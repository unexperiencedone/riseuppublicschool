import { apiGet } from '@/lib/api';
import { SCHOOL } from '@/lib/config';
import { PageHero, CtaBanner } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import CalendarView from '@/components/CalendarView';

export const revalidate = 3600;
export const metadata = buildMetadata({
  title: 'Academic Calendar 2026-27',
  description: `Complete academic calendar for ${SCHOOL.name}, session 2026-27 — examination dates, parent-teacher meetings, holidays, sports week and cultural events.`,
  path: '/academics/calendar',
});

export default async function CalendarPage() {
  const events = await apiGet('/events?session=2026-27', { fallback: [], tags: ['events'] });

  return (
    <>
      <PageHero eyebrow={`Session ${SCHOOL.session}`} title="Academic Calendar"
        subtitle="Examinations, parent-teacher meetings, holidays and events for the full session — as published in the printed school calendar."
        breadcrumb={[{ label: 'Academics', href: '/academics' }, { label: 'Academic Calendar' }]} />

      <section className="section">
        <div className="container-page max-w-4xl">
          <CalendarView events={events} />

          <aside className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-semibold">Please note</p>
            <p className="mt-1 leading-relaxed">
              Dates for festivals that depend on moon sighting (Muharram, Id-Ul-Milad, Id-Ul-Fitr) are indicative and may shift by a day.
              Any change to examination or PTM dates will be circulated through the school notice board, the Notices section of this website
              and the parent portal.
            </p>
          </aside>
        </div>
      </section>

      <CtaBanner title="Questions about the calendar?"
        description="Call the school office between 8:00 AM and 3:00 PM, Monday to Saturday."
        primary={{ href: '/contact', label: 'Contact the School' }} />
    </>
  );
}
