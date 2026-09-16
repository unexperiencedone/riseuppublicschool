import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { JsonLd, schoolSchema, websiteSchema } from '@/lib/seo';

/** Public website chrome. Not applied to /admin or /portal. */
export default function SiteLayout({ children }) {
  return (
    <>
      <JsonLd data={schoolSchema()} />
      <JsonLd data={websiteSchema()} />
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
