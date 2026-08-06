import Link from 'next/link';
import { CalendarDays, ClipboardList, GraduationCap, Users } from 'lucide-react';
import { PageHero, SectionHeading, CtaBanner } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { STAGES } from '@/components/home/Stages';
import { SCHOOL } from '@/lib/config';

export const metadata = buildMetadata({
  title: 'Academics — Curriculum & Examination Pattern',
  description: `Curriculum, subjects and examination pattern at ${SCHOOL.name} for ${SCHOOL.classesOffered}, session ${SCHOOL.session}.`,
  path: '/academics',
});

const ASSESSMENTS = [
  { name: 'Unit Test I', when: 'May 2026', weight: 'Formative', detail: 'Short written tests across core subjects, held over four days.' },
  { name: 'Unit Test II', when: 'July 2026', weight: 'Formative', detail: 'Five-day cycle covering the first term’s syllabus.' },
  { name: 'Half Yearly Examination', when: 'September 2026', weight: 'Summative', detail: 'Full-length papers; results declared at PTM-III on 01 October.' },
  { name: 'Unit Test III', when: 'November 2026', weight: 'Formative', detail: 'Five-day cycle before the winter term.' },
  { name: 'Unit Test IV', when: 'January 2027', weight: 'Formative', detail: 'Final formative cycle ahead of the annual examination.' },
  { name: 'Annual Examination', when: 'Feb – Mar 2027', weight: 'Summative', detail: 'Comprehensive examination; results declared 15 March 2027.' },
];

const SUBJECTS = [
  { stage: 'Pre-Primary', list: ['English (phonics & rhymes)', 'Hindi', 'Numbers & pre-maths', 'General Awareness', 'Art & Craft', 'Music & Movement'] },
  { stage: 'Primary (I–V)', list: ['English', 'Hindi', 'Mathematics', 'Environmental Studies', 'Computer Science', 'General Knowledge', 'Art', 'Physical Education'] },
  { stage: 'Middle (VI–VIII)', list: ['English', 'Hindi', 'Sanskrit', 'Mathematics', 'Science', 'Social Science', 'Computer Science', 'Art', 'Physical Education'] },
  { stage: 'Secondary (IX–X)', list: ['English', 'Hindi', 'Mathematics', 'Science (Physics, Chemistry, Biology)', 'Social Science', 'Information Technology', 'Physical Education'] },
  { stage: 'Senior Secondary (XI–XII)', list: ['Science stream: Physics, Chemistry, Biology / Mathematics, English, Computer Science', 'Commerce stream: Accountancy, Business Studies, Economics, English, Mathematics', 'Arts stream: History, Political Science, Geography, Hindi, English'] },
];

export default function AcademicsPage() {
  return (
    <>
      <PageHero eyebrow="Academics" title="A curriculum that builds, stage by stage"
        subtitle={`English medium, CBSE pattern, ${SCHOOL.classesOffered}. Continuous assessment with four unit tests, a half-yearly and an annual examination every session.`}
        breadcrumb={[{ label: 'Academics' }]} />

      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="Stages" title="Five academic stages" description="Each stage has its own rhythm, its own subjects, and its own way of measuring progress." />
          <div className="mt-12 space-y-4">
            {STAGES.map((s, i) => (
              <article key={s.name} className="card overflow-hidden lg:flex">
                <div className={`w-full bg-gradient-to-br ${s.accent} p-6 text-white lg:w-64 lg:shrink-0`}>
                  <p className="font-display text-3xl font-bold opacity-40">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-1 font-display text-xl font-bold text-white">{s.name}</h3>
                  <p className="mt-1 text-sm text-white/85">{s.classes}</p>
                  <p className="mt-3 inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">{s.age}</p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-sm leading-relaxed text-slate-600">{s.text}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.focus.map((f) => (
                      <li key={f} className="chip bg-slate-100 text-slate-700 ring-slate-200">{f}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page">
          <SectionHeading eyebrow="Subjects" title="What your child studies" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((s) => (
              <article key={s.stage} className="card p-6">
                <h3 className="flex items-center gap-2 font-display text-base font-bold">
                  <GraduationCap className="h-4 w-4 text-brand-600" aria-hidden /> {s.stage}
                </h3>
                <ul className="mt-4 space-y-2">
                  {s.list.map((x) => (
                    <li key={x} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" aria-hidden />{x}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Subject combinations for Classes XI–XII are introduced progressively as each cohort reaches the senior classes.
            Please confirm current availability with the school office.
          </p>
        </div>
      </section>

      <section id="examinations" className="section scroll-mt-32">
        <div className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Assessment" title="Examination pattern, session 2026-27"
              description="Formative unit tests spread across the year, two summative examinations, and a Parent-Teacher Meeting after each major cycle." />
            <Link href="/academics/calendar" className="btn-outline shrink-0">
              <CalendarDays className="h-4 w-4" aria-hidden /> Full Calendar
            </Link>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Examination schedule for session 2026-27</caption>
              <thead className="bg-navy-700 text-white">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Assessment</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">When</th>
                  <th scope="col" className="hidden px-5 py-3.5 font-semibold sm:table-cell">Type</th>
                  <th scope="col" className="hidden px-5 py-3.5 font-semibold md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {ASSESSMENTS.map((a) => (
                  <tr key={a.name} className="transition hover:bg-slate-50">
                    <th scope="row" className="px-5 py-4 text-left font-semibold text-navy-800">{a.name}</th>
                    <td className="px-5 py-4 text-slate-600">{a.when}</td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className={`chip ${a.weight === 'Summative' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-brand-50 text-brand-700 ring-brand-200'}`}>{a.weight}</span>
                    </td>
                    <td className="hidden px-5 py-4 text-slate-600 md:table-cell">{a.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: ClipboardList, title: '4 Unit Tests', text: 'Short formative tests in May, July, November and January.' },
              { Icon: Users, title: '4 Parent-Teacher Meetings', text: 'PTM-I to PTM-IV, held after each major assessment cycle.' },
              { Icon: GraduationCap, title: '2 Major Examinations', text: 'Half Yearly in September and the Annual Examination in February–March.' },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="card flex gap-4 p-5">
                <Icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <p className="font-semibold text-navy-800">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
