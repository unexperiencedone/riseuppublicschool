# Backend Architecture & Documented Pipelines
### Rise UP Public School — MERN stack

---

## 1. System topology

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                      │
│   Public site · Parent portal · Admin panel                               │
└───────────────┬──────────────────────────────────┬───────────────────────┘
                │ HTML (SSR/ISR)                   │ fetch() JSON
                ▼                                  ▼
┌───────────────────────────────┐   ┌──────────────────────────────────────┐
│   NEXT.JS 14  (Vercel)        │   │   EXPRESS API  (Vercel, 2nd project) │
│   ─────────────────────       │──▶│   ────────────────────                │
│   • App Router, RSC           │   │   app.js  →  routes  →  controllers  │
│   • ISR cache (revalidate)    │   │   middleware: auth, rbac, validate,   │
│   • Static fallback content   │   │               rateLimit, upload       │
│   • SEO: sitemap, robots,     │   │   services: email, sms, whatsapp,     │
│     JSON-LD schema.org/School │   │             payment, storage          │
└───────────────────────────────┘   └───────┬──────────────┬───────────────┘
                                            │              │
                            ┌───────────────▼──┐   ┌───────▼─────────────┐
                            │  MONGODB ATLAS   │   │  THIRD PARTIES      │
                            │  20 collections  │   │  Razorpay ─ payments│
                            │  Mongoose ODM    │   │  Cloudinary ─ media │
                            └──────────────────┘   │  SMTP ─ email       │
                                                   │  MSG91 ─ SMS        │
                                                   │  Meta ─ WhatsApp    │
                                                   └─────────────────────┘
```

### Why the API is a separate service
Next.js could host the routes itself, but keeping Express standalone means:
- the same API serves a future mobile app or a third-party integration,
- the school's data layer is portable if the frontend host ever changes — including
  off Vercel entirely, since `src/server.js` (`app.listen`) still runs the exact
  same `app.js` as a normal long-running process with no code changes.

(One old reason no longer applies now that the API also runs on Vercel: both
projects share the same 30-second `maxDuration` ceiling, so this split no longer
buys headroom for long-running jobs — see § Serverless considerations.)

---

## 2. Request lifecycle — the middleware chain

Every request passes through this ordered chain, defined in `server/src/app.js`.
**Order is load-bearing**; two places in particular are easy to break.

```
  incoming request
        │
   ①  trust proxy ......... Render/Vercel sit behind a load balancer, so req.ip
        │                   must come from X-Forwarded-For or rate limiting
        │                   would throttle the whole platform as one client.
        ▼
   ②  helmet ............... security headers; CORP set to cross-origin so the
        │                   Next.js origin can load /uploads images.
        ▼
   ③  cors ................. explicit allowlist + credentials:true, required
        │                   for the httpOnly refresh cookie to travel.
        ▼
   ④  /webhooks ............ ⚠ MOUNTED BEFORE express.json(). Razorpay signs
        │                   the RAW body; parsing it first destroys the HMAC.
        ▼
   ⑤  express.json (2mb) ... file uploads bypass this and go through multer.
        ▼
   ⑥  cookieParser ......... reads the refreshToken cookie.
        ▼
   ⑦  mongoSanitize ........ strips $ and . from keys → blocks NoSQL injection
        │                   such as { "email": { "$gt": "" } }.
        ▼
   ⑧  hpp ................. collapses duplicated query params.
        ▼
   ⑨  compression ......... gzip.
        ▼
   ⑩  morgan .............. request logging.
        ▼
   ⑪  express.static ....... /uploads (local storage driver only).
        ▼
   ⑫  apiLimiter ........... 300 req / 15 min per IP, global.
        ▼
   ⑬  route-level ..........  publicFormLimiter → validate → requireAuth
        │                     → requireRole → upload → controller
        ▼
   ⑭  notFound ............. any unmatched path → ApiError 404.
        ▼
   ⑮  errorHandler ......... ⚠ MUST BE LAST. Normalises Mongoose, Zod, Multer
                             and duplicate-key errors into one JSON envelope.
```

**Two failure modes to remember**
1. Moving the webhook router below `express.json()` silently breaks every payment reconciliation.
2. Registering any middleware after `errorHandler` makes it unreachable.

---

## 3. Layered responsibilities

| Layer | Directory | May do | Must not do |
|---|---|---|---|
| **Route** | `routes/` | Declare paths, attach middleware in order | Contain business logic |
| **Middleware** | `middleware/` | Auth, RBAC, validation, uploads, limits, audit | Query domain data beyond the caller |
| **Validator** | `validators/` | Zod schemas; coerce and strip unknown fields | Touch the database |
| **Controller** | `controllers/` | Orchestrate: validate intent → call models/services → shape response | Talk to third parties directly |
| **Service** | `services/` | Wrap external systems (mail, SMS, storage, gateway) behind a driver | Know about `req` / `res` |
| **Model** | `models/` | Schema, indexes, hooks, instance methods | Send responses |
| **Util** | `utils/` | Pure helpers — errors, pagination, tokens, slugs | Hold state |

Every controller is wrapped in `asyncHandler`, so a rejected promise always reaches `errorHandler` — there is not a single bare `try/catch` for control flow in the request path.

---

## 4. Pipeline: Authentication & session management

```
POST /auth/login
  │
  ├─ authLimiter ......... 10 attempts / 15 min, successful ones not counted
  ├─ validate(loginSchema)
  │
  ├─ User.findOne({email}).select('+password')
  │     └─ not found OR bcrypt.compare fails
  │           → 401 "Invalid email or password"   ← same message either way,
  │                                                 so the endpoint cannot be
  │                                                 used to enumerate accounts
  ├─ user.isActive === false → 403
  │
  └─ issueTokens(user)
        ├─ accessToken  = JWT{ sub, role, name }, 15 min, returned in the body
        ├─ refreshToken = JWT{ sub }, 30 days, set as httpOnly cookie
        ├─ $push refreshToken into user.refreshTokens with $slice:-5
        │     → a user may hold at most 5 concurrent devices
        └─ $set lastLoginAt
```

### Refresh rotation with reuse detection

```
POST /auth/refresh   (cookie)
  │
  ├─ verifyRefreshToken() fails → 401
  │
  ├─ token NOT present in user.refreshTokens
  │     → the token was already rotated ⇒ it has been stolen and replayed
  │     → WIPE user.refreshTokens entirely (kills every session)
  │     → 401 "Refresh token has been revoked"
  │
  └─ token valid and present
        ├─ $pull the old token
        └─ issue a fresh pair          ← one-time-use rotation
```

### Authorisation

```
requireAuth   → verifies the access token, loads the user, rejects deactivated accounts
requireRole() → coarse-grained: does this role appear in the allowlist?
assertAccess()→ fine-grained ownership, applied inside portal controllers:
                  staff roles      → unrestricted
                  role=student     → only user.student
                  role=parent      → only ids in user.wards
                  anything else    → 403
```

Row-level scoping lives in the controller rather than the route because the
student id can arrive as a param, a query value, or be derived from the token —
route middleware cannot see all three cases.

---

## 5. Pipeline: Admission enquiry (the most important flow on the site)

```
Parent submits the form on /admissions#enquiry
  │
  ├─ CLIENT  EnquiryForm.js validates locally, focuses the first bad field
  │          (fast feedback, but never trusted)
  │
  ▼
POST /api/v1/admissions/enquiry
  │
  ├─ publicFormLimiter ...... 10 submissions / hour / IP
  ├─ validate(enquirySchema) . Zod: mobile /^[6-9]\d{9}$/, class in enum,
  │                            consent must literally be true (DPDP Act 2023)
  ├─ honeypot check .......... req.body.website non-empty → 400, bot discarded
  │
  ├─ Setting.get() ........... resolves the current session (2026-27)
  │
  ├─ Admission.create()
  │     └─ pre('save') generates applicationNo = RUPS/<year>/<00001>
  │           counted from records created this calendar year
  │
  ├─ notifyAdmissionReceived(admission)  ── FIRE AND FORGET ──┐
  │     .catch(() => {})                                       │
  │                                                            │
  └─ 201 { applicationNo, id }  ← returned immediately         │
                                                               │
        ┌──────────────────────────────────────────────────────┘
        ▼  Promise.allSettled — no channel can fail the request
   ┌────────────────┬─────────────────────┬──────────────────────┐
   │ EMAIL          │ SMS                 │ (WhatsApp — ready)   │
   │ to parent, cc  │ to parent, MSG91    │ Meta Cloud API       │
   │ school inbox   │ DLT template        │ template message     │
   │ HTML template  │                     │                      │
   └────────────────┴─────────────────────┴──────────────────────┘
```

**The design decision that matters:** notifications are deliberately *not* awaited.
If Gmail is slow or MSG91 is down, the parent still gets their application number
in under 200 ms. A lost SMS is recoverable; a lost enquiry is not.

### Downstream CRM pipeline

```
new ──▶ contacted ──▶ documents_pending ──▶ shortlisted ──▶ admitted
  │                                                            │
  └──────────────▶ rejected / withdrawn                        │
                                                               ▼
                                          POST /admin/students/from-admission/:id
                                                               │
                                             ┌─────────────────┴─────────────────┐
                                             │ Student.create()                   │
                                             │  admissionNo = RUPS<year><0001>    │
                                             │  parent details copied across      │
                                             └─────────────────┬─────────────────┘
                                                               ▼
                                          POST /admin/students/:id/portal-access
                                             ├─ create/link parent User
                                             ├─ temp password `Rups@<nanoid6>`
                                             ├─ mustChangePassword = true
                                             └─ email the credentials
```

Every status transition appends to `statusHistory` **and** writes an `AuditLog`
row — so the office can always answer "who moved this application, and when?"

---

## 6. Pipeline: Online fee payment

Three independent paths converge on one settlement function. This is the part of
the system where correctness matters most, because money is involved.

```
                    ┌─────────────── PATH A: browser callback ───────────────┐
                    │                                                         │
POST /portal/payments/order                                                   │
  ├─ validate(createOrderSchema)                                              │
  ├─ if invoiceId → load invoice                                              │
  │     ├─ already paid          → 409                                        │
  │     └─ amount > balance      → 400                                        │
  ├─ Payment.create({ status:'created' })                                     │
  │     └─ pre('save') → receiptNo = RCPT/<year>/<000001>                     │
  ├─ createOrder() → Razorpay order_xxx  (amount × 100 = paise)               │
  └─ persist gatewayOrderId, return { order, keyId, prefill }                 │
        │                                                                     │
        ▼                                                                     │
  Razorpay Checkout opens in the browser                                      │
        │                                                                     │
        ├─ success → handler fires ────────────────────────────────────────▶ │
        │                                                                     ▼
        │                                          POST /portal/payments/verify
        │                                            ├─ HMAC_SHA256(order|payment, secret)
        │                                            │     compared with timingSafeEqual
        │                                            │     mismatch → 400
        │                                            ├─ already 'paid' → return early (idempotent)
        │                                            ├─ fetchPayment() confirms with the gateway
        │                                            └─ settlePayment() ─────────┐
        │                                                                        │
        └─ user closes the tab / network drops                                   │
                    ↓ nothing happens client-side                                │
                                                                                 │
    ┌──────────── PATH B: webhook — the source of truth ────────────┐            │
    │                                                                │            │
POST /api/v1/webhooks/razorpay                                       │            │
  ├─ raw body preserved (router mounted before express.json)         │            │
  ├─ verifyWebhookSignature(rawBody, X-Razorpay-Signature)           │            │
  │     invalid → 400, logged as a rejected webhook                  │            │
  ├─ payment.captured  → settlePayment() if not already paid ────────┼────────────┤
  ├─ payment.failed    → status='failed', store failureReason        │            │
  └─ ALWAYS 200 quickly — a non-2xx makes Razorpay retry for hours   │            │
                                                                     │            │
    ┌──────────── PATH C: offline payment at the office ────────────┐│            │
    │  Accountant records cash/cheque → Payment{ gateway:'cash' }   ││            │
    └───────────────────────────────────────────────────────────────┘│            │
                                                                     ▼            ▼
                                            ╔═══════════════════════════════════════╗
                                            ║  settlePayment(payment, details)      ║
                                            ║  ───────────────────────────────────  ║
                                            ║  1. status = 'paid', paidAt = now     ║
                                            ║  2. store gatewayPaymentId, method    ║
                                            ║  3. invoice.amountPaid += amount      ║
                                            ║     invoice.status =                  ║
                                            ║       paid   if amountPaid >= total   ║
                                            ║       partial otherwise               ║
                                            ║  4. push payment into invoice.payments║
                                            ║  5. notifyPaymentSuccess() (async)    ║
                                            ╚═══════════════════════════════════════╝
```

**Idempotency guarantees**
- `settlePayment` is guarded by a `status !== 'paid'` check on both paths, so
  callback-then-webhook (the normal case) settles exactly once.
- `receiptNo` and `invoiceNo` are generated in `pre('save')` hooks and are unique-indexed.
- Amounts are handled in **rupees** everywhere in our code; conversion to paise
  happens only at the Razorpay boundary, so there is one place to audit.

**Why the webhook is authoritative:** the browser callback can be lost (tab
closed, network dropped, phone died). The webhook is retried by Razorpay for
hours. Any system that trusts only the callback will eventually take a parent's
money without marking the invoice paid.

---

## 7. Pipeline: File upload & storage

Two paths exist side by side, chosen by `Content-Type`, not by a separate
route — `middleware/upload.js#conditionalUpload` runs multer only for
`multipart/form-data` and is a no-op (`next()`) for `application/json`:

```
                          POST /admin/gallery  (same path, either flow)
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                            ▼
   Content-Type: multipart/form-data        Content-Type: application/json
   (local dev — `npm run dev`)              (production — Vercel)
              │                                            │
   ┌──────────▼──────────┐                     ┌───────────▼────────────┐
   │ multer               │                     │ browser already holds  │
   │  ├ fileFilter — MIME  │                     │ Cloudinary descriptors │
   │  │  allowlist          │                     │ {url, publicId, ...}  │
   │  ├ limits — 8MB/file,  │                     │  from web/lib/upload.js│
   │  │  20 files max       │                     │  (see below)          │
   │  └ storage engine:     │                     └───────────┬────────────┘
   │     STORAGE_DRIVER     │                                 │
   │     local → disk       │                                 │ validated against
   │     cloudinary → memory│                                 │ fileDescriptorSchema
   ├───────────┬───────────┘                                 │ (zod) before trust
   ▼           │                                              │
saveFile()/saveMany()                                         │
   │  local      → { url:'/uploads/<name>', publicId:<name> } │
   │  cloudinary → base64 upload → { url:secure_url, ... }    │
   └────────────────────────┬───────────────────────────────┘
                             ▼
        descriptor embedded in the document
        Notice.attachments[] · GalleryAlbum.photos[] · Staff.photo ·
        Download.file · Student.photo · Event.cover · Admission.documents[]
                             │
                             ▼
        on delete → deleteFile(publicId) removes the blob as well as the row
        (branches on STORAGE_DRIVER, same as the create path — see § Serverless
        considerations for why STORAGE_DRIVER=cloudinary is required in production)
```

### The direct-to-Cloudinary flow (production)

Vercel's Node runtime has a **hard 4.5 MB request body limit** that cannot be
raised — an album upload or a scanned admission document routinely exceeds
that. So on Vercel, files never go through the API's body at all:

```
1. Browser calls  POST /admin/uploads/signature  (auth+CMS)
                or POST /admissions/upload-signature  (public, rate-limited)
     └─ server signs { timestamp, folder, allowed_formats } with
        CLOUDINARY_API_SECRET — the secret itself never reaches the browser

2. Browser POSTs the file straight to
     https://api.cloudinary.com/v1_1/<cloud>/auto/upload
   with the signed params attached (web/lib/upload.js) — this request never
   touches our API or its 4.5 MB ceiling

3. Cloudinary returns { secure_url, public_id, bytes, width, height, ... }

4. Browser POSTs that small JSON descriptor to the SAME admin route it would
   have used for multipart (e.g. POST /admin/gallery), just with
   Content-Type: application/json — the controller detects this via
   req.is('application/json') and stores the descriptor directly instead of
   calling saveFile()
```

Controllers never branch on the storage driver itself (local vs cloudinary) —
that's still centralised in `storage.service.js`. They only branch on
*transport* (multipart vs JSON), and only because two genuinely different
delivery mechanisms exist now. Switching `STORAGE_DRIVER` between `local` and
`cloudinary` remains a one-variable change for the multipart path.

---

## 7A. Serverless considerations (Vercel)

Both the API and the frontend run as Vercel projects (root directories
`server/` and `web/`), which changes several assumptions that held when the
API was a single long-running Render process.

**The entry point is not `src/server.js`.** That file still calls
`app.listen()` and remains the entry point for `npm run dev` and any
long-running host — it is untouched. Vercel instead calls `server/api/index.js`,
which imports the same `app.js`, awaits a cached DB connection, and delegates
the request to it: `return app(req, res)`. `server/vercel.json` rewrites every
path to that one function so `/health`, `/api/v1/*` and everything else hit
it identically to how they hit the Express listener locally.

**Cold starts and connection pooling.** A cold start pays for a fresh Node
process, a fresh Mongoose connection, and (for MONGODB_URI on Atlas) a fresh
TLS handshake — all before the first query runs. Two mitigations are in
place:
- `src/config/db.js` caches the connection *promise* on `globalThis`, not a
  module-level variable, because a warm invocation may reuse the same
  process but reload the module graph — `globalThis` is the one thing
  guaranteed to survive either way. A warm invocation reuses the connection
  in ~0 ms; only a genuine cold start pays the Atlas round-trip.
- `maxPoolSize` is lowered from 10 to 5. Every concurrent lambda opens its
  own pool, and Atlas M0 caps total connections at 500 — a traffic spike
  that spins up 50+ concurrent cold starts at `maxPoolSize:10` could exhaust
  that budget outright; 5 gives more headroom per instance at a small
  latency cost under heavy per-instance concurrency (which this workload
  doesn't have — each request is short-lived).

**The 4.5 MB request body limit** is the reason the upload pipeline (§7) now
has two paths. It is not configurable — raising `express.json({ limit })` or
multer's `fileSize` does nothing on Vercel; the platform rejects the request
before it reaches the function. Direct-to-Cloudinary upload is the fix, not
a workaround.

**`maxDuration: 30`** (in `vercel.json`) is the ceiling for every request,
including the Razorpay webhook and the admission-application write. Nothing
in this codebase currently approaches that — the slowest path (bulk
attendance `bulkWrite`, or seeding) is either not on the request path or not
deployed as a function at all (`npm run seed` runs locally / via a one-off
script, not as a Vercel function). If a future feature needs longer (e.g.
PDF report-card generation, per the roadmap), it will need a queue
(§16 Known gaps already flags "no background job queue") rather than a
bigger `maxDuration`.

**Rate limiting requires Upstash in production.** `middleware/rateLimiter.js`
falls back to express-rate-limit's in-memory store when
`UPSTASH_REDIS_REST_URL`/`_TOKEN` are unset — correct for `npm run dev`
(one process, one memory space) but silently meaningless once deployed,
because every Vercel invocation is an independent process: an attacker
distributed across enough cold starts would never see a 429. Set both
Upstash variables before relying on `authLimiter` / `publicFormLimiter` /
`apiLimiter` in production. One behavioural difference to know about: the
in-memory `authLimiter` uses `skipSuccessfulRequests` (only failed logins
count toward the 10/15min budget); the Upstash-backed version counts every
attempt, because Upstash's sliding-window algorithm has no "uncount this"
operation. Stricter, never looser — see the comment in that file.

**The Razorpay webhook's raw body is not deploy-verified.** `express.raw()`
reads the request stream directly and never touches Vercel's lazy `req.body`
getter, so by that reasoning the raw bytes should survive untouched — but
this project could not confirm that against an actual Vercel deployment.
`routes/webhook.routes.js` now logs loudly (`Razorpay webhook: req.body was
not a raw Buffer...`) if that assumption turns out to be wrong instead of
failing silently. **Action item before enabling `PAYMENTS_DRIVER=razorpay`
in production:** send one real or Razorpay-dashboard-test webhook to the
deployed endpoint and confirm the log line is `Razorpay webhook:
payment.captured`, not `Rejected Razorpay webhook: bad signature`.

**`STORAGE_DRIVER` must be `cloudinary` in production, not just "supported".**
It isn't only a feature choice anymore: Vercel's filesystem is read-only
outside `/tmp`, so `STORAGE_DRIVER=local` cannot work at all once deployed,
and `deleteFile()` branches on this same flag to decide whether to call
Cloudinary's `destroy` or `fs.unlink` — since every direct-to-Cloudinary
upload's `publicId` is a Cloudinary id, `deleteFile` only works if
`STORAGE_DRIVER=cloudinary` is actually set. `express.static('/uploads')` in
`app.js` is now guarded behind `STORAGE_DRIVER === 'local'` so it doesn't
mount pointlessly (and harmlessly) on Vercel.

---

## 8. Pipeline: Content publishing → live site

```
Admin publishes a notice in the admin panel
  │
POST /admin/notices  (multipart)
  ├─ requireAuth → requireRole(CMS)
  ├─ multer parses up to 5 attachments
  ├─ validate(noticeSchema)
  ├─ uniqueSlug(Notice, title) — appends -2, -3 … on collision
  ├─ excerpt auto-derived from the body if not supplied
  ├─ saveMany(files, 'notices')
  ├─ Notice.create({ ..., author: req.user._id })
  └─ recordAudit('notice.create')
        │
        ▼
Next.js ISR picks it up
  ├─ /notices          revalidate = 120s
  ├─ /notices/[slug]   revalidate = 120s, generateStaticParams from fallback set
  ├─ /                 revalidate = 300s (homepage marquee + notice list)
  └─ tags: ['notices'] — ready for on-demand revalidation once
                          POST /admin/revalidate is added (see roadmap)
```

### The fallback strategy

`lib/api.js` `apiGet()` never throws. On any failure — API down, cold Render
instance, DNS blip, empty collection — it returns the static content in
`lib/fallback.js`, which mirrors what the seeder writes to MongoDB.

Consequence: **the website renders completely with the API switched off.**
That is deliberate. A school website that shows an error page because a free-tier
API instance is cold-starting is worse than one that shows slightly stale content.

---

## 9. Pipeline: Attendance & results

### Attendance — bulk, idempotent

```
GET /admin/attendance/register?classLevel=VI&section=A&date=2026-08-05
  ├─ Student.find({classLevel, section, status:'active'}).sort('rollNo')
  ├─ Attendance.find({classLevel, section, date})
  └─ left-join in memory → [{ ...student, attendance: mark | null }]
        (a teacher sees the class list with today's marks pre-filled)

POST /admin/attendance
  └─ bulkWrite([...entries.map(upsert on (student, date))], { ordered:false })
        ├─ unique index { student:1, date:1 } makes re-submission safe
        ├─ ordered:false → one bad row does not abort the batch
        └─ single round-trip for a whole class
```

### Results — compute, then publish

```
POST /admin/results          (per student, staff)
  └─ Result pre('save'):
       totalMax      = Σ maxMarks
       totalObtained = Σ obtainedMarks
       percentage    = round(obtained/max × 100, 2)
       grade         = A1 ≥91 · A2 ≥81 · B1 ≥71 · B2 ≥61
                       C1 ≥51 · C2 ≥41 · D ≥33 · E below
       unique index { student, session, examType } → upsert, never duplicate

PATCH /admin/results/publish  (whole class at once, CMS role)
  ├─ Result.updateMany({classLevel, section, session, examType},
  │                    { isPublished:true, publishedAt, publishedBy })
  └─ for each → notifyResultPublished() → SMS to the parent (async)
```

Results are invisible to parents until `isPublished` flips. Teachers can enter
marks over several days without a half-finished result appearing in the portal.

---

## 10. Data model

20 Mongoose models in `server/src/models/`.

```
User ──┬── staff ────▶ Staff
       ├── student ──▶ Student          (role = student)
       └── wards[] ──▶ Student[]        (role = parent)

Student ──┬──▶ Attendance   (unique: student + date)
          ├──▶ Result       (unique: student + session + examType)
          ├──▶ FeeInvoice ──▶ Payment
          └──▶ AcademicClass (by level + section + session)

Admission ──▶ (converts to) Student
          └──▶ Payment       (optional application fee)

Content:  Notice · Event · GalleryAlbum · Page · Download · Testimonial
Config:   Setting (singleton) · FeeStructure · AcademicClass
Trail:    AuditLog
```

**Indexing rationale**

| Index | Why |
|---|---|
| `Attendance {student, date}` unique | Makes bulk marking idempotent |
| `Result {student, session, examType}` unique | One result per exam, upsert-safe |
| `AcademicClass {level, section, session}` unique | Prevents duplicate sections |
| `Notice {isPublished, publishAt:-1}` | The exact shape of the public list query |
| `Notice` text index on title+body | Search without a separate engine |
| `Student {classLevel, section, session}` | Class register and roll-list queries |
| `Payment {gatewayOrderId}` | Webhook lookup must be O(log n), not a scan |
| `Admission {parent.phone}` | Application tracking + duplicate detection |

**Soft deletes where history matters.** `DELETE /admin/students/:id` sets
`status: 'inactive'`; it never removes the row, because attendance, results and
fee history must survive a student leaving.

---

## 11. Error handling

```
                    ┌── mongoose.ValidationError ──▶ 422 + per-field details
                    ├── mongoose.CastError ────────▶ 400 "Invalid value for 'x'"
   any throw  ──────┼── code 11000 (duplicate key) ─▶ 409 + which field
                    ├── entity.too.large ──────────▶ 400 "Payload too large"
                    ├── ApiError (thrown by us) ───▶ its own status
                    └── anything else ─────────────▶ 500, isOperational:false
                                    │
                                    ▼
                    status ≥ 500 → logger.error with stack
                    status < 500 → logger.warn, one line
                                    │
                                    ▼
                    { success:false, message, code, errors?, stack? }
                                                          └─ dev only
```

Stack traces are stripped in production. Operational errors (a parent typing a
bad phone number) are warnings; programming errors are `error` level with the
full stack, so log noise stays meaningful.

---

## 12. Security posture

| Threat | Control | Where |
|---|---|---|
| Credential stuffing | 10 attempts / 15 min; successes not counted | `authLimiter` |
| Account enumeration | Identical 401 for unknown email and wrong password; forgot-password always 200 | `auth.controller.js` |
| Stolen refresh token | One-time-use rotation; reuse wipes every session | `auth.controller.js` |
| Password theft | bcrypt, cost 10; `select:false` so hashes never leave the DB by accident | `User.js` |
| NoSQL injection | `express-mongo-sanitize` strips `$` and `.` from keys | `app.js` |
| XSS | React escapes by default; `dangerouslySetInnerHTML` used only for our own JSON-LD | frontend |
| CSRF | Bearer token in a header (not a cookie) for state changes; refresh cookie is `sameSite` + httpOnly | `token.js` |
| Form spam | Honeypot field + 10 submissions / hour / IP | `enquirySchema`, `publicFormLimiter` |
| Malicious upload (multipart, local dev) | MIME allowlist, 8 MB cap, 20 file cap, randomised filenames | `upload.js` |
| Malicious upload (JSON / direct-to-Cloudinary, production) | Signed `folder` + `allowed_formats` (server-chosen, client cannot alter without invalidating the signature); size cap is **not** enforced by a signed param — set a file-size limit in the Cloudinary account settings before relying on this in production | `storage.service.js#createUploadSignature` |
| Forged payment | HMAC verified with `timingSafeEqual` on both callback and webhook | `payment.service.js` |
| Parameter pollution | `hpp` | `app.js` |
| Privilege escalation | `requireRole` on every admin route + row-level `assertAccess` in portal controllers | `rbac.js`, `portal.controller.js` |
| Untraceable changes | `AuditLog` on every destructive or financial operation | `audit.js` |
| Data leakage | Public `/staff` strips email and phone; `Payment.rawWebhookEvent` is `select:false` | models |

**Deliberately not stored:** full Aadhaar numbers (only `aadhaarLast4`), card
details (Razorpay handles them), plaintext passwords.

---

## 13. Configuration & drivers

Every external dependency has a `log` or `mock` driver that is the default.
The system runs end-to-end with zero third-party credentials.

| Variable | Values | Default | Effect of the default |
|---|---|---|---|
| `STORAGE_DRIVER` | `local` \| `cloudinary` | `local` | Files written to `./uploads`, served by express.static. **Must** be `cloudinary` in production/Vercel — `local` cannot work there at all (§7A) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | — | unset | Rate limiters use express-rate-limit's in-memory store — meaningless across separate Vercel invocations (§7A) |
| `MAIL_DRIVER` | `log` \| `smtp` | `log` | Emails printed to the console — no risk of mailing real parents from a dev box |
| `SMS_DRIVER` | `log` \| `msg91` | `log` | SMS printed to the console |
| `WHATSAPP_DRIVER` | `log` \| `meta` | `log` | WhatsApp printed to the console |
| `PAYMENTS_DRIVER` | `mock` \| `razorpay` | `mock` | Fake order IDs, signature check always passes — the full flow is testable |

Razorpay and Cloudinary are `optionalDependencies`: `npm install` succeeds and
the server boots even if those packages fail to install, because they are
imported lazily inside their service functions and only when the live driver is selected.

---

## 14. Deployment pipeline

Both apps deploy from the same monorepo as **two separate Vercel projects**,
each with its own root directory. Full step-by-step in `docs/DEPLOYMENT.md`;
this is the shape of it:

```
git push origin main
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
VERCEL PROJECT 1 (web/)      VERCEL PROJECT 2 (server/)     MONGODB ATLAS
├ npm install                ├ npm install                  ├ M0 free tier
├ next build                 ├ vercel.json rewrites          ├ IP allowlist: 0.0.0.0/0
│   ├ static pages           │   /(.*) → api/index.js        │   (no fixed Vercel
│   ├ ISR pages              ├ api/index.js: connectDB()     │    egress range)
│   └ sitemap + robots       │   then delegates to app.js    ├ daily backups
└ global CDN                 └ env vars from dashboard       └ separate prod user

Environment variables that must match across projects:
  CLIENT_URL / ADMIN_URL (server project) ==  the web project's production domain
  NEXT_PUBLIC_API_URL (web project)  ==  https://<server-project>.vercel.app/api/v1
  NEXT_PUBLIC_SITE_URL (web project) ==  the web project's production domain
Mismatch → CORS failures that look like network errors in the browser console.
```

### First-deploy order
1. Create the Atlas cluster, database user and IP allowlist (`0.0.0.0/0` — Vercel has no fixed egress range to allowlist instead).
2. Deploy the API as its own Vercel project (root directory `server/`) with `MONGODB_URI`, `STORAGE_DRIVER=cloudinary` + Cloudinary credentials, and (recommended) `UPSTASH_REDIS_REST_URL`/`_TOKEN`; confirm `/health` returns 200.
3. Run `npm run seed` **locally** against that same `MONGODB_URI` — there is no long-running shell to exec into on Vercel the way Render offered one.
4. Deploy the frontend as a second Vercel project (root directory `web/`) with `NEXT_PUBLIC_API_URL` pointing at the API project's domain.
5. Set `CLIENT_URL` / `ADMIN_URL` on the API project to the frontend's domain and redeploy it.
6. Sign in to `/admin/login` and **change the seeded password immediately**.
7. Send a test Razorpay webhook to the deployed endpoint before enabling `PAYMENTS_DRIVER=razorpay` — see § Serverless considerations.

### Cold starts
Vercel's Hobby-tier functions also cold-start after a period of inactivity —
same shape of problem as Render's free tier had. The frontend's fallback
content (`web/lib/fallback.js`) means visitors still see a complete site
during one. Connection caching (§7A) keeps a *warm* invocation fast; it does
nothing for the first request after a cold start.

---

## 15. Observability

| Concern | Current | Next step |
|---|---|---|
| Request logs | `morgan` — `dev` locally, `combined` in production | Ship to a log service |
| Application logs | Dependency-free levelled logger (`config/logger.js`) | Swap for pino + JSON output |
| Audit trail | `AuditLog` collection, queryable by entity and actor | Add an admin UI |
| Health | `GET /health` with uptime | Add a DB-ping readiness probe |
| Errors | Stack traces in logs, stripped from responses | Add Sentry |
| Uptime | — | UptimeRobot on `/health` |

---

## 16. Known gaps

Stated plainly so nobody discovers them at the wrong moment.

1. **No automated test suite.** Add Vitest + Supertest with `mongodb-memory-server`; the layering makes controllers straightforward to test.
2. **No PDF generation.** Report cards and payment receipts are HTML/JSON only — see the roadmap in `API_ENDPOINTS.md`.
3. **No on-demand ISR revalidation.** Content edits take up to `revalidate` seconds to appear. `POST /admin/revalidate` hitting a Next.js route handler with `revalidateTag` would close this.
4. **No background job queue.** Notifications are fire-and-forget promises; a failed SMS is logged but never retried. BullMQ + Redis when volume justifies it.
5. **Fee figures are placeholders.** `seed/data/fees.js` seeds every class at ₹0 with `isPublished:false`, and the fees page shows a "contact the office" state until real figures are entered. **Publishing wrong fees is worse than publishing none.**
6. **Admin panel is a dashboard, not full CRUD.** The API supports every operation; the admin UI currently surfaces metrics and quick links. Building the CRUD screens is frontend work against endpoints that already exist.
