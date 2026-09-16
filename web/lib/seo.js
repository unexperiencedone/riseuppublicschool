import { SCHOOL, SITE_URL } from './config';

/**
 * Social sharing reality check — there are only two vocabularies:
 *
 *   Open Graph  → Facebook, WhatsApp, LinkedIn, Telegram, Slack, Discord,
 *                 Pinterest, Snapchat, Signal, iMessage, Instagram DMs/Stories
 *   Twitter Card → X/Twitter only (falls back to Open Graph if absent)
 *
 * Instagram and Snapchat have no proprietary tags — they read Open Graph.
 * Instagram feed posts don't render link previews at all; only DMs, Stories
 * and the bio link do. So getting OG right covers every platform that can
 * show a preview.
 */

const OG_IMAGE = { url: '/opengraph-image.jpg', width: 1200, height: 630, type: 'image/jpeg' };

/**
 * buildMetadata — one helper so every page ships a complete, consistent card.
 * Pass an `image` to override the default share card (used by notices and albums).
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  noIndex = false,
  keywords,
} = {}) {
  const url = `${SITE_URL}${path}`;
  const titleString = typeof title === 'object' && title?.absolute ? title.absolute : title;
  const fullTitle = titleString
    ? (title?.absolute ? title.absolute : `${titleString} | ${SCHOOL.name}`)
    : `${SCHOOL.name} — ${SCHOOL.tagline}`;

  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: titleString || SCHOOL.name }]
    : [{ ...OG_IMAGE, alt: `${SCHOOL.name} — ${SCHOOL.tagline}` }];

  return {
    ...(title ? { title } : {}),
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type,
      locale: 'en_IN',
      siteName: SCHOOL.name,
      url,
      title: fullTitle,
      description,
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
      ...(SCHOOL.social.twitterHandle ? { site: SCHOOL.social.twitterHandle, creator: SCHOOL.social.twitterHandle } : {}),
    },
  };
}

/* ─────────────── JSON-LD builders ─────────────── */

const sameAs = () => Object.values(SCHOOL.social).filter((v) => typeof v === 'string' && v.startsWith('http'));

/**
 * WebSite schema — Google Search uses this specifically to determine and display
 * the Site Name above the search snippet instead of the fallback domain name.
 * Requirements: https://developers.google.com/search/docs/appearance/site-names
 */
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SCHOOL.name,
  alternateName: [
    'Rise Up Public School',
    SCHOOL.shortName,
    'Rise Up Public School Pipargaon',
    'Rise Up Public School Aurai',
    'Rise UP Public School Bhadohi',
    'RUPS Bhadohi',
    SCHOOL.trust,
  ].filter(Boolean),
  url: `${SITE_URL}/`,
  publisher: { '@id': `${SITE_URL}/#school` },
  inLanguage: 'en-IN',
});

/** schema.org/School — the entity Google uses for the knowledge panel. */
export const schoolSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['School', 'EducationalOrganization'],
  '@id': `${SITE_URL}/#school`,
  name: SCHOOL.name,
  alternateName: [SCHOOL.trust, 'Rise Up Public School', SCHOOL.shortName].filter(Boolean),
  foundingDate: String(SCHOOL.established),
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
  image: `${SITE_URL}/opengraph-image.jpg`,
  telephone: `+91${SCHOOL.phone}`,
  email: SCHOOL.email,
  slogan: SCHOOL.motto,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SCHOOL.address.line1,
    addressLocality: SCHOOL.address.city,
    addressRegion: SCHOOL.address.state,
    postalCode: SCHOOL.address.pincode,
    addressCountry: 'IN',
  },
  areaServed: ['Aurai', 'Bhadohi', 'Sant Ravidas Nagar', 'Uttar Pradesh'],
  description: `English medium, CBSE pattern school offering ${SCHOOL.classesOffered}.`,
  openingHours: 'Mo-Sa 08:00-15:00',
  ...(sameAs().length ? { sameAs: sameAs() } : {}),
  employee: [
    { '@type': 'Person', name: SCHOOL.leadership.principal.name, jobTitle: 'Principal' },
    { '@type': 'Person', name: SCHOOL.leadership.founder.name, jobTitle: 'Founder & CEO' },
  ],
});

/** Breadcrumbs — Google renders these instead of a raw URL in results. */
export const breadcrumbSchema = (trail = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: `${SITE_URL}${c.path}`,
  })),
});

export const articleSchema = ({ title, description, path, published, modified, image }) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: title,
  description,
  datePublished: published,
  dateModified: modified || published,
  image: image ? [image] : [`${SITE_URL}/opengraph-image.jpg`],
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
  author: { '@type': 'Organization', name: SCHOOL.name, url: SITE_URL },
  publisher: { '@id': `${SITE_URL}/#school` },
});

export const eventSchema = (e) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: e.title,
  startDate: e.startDate,
  ...(e.endDate ? { endDate: e.endDate } : {}),
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: e.venue || `${SCHOOL.name} Campus`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SCHOOL.address.line1,
      addressLocality: SCHOOL.address.city,
      addressRegion: SCHOOL.address.state,
      postalCode: SCHOOL.address.pincode,
      addressCountry: 'IN',
    },
  },
  organizer: { '@id': `${SITE_URL}/#school` },
  description: e.description || e.title,
});

/** FAQPage — can win an expandable rich result on the admissions page. */
export const faqSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/** Renders any JSON-LD object as a script tag. */
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
