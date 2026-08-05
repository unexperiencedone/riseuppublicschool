'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Loader2, CalendarDays } from 'lucide-react';
import { authedFetch } from '@/lib/auth';
import { PageHeader, Body, Loading, ErrorBox, Empty, Toast, ConfirmButton } from '@/components/admin/ui';

const CATEGORIES = ['academic', 'cultural', 'sports', 'holiday', 'exam', 'ptm', 'celebration', 'trip'];

const emptyForm = {
  title: '', description: '', category: 'academic',
  startDate: '', endDate: '', venue: 'School Campus',
  isHoliday: false, isPublished: true,
};

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminEventsPage() {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [form, setForm] = useState(emptyForm);
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    authedFetch('/events?session=2026-27')
      .then((json) => setState({ loading: false, items: json.data || [], error: '' }))
      .catch((err) => setState({ loading: false, items: [], error: err.message }));
  };

  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authedFetch('/admin/events', {
        method: 'POST',
        body: { ...form, endDate: form.endDate || undefined, description: form.description || undefined },
      });
      setToast({ message: 'Event created', tone: 'success' });
      setDrawer(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await authedFetch(`/admin/events/${id}`, { method: 'DELETE' });
      setToast({ message: 'Event deleted', tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = state.items.filter((e) => String(e.endDate || e.startDate).slice(0, 10) >= today);
  const past = state.items.filter((e) => String(e.endDate || e.startDate).slice(0, 10) < today);

  const Row = ({ e }) => (
    <li className="card flex items-center gap-4 p-4">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-700 text-white">
        <span className="text-sm font-bold leading-none">{new Date(e.startDate).getDate()}</span>
        <span className="text-[9px] uppercase">{new Date(e.startDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-navy-800">{e.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {fmt(e.startDate)}{e.endDate ? ` – ${fmt(e.endDate)}` : ''} · {e.category}
          {e.isHoliday ? ' · Holiday' : ''}
        </p>
      </div>
      <ConfirmButton onConfirm={() => remove(e._id)} className="shrink-0 rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </ConfirmButton>
    </li>
  );

  return (
    <>
      <PageHeader
        title="Events"
        description="The academic calendar for 2026-27 is already seeded. Add anything new here."
        action={<button type="button" onClick={() => setDrawer(true)} className="btn-primary"><Plus className="h-4 w-4" aria-hidden /> New event</button>}
      />

      <Body>
        {state.loading ? <Loading /> : state.error ? <ErrorBox message={state.error} onRetry={load} /> : (
          state.items.length === 0 ? (
            <Empty title="No events" description="Run the seeder to load the 2026-27 academic calendar, or add events one by one." />
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-navy-800">
                  <CalendarDays className="h-4 w-4 text-brand-600" aria-hidden /> Upcoming ({upcoming.length})
                </h2>
                {upcoming.length ? <ul className="space-y-2.5">{upcoming.map((e) => <Row key={e._id} e={e} />)}</ul>
                  : <p className="text-sm text-slate-500">Nothing scheduled ahead.</p>}
              </section>

              {past.length > 0 && (
                <section>
                  <h2 className="mb-3 font-display text-base font-bold text-slate-400">Past ({past.length})</h2>
                  <ul className="space-y-2.5 opacity-60">{past.slice(0, 20).map((e) => <Row key={e._id} e={e} />)}</ul>
                </section>
              )}
            </div>
          )
        )}
      </Body>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="New event">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawer(false)} aria-hidden />
          <form onSubmit={save} className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy-800">New event</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="rounded p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 space-y-4 px-5 py-5">
              <div>
                <label className="label" htmlFor="e-title">Event name <span className="text-red-600">*</span></label>
                <input id="e-title" required minLength={3} className="input" value={form.title} onChange={set('title')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="e-start">Start date <span className="text-red-600">*</span></label>
                  <input id="e-start" type="date" required className="input" value={form.startDate} onChange={set('startDate')} />
                </div>
                <div>
                  <label className="label" htmlFor="e-end">End date <span className="font-normal text-slate-400">(optional)</span></label>
                  <input id="e-end" type="date" className="input" value={form.endDate} onChange={set('endDate')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="e-cat">Category</label>
                  <select id="e-cat" className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="e-venue">Venue</label>
                  <input id="e-venue" className="input" value={form.venue} onChange={set('venue')} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="e-desc">Description</label>
                <textarea id="e-desc" rows={5} className="input" value={form.description} onChange={set('description')} />
              </div>
              <div className="flex flex-wrap gap-5 rounded-lg bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isHoliday} onChange={set('isHoliday')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  School holiday
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Show on website
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…</> : 'Create event'}
              </button>
              <button type="button" onClick={() => setDrawer(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </>
  );
}
