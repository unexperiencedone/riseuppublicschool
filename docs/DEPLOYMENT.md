# Deployment Guide
### Vercel (frontend) + Vercel (API) + MongoDB Atlas (database)

Both the Next.js frontend and the Express API deploy to Vercel as **two
separate projects** from the same monorepo — one with root directory `web/`,
one with root directory `server/`. Target cost: **₹0/month** on free tiers.

---

## Step 1 — MongoDB Atlas

1. Create a free **M0** cluster at [cloud.mongodb.com](https://cloud.mongodb.com). Choose the **Mumbai (ap-south-1)** region — lowest latency for users in UP.
2. **Database Access** → Add a user, e.g. `rups_app`, with a strong generated password and the `readWrite` role on `riseup_school`.
3. **Network Access** → Add `0.0.0.0/0`. Vercel functions run on a large, changing pool of IPs with no fixed range to allowlist instead — this is not optional the way it might be on a platform with static egress IPs.
4. Copy the connection string:
   ```
   mongodb+srv://rups_app:<password>@cluster0.xxxxx.mongodb.net/riseup_school?retryWrites=true&w=majority
   ```
5. **Backup** → confirm daily snapshots are enabled.

---

## Step 2 — Cloudinary (required in production — not optional)

Vercel's filesystem is read-only outside `/tmp`, and its Node functions have
a hard 4.5 MB request body limit. `STORAGE_DRIVER=local` cannot work at all
once deployed, and the API's upload routes rely on the browser uploading
straight to Cloudinary (see `docs/ARCHITECTURE.md` §7A).

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From the dashboard, copy **Cloud name**, **API Key**, **API Secret**.
3. Nothing else to configure server-side — no upload preset needed, uploads are signed per-request by the API.
4. Optional but recommended: **Settings → Upload** → set a per-file size limit. The signed-upload flow restricts *folder* and *file format* (`allowed_formats`) but Cloudinary's plain signed-upload endpoint has no signable "max bytes" parameter, so a size cap has to be set on the account itself.

---

## Step 3 — Upstash Redis (recommended — rate limiting is meaningless without it)

Each Vercel invocation is an independent process with its own memory, so
`express-rate-limit`'s default in-memory store counts nothing across
invocations — every request looks like the first one. Skipping this step
does not break anything; it just means the rate limiters silently do nothing
in production.

1. Create a free database at [upstash.com](https://upstash.com) (Redis).
2. Copy the **REST URL** and **REST Token** (not the `redis://` / ioredis connection string — the API uses the HTTP client, which works from a stateless function; a TCP `redis://` connection does not).

---

## Step 4 — API as a Vercel project (root directory `server/`)

1. Push the repository to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. Settings:
   | Field | Value |
   |---|---|
   | Root directory | `server` |
   | Framework preset | Other |
   | Build command | (leave default / none needed) |
   | Install command | `npm install` |
   | Node version | 20.x |

   `server/vercel.json` (already in the repo) handles the rest: it rewrites
   every path to `api/index.js` and sets `maxDuration: 30` for that function.
4. **Environment variables** (Project → Settings → Environment Variables):
   ```
   NODE_ENV=production
   API_PREFIX=/api/v1
   MONGODB_URI=<Atlas string from step 1>
   CLIENT_URL=https://<your-web-project>.vercel.app
   ADMIN_URL=https://<your-web-project>.vercel.app
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=30d
   BCRYPT_ROUNDS=10
   SEED_ADMIN_EMAIL=riseuppublicschool48@gmail.com
   SEED_ADMIN_PASSWORD=<a strong temporary password>
   STORAGE_DRIVER=cloudinary
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   MAIL_DRIVER=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=riseuppublicschool48@gmail.com
   SMTP_PASS=<Gmail App Password, not the account password>
   MAIL_FROM="Rise UP Public School <riseuppublicschool48@gmail.com>"
   MAIL_ADMIN_INBOX=riseuppublicschool48@gmail.com
   SMS_DRIVER=log
   WHATSAPP_DRIVER=log
   PAYMENTS_DRIVER=mock
   ```
   Note what's **not** here: `PORT` — Vercel controls the port for you; the
   Express app's own `app.listen(env.port)` in `src/server.js` never runs on
   Vercel (`api/index.js` is the entry point there instead).

   Generate the JWT secrets with:
   ```bash
   openssl rand -hex 32
   ```
5. Deploy. Confirm `https://<server-project>.vercel.app/health` returns `{"success":true,"status":"ok",...}`.
6. **Seed the database from your own machine**, not from Vercel — there is no
   long-running shell to exec into the way Render offered one:
   ```bash
   cd server
   MONGODB_URI="<same Atlas string as step 4>" npm run seed
   ```
   This creates the settings singleton, CMS pages, staff, notices, the full 2026-27 calendar, six gallery albums, all 16 classes, fee placeholders, and the super-admin account.

---

## Step 5 — Frontend as a Vercel project (root directory `web/`)

1. Vercel → **Add New → Project** → import the **same repo again** (a second, independent project).
2. Settings:
   | Field | Value |
   |---|---|
   | Root directory | `web` |
   | Framework preset | Next.js (auto-detected) |
   | Build command | `next build` (default) |
   | Node version | 20.x |
3. **Environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://<server-project>.vercel.app/api/v1
   NEXT_PUBLIC_SITE_URL=https://<your-web-project>.vercel.app
   NEXT_PUBLIC_SCHOOL_PHONE=9170285353
   NEXT_PUBLIC_SCHOOL_EMAIL=riseuppublicschool48@gmail.com
   NEXT_PUBLIC_WHATSAPP=919170285353
   API_URL=https://<server-project>.vercel.app/api/v1
   REVALIDATE_SECONDS=300
   ```
4. Deploy.
5. **Go back to the API project** and set `CLIENT_URL` / `ADMIN_URL` to the real web project domain, then redeploy the API.

> ⚠️ The most common deployment failure is a `CLIENT_URL` / `NEXT_PUBLIC_API_URL` mismatch. It surfaces as CORS errors in the browser console that look like network failures. Both variables must point at the *actual* deployed domain of the other project, not a guessed one — Vercel assigns the domain on first deploy.

---

## Step 6 — Custom domain

1. Buy the domain (e.g. `riseuppublicschool.in`).
2. On the **web** project → Settings → Domains → add both `riseuppublicschool.in` and `www.riseuppublicschool.in`.
3. Add the DNS records Vercel shows at your registrar. SSL is issued automatically.
4. Update on the web project: `NEXT_PUBLIC_SITE_URL=https://riseuppublicschool.in`
5. Update on the **API** project: `CLIENT_URL` and `ADMIN_URL` to the same value. Redeploy both projects.
6. The API project can keep its `*.vercel.app` domain — nothing requires it to be on the custom domain too, since the frontend only ever talks to it via `NEXT_PUBLIC_API_URL`.

---

## Step 7 — Post-deploy checklist

- [ ] `/health` (API project) returns 200
- [ ] Homepage renders with notices and gallery from the database (not fallback)
- [ ] Submit a test enquiry → application number returned → email arrives in the school inbox
- [ ] Sign in at `/admin/login` → **change the seeded password immediately**
- [ ] Publish a test notice from the admin panel (JSON upload path) → appears on `/notices` within 2 minutes
- [ ] Upload a gallery photo end-to-end: request a signature → confirm the file lands in the Cloudinary media library under the expected folder → confirm the album shows it on `/gallery`
- [ ] Delete that same test photo from the admin panel → confirm it's actually gone from the Cloudinary media library, not just the database (`deleteFile` requires `STORAGE_DRIVER=cloudinary` — see docs/ARCHITECTURE.md §7A)
- [ ] **Before enabling `PAYMENTS_DRIVER=razorpay`:** send a test webhook from the Razorpay dashboard to `https://<server-project>.vercel.app/api/v1/webhooks/razorpay` and confirm the API log shows `Razorpay webhook: payment.captured`, not `Rejected Razorpay webhook: bad signature` or `req.body was not a raw Buffer` — this was not verified against a live Vercel deployment during development (see docs/ARCHITECTURE.md §7A)
- [ ] `/sitemap.xml` and `/robots.txt` resolve
- [ ] Test on a real Android phone over mobile data, not just desktop
- [ ] Submit the sitemap to Google Search Console
- [ ] Create the Google Business Profile and link the website
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO 100

---

## Local development

```bash
# Terminal 1 — API
cd server
cp .env.example .env          # edit MONGODB_URI; leave STORAGE_DRIVER=local and Upstash unset
npm install
npm run seed                  # first time only
npm run dev                   # → http://localhost:5000/api/v1  (src/server.js — app.listen, unaffected by any of the above)

# Terminal 2 — Website
cd web
cp .env.example .env.local
npm install
npm run dev                   # → http://localhost:3000
```

MongoDB locally: either install MongoDB Community, or point `MONGODB_URI` at a
free Atlas cluster — the latter is simpler and matches production.

No Cloudinary account, no Upstash account, and no Redis are required for
local development — every admin/public upload route falls back to the
`multipart/form-data` + multer + local-disk path automatically when the
request `Content-Type` isn't `application/json`, and every rate limiter falls
back to an in-memory store when the Upstash env vars are unset.

---

## Cost

| Service | Free tier | When to upgrade |
|---|---|---|
| Vercel Hobby (web project) | 100 GB bandwidth/month | Not needed at this scale |
| Vercel Hobby (API project) | Same plan, second project; functions cold-start after inactivity | If cold starts become a real problem, Vercel Pro removes most of that |
| MongoDB Atlas M0 | 512 MB storage | At roughly 5,000+ students with full attendance history |
| Cloudinary Free | 25 GB storage + 25 GB bandwidth | Well beyond current needs |
| Upstash Free | 10,000 commands/day | Well beyond current needs at this traffic |
| Domain `.in` | — | ~₹700–1,200/year |

**Minimum realistic running cost: the domain only**, until traffic outgrows
the free tiers above.

A cold start on the API project's Hobby-tier function is the same shape of
problem Render's free tier had — the frontend's static fallback content keeps
the site fully readable during one; visitors see a complete website, just
with content that may be a few minutes stale.

---

## Rollback

- **Either Vercel project** — Deployments → select the previous deployment → Promote to Production. Instant, and the two projects roll back independently of each other.
- **Database** — Atlas → Backup → restore a snapshot. Take a manual snapshot before any schema change.
