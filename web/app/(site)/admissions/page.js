import Link from 'next/link';
import { FileText, Phone, MapPin, CheckCircle2, HelpCircle } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/ui';
import { STEPS } from '@/components/home/AdmissionSteps';
import EnquiryForm from '@/components/forms/EnquiryForm';
import { SCHOOL } from '@/lib/config';
import { buildMetadata, JsonLd, faqSchema, breadcrumbSchema } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Admissions 2026-27 — Apply Online',
  description: `Admissions open at ${SCHOOL.name}, Pipargaon Aurai Bhadohi for ${SCHOOL.classesOffered}, session ${SCHOOL.session}. No donation, no capitation fee. Apply online or call ${SCHOOL.phoneDisplay}.`,
  path: '/admissions',
  keywords: ['admission Bhadohi 2026', 'school admission Aurai', 'CBSE admission Sant Ravidas Nagar', 'nursery admission Bhadohi'],
});

const DOCUMENTS = [
  { doc: 'Birth certificate (original + photocopy)', when: 'All classes' },
  { doc: 'Transfer Certificate from the previous school', when: 'Class I and above' },
  { doc: 'Last report card / marksheet', when: 'Class I and above' },
  { doc: 'Aadhaar copy of the student', when: 'All classes' },
  { doc: 'Aadhaar copy of both parents', when: 'All classes' },
  { doc: 'Four passport-size photographs of the student', when: 'All classes' },
  { doc: 'Caste / income certificate (if applicable)', when: 'Optional' },
];

const FAQS = [
  { q: 'Is there a donation or capitation fee?', a: 'No. Rise UP Public School does not accept any donation or capitation fee of any kind. The only payments are the published admission fee, tuition fee and, if opted, transport charges.' },
  { q: 'Is there an entrance examination?', a: 'No competitive entrance test. For Class I and above we hold a short, informal interaction to understand your child’s current level so we can place them appropriately and give support where needed.' },
  { q: 'When does the session start?', a: 'The new session begins on 01 April. Admissions remain open through the year subject to seat availability, but joining at the start of the session is strongly recommended.' },
  { q: 'Do you provide school transport?', a: 'Yes. GPS-enabled school buses cover the villages around Aurai, with a trained attendant on every route. Please confirm route availability for your village with the school office.' },
  { q: 'What is the medium of instruction?', a: 'English. Hindi and Sanskrit are taught as language subjects, and teachers use Hindi for explanation in the junior classes wherever it helps understanding.' },
  { q: 'Can my child join mid-session?', a: 'Yes, subject to seats being available and a Transfer Certificate from the previous school. Please speak to the office before the child’s current school closes admissions.' },
];

export default function AdmissionsPage() {
  return (
    <>
      <JsonLd data={faqSchema(FAQS)} />
      <JsonLd data={breadcrumbSchema([{ name: 'Admissions', path: '/admissions' }])} />

      <PageHero eyebrow={`Session ${SCHOOL.session}`} title="Admissions are open"
        subtitle={`${SCHOOL.classesOffered}. No donation, no capitation fee — the same process for every family.`}
        breadcrumb={[{ label: 'Admissions' }]} />

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="Four straightforward steps" />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="font-display text-4xl font-bold text-brand-100" aria-hidden>{s.n}</span>
                <h3 className="mt-1 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading align="left" eyebrow="Checklist" title="Documents you will need"
              description="Bring the originals for verification along with one photocopy of each. The office returns originals the same day." />
            <ul className="mt-8 space-y-3">
              {DOCUMENTS.map((d) => (
                <li key={d.doc} className="card flex items-start gap-3 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800">{d.doc}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{d.when}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="card mt-8 p-6">
              <h3 className="font-display text-base font-bold">Prefer to visit or call?</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <a href={`tel:+91${SCHOOL.phone}`} className="font-semibold text-navy-800 hover:text-brand-700">{SCHOOL.phoneDisplay}</a></li>
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="text-slate-600">{SCHOOL.address.full}</span></li>
                <li className="flex gap-3"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  <Link href="/admissions/fees" className="text-brand-700 hover:underline">View the fee structure</Link></li>
              </ul>
            </div>
          </div>

          <div id="enquiry" className="scroll-mt-32 lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions parents ask us most" />
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-navy-800">
                  <span className="flex items-start gap-3">
                    <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />{f.q}
                  </span>
                  <span className="shrink-0 text-xl leading-none text-brand-600 transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 pl-7 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Still unsure? <Link href="/contact" className="font-semibold text-brand-700 hover:underline">Write to us</Link> or
            call <a href={`tel:+91${SCHOOL.phone}`} className="font-semibold text-brand-700 hover:underline">{SCHOOL.phoneDisplay}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
