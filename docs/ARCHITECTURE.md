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
│   NEXT.JS 14  (Vercel)        │   │   EXPRESS API  (Render)              │
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
- webhooks and long-running jobs are not constrained by serverless limits,
- the school's data layer is portable if the frontend host ever changes.

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

```
multipart/form-data
  │
  ├─ multer
  │    ├─ fileFilter — MIME allowlist (images, or images+PDF/DOC for documents)
  │    ├─ limits — 8 MB per file, 20 files max
  │    └─ storage engine chosen by STORAGE_DRIVER:
  │           local      → diskStorage, filename = <timestamp>-<nanoid8><ext>
  │           cloudinary → memoryStorage, kept as a Buffer
  │
  ├─ controller calls saveFile(file, folder)
  │    │
  │    ├─ local      → returns { url:'/uploads/<name>', publicId:<name>, sizeKb }
  │    └─ cloudinary → base64 upload → { url:secure_url, publicId, width, height }
  │
  ├─ the returned descriptor is embedded in the document
  │        Notice.attachments[] · GalleryAlbum.photos[] · Staff.photo · Download.file
  │
  └─ on delete → deleteFile(publicId) removes the blob as well as the row
```

Controllers never branch on the storage driver. Switching from local disk to
Cloudinary is one environment variable — which matters because **Render's
filesystem is ephemeral**: anything uploaded to local disk disappears on the
next deploy. Cloudinary must be configured before real photographs are uploaded.

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
| Malicious upload | MIME allowlist, 8 MB cap, 20 file cap, randomised filenames | `upload.js` |
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
| `STORAGE_DRIVER` | `local` \| `cloudinary` | `local` | Files written to `./uploads`, served by express.static |
| `MAIL_DRIVER` | `log` \| `smtp` | `log` | Emails printed to the console — no risk of mailing real parents from a dev box |
| `SMS_DRIVER` | `log` \| `msg91` | `log` | SMS printed to the console |
| `WHATSAPP_DRIVER` | `log` \| `meta` | `log` | WhatsApp printed to the console |
| `PAYMENTS_DRIVER` | `mock` \| `razorpay` | `mock` | Fake order IDs, signature check always passes — the full flow is testable |

Razorpay and Cloudinary are `optionalDependencies`: `npm install` succeeds and
the server boots even if those packages fail to install, because they are
imported lazily inside their service functions and only when the live driver is selected.

---

## 14. Deployment pipeline

```
git push origin main
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
VERCEL (web/)               RENDER (server/)              MONGODB ATLAS
├ npm install               ├ npm install                 ├ M0 free tier
├ next build                ├ node src/src/server.js      ├ IP allowlist:
│   ├ static pages          ├ health check /health        │   Render egress IPs
│   ├ ISR pages             ├ auto-deploy on push         ├ daily backups
│   └ sitemap + robots      └ env vars from dashboard     └ separate prod user
└ global CDN

Environment variables that must match across services:
  CLIENT_URL (Render)  ==  the Vercel production domain
  NEXT_PUBLIC_API_URL (Vercel)  ==  https://<render-app>.onrender.com/api/v1
  NEXT_PUBLIC_SITE_URL (Vercel) ==  the Vercel production domain
Mismatch → CORS failures that look like network errors in the browser console.
```

### First-deploy order
1. Create the Atlas cluster, database user and IP allowlist.
2. Deploy the API to Render with `MONGODB_URI`; confirm `/health` returns 200.
3. Run `npm run seed` once (Render Shell) to create settings, pages, calendar, gallery and the admin account.
4. Deploy the frontend to Vercel with `NEXT_PUBLIC_API_URL` pointing at Render.
5. Set `CLIENT_URL` on Render to the Vercel domain and redeploy the API.
6. Sign in to `/admin/login` and **change the seeded password immediately**.

### Free-tier caveat
Render's free instances sleep after 15 minutes of inactivity and take
30–60 seconds to wake. The frontend's fallback content means visitors still see a
complete site during a cold start — but before the school advertises the URL,
either upgrade to a paid instance or add an external uptime pinger.

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
