# Rise UP Public School — Website, Parent Portal & Admin Panel

A production-ready MERN application for **Rise UP Public School**, Pipargaon (Aurai),
Sant Ravidas Nagar (Bhadohi), Uttar Pradesh — run by the *Rise UP Public Shiksha Seva
Samiti Trust*, established 2024.

**Stack:** MongoDB · Express · **Next.js 14** (App Router) · Node.js

---

## What's in the box

| | |
|---|---|
| 🌐 **Public website** | 18 routes — home, about, founder & principal messages, academics, academic calendar, admissions, fees, facilities, faculty, gallery, events, notices, downloads, mandatory disclosure, contact, privacy |
| 👨‍👩‍👧 **Parent & student portal** | Attendance, results, homework, fee invoices, school notices |
| 🛠 **Admin panel** | Dashboard with live metrics; full CRUD API behind it |
| 🔌 **REST API** | **79 endpoints**, JWT auth with refresh rotation, 7 roles, RBAC + row-level scoping |
| 📅 **Real data** | The complete 2026-27 academic calendar (55 entries) transcribed from the school's printed calendar |
| 📸 **Real photographs** | 24 supplied photos, optimised and organised into 6 albums |
| 💳 **Payments** | Razorpay order → verify → webhook, idempotent settlement |
| 📨 **Notifications** | Email, SMS (MSG91) and WhatsApp (Meta) behind one orchestrator |

---

## Documentation

| File | What it covers |
|---|---|
| **[`API_ENDPOINTS.md`](./API_ENDPOINTS.md)** | Every one of the 79 endpoints — method, path, auth, roles, request/response examples · endpoints still to be added · **all 10 third-party APIs to integrate**, with env vars and setup order |
| **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** | System topology · the middleware chain and why its order matters · **documented pipelines** for auth, admissions, payments, uploads, content publishing, attendance & results · data model · security posture · deployment pipeline · known gaps |
| **[`docs/RESEARCH.md`](./docs/RESEARCH.md)** | School-website benchmarking, CBSE mandatory disclosure requirements, positioning, visual identity, information architecture, SEO decisions |
| **[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)** | Step-by-step Vercel + Render + Atlas deployment, env vars, post-deploy checklist, cost breakdown, rollback |
| **[`docs/CONTENT_CHECKLIST.md`](./docs/CONTENT_CHECKLIST.md)** | Everything the school must supply before launch, prioritised 🔴🟠🟡 |

---

## Repository layout

```
RiseUpPublicSchool/
├── README.md
├── API_ENDPOINTS.md              ← endpoint reference + third-party APIs
├── docs/
│   ├── ARCHITECTURE.md           ← backend pipelines
│   ├── RESEARCH.md
│   ├── DEPLOYMENT.md
│   └── CONTENT_CHECKLIST.md
│
├── server/                       ← Express + MongoDB API
│   ├── .env.example
│   └── src/
│       ├── app.js                ← middleware chain (order is load-bearing)
│       ├── server.js             ← bootstrap + graceful shutdown
│       ├── config/               ← env, db, logger
│       ├── models/               ← 20 Mongoose models
│       ├── controllers/          ← 7 controllers
│       ├── routes/               ← auth · public · portal · admin · webhooks
│       ├── middleware/           ← auth · rbac · validate · rateLimit · upload · audit · errors
│       ├── services/             ← email · sms · whatsapp · payment · storage · notification
│       ├── validators/           ← Zod schemas
│       ├── templates/            ← branded HTML email templates
│       └── seed/                 ← idempotent seeder + real school data
│
└── web/                          ← Next.js 14 App Router
    ├── .env.example
    ├── app/                      ← 18 public routes + portal + admin + sitemap/robots
    ├── components/               ← header, footer, home sections, forms, lightbox, ui kit
    ├── lib/                      ← config · api client · auth · calendar · fallback content
    └── public/images/            ← brand, campus, 24 gallery photos
```

---

## Quick start

```bash
# API
cd server
cp .env.example .env          # set MONGODB_URI
npm install
npm run seed                  # loads calendar, gallery, pages, staff, admin account
npm run dev                   # http://localhost:5000/api/v1

# Website
cd web
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

Seeded admin login: the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env`.
**Change the password on first sign-in.**

---

## Design notes

**Brand colours are sampled from the school crest** — deep green `#0B5D34`,
navy `#16306B`, gold `#F5B301` — expanded into full 50–900 ramps.
Fraunces for headings, Inter for body text.

**Every photograph is real.** No stock imagery anywhere on the site.

**The site works with the API switched off.** `web/lib/fallback.js` mirrors the
seeded content, so a cold-starting free-tier API never produces an error page.

**Nothing is claimed that the school cannot substantiate.** Unknown figures on the
mandatory-disclosure page say "To be updated" rather than being invented, and the
fee page shows a "contact the office" state until real figures are entered.

---

## Verified

- ✅ `next build` — 38 routes compiled, First Load JS **101 kB**
- ✅ `next lint` — no warnings or errors
- ✅ API route table — **79 routes** resolve correctly
- ✅ 13/13 API smoke tests pass (health, validation, auth, RBAC, 404, NoSQL-injection rejection, honeypot)

---

## Before launch

Read **[`docs/CONTENT_CHECKLIST.md`](./docs/CONTENT_CHECKLIST.md)**. The six 🔴 blocking items are:
fee structure, admin password change, affiliation/UDISE codes, statutory certificate PDFs,
full staff list, and resolving the **Play Group–VIII vs Play Group–XII** discrepancy between
the printed calendar and this website.
