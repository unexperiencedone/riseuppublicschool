import Link from 'next/link';
import Image from 'next/image';
import { SCHOOL } from '@/lib/config';

export const metadata = { title: 'Page not found' };

export default function RootNotFound() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <Image src="/images/brand/logo.png" alt="" width={72} height={72} className="mx-auto h-18 w-18 object-contain" />
        <p className="mt-6 font-display text-6xl font-bold text-brand-100">404</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-800">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          That address doesn&apos;t exist on the {SCHOOL.name} website.
        </p>
        <Link href="/" className="btn-primary mt-8">Go to homepage</Link>
      </div>
    </section>
  );
}
