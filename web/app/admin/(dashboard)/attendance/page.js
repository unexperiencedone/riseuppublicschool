'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, Users, CheckCheck } from 'lucide-react';
import { authedFetch } from '@/lib/auth';
import { PageHeader, Body, Loading, ErrorBox, Empty, Toast } from '@/components/admin/ui';

const CLASS_LEVELS = ['Play Group','Nursery','LKG','UKG','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const STATUS = [
  { key: 'present',  label: 'P', title: 'Present',  on: 'bg-brand-600 text-white',  off: 'text-brand-700 hover:bg-brand-50' },
  { key: 'absent',   label: 'A', title: 'Absent',   on: 'bg-red-600 text-white',    off: 'text-red-700 hover:bg-red-50' },
  { key: 'late',     label: 'L', title: 'Late',     on: 'bg-amber-500 text-white',  off: 'text-amber-700 hover:bg-amber-50' },
  { key: 'half_day', label: 'H', title: 'Half day', on: 'bg-teal-600 text-white',   off: 'text-teal-700 hover:bg-teal-50' },
  { key: 'leave',    label: 'Lv', title: 'Leave',   on: 'bg-slate-600 text-white',  off: 'text-slate-600 hover:bg-slate-100' },
];

export default function AdminAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [classLevel, setClassLevel] = useState('I');
  const [section, setSection] = useState('A');
  const [date, setDate] = useState(today);
  const [state, setState] = useState({ loading: false, rows: [], error: '' });
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setState({ loading: true, rows: [], error: '' });
    const q = new URLSearchParams({ classLevel, section, date });
    authedFetch(`/admin/attendance/register?${q}`)
      .then((json) => {
        const rows = json.data || [];
        setState({ loading: false, rows, error: '' });
        setMarks(Object.fromEntries(rows.map((r) => [r._id, r.attendance?.status || ''])));
      })
      .catch((err) => setState({ loading: false, rows: [], error: err.message }));
  };

  useEffect(load, [classLevel, section, date]);   // eslint-disable-line react-hooks/exhaustive-deps

  const summary = useMemo(() => {
    const vals = Object.values(marks);
    return {
      marked: vals.filter(Boolean).length,
      present: vals.filter((v) => v === 'present').length,
      absent: vals.filter((v) => v === 'absent').length,
      total: state.rows.length,
    };
  }, [marks, state.rows.length]);

  const markAllPresent = () =>
    setMarks(Object.fromEntries(state.rows.map((r) => [r._id, marks[r._id] || 'present'])));

  const save = async () => {
    const entries = Object.entries(marks)
      .filter(([, status]) => status)
      .map(([student, status]) => ({ student, status }));

    if (!entries.length) { setToast({ message: 'Mark at least one student first', tone: 'error' }); return; }

    setSaving(true);
    try {
      const json = await authedFetch('/admin/attendance', {
        method: 'POST',
        body: { classLevel, section, date, entries },
      });
      const d = json.data || {};
      setToast({ message: `Saved — ${(d.upserted || 0) + (d.modified || 0)} record(s) written`, tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Attendance Register"
        description="Re-saving the same day is safe — records are matched on student and date, never duplicated."
        action={
          <button type="button" onClick={save} disabled={saving || !state.rows.length} className="btn-primary">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…</> : <><Save className="h-4 w-4" aria-hidden /> Save register</>}
          </button>
        }
      />

      <Body>
        <div className="card mb-5 flex flex-wrap items-end gap-4 p-4">
          <div>
            <label className="label" htmlFor="a-class">Class</label>
            <select id="a-class" className="input !py-2" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
              {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="a-sec">Section</label>
            <select id="a-sec" className="input !py-2" value={section} onChange={(e) => setSection(e.target.value)}>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="a-date">Date</label>
            <input id="a-date" type="date" max={today} className="input !py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {state.rows.length > 0 && (
            <>
              <button type="button" onClick={markAllPresent} className="btn-outline !py-2 !text-xs">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden /> Mark all present
              </button>
              <div className="ml-auto flex gap-4 text-sm">
                <span className="text-slate-500">Marked <strong className="text-navy-800">{summary.marked}/{summary.total}</strong></span>
                <span className="text-brand-700">Present <strong>{summary.present}</strong></span>
                <span className="text-red-700">Absent <strong>{summary.absent}</strong></span>
              </div>
            </>
          )}
        </div>

        {state.loading ? <Loading /> : state.error ? <ErrorBox message={state.error} onRetry={load} /> : (
          state.rows.length === 0 ? (
            <Empty
              title={`No active students in ${classLevel}-${section}`}
              description="Students must be enrolled before attendance can be taken. Student records are managed through the API until that screen is built."
            />
          ) : (
            <ul className="space-y-2">
              {state.rows.map((s, i) => (
                <li key={s._id} className="card flex flex-wrap items-center gap-3 p-3">
                  <span className="w-8 shrink-0 text-center text-xs font-semibold text-slate-400">{s.rollNo || i + 1}</span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500" aria-hidden>
                    {(s.firstName?.[0] || '?').toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy-800">
                      {[s.firstName, s.lastName].filter(Boolean).join(' ')}
                    </p>
                    <p className="text-xs text-slate-400">{s.admissionNo}</p>
                  </div>
                  <div className="flex shrink-0 gap-1" role="group" aria-label={`Attendance for ${s.firstName}`}>
                    {STATUS.map((st) => {
                      const on = marks[s._id] === st.key;
                      return (
                        <button
                          key={st.key} type="button" title={st.title}
                          aria-pressed={on}
                          onClick={() => setMarks((m) => ({ ...m, [s._id]: on ? '' : st.key }))}
                          className={`h-9 w-9 rounded-lg border text-xs font-bold transition ${
                            on ? `${st.on} border-transparent` : `border-slate-200 bg-white ${st.off}`}`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}

        {state.rows.length > 0 && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            <p>P = Present · A = Absent · L = Late · H = Half day · Lv = Leave. Click a marked button again to clear it.</p>
          </div>
        )}
      </Body>

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </>
  );
}
