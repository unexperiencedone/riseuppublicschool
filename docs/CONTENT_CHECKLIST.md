# Pre-Launch Content Checklist

Everything the website needs from the school before it goes live.
Items are ordered by how badly their absence hurts.

---

## 🔴 Blocking — do not launch without these

| # | Item | Where it goes | Why it blocks |
|---|---|---|---|
| 1 | **Approved fee structure**, class by class | Admin → Settings, or `server/src/seed/data/fees.js` | Currently seeded as ₹0 and unpublished. The fees page shows "contact the office". Fee transparency is a disclosure requirement. |
| 2 | **Change the seeded admin password** | `/admin/login` → change password | `SEED_ADMIN_PASSWORD` from `.env` is a known default. |
| 3 | **Affiliation number, school code, UDISE code** | `/mandatory-disclosure` | Shows "To be updated". |
| 4 | **Statutory certificates as PDFs** — affiliation, trust registration, state NOC, recognition, building safety, fire safety, water & sanitation | Admin → Downloads, category `mandatory_disclosure` | Rows show "At school office" until uploaded. |
| 5 | **Full teaching & non-teaching staff list** — name, designation, qualifications, experience | Admin → Staff | Only the three named leaders exist. Faculty page shows a "coming soon" panel. |
| 6 | **Resolve PG–VIII vs PG–XII** | Everywhere | The site says Class XII; the printed calendar says Std. VIII. Fix the signage or tell me to change the site. |

---

## 🟠 Important — fix within the first fortnight

| # | Item | Where |
|---|---|---|
| 7 | Exact Google Maps location (verified Business Profile pin) | `web/app/contact/page.js` — replace the search-query embed |
| 8 | Campus area, built-up area, classroom count, lab count | `/mandatory-disclosure` infrastructure table |
| 9 | Social media links — Facebook, Instagram, YouTube | `web/components/Footer.js` (currently `#`) |
| 10 | Real classroom, laboratory and library photographs | Admin → Gallery. Facilities page currently reuses event photos. |
| 11 | School transport routes and stops | New Downloads entry, or a Transport page |
| 12 | Parent testimonials (with written permission) | Admin → Testimonials, then approve |
| 13 | Uniform details and supplier | Admissions page |
| 14 | School timings by stage | Academics page |
| 15 | Verified email deliverability — Gmail App Password or Brevo | `.env` `MAIL_DRIVER=smtp` |

---

## 🟡 Valuable — first quarter

| # | Item |
|---|---|
| 16 | Cloudinary account (Render's disk is ephemeral — uploads vanish on redeploy) |
| 17 | Google Business Profile — highest-value local SEO action available |
| 18 | Google Search Console — submit `sitemap.xml` |
| 19 | Google Analytics 4 — set `NEXT_PUBLIC_GA_ID` |
| 20 | Custom domain (e.g. `riseuppublicschool.in`) + SSL |
| 21 | Textbook list per class |
| 22 | MSG91 DLT registration (3–7 working days — start early) |
| 23 | Razorpay KYC with the trust's bank account |
| 24 | Student houses — names, colours, captains |
| 25 | A short campus video for the homepage |

---

## Who does what

| Task | Owner |
|---|---|
| Supply fee structure, certificates, staff list, infrastructure figures | School office |
| Upload notices, gallery photos, events | School office (admin panel — no developer needed) |
| Create Google Business Profile, Search Console, Analytics | Whoever manages the school's digital presence |
| Cloudinary, MSG91, Razorpay accounts | Trust / management (needs bank + KYC) |
| Deployment, environment variables, domain | Developer |

---

## Publishing content — quick reference

| To publish… | Go to | Endpoint behind it |
|---|---|---|
| A notice or circular | Admin → Notices | `POST /admin/notices` |
| Event photographs | Admin → Gallery | `POST /admin/gallery/:id/photos` |
| A downloadable form or certificate | Admin → Downloads | `POST /admin/downloads` |
| A staff member | Admin → Staff | `POST /admin/staff` |
| Page text (About, Principal's message…) | Admin → Pages | `PUT /admin/pages/:key` |
| Fee structure / contact details / toggles | Admin → Settings | `PATCH /admin/settings` |

Content changes appear on the live site within the ISR window
(2 minutes for notices, 5 for the homepage, up to an hour for the calendar).
