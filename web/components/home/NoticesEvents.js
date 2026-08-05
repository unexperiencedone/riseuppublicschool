import Link from 'next/link';
import { CalendarDays, ArrowRight, FileText } from 'lucide-react';
import { CATEGORY_STYLES, ACADEMIC_CALENDAR, formatEventDate } from '@/lib/calendar';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function upcomingFromCalendar(limit = 6) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = ACADEMIC_CALENDAR.filter((e) => (e.endDate || e.date) >= today);
  return (upcoming.length ? upcoming : ACADEMIC_CALENDAR).slice(0, limit);
}

export default function NoticesEvents({ notices = [], events = [] }) {
  const eventList = events.length
    ? events.map((e) => ({
        title: e.title,
        date: String(e.startDate).slice(0, 10),
        endDate: e.endDate ? String(e.endDate).slice(0, 10) : undefined,
        category: e.category,
      }))
    : upcomingFromCalendar();

  return (
    <section className="section bg-slate-50">
      <div className="container-page grid gap-10 lg:grid-cols-5 lg:gap-12">
        {/* Notices */}
        <div className="lg:col-span-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Announcements</p>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-[1.75rem]">Notices & Circulars</h2>
            </div>
            <Link href="/notices" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">View all →</Link>
          </div>

          <ul className="mt-7 space-y-3">
            {notices.slice(0, 5).map((n) => {
              const style = CATEGORY_STYLES[n.category] || { chip: 'bg-slate-100 text-slate-700 ring-slate-200' };
              return (
                <li key={n.slug}>
                  <Link href={`/notices/${n.slug}`} className="card-hover group flex gap-4 p-4 sm:p-5">
                    <span className="mt-0.5 hidden shrink-0 rounded-lg bg-brand-50 p-2.5 text-brand-600 sm:block" aria-hidden>
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`chip ${style.chip}`}>{n.category}</span>
                        {n.pinned && <span className="chip bg-gold-50 text-gold-700 ring-gold-200">Pinned</span>}
                        <time className="text-xs text-slate-400" dateTime={n.publishAt}>{fmt(n.publishAt)}</time>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-navy-800 group-hover:text-brand-700">
                        {n.title}
                      </h3>
                      {n.excerpt && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.excerpt}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Events */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">What&apos;s next</p>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-[1.75rem]">Upcoming Events</h2>
            </div>
            <Link href="/academics/calendar" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">Calendar →</Link>
          </div>

          <ol className="mt-7 space-y-3">
            {eventList.map((e, i) => {
              const style = CATEGORY_STYLES[e.category] || CATEGORY_STYLES.academic;
              const d = new Date(`${e.date}T00:00:00`);
              return (
                <li key={`${e.title}-${e.date}-${i}`} className="card flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-700 text-white">
                    <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
                    <span className="text-[10px] uppercase tracking-wide">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy-800">{e.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
                      {style.label} · {formatEventDate(e.date, e.endDate)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <Link href="/academics/calendar" className="btn-outline mt-5 w-full">
            <CalendarDays className="h-4 w-4" aria-hidden /> Full Academic Calendar {new Date().getFullYear()}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
