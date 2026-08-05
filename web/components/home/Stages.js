import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui';

export const STAGES = [
  {
    name: 'Pre-Primary', classes: 'Play Group · Nursery · LKG · UKG', age: 'Age 3 – 6',
    accent: 'from-gold-400 to-gold-600',
    text: 'Play-led learning that builds language, number sense and social confidence. Short structured periods, plenty of rhyme, art and movement, and a first, gentle introduction to English.',
    focus: ['Phonics & pre-writing', 'Number readiness', 'Rhymes, art & music', 'Motor skills through play'],
  },
  {
    name: 'Primary', classes: 'Class I – V', age: 'Age 6 – 11',
    accent: 'from-brand-400 to-brand-600',
    text: 'The foundation years. English, Hindi, Mathematics, Environmental Studies and Computers, with regular reading practice and activity-based science.',
    focus: ['Reading fluency', 'Mathematical reasoning', 'EVS through activity', 'Handwriting & expression'],
  },
  {
    name: 'Middle', classes: 'Class VI – VIII', age: 'Age 11 – 14',
    accent: 'from-navy-400 to-navy-600',
    text: 'Subject specialisation begins. Science splits into strands, Social Science broadens, and students take part in the Science Exhibition and inter-house competitions.',
    focus: ['Laboratory science', 'Sanskrit / third language', 'Project & model making', 'Public speaking'],
  },
  {
    name: 'Secondary', classes: 'Class IX – X', age: 'Age 14 – 16',
    accent: 'from-teal-400 to-teal-600',
    text: 'Board preparation with a full assessment cycle — four unit tests, half-yearly and annual examinations, plus doubt-clearing sessions and past-paper practice.',
    focus: ['Board exam readiness', 'Practical examinations', 'Career orientation', 'Regular mock tests'],
  },
  {
    name: 'Senior Secondary', classes: 'Class XI – XII', age: 'Age 16 – 18',
    accent: 'from-fuchsia-400 to-fuchsia-600',
    text: 'Stream-based study with guidance for competitive examinations. Streams are introduced progressively as each cohort reaches the senior classes.',
    focus: ['Science, Commerce & Arts streams', 'Competitive exam guidance', 'College application support', 'Leadership roles'],
  },
];

export default function Stages() {
  return (
    <section className="section">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading align="left" eyebrow="Academics"
            title="Five stages, one continuous journey"
            description="From a three-year-old's first day in Play Group to a Class XII student's last examination — a single school, a single standard."
          />
          <Link href="/academics" className="btn-outline shrink-0">
            Explore Academics <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s) => (
            <article key={s.name} className="card-hover overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${s.accent}`} aria-hidden />
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold">{s.name}</h3>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-600">{s.classes}</p>
                  </div>
                  <span className="chip bg-slate-100 text-slate-600 ring-slate-200">{s.age}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.text}</p>
                <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                  {s.focus.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" aria-hidden />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
