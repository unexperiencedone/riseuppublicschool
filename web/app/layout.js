import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { SCHOOL, SITE_URL } from '@/lib/config';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', weight: ['600', '700'] });

const DESCRIPTION = `${SCHOOL.name}, Pipargaon (Aurai), Sant Ravidas Nagar Bhadohi — an English medium, CBSE pattern school for ${SCHOOL.classesOffered}. Established ${SCHOOL.established}. Admissions open for session ${SCHOOL.session}. Call ${SCHOOL.phoneDisplay}.`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SCHOOL.name} — English Medium CBSE Pattern School, Pipargaon Aurai Bhadohi`,
    template: `%s | ${SCHOOL.name}`,
  },
  description: DESCRIPTION,
  applicationName: SCHOOL.name,
  keywords: [
    'school in Aurai', 'CBSE school Bhadohi', 'English medium school Pipargaon',
    'Rise UP Public School', 'best school Sant Ravidas Nagar', 'admission Bhadohi 2026',
    'Rise UP Public School Bhadohi', 'nursery admission Aurai', 'school near me Bhadohi',
  ],
  authors: [{ name: SCHOOL.name, url: SITE_URL }],
  creator: SCHOOL.name,
  publisher: SCHOOL.trust,
  category: 'education',
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: true, address: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true, follow: true,
      'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
    },
  },
  // Google Search Console — Settings → Ownership verification → HTML tag.
  verification: { google: 'qxF9nBpDsaBObqO_sLtPqgH8c3z_egbj86LDXbuz2pY' },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SCHOOL.name,
    title: `${SCHOOL.name} — English Medium CBSE Pattern School, Pipargaon Aurai Bhadohi`,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/opengraph-image.jpg`, width: 1200, height: 630, alt: `${SCHOOL.name} — ${SCHOOL.tagline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SCHOOL.name} — English Medium CBSE Pattern School, Pipargaon Aurai Bhadohi`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image.jpg`],
  },
};

export const viewport = {
  themeColor: '#0B5D34',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

/**
 * Root layout deliberately holds NOTHING but <html> and <body>.
 * Public chrome lives in app/(site)/layout.js so it never renders in /admin or /portal.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col bg-white font-sans">{children}</body>
    </html>
  );
}
