import { SCHOOL, SITE_URL } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const schoolJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'School',
  name: SCHOOL.name,
  alternateName: SCHOOL.trust,
  foundingDate: '2024',
  url: SITE_URL,
  logo: `${SITE_URL}/images/brand/logo.png`,
  image: `${SITE_URL}/images/campus/school-building.jpg`,
  telephone: `+91${SCHOOL.phone}`,
  email: SCHOOL.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SCHOOL.address.line1,
    addressLocality: SCHOOL.address.city,
    addressRegion: SCHOOL.address.state,
    postalCode: SCHOOL.address.pincode,
    addressCountry: 'IN',
  },
  areaServed: 'Aurai, Bhadohi, Sant Ravidas Nagar, Uttar Pradesh',
  description: `English medium, CBSE pattern school offering ${SCHOOL.classesOffered}.`,
};

/** Public website chrome. Not applied to /admin or /portal. */
export default function SiteLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
        Skip to main content
      </a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
    </>
  );
}
