import Link from 'next/link';
import { SectionHeading } from '@/components/ui';

export const STEPS = [
  { n: '01', title: 'Enquire', text: 'Submit the online enquiry form, call 9170285353, or visit the school office. You receive an application number immediately.' },
  { n: '02', title: 'Visit & Interact', text: 'Bring your child to the campus. For Class I and above there is a short, informal interaction — not a competitive entrance test.' },
  { n: '03', title: 'Submit Documents', text: 'Birth certificate, Transfer Certificate (Class I and above), last report card, Aadhaar copies and four passport-size photographs.' },
  { n: '04', title: 'Confirm Admission', text: 'Pay the admission and first-term fees at the office or online. Admission number, section and portal login are issued the same day.' },
];

export default function AdmissionSteps() {
  return (
    <section className="section bg-slate-50">
      <div className="container-page">
        <SectionHeading eyebrow="Admissions" title="Four straightforward steps"
          description="No donation. No capitation fee. The process is the same for every family that walks through our gate." />

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="card-hover relative p-6">
              <span className="font-display text-4xl font-bold text-brand-100" aria-hidden>{s.n}</span>
              <h3 className="mt-1 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Link href="/admissions#enquiry" className="btn-primary">Begin your enquiry</Link>
        </div>
      </div>
    </section>
  );
}
