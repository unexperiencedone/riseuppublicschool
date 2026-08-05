import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { PageHero, SectionHeading } from '@/components/ui';
import { ACADEMIC_CALENDAR, CATEGORY_STYLES, formatEventDate } from '@/lib/calendar';

export const revalidate = 600;
export const metadata = {
  title: 'School Events',
  description: 'Upcoming and recent events at Rise UP Public School — Sports Week, Science Exhibition, Annual Function, PTMs and celebrations.',
};

const HIGHLIGHTS = [
  { title: 'Annual Sports Day', when: '05 December 2026', text: 'Athletics, relay races, kabaddi, kho-kho, karate demonstration and the inter-house march past — preceded by a full Sports Week.', image: '/images/gallery/sports-day-medal-winners.jpg' },
  { title: "Children's Day & Science Exhibition", when: '14 November 2026', text: 'Working models and projects by Classes VI–XII, judged by an invited panel across Physics, Chemistry & Biology, and Applied Technology.', image: '/images/gallery/science-exhibition.jpg' },
  { title: 'Annual Function & Cultural Evening', when: 'Announced each session', text: 'Folk and classical dance, group songs and drama performed by students from Play Group to the senior classes.', image: '/images/gallery/annual-function-folk-dance.jpg' },
  { title: 'Investiture Ceremony', when: 'Start of session', text: 'Head Boy, Head Girl and house captains take their oath before the whole school at morning assembly.', image: '/images/gallery/head-boy-head-girl-investiture.jpg' },
];

export default async function EventsPage() {
  const apiEvents = (await apiGet('/events?session=2026-27', { fallback: [], tags: ['events'] })) || [];
  const today = new Date().toISOString().slice(0, 10);

  const source = apiEvents.length
    ? apiEvents.map((e) => ({ title: e.title, date: String(e.startDate).slice(0, 10), endDate: e.endDate ? String(e.endDate).slice(0, 10) : undefined, category: e.category }))
    : ACADEMIC_CALENDAR;

  const upcoming = source.filter((e) => (e.endDate || e.date) >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12);

  return (
    <>
      <PageHero eyebrow="Campus Life" title="Events at Rise UP"
        subtitle="Sport, science, culture and ceremony — the calendar that makes school more than the syllabus."
        breadcrumb={[{ label: 'Events' }]} />

      <section className="section">
        <div className="container-page">
          <SectionHeading align="left" eyebrow="Signature events" title="What our year looks like" />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <article key={h.title} className="card-hover overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.image} alt="" className="h-52 w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <p className="eyebrow">{h.when}</p>
                  <h3 className="mt-1 font-display text-lg font-bold">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{h.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-page max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading align="left" eyebrow="Coming up" title="Next on the calendar" />
            <Link href="/academics/calendar" className="btn-outline shrink-0">
              <CalendarDays className="h-4 w-4" aria-hidden /> Full Calendar
            </Link>
          </div>

          <ul className="mt-8 space-y-2.5">
            {upcoming.map((e, i) => {
              const style = CATEGORY_STYLES[e.category] || CATEGORY_STYLES.academic;
              const d = new Date(`${e.date}T00:00:00`);
              return (
                <li key={`${e.title}-${i}`} className="card flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-700 text-white">
                    <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
                    <span className="text-[10px] uppercase">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-800">{e.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatEventDate(e.date, e.endDate)}</p>
                  </div>
                  <span className={`chip shrink-0 ${style.chip}`}>{style.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
