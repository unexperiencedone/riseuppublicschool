import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { SCHOOL } from '@/lib/config';

/** Standard interior page banner with breadcrumb. */
export function PageHero({ title, subtitle, eyebrow, image = '/images/campus/school-building.jpg', breadcrumb = [] }) {
  return (
    <section className="relative overflow-hidden bg-navy-800">
      <Image src={image} alt="" fill priority className="object-cover opacity-25" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-800/90 to-brand-800/70" />
      <div className="container-page relative py-14 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-white/70">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          {breadcrumb.map((b) => (
            <span key={b.href || b.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" aria-hidden />
              {b.href ? <Link href={b.href} className="hover:text-gold-400">{b.label}</Link> : <span className="text-white">{b.label}</span>}
            </span>
          ))}
        </nav>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-400">{eyebrow}</p>}
        <h1 className="max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, align = 'center', className = '' }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-bold sm:text-3xl lg:text-[2rem]">{title}</h2>
      {description && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

export function Stat({ value, label, suffix = '' }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-bold text-brand-600 sm:text-4xl">{value}<span className="text-gold-500">{suffix}</span></p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-brand-50 p-4" aria-hidden>
        <svg className="h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}

export function CtaBanner({ title = 'Admissions are open for Session 2026-27', description = 'Play Group to Class XII. Limited seats in each class — submit an enquiry and our admissions team will call you back.', primary = { href: '/admissions#enquiry', label: 'Start an Enquiry' }, secondary = { href: `tel:+91${SCHOOL.phone}`, label: SCHOOL.phoneDisplay } }) {
  return (
    <section className="relative overflow-hidden bg-brand-600">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="container-page relative flex flex-col items-center gap-6 py-14 text-center sm:py-16">
        <h2 className="max-w-2xl font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        <p className="max-w-2xl text-[15px] leading-relaxed text-white/85">{description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={primary.href} className="btn-gold">{primary.label}</Link>
          <a href={secondary.href} className="btn border border-white/40 text-white hover:bg-white/10">{secondary.label}</a>
        </div>
      </div>
    </section>
  );
}

export function Prose({ text, className = '' }) {
  return (
    <div className={`prose-school ${className}`}>
      {String(text || '').split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}
