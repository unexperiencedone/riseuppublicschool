'use client';

import { useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { ACADEMIC_CALENDAR, CATEGORY_STYLES, MONTHS, formatEventDate } from '@/lib/calendar';

const FILTERS = [
  { key: 'all', label: 'Everything' },
  { key: 'exam', label: 'Examinations' },
  { key: 'ptm', label: 'PTMs' },
  { key: 'holiday', label: 'Holidays' },
  { key: 'celebration', label: 'Celebrations' },
  { key: 'sports', label: 'Sports' },
  { key: 'academic', label: 'Academic' },
];

export default function CalendarView({ events }) {
  const [filter, setFilter] = useState('all');
  const source = events?.length
    ? events.map((e) => ({
        title: e.title,
        date: String(e.startDate).slice(0, 10),
        endDate: e.endDate ? String(e.endDate).slice(0, 10) : undefined,
        category: e.category,
      }))
    : ACADEMIC_CALENDAR;

  const grouped = useMemo(() => {
    const filtered = filter === 'all' ? source : source.filter((e) => e.category === filter);
    return MONTHS.map((m) => ({
      ...m,
      events: filtered.filter((e) => e.date.startsWith(m.key)).sort((a, b) => a.date.localeCompare(b.date)),
    })).filter((m) => m.events.length);
  }, [filter, source]);

  const counts = useMemo(() => {
    const c = {};
    source.forEach((e) => { c[e.category] = (c[e.category] || 0) + 1; });
    return c;
  }, [source]);

  return (
    <>
      <div className="sticky top-[72px] z-30 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 pr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3.5 w-3.5" aria-hidden /> Filter
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const n = f.key === 'all' ? source.length : counts[f.key] || 0;
            if (!n) return null;
            return (
              <button
                key={f.key} type="button" onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f.label} <span className={active ? 'text-white/70' : 'text-slate-400'}>{n}</span>
              </button>
            );
          })}
          <a href="/academic-calendar-2026-27.pdf" download className="btn-outline ml-auto !px-3 !py-1.5 !text-xs">
            <Download className="h-3.5 w-3.5" aria-hidden /> PDF
          </a>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {grouped.map((month) => (
          <section key={month.key} aria-labelledby={`m-${month.key}`}>
            <div className="mb-4 flex items-center gap-4">
              <h2 id={`m-${month.key}`} className="font-display text-xl font-bold text-navy-800">{month.label}</h2>
              <span className="h-px flex-1 bg-slate-200" aria-hidden />
              <span className="text-xs font-semibold text-slate-400">{month.events.length} entries</span>
            </div>

            <ul className="space-y-2.5">
              {month.events.map((e, i) => {
                const style = CATEGORY_STYLES[e.category] || CATEGORY_STYLES.academic;
                const d = new Date(`${e.date}T00:00:00`);
                return (
                  <li key={`${e.title}-${e.date}-${i}`} className="card flex items-center gap-4 p-4 transition hover:border-brand-200">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 text-navy-800">
                      <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy-800">{e.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatEventDate(e.date, e.endDate)}</p>
                    </div>
                    <span className={`chip shrink-0 ${style.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />{style.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
