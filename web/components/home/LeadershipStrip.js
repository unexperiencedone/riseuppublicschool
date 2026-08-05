import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';
import { SCHOOL } from '@/lib/config';

const MESSAGES = [
  {
    ...SCHOOL.leadership.founder,
    href: '/about/founder-message',
    quote: 'Rise UP began with a question I could not stop asking: why should a child’s postcode decide the quality of their schooling?',
    initials: 'RD',
    accent: 'bg-navy-600',
  },
  {
    ...SCHOOL.leadership.principal,
    href: '/about/principal-message',
    quote: 'Education works best when the school and the home pull in the same direction. To parents, my request is simple: stay involved.',
    initials: 'AM',
    accent: 'bg-brand-600',
  },
];

export default function LeadershipStrip() {
  return (
    <section className="section bg-navy-800">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">Leadership</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">The people behind the school</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {MESSAGES.map((m) => (
            <article key={m.name} className="rounded-2xl bg-white/5 p-7 ring-1 ring-inset ring-white/10 transition hover:bg-white/[.08]">
              <Quote className="h-7 w-7 text-gold-400/70" aria-hidden />
              <blockquote className="mt-4 font-display text-lg leading-relaxed text-white/90">“{m.quote}”</blockquote>
              <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${m.accent} font-display text-sm font-bold text-white`} aria-hidden>
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-gold-400">{m.role} · {m.qualifications}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{m.experience}</p>
                </div>
                <Link href={m.href} aria-label={`Read the full message from ${m.name}`}
                  className="shrink-0 rounded-lg bg-white/10 p-2.5 text-white transition hover:bg-gold-500 hover:text-navy-800">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
