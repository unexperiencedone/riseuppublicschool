'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Check, Archive, Ban, Loader2 } from 'lucide-react';
import { authedFetch } from '@/lib/auth';
import { PageHeader, Body, Loading, ErrorBox, Empty, Toast } from '@/components/admin/ui';

const STATUSES = [
  { key: '', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'responded', label: 'Responded' },
  { key: 'closed', label: 'Closed' },
  { key: 'spam', label: 'Spam' },
];

const TONE = {
  new: 'bg-amber-50 text-amber-800 ring-amber-200',
  read: 'bg-slate-100 text-slate-700 ring-slate-200',
  responded: 'bg-brand-50 text-brand-700 ring-brand-200',
  closed: 'bg-slate-100 text-slate-500 ring-slate-200',
  spam: 'bg-red-50 text-red-700 ring-red-200',
};

const fmt = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminMessagesPage() {
  const [status, setStatus] = useState('');
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    const q = new URLSearchParams({ limit: '50', ...(status ? { status } : {}) });
    authedFetch(`/admin/messages?${q}`)
      .then((json) => setState({ loading: false, items: json.data || [], error: '' }))
      .catch((err) => setState({ loading: false, items: [], error: err.message }));
  };

  useEffect(load, [status]);   // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (id, newStatus, note) => {
    setBusy(id);
    try {
      await authedFetch(`/admin/messages/${id}`, { method: 'PATCH', body: { status: newStatus, responseNote: note } });
      setToast({ message: `Marked as ${newStatus}`, tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title="Messages" description="Enquiries submitted through the website contact form." />

      <Body>
        <div className="mb-5 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s.key} type="button" onClick={() => setStatus(s.key)} aria-pressed={status === s.key}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                status === s.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {state.loading ? <Loading /> : state.error ? <ErrorBox message={state.error} onRetry={load} /> : (
          state.items.length === 0 ? (
            <Empty title="No messages" description={status ? `Nothing with status "${status}".` : 'Messages from the website contact form will appear here.'} />
          ) : (
            <ul className="space-y-3">
              {state.items.map((m) => (
                <li key={m._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`chip ${TONE[m.status] || TONE.new}`}>{m.status}</span>
                        <span className="chip bg-navy-50 text-navy-700 ring-navy-200">{m.category}</span>
                        <time className="text-xs text-slate-400">{fmt(m.createdAt)}</time>
                      </div>
                      <p className="mt-2 font-semibold text-navy-800">{m.subject}</p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {m.name}
                        {m.phone && <> · <a href={`tel:+91${m.phone}`} className="text-brand-700 hover:underline">{m.phone}</a></>}
                        {m.email && <> · <a href={`mailto:${m.email}`} className="text-brand-700 hover:underline">{m.email}</a></>}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {m.phone && (
                        <a href={`tel:+91${m.phone}`} title="Call" className="rounded-lg bg-brand-50 p-2 text-brand-700 hover:bg-brand-100">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} title="Reply by email"
                          className="rounded-lg bg-navy-50 p-2 text-navy-700 hover:bg-navy-100">
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{m.message}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {busy === m._id ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : (
                      <>
                        {m.status !== 'responded' && (
                          <button type="button" onClick={() => update(m._id, 'responded')} className="btn-outline !px-3 !py-1.5 !text-xs">
                            <Check className="h-3.5 w-3.5" aria-hidden /> Mark responded
                          </button>
                        )}
                        {m.status !== 'closed' && (
                          <button type="button" onClick={() => update(m._id, 'closed')} className="btn-ghost !px-3 !py-1.5 !text-xs">
                            <Archive className="h-3.5 w-3.5" aria-hidden /> Close
                          </button>
                        )}
                        {m.status !== 'spam' && (
                          <button type="button" onClick={() => update(m._id, 'spam')} className="btn-ghost !px-3 !py-1.5 !text-xs !text-red-600">
                            <Ban className="h-3.5 w-3.5" aria-hidden /> Spam
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </Body>

      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </>
  );
}
