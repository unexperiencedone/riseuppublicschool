import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, CheckCircle2 } from 'lucide-react';
import { SCHOOL } from '@/lib/config';

const HIGHLIGHTS = ['English Medium', 'CBSE Pattern', 'Play Group to Class XII', 'Digital Classrooms'];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <Image
        src="/images/campus/school-building.jpg"
        alt="Rise UP Public School campus at Pipargaon, Aurai, Bhadohi"
        fill priority sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-navy-900/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />

      <div className="container-page relative grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400 ring-1 ring-inset ring-gold-500/30 animate-fadeUp">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
            </span>
            Admissions open — Session {SCHOOL.session}
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-white animate-fadeUp sm:text-5xl lg:text-[3.5rem]">
            Where rural talent<br />
            <span className="text-gold-400">rises to meet the world.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 animate-fadeUp sm:text-lg">
            {SCHOOL.name} brings English-medium, CBSE-pattern education to Pipargaon, Aurai —
            with digital classrooms, well-equipped laboratories and teachers who know every child by name.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5 animate-fadeUp">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm font-medium text-white/90">
                <CheckCircle2 className="h-4 w-4 text-gold-400" aria-hidden /> {h}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3 animate-fadeUp">
            <Link href="/admissions#enquiry" className="btn-gold group">
              Apply for Admission
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a href={`tel:+91${SCHOOL.phone}`} className="btn border border-white/30 text-white backdrop-blur hover:bg-white/10">
              <Phone className="h-4 w-4" aria-hidden /> {SCHOOL.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-8">
          <div className="rounded-2xl border border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur animate-fadeUp sm:p-7">
            <p className="eyebrow">Quick Enquiry</p>
            <h2 className="mt-1 font-display text-xl font-bold">Talk to our admissions team</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us about your child and we will call you back within two working days. No obligation.
            </p>
            <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Classes offered</dt>
                <dd className="text-right font-semibold text-navy-800">{SCHOOL.classesOffered}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Medium</dt>
                <dd className="text-right font-semibold text-navy-800">English</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Office hours</dt>
                <dd className="text-right font-semibold text-navy-800">Mon–Sat, 8 AM–3 PM</dd>
              </div>
            </dl>
            <Link href="/admissions#enquiry" className="btn-primary mt-6 w-full">Start Enquiry Form</Link>
            <p className="mt-3 text-center text-xs text-slate-500">
              Already applied? <Link href="/admissions/track" className="font-semibold text-brand-700 underline">Track your application</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
