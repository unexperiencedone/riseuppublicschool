# Research: School Website Benchmarks & Design Decisions

Compiled before any code was written, to make sure the site solves the right problems.

---

## 1. What the research says

Sources consulted (August 2026): Colorlib's school website roundup, Authentic Style's
"features every school website needs", Digital Roots Media's education design best
practices, Ubiq Education's best school websites, plus CBSE's mandatory public
disclosure guidance (Appendix IX) and the compliance commentary around it.

### Consistent findings

| Finding | What it means here |
|---|---|
| **Clear navigation is the single most critical feature.** Education sites hold a lot of information; users must find things fast. | Seven top-level items, no more. Dropdowns only where a section genuinely has children. Every page reachable in ≤ 2 clicks. |
| **Admissions clarity is the top parent priority** — process, deadlines, what the school looks for. | Admissions gets a dedicated section, a 4-step visual process, a document checklist, an FAQ answering the questions parents actually ask, and an enquiry form on the same page. |
| **Essential pages**: Admissions, Academics, Student Life, Events, Faculty, Contact. | All six exist, plus the India-specific Mandatory Disclosure and Downloads. |
| **Update at least monthly**; fresh content builds trust and improves ranking. | Notices, Events and Gallery are database-driven so the office can update them without a developer. |
| **Mobile responsiveness is non-negotiable.** | Mobile-first Tailwind. In rural UP, the overwhelming majority of parents will arrive on an Android phone over a 4G connection. |
| **Accessibility** — screen-reader support, alt text, keyboard navigation, contrast. | Semantic landmarks, skip link, visible focus rings, alt text on every image, ARIA on all interactive components, `prefers-reduced-motion` respected. |
| **Authentic photography beats stock imagery.** | Every photograph is a real photo of real students at this school. Zero stock images. |

### CBSE mandatory public disclosure (Appendix IX)

Affiliated schools must publish, in a dedicated website section:

- **General** — name, address, contact, affiliation number, school code, email, trust/society name, principal's name with qualifications and experience
- **Documents** — affiliation letter, trust/society registration, state NOC, recognition certificate, building safety, fire safety, water & sanitation certificates
- **Academic** — classes offered, curriculum, fee structure, academic calendar, textbook list, board results
- **Staff** — complete teaching and non-teaching list with names, qualifications, designation, experience
- **Infrastructure** — land area, built-up area, classrooms, laboratories, library, drinking water, toilets, playground, CCTV, transport

Non-compliance can attract action under affiliation rules.

**Implemented as:** a `/mandatory-disclosure` page with four structured tables and a
document checklist. Rows the school has not yet supplied show honestly as
"To be updated" rather than being invented, and undelivered certificates show
"At school office" until a PDF is uploaded through the admin panel.

---

## 2. Positioning decision

Most Indian school websites fall into two camps:

- **Corporate template** — stock photos of smiling children who don't attend the school, meaningless copy ("holistic development", "world-class infrastructure"), no real information.
- **Government-form aesthetic** — dense text, blue underlined links, PDFs everywhere, no structure.

Rise UP is a **two-year-old rural school competing against established names in
Bhadohi and Varanasi**. Neither camp works. What builds trust here is *specificity*:

- Real photographs of Sports Day, the science exhibition and the investiture ceremony.
- Actual dates from the printed academic calendar, not "exams are held periodically".
- Named leadership with real qualifications and honest experience figures (5 years, not "decades of excellence").
- Explicit statements about what the school does *not* do — "no donation, no capitation fee", "no competitive entrance test".
- Admitting what isn't ready yet, instead of faking it.

**Editorial rule applied throughout:** never write a claim the school cannot
substantiate. Where a figure is unknown, the page says so.

---

## 3. Visual identity

Colours sampled directly from the school crest — no invented palette.

| Token | Hex | Source | Used for |
|---|---|---|---|
| `brand-600` | `#0B5D34` | Crest outer ring | Primary actions, section accents, links |
| `navy-600` | `#16306B` | Crest shield | Headings, footer, page banners |
| `gold-500` | `#F5B301` | Crest lettering | Highlights, CTAs on dark, announcement bar |

Full 50–900 ramps are generated from these three so the interface has depth
without introducing a fourth hue.

**Typography** — Fraunces (a warm serif) for headings, Inter for body text.
The serif signals that this is an institution with intent; Inter keeps long
passages readable on a small screen. Both loaded through `next/font` so there is
no layout shift and no external request at runtime.

**Layout language**
- 7xl container, generous 16–24 vertical rhythm, cards with soft shadow-plus-hairline-border rather than heavy borders.
- Interior pages open with a dark photographic banner and a breadcrumb — orientation on arrival from a search result.
- Motion is restrained: a lift on hover, one fade-up on the hero, a pausable marquee. Everything disabled under `prefers-reduced-motion`.

---

## 4. Information architecture

```
Home
├── About            → About · Founder's Message · Principal's Message · Vision & Mission
├── Academics        → Curriculum & Stages · Academic Calendar · Examination Pattern · Faculty
├── Admissions       → Process · Apply Online · Track Application · Fee Structure
├── Facilities
├── Campus Life      → Photo Gallery · Events · Notices & Circulars
└── Contact

Utility bar:  Mandatory Disclosure · Downloads · Parent Portal
Footer:       everything above + Privacy Policy
```

Seven top-level items. Persistent "Apply Now" in the header; floating WhatsApp
and call buttons on mobile — because a significant share of rural parents will
prefer to call rather than fill a form, and the site should make that trivially easy.

---

## 5. Homepage sequence and why

| # | Section | Job it does |
|---|---|---|
| 1 | Announcement marquee | Surfaces the current notice before anything else |
| 2 | Hero + enquiry card | One-line proposition, admissions badge, immediate path to enquiry or phone |
| 3 | Stats band | Established year, classes, PTMs — concrete facts, fast |
| 4 | Facilities grid | Answers "is this a real school with real infrastructure?" |
| 5 | Academic stages | Answers "will you take my child, and what will they study?" |
| 6 | Notices + Events | Proves the school is active, not a brochure from 2024 |
| 7 | Gallery preview | Emotional proof — real children, real events |
| 8 | Leadership quotes | Puts named humans behind the institution |
| 9 | Admission steps | Removes friction from the decision |
| 10 | CTA banner | Final conversion point |

---

## 6. Performance & SEO decisions

- **Server components by default.** Only five components ship JavaScript: header, calendar filter, lightbox, the three forms, and the two dashboards. First Load JS is ~101 kB.
- **ISR, not SSR.** Content pages regenerate on a timer (120–3600 s depending on volatility). Visitors are served from cache; the API is hit rarely.
- **Static fallback.** `lib/fallback.js` mirrors the seed content, so the site renders fully even with the API down — important on a free-tier host that sleeps.
- **Local SEO first.** For a village school the highest-value SEO asset is not the website, it's a verified **Google Business Profile**. The site supports it with `schema.org/School` JSON-LD carrying the full postal address, phone and founding date, plus a generated sitemap and robots file.
- **Images** — every gallery photo re-encoded to ≤ 1600 px at quality 82, served through `next/image` with AVIF/WebP negotiation and correct `sizes`.
- **Keywords targeted** — "school in Aurai", "CBSE school Bhadohi", "English medium school Pipargaon", "best school Sant Ravidas Nagar", "admission Bhadohi 2026".

---

## 7. Content sourced from the school's own materials

| Source | What was extracted |
|---|---|
| `riseupschoolcaendar26-27.pdf` | The complete 2026-27 academic calendar — 55 dated entries covering examinations, PTMs, holidays, sports week and celebrations. Transcribed verbatim into `server/src/seed/data/calendar.js` and `web/lib/calendar.js`. |
| Calendar footer | "English Medium \| CBSE Pattern" tagline; the campus render used as the hero image. |
| Calendar photo collages | Confirmed the school's real activities: march past, science exhibition, investiture, karate, folk dance, educational tour, PTMs. |
| School crest | Brand palette, "SINCE 2024", "PIPARGAON BHADOHI". |
| 24 supplied photographs | Renamed to descriptive slugs and organised into six thematic albums. |

### One discrepancy, and how it was handled
The printed calendar and banners say **"Classes: Play Group to Std. VIII"**, while
the brief specified **PG to Class 12**. Per your instruction the site presents
**Play Group to Class XII**, with Senior Secondary described as introduced
"progressively as each cohort reaches the senior classes" — accurate for a school
founded in 2024, and it avoids promising a Class XII batch that does not yet exist.

**Before launch:** update the printed calendar and banners to match, or the
website and the physical signage will contradict each other in front of parents.
