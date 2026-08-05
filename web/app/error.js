'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-slate-50">
      <div className="container-page max-w-lg text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          We hit an unexpected problem loading this page. Please try again — if it keeps happening,
          call the school office on <a href="tel:+919170285353" className="font-semibold text-brand-700 hover:underline">+91 91702 85353</a>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary"><RefreshCw className="h-4 w-4" aria-hidden /> Try again</button>
          <Link href="/" className="btn-outline"><Home className="h-4 w-4" aria-hidden /> Homepage</Link>
        </div>
      </div>
    </section>
  );
}
