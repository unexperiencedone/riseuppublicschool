# Deployment Guide
### Vercel (frontend) + Render (API) + MongoDB Atlas (database)

Target cost: **₹0/month** on free tiers, with one paid upgrade recommended before launch.

---

## Step 1 — MongoDB Atlas

1. Create a free **M0** cluster at [cloud.mongodb.com](https://cloud.mongodb.com). Choose the **Mumbai (ap-south-1)** region — lowest latency for users in UP.
2. **Database Access** → Add a user, e.g. `rups_app`, with a strong generated password and the `readWrite` role on `riseup_school`.
3. **Network Access** → Add `0.0.0.0/0` initially. Once the API is deployed, replace it with Render's static egress IPs.
4. Copy the connection string:
   ```
   mongodb+srv://rups_app:<password>@cluster0.xxxxx.mongodb.net/riseup_school?retryWrites=true&w=majority
   ```
5. **Backup** → confirm daily snapshots are enabled.

---

## Step 2 — API on Render

1. Push the repository to GitHub.
2. Render → **New → Web Service** → connect the repo.
3. Settings:
   | Field | Value |
   |---|---|
   | Root directory | `server` |
   | Runtime | Node |
   | Build command | `npm install` |
   | Start command | `npm start` |
   | Health check path | `/health` |
   | Region | Singapore (closest available to India) |
4. **Environment variables** (Dashboard → Environment):
   ```
   NODE_ENV=production
   PORT=5000
   API_PREFIX=/api/v1
   MONGODB_URI=<Atlas string from step 1>
   CLIENT_URL=https://<your-vercel-domain>
   ADMIN_URL=https://<your-vercel-domain>
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
   Generate the secrets with:
   ```bash
   openssl rand -hex 32
   ```
5. Deploy. Confirm `https://<app>.onrender.com/health` returns `{"success":true,"status":"ok",...}`.
6. **Render → Shell** → seed the database once:
   ```bash
   npm run seed
   ```
   This creates the settings singleton, CMS pages, staff, notices, the full 2026-27 calendar, six gallery albums, all 16 classes, fee placeholders, and the super-admin account.

---

## Step 3 — Frontend on Vercel

1. Vercel → **Add New → Project** → import the same repo.
2. Settings:
   | Field | Value |
   |---|---|
   | Root directory | `web` |
   | Framework preset | Next.js (auto-detected) |
   | Build command | `next build` (default) |
   | Node version | 20.x |
3. **Environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://<render-app>.onrender.com/api/v1
   NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
   NEXT_PUBLIC_SCHOOL_PHONE=9170285353
   NEXT_PUBLIC_SCHOOL_EMAIL=riseuppublicschool48@gmail.com
   NEXT_PUBLIC_WHATSAPP=919170285353
   API_URL=https://<render-app>.onrender.com/api/v1
   REVALIDATE_SECONDS=300
   ```
4. Deploy.
5. **Go back to Render** and set `CLIENT_URL` / `ADMIN_URL` to the real Vercel domain, then redeploy the API.

> ⚠️ The most common deployment failure is a `CLIENT_URL` / `NEXT_PUBLIC_API_URL` mismatch. It surfaces as CORS errors in the browser console that look like network failures.

---

## Step 4 — Custom domain

1. Buy the domain (e.g. `riseuppublicschool.in`).
2. Vercel → Project → Settings → Domains → add both `riseuppublicschool.in` and `www.riseuppublicschool.in`.
3. Add the DNS records Vercel shows at your registrar. SSL is issued automatically.
4. Update on Vercel: `NEXT_PUBLIC_SITE_URL=https://riseuppublicschool.in`
5. Update on Render: `CLIENT_URL` and `ADMIN_URL` to the same value. Redeploy both.

---

## Step 5 — Post-deploy checklist

- [ ] `/health` returns 200
- [ ] Homepage renders with notices and gallery from the database (not fallback)
- [ ] Submit a test enquiry → application number returned → email arrives in the school inbox
- [ ] Sign in at `/admin/login` → **change the seeded password immediately**
- [ ] Publish a test notice from the admin panel → appears on `/notices` within 2 minutes
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
cp .env.example .env          # edit MONGODB_URI
npm install
npm run seed                  # first time only
npm run dev                   # → http://localhost:5000/api/v1

# Terminal 2 — Website
cd web
cp .env.example .env.local
npm install
npm run dev                   # → http://localhost:3000
```

MongoDB locally: either install MongoDB Community, or point `MONGODB_URI` at a
free Atlas cluster — the latter is simpler and matches production.

---

## Cost

| Service | Free tier | When to upgrade |
|---|---|---|
| Vercel Hobby | 100 GB bandwidth/month | Not needed at this scale |
| Render Free | 750 hrs/month, **sleeps after 15 min idle** | **Before launch.** ~$7/month keeps the API awake. A cold start is 30–60 s. |
| MongoDB Atlas M0 | 512 MB storage | At roughly 5,000+ students with full attendance history |
| Cloudinary Free | 25 GB storage + 25 GB bandwidth | Well beyond current needs |
| Domain `.in` | — | ~₹700–1,200/year |

**Minimum realistic running cost: ~₹600/month** (Render paid instance) plus the domain.

Until the paid Render instance is in place, the frontend's static fallback keeps
the site fully readable during a cold start — visitors see a complete website,
just with content that may be a few minutes stale.

---

## Rollback

- **Vercel** — Deployments → select the previous deployment → Promote to Production. Instant.
- **Render** — Events → select a previous deploy → Rollback.
- **Database** — Atlas → Backup → restore a snapshot. Take a manual snapshot before any schema change.
