# API Endpoints & Third-Party Integrations
### Rise UP Public School — REST API v1

Base URL (dev): `http://localhost:5000/api/v1`
Base URL (prod): `https://<your-server-project>.vercel.app/api/v1` — deployed as its own Vercel project, root directory `server/` (see `docs/DEPLOYMENT.md`)

**81 routes** across 4 groups. Every route below is implemented in `server/src/routes/`.

| Group | Prefix | Auth | Purpose |
|---|---|---|---|
| Public | `/api/v1/*` | None | Website content, admission enquiry, contact |
| Auth | `/api/v1/auth/*` | Mixed | Login, refresh, password reset |
| Portal | `/api/v1/portal/*` | Bearer token | Parent & student self-service |
| Admin | `/api/v1/admin/*` | Bearer + role | Staff CMS, CRM, academics, finance |
| Webhooks | `/api/v1/webhooks/*` | HMAC signature | Payment gateway callbacks |

---

## 0. Conventions

**Success envelope**
```json
{ "success": true, "message": "OK", "data": { }, "meta": { "page": 1, "limit": 12, "total": 42, "totalPages": 4, "hasNext": true, "hasPrev": false } }
```

**Error envelope**
```json
{ "success": false, "message": "Validation failed", "code": "VALIDATION_ERROR",
  "errors": [{ "in": "body", "path": "parent.phone", "message": "Enter a valid 10-digit Indian mobile number" }] }
```

**Status codes** — `200` OK · `201` Created · `204` No Content · `400` Bad request · `401` Unauthenticated · `403` Forbidden · `404` Not found · `409` Conflict · `422` Validation failed · `429` Rate limited · `500` Server error

**Auth header** — `Authorization: Bearer <accessToken>` (15 min). Refresh token lives in an httpOnly cookie (30 days).

**Roles** — `super_admin` · `admin` · `principal` · `teacher` · `accountant` · `student` · `parent`

**Common list query params** — `?page=1&limit=12&sort=-createdAt&search=&category=&session=2026-27&from=&to=`

**File uploads — two transports, same routes.** Every route that accepts a
file (marked *multipart/JSON* below) accepts either:
- `multipart/form-data` — the original path, still used by `npm run dev` locally.
- `application/json` — production (Vercel). The browser uploads straight to
  Cloudinary first (see §5.2a and §3.6a), then POSTs the small resulting
  descriptor(s) — `{ url, publicId, mime, sizeKb, width, height, name }` — to
  the same route and method shown below. Vercel's Node functions have a hard
  4.5 MB request body limit, so real files never pass through the API on
  that transport. Full flow in `docs/ARCHITECTURE.md` §7 and §7A.

---

## 1. Health & Root

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Liveness probe. Returns uptime, env, timestamp. Used by Render health checks. |
| `GET` | `/api/v1/` | — | API index — name, version, docs pointer. |

---

## 2. Authentication — `/api/v1/auth`

| Method | Path | Auth | Rate limit | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | — | 10 / 15 min | Create an account. Self-service is limited to `parent`; staff accounts are created by admins. |
| `POST` | `/auth/login` | — | 10 / 15 min | Returns `accessToken` + sets `refreshToken` cookie. |
| `POST` | `/auth/refresh` | Cookie | — | Rotates the refresh token. Token reuse revokes **all** sessions. |
| `POST` | `/auth/logout` | Cookie | — | Revokes the presented refresh token, clears the cookie. |
| `GET` | `/auth/me` | Bearer | — | Current user + linked student/ward records. |
| `PATCH` | `/auth/change-password` | Bearer | — | Requires current password. Invalidates all other sessions. |
| `POST` | `/auth/forgot-password` | — | 10 / 15 min | Always returns 200 — never reveals whether an email exists. |
| `POST` | `/auth/reset-password` | — | 10 / 15 min | Consumes a SHA-256 hashed, 30-minute token. |

<details><summary><code>POST /auth/login</code> — request / response</summary>

```jsonc
// Request
{ "email": "riseuppublicschool48@gmail.com", "password": "••••••••" }

// 200
{ "success": true, "message": "Signed in",
  "data": {
    "user": { "id": "66b...", "name": "School Administrator", "role": "super_admin", "mustChangePassword": true },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  } }
```
</details>

---

## 3. Public content — `/api/v1`

No authentication. Cached by Next.js with ISR (`revalidate`).

### 3.1 Site configuration & CMS pages

| Method | Path | Description | Used by |
|---|---|---|---|
| `GET` | `/settings` | School profile, contacts, leadership, feature toggles, SEO defaults. | Header, Footer, everywhere |
| `GET` | `/pages/:key` | Editable CMS page. Keys: `about-us`, `principal-message`, `founder-message`, `facilities`, `admission-process`, `mandatory-disclosure`, `privacy-policy`. | `/about`, `/facilities`, … |

### 3.2 Notices & circulars

| Method | Path | Description |
|---|---|---|
| `GET` | `/notices` | Published notices within the publish window. Pinned first. Supports `?category=&search=&page=&limit=`. Body omitted from list responses. |
| `GET` | `/notices/:slug` | Single notice with full body + attachments. Increments `views`. |

Categories: `general` `academic` `examination` `holiday` `admission` `event` `circular` `result` `vacancy`

### 3.3 Events & academic calendar

| Method | Path | Description |
|---|---|---|
| `GET` | `/events` | Calendar feed. `?session=2026-27&category=exam&from=2026-04-01&to=2027-03-31`. Max 500 records. |
| `GET` | `/events/upcoming` | Next N events from today. `?limit=6` (max 20). |
| `GET` | `/events/:slug` | Single event. |

Categories: `academic` `cultural` `sports` `holiday` `exam` `ptm` `celebration` `trip`

### 3.4 Gallery

| Method | Path | Description |
|---|---|---|
| `GET` | `/gallery` | Album list with cover + `photoCount` (photo arrays stripped for payload size). `?category=` |
| `GET` | `/gallery/:slug` | Single album with all photos, captions and alt text. |

### 3.5 Faculty, downloads, fees, testimonials

| Method | Path | Description |
|---|---|---|
| `GET` | `/staff` | Public faculty directory. Email and phone are stripped. `?category=teaching&department=primary` |
| `GET` | `/downloads` | Published documents. `?category=mandatory_disclosure` |
| `GET` | `/fees/structure` | Class-wise published fee structure (fee transparency requirement). `?session=2026-27` |
| `GET` | `/testimonials` | Approved parent testimonials (max 24). |
| `POST` | `/testimonials` | Submit a testimonial. Held unapproved until moderated. **10 / hour** |

### 3.6 Admissions (public)

| Method | Path | Rate limit | Description |
|---|---|---|---|
| `POST` | `/admissions/enquiry` | 10 / hour | Lightweight enquiry. Honeypot + DPDP consent required. Returns an application number. |
| `POST` | `/admissions/apply` | 10 / hour | Full application. *multipart/JSON* — up to 8 documents. |
| `POST` | `/admissions/upload-signature` | 10 / hour | §3.6a below. Public — no auth, since an applicant isn't signed in yet. Folder is hardcoded to `admissions`, not caller-selectable. |
| `GET` | `/admissions/track/:applicationNo` | — | Status lookup. Requires `?phone=` matching the record — acts as the shared secret. |

<details><summary><code>POST /admissions/enquiry</code> — request / response</summary>

```jsonc
// Request
{
  "student":  { "firstName": "Aarav", "lastName": "Dubey", "dob": "2015-06-12",
                "gender": "male", "classApplyingFor": "VI", "stream": "NA",
                "previousSchool": "Saraswati Vidya Mandir" },
  "parent":   { "guardianName": "Suresh Dubey", "relation": "Father",
                "phone": "9450338917", "altPhone": "8052397504",
                "email": "suresh@example.com", "occupation": "Farmer" },
  "address":  { "village": "Pipargaon", "pincode": "221301", "state": "Uttar Pradesh" },
  "message":  "Please share transport routes for Pipargaon.",
  "consent":  true,
  "website":  ""            // honeypot — must be empty
}

// 201
{ "success": true,
  "message": "Thank you! Your enquiry has been received. Our admissions team will contact you shortly.",
  "data": { "applicationNo": "RUPS/2026/00001", "id": "66b1f..." } }
```

**`POST /admissions/apply`** — `multipart/form-data` variant (local dev):
- `data` — JSON string with the same shape as above
- `documentTypes[]` — parallel array: `birth_certificate` `transfer_certificate` `report_card` `aadhaar` `photo` `caste_certificate` `other`
- `documents` — up to 8 files (PDF / JPEG / PNG / WebP, ≤ 8 MB each)

**`POST /admissions/apply`** — `application/json` variant (production): the
same top-level shape as the enquiry above, plus `documents`, each already
uploaded via §3.6a:
```jsonc
{ "student": { /* ... */ }, "parent": { /* ... */ }, "consent": true,
  "documents": [
    { "type": "birth_certificate", "url": "https://res.cloudinary.com/.../birth.pdf",
      "publicId": "riseup-school/admissions/abc123", "mime": "application/pdf", "sizeKb": 340 }
  ] }
```
</details>

### 3.6a Direct upload signature (public)

<details><summary><code>POST /admissions/upload-signature</code> — request / response</summary>

```jsonc
// Request — empty body, no auth
{}

// 200
{ "success": true, "data": {
    "timestamp": 1785900000, "signature": "9c2f...",
    "apiKey": "123456789012345", "cloudName": "riseup-school",
    "folder": "riseup-school/admissions", "allowedFormats": "jpg,jpeg,png,webp,avif,pdf,doc,docx"
} }
```
The browser then POSTs the file, together with these exact fields, straight
to `https://api.cloudinary.com/v1_1/<cloudName>/auto/upload` — see
`web/lib/upload.js`. `folder` and `allowedFormats` are part of the signed
payload; changing either before upload invalidates the signature.
</details>

### 3.7 Contact

| Method | Path | Rate limit | Description |
|---|---|---|---|
| `POST` | `/contact` | 10 / hour | Contact form. Honeypot protected. Emails the school inbox. |

---

## 4. Parent & Student Portal — `/api/v1/portal`

All routes require `Authorization: Bearer`. Parents see only their wards; students only themselves; staff see everyone.

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/portal/dashboard` | student, parent | One call returns: student profile, month attendance %, latest published result, recent homework, pending invoices, total dues, latest notices. |
| `GET` | `/portal/students/:studentId/attendance` | scoped | Day-by-day records + summary + percentage. `?from=&to=` |
| `GET` | `/portal/students/:studentId/results` | scoped | Published results only. `?session=2026-27` |
| `GET` | `/portal/students/:studentId/invoices` | scoped | Invoices with payments and computed balance. |
| `GET` | `/portal/homework` | scoped | Homework auto-filtered to the ward's class + section. |
| `POST` | `/portal/payments/order` | any authed | Creates a gateway order + local `Payment` in `created` state. |
| `POST` | `/portal/payments/verify` | any authed | Verifies the checkout signature, settles the payment, reconciles the invoice. |
| `GET` | `/portal/payments/:receiptNo` | any authed | Fetch a receipt. |

<details><summary>Payment order &rarr; verify flow</summary>

```jsonc
// 1. POST /portal/payments/order
{ "invoiceId": "66b2...", "amount": 1500, "purpose": "fee",
  "payerName": "Suresh Dubey", "payerPhone": "9450338917", "payerEmail": "suresh@example.com" }

// 201
{ "data": { "paymentId": "66b3...", "receiptNo": "RCPT/2026/000123",
            "order": { "id": "order_Nx1a...", "amount": 150000, "currency": "INR" },
            "keyId": "rzp_live_xxx",
            "prefill": { "name": "Suresh Dubey", "contact": "9450338917", "email": "suresh@example.com" } } }

// 2. Browser opens Razorpay Checkout with order.id + keyId
// 3. POST /portal/payments/verify with the handler payload
{ "razorpay_order_id": "order_Nx1a...", "razorpay_payment_id": "pay_Nx1b...", "razorpay_signature": "9ef4..." }
```
Amounts are sent to the API **in rupees**; the service converts to paise for Razorpay.
</details>

---

## 5. Admin — `/api/v1/admin`

All routes require `Authorization: Bearer` plus a role.

Role shorthands used below:
- **CMS** = `super_admin` · `admin` · `principal`
- **STAFF** = CMS + `teacher`
- **FINANCE** = `super_admin` · `admin` · `accountant`
- **OWNER** = `super_admin` · `admin`

### 5.1 Dashboard

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | CMS | Aggregated counters: students, staff, new enquiries, unread messages, 30-day collection, outstanding fees, notices, albums, upcoming events, students-by-class histogram. |

### 5.2 Content management

| Method | Path | Roles | Body | Description |
|---|---|---|---|---|
| `POST` | `/admin/uploads/signature` | CMS | json | §5.2a below. `{ "folder": "gallery" }` — folder must be one of `gallery` `notices` `events` `staff` `downloads` `students`, else falls back to `misc`. |
| `POST` | `/admin/notices` | CMS | multipart/JSON | Create a notice, up to 5 attachments. Auto-generates a unique slug and excerpt. |
| `PATCH` | `/admin/notices/:id` | CMS | multipart/JSON | Update. Regenerates the slug if the title changes. |
| `DELETE` | `/admin/notices/:id` | CMS | — | Deletes the notice and its stored attachments. |
| `POST` | `/admin/events` | CMS | multipart/JSON | Create an event with an optional cover image. |
| `PATCH` | `/admin/events/:id` | CMS | multipart/JSON | Update. |
| `DELETE` | `/admin/events/:id` | CMS | — | Delete + remove cover from storage. |
| `POST` | `/admin/gallery` | CMS | multipart/JSON | Create an album, up to 20 photos. First photo becomes the cover. |
| `POST` | `/admin/gallery/:id/photos` | CMS | multipart/JSON | Append up to 20 photos to an existing album. |
| `DELETE` | `/admin/gallery/:id/photos/:photoId` | CMS | — | Remove one photo (also deletes it from storage). |
| `DELETE` | `/admin/gallery/:id` | CMS | — | Delete the album and every stored photo. |
| `POST` | `/admin/staff` | CMS | multipart/JSON | Add a staff member with a photo. |
| `PATCH` | `/admin/staff/:id` | CMS | multipart/JSON | Update. |
| `DELETE` | `/admin/staff/:id` | CMS | — | Remove. |
| `PUT` | `/admin/pages/:key` | CMS | json | Upsert a CMS page. |
| `POST` | `/admin/downloads` | CMS | multipart/JSON | Upload a document. **Upload mandatory-disclosure PDFs here** with `category=mandatory_disclosure`. |
| `DELETE` | `/admin/downloads/:id` | CMS | — | Delete. |
| `PATCH` | `/admin/testimonials/:id` | CMS | json | `{ "isApproved": true }` — moderate. |
| `PATCH` | `/admin/settings` | OWNER | json | Update site settings (school profile, contacts, toggles, announcement bar). |

### 5.2a Direct upload signature (admin)

<details><summary><code>POST /admin/uploads/signature</code> — request / response</summary>

```jsonc
// Request
{ "folder": "gallery" }

// 200
{ "success": true, "data": {
    "timestamp": 1785900000, "signature": "4a1e...",
    "apiKey": "123456789012345", "cloudName": "riseup-school",
    "folder": "riseup-school/gallery", "allowedFormats": "jpg,jpeg,png,webp,avif"
} }
```
400s with `Direct uploads require STORAGE_DRIVER=cloudinary` if the API isn't
configured for it yet — this is the local-dev default, so the admin panel's
upload UI should expect that response while `STORAGE_DRIVER=local`.
</details>

### 5.3 Admissions CRM

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/admin/admissions` | CMS | Paginated list. Filters: `status`, `type`, `session`, `classLevel`, `search` (matches application no., student name, guardian name, phone). |
| `GET` | `/admin/admissions/stats` | CMS | Aggregates by status, by class, and monthly trend (24 months). |
| `GET` | `/admin/admissions/:id` | CMS | Full record with documents and status history. |
| `PATCH` | `/admin/admissions/:id/status` | CMS | Move through the pipeline; appends to `statusHistory` and writes an audit log. |
| `DELETE` | `/admin/admissions/:id` | OWNER | Hard delete (audited). |

Pipeline: `new` → `contacted` → `documents_pending` → `shortlisted` → `admitted` (or `rejected` / `withdrawn`)

### 5.4 Contact inbox

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/admin/messages` | CMS | Paginated. `?status=new&category=admission` |
| `PATCH` | `/admin/messages/:id` | CMS | Set status (`read` / `responded` / `closed` / `spam`) + response note. |

### 5.5 Students

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/admin/students` | STAFF | Paginated. `?classLevel=&section=&session=&status=&search=` |
| `GET` | `/admin/students/:id` | STAFF | Full record + linked user account. |
| `POST` | `/admin/students` | CMS | Enrol a student. *multipart/JSON* — optional photo. |
| `PATCH` | `/admin/students/:id` | CMS | Update. *multipart/JSON*. |
| `DELETE` | `/admin/students/:id` | OWNER | **Soft delete** — sets `status: inactive`. Academic history is never destroyed. |
| `POST` | `/admin/students/:id/portal-access` | CMS | Creates/links a parent account, generates a temporary password, emails credentials. |
| `POST` | `/admin/students/from-admission/:admissionId` | CMS | Converts an `admitted` application into a Student record with a generated admission number. |

### 5.6 Attendance

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/admin/attendance/register` | STAFF | Class register for a date: every active student with today's mark (or `null`). `?classLevel=VI&section=A&date=2026-08-05` |
| `POST` | `/admin/attendance` | STAFF | Bulk upsert via `bulkWrite`. Idempotent on `(student, date)` — safe to re-submit. |

<details><summary><code>POST /admin/attendance</code></summary>

```jsonc
{ "classLevel": "VI", "section": "A", "date": "2026-08-05",
  "entries": [
    { "student": "66b4...", "status": "present" },
    { "student": "66b5...", "status": "absent", "remark": "Informed by parent" },
    { "student": "66b6...", "status": "late" }
  ] }
```
Statuses: `present` `absent` `late` `half_day` `leave` `holiday`
</details>

### 5.7 Results

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/admin/results` | STAFF | Upsert one student's exam result. Totals, percentage and CBSE-style grade (A1–E) are computed by a pre-save hook. |
| `PATCH` | `/admin/results/publish` | CMS | Publish a whole exam for a class in one call and fire SMS to parents. |

Exam types: `unit_test_1` `unit_test_2` `unit_test_3` `unit_test_4` `half_yearly` `annual` `pre_board`

### 5.8 Homework

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/admin/homework` | STAFF | Assign homework to a class + section. |
| `DELETE` | `/admin/homework/:id` | STAFF | Delete. |

### 5.9 Fees & payments

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/admin/fees/invoices/generate` | FINANCE | Bulk-generate a period's invoices for a class from the fee structure. Skips students already invoiced for that period (idempotent). Honours the transport opt-in flag. |
| `GET` | `/admin/payments` | FINANCE | Last 200 payments + total collected. `?status=paid&purpose=fee` |
| `POST` | `/admin/payments/:id/refund` | OWNER | Initiate a gateway refund (audited). |

---

## 6. Webhooks — `/api/v1/webhooks`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhooks/razorpay` | `X-Razorpay-Signature` HMAC | Source of truth for payment state. Mounted **before** `express.json()` so the raw body is available for signature verification. Always returns 200 quickly. Handles `payment.captured` and `payment.failed`. Idempotent. |

Configure in the Razorpay dashboard → Settings → Webhooks:
`https://<your-server-project>.vercel.app/api/v1/webhooks/razorpay`

⚠️ Raw-body handling on Vercel was not verified against a live deployment —
send one test webhook and check the API logs before enabling
`PAYMENTS_DRIVER=razorpay` in production. See `docs/ARCHITECTURE.md` §7A.

---

## 7. Endpoints still to be added (roadmap)

These are **not** implemented yet. Listed so the next developer knows where the seams are.

| Method | Path | Purpose | Priority |
|---|---|---|---|
| `GET` | `/admin/students/:id/report-card.pdf` | Server-generated PDF report card | High |
| `GET` | `/portal/payments/:receiptNo/receipt.pdf` | Downloadable PDF receipt | High |
| `GET` | `/admin/exports/students.xlsx` | Excel export for the office | Medium |
| `GET` | `/admin/exports/admissions.csv` | Enquiry export for follow-up calling | Medium |
| `POST` | `/admin/notices/:id/broadcast` | Push a notice to parents by SMS/WhatsApp | Medium |
| `GET` | `/timetable` · `/admin/timetable` | Class timetable CRUD + public view | Medium |
| `GET/POST` | `/admin/transport/routes` | Bus routes, stops, driver details | Medium |
| `POST` | `/portal/leave-application` | Parent-submitted leave requests | Medium |
| `GET` | `/admin/library/*` | Book catalogue and issue/return | Low |
| `POST` | `/auth/otp/send` · `/auth/otp/verify` | Mobile-OTP login for parents without email | Low |
| `GET` | `/api/v1/search` | Site-wide search across notices, pages, events | Low |
| `POST` | `/admin/revalidate` | Trigger Next.js on-demand ISR after a content edit | High |

---

## 8. Third-party APIs to integrate

Each one is already abstracted behind a service in `server/src/services/`, with a `log`/`mock` driver so nothing breaks before credentials exist. Switching to live is an `.env` change, not a code change.

| # | Service | Purpose | Env variables | Driver file | Status |
|---|---|---|---|---|---|
| 1 | **MongoDB Atlas** | Primary database | `MONGODB_URI` | `config/db.js` | Required |
| 2 | **Razorpay** | Fee & application-fee payments (UPI, cards, netbanking) | `PAYMENTS_DRIVER=razorpay` `RAZORPAY_KEY_ID` `RAZORPAY_KEY_SECRET` `RAZORPAY_WEBHOOK_SECRET` | `services/payment.service.js` | Mocked |
| 3 | **Cloudinary** | Image/document CDN, on-the-fly resizing, direct browser uploads (§5.2a / §3.6a) | `STORAGE_DRIVER=cloudinary` `CLOUDINARY_CLOUD_NAME` `CLOUDINARY_API_KEY` `CLOUDINARY_API_SECRET` | `services/storage.service.js` | Local driver active in dev — **required** in production (Vercel's filesystem can't take `local`) |
| — | **Upstash Redis** | Shared rate-limit store across serverless invocations | `UPSTASH_REDIS_REST_URL` `UPSTASH_REDIS_REST_TOKEN` | `middleware/rateLimiter.js` | In-memory fallback active — rate limiting is a no-op in production without this |
| 4 | **SMTP** (Gmail / Brevo / Resend) | Transactional email — enquiry confirmations, receipts, portal credentials, password resets | `MAIL_DRIVER=smtp` `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `MAIL_FROM` | `services/email.service.js` | Log driver active |
| 5 | **MSG91** | Transactional SMS (DLT-registered templates required in India) | `SMS_DRIVER=msg91` `MSG91_AUTH_KEY` `MSG91_SENDER_ID` `MSG91_TEMPLATE_*` | `services/sms.service.js` | Log driver active |
| 6 | **Meta WhatsApp Cloud API** | WhatsApp notices, fee reminders, result alerts | `WHATSAPP_DRIVER=meta` `WHATSAPP_PHONE_NUMBER_ID` `WHATSAPP_TOKEN` | `services/whatsapp.service.js` | Log driver active |
| 7 | **Google Maps Embed** | Location map on `/contact` | None (iframe embed) | `app/contact/page.js` | Live — replace with the verified Business Profile link |
| 8 | **Google Search Console** | Sitemap submission, indexing | Verification meta tag | `app/layout.js` metadata | To do |
| 9 | **Google Analytics 4** | Traffic and enquiry-conversion tracking | `NEXT_PUBLIC_GA_ID` | To be added in `app/layout.js` | To do |
| 10 | **Google Business Profile** | Local SEO — the single highest-impact item for a village school | — | External | To do |

### Setup order that matters
1. **MongoDB Atlas** — nothing runs without it.
2. **SMTP** — so enquiries actually reach the school inbox. Use a Gmail *App Password*, not the account password.
3. **Cloudinary** — before the first real photo upload (Render's disk is ephemeral; local uploads vanish on redeploy).
4. **Google Business Profile + Search Console** — before announcing the site.
5. **MSG91** — DLT template registration takes 3–7 working days; start early.
6. **Razorpay** — needs the trust's bank account and KYC. Keep `PAYMENTS_DRIVER=mock` until then.

### India-specific compliance notes
- **DLT registration** is mandatory for transactional SMS. Register the sender ID and each template with your telecom operator before `SMS_DRIVER=msg91` will deliver anything.
- **WhatsApp** business-initiated messages must use pre-approved templates; free-form text only works within a 24-hour customer service window.
- **DPDP Act 2023** — the enquiry form captures explicit consent (`consent: true` is required by the validator) because the data concerns a minor. Do not remove that field.
- **PCI-DSS** — card details never touch this server. Razorpay Checkout collects them directly; we only store order/payment IDs.
