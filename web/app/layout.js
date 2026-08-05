import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { SCHOOL, SITE_URL } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', weight: ['600', '700'] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SCHOOL.name} — English Medium CBSE Pattern School, Pipargaon Aurai Bhadohi`,
    template: `%s | ${SCHOOL.name}`,
  },
  description: `${SCHOOL.name}, Pipargaon (Aurai), Sant Ravidas Nagar Bhadohi — an English medium, CBSE pattern school for Play Group to Class XII. Established 2024. Admissions open for session 2026-27. Call ${SCHOOL.phoneDisplay}.`,
  keywords: ['school in Aurai', 'CBSE school Bhadohi', 'English medium school Pipargaon', 'Rise UP Public School', 'best school Sant Ravidas Nagar', 'admission Bhadohi 2026'],
  authors: [{ name: SCHOOL.name }],
  openGraph: {
    type: 'website', locale: 'en_IN', siteName: SCHOOL.name, url: SITE_URL,
    title: `${SCHOOL.name} — Pipargaon, Aurai, Bhadohi`,
    description: `English medium, CBSE pattern school for Play Group to Class XII. Admissions open for ${SCHOOL.session}.`,
    images: [{ url: '/images/campus/school-building.jpg', width: 1800, height: 700, alt: `${SCHOOL.name} campus` }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport = { themeColor: '#0B5D34', width: 'device-width', initialScale: 1 };

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

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolJsonLd) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}
