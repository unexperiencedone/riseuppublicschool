import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-slate-50">
      <div className="container-page max-w-lg text-center">
        <p className="font-display text-7xl font-bold text-brand-100">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold">We couldn&apos;t find that page</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The page may have been moved or removed. Try the homepage, or use the menu to find what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary"><Home className="h-4 w-4" aria-hidden /> Go to homepage</Link>
          <Link href="/contact" className="btn-outline"><Search className="h-4 w-4" aria-hidden /> Contact the school</Link>
        </div>
      </div>
    </section>
  );
}
