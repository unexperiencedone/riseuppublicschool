import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { SCHOOL, SITE_URL } from '@/lib/config';

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
  icons: { icon: '/images/brand/logo.png', apple: '/images/brand/logo.png' },
};

export const viewport = { themeColor: '#0B5D34', width: 'device-width', initialScale: 1 };

/**
 * Root layout deliberately holds NOTHING but <html> and <body>.
 *
 * Public chrome (header, footer, floating call buttons) lives in app/(site)/layout.js
 * so it never renders inside /admin or /portal. A staff console showing an
 * "Apply Now" button and a public footer is confusing and looks unprofessional.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col bg-white font-sans">{children}</body>
    </html>
  );
}
