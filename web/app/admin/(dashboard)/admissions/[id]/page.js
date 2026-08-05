'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, AlertCircle, ArrowLeft, Phone, Mail, MapPin, FileText, Trash2, CheckCircle2,
} from 'lucide-react';
import { authedFetch, readSession } from '@/lib/auth';

const STATUS_META = {
  new: { label: 'New', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
  contacted: { label: 'Contacted', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  documents_pending: { label: 'Docs pending', tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  shortlisted: { label: 'Shortlisted', tone: 'bg-teal-50 text-teal-700 ring-teal-200' },
  admitted: { label: 'Admitted', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  rejected: { label: 'Rejected', tone: 'bg-red-50 text-red-700 ring-red-200' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700 ring-slate-200' },
};
const STATUS_ORDER = ['new', 'contacted', 'documents_pending', 'shortlisted', 'admitted', 'rejected', 'withdrawn'];
const OWNER_ROLES = ['super_admin', 'admin'];

const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-800">{value || '—'}</dd>
    </div>
  );
}

export default function AdmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [form, setForm] = useState({ status: '', note: '', followUpAt: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    authedFetch(`/admin/admissions/${params.id}`)
      .then((json) => {
        setState({ loading: false, data: json.data, error: '' });
        setForm({ status: json.data.status, note: '', followUpAt: json.data.followUpAt ? json.data.followUpAt.slice(0, 10) : '' });
      })
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, [params.id]);

  useEffect(() => {
    const session = readSession();
    if (!session?.token) { router.replace('/admin/login'); return; }
    setUser(session.user);
    load();
  }, [router, load]);

  const signOut = async () => { await logout(); router.replace('/admin/login'); };

  const onUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      const body = { status: form.status, note: form.note || undefined, followUpAt: form.followUpAt || undefined };
      const json = await authedFetch(`/admin/admissions/${params.id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
      setState((s) => ({ ...s, data: json.data }));
      setForm((f) => ({ ...f, note: '' }));
      setSaveMsg('Status updated.');
    } catch (err) {
      setSaveMsg(err.message || 'Could not update the status.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Permanently delete this record? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await authedFetch(`/admin/admissions/${params.id}`, { method: 'DELETE' });
      router.push('/admin/admissions');
    } catch (err) {
      setSaveMsg(err.message || 'Could not delete this record.');
      setDeleting(false);
    }
  };

  if (state.loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" /></div>;
  }

  if (state.error || !state.data) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md card p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" aria-hidden />
          <h1 className="mt-4 font-display text-lg font-bold">Could not load this record</h1>
          <p className="mt-2 text-sm text-slate-600">{state.error}</p>
          <Link href="/admin/admissions" className="btn-outline mt-6 inline-flex">Back to list</Link>
        </div>
      </div>
    );
  }

  const a = state.data;
  const meta = STATUS_META[a.status] || STATUS_META.new;

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/admin/admissions" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-700">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All admissions
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-navy-800">{a.applicationNo}</h1>
            <span className={`chip ${meta.tone}`}>{meta.label}</span>
            <span className="chip bg-slate-100 text-slate-600 ring-slate-200">{a.type === 'application' ? 'Full application' : 'Enquiry'}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">Submitted {fmt(a.createdAt)} via {a.source?.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Student</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={`${a.student?.firstName || ''} ${a.student?.lastName || ''}`.trim()} />
              <Field label="Class applying for" value={a.student?.classApplyingFor} />
              <Field label="Date of birth" value={fmtDate(a.student?.dob)} />
              <Field label="Gender" value={a.student?.gender} />
              <Field label="Stream" value={a.student?.stream !== 'NA' ? a.student?.stream : '—'} />
              <Field label="Previous school" value={a.student?.previousSchool} />
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Parent / Guardian</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={a.parent?.guardianName} />
              <Field label="Relation" value={a.parent?.relation} />
              <Field label="Occupation" value={a.parent?.occupation} />
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</dt>
                <dd className="mt-0.5 text-sm font-medium">
                  <a href={`tel:+91${a.parent?.phone}`} className="inline-flex items-center gap-1.5 text-brand-700 hover:underline">
                    <Phone className="h-3.5 w-3.5" aria-hidden /> {a.parent?.phone}
                  </a>
                  {a.parent?.altPhone && <span className="ml-2 text-slate-500">(alt. {a.parent.altPhone})</span>}
                </dd>
              </div>
              {a.parent?.email && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    <a href={`mailto:${a.parent.email}`} className="inline-flex items-center gap-1.5 text-brand-700 hover:underline">
                      <Mail className="h-3.5 w-3.5" aria-hidden /> {a.parent.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {(a.address?.village || a.address?.line1 || a.address?.city) && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <MapPin className="h-4 w-4 text-brand-600" aria-hidden /> Address
              </h2>
              <p className="mt-3 text-sm text-slate-700">
                {[a.address?.line1, a.address?.village, a.address?.city, a.address?.district, a.address?.state, a.address?.pincode]
                  .filter(Boolean).join(', ')}
              </p>
            </section>
          )}

          {a.message && (
            <section className="card p-6">
              <h2 className="font-display text-lg font-bold">Message from the parent</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{a.message}</p>
            </section>
          )}

          {a.documents?.length > 0 && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <FileText className="h-4 w-4 text-brand-600" aria-hidden /> Documents ({a.documents.length})
              </h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {a.documents.map((d) => (
                  <li key={d.url || d.publicId} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-800">{d.name || d.type}</p>
                      <p className="text-xs capitalize text-slate-500">{d.type?.replace(/_/g, ' ')}</p>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer" className="btn-outline shrink-0 px-3 py-1.5 text-xs">View</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {a.statusHistory?.length > 0 && (
            <section className="card p-6">
              <h2 className="font-display text-lg font-bold">Status history</h2>
              <ol className="mt-4 space-y-4 border-l-2 border-slate-100 pl-4">
                {[...a.statusHistory].reverse().map((h, i) => (
                  <li key={`${h.status}-${h.at}-${i}`} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden />
                    <p className="text-sm font-semibold text-navy-800">{(STATUS_META[h.status] || {}).label || h.status}</p>
                    {h.note && <p className="mt-0.5 text-sm text-slate-600">{h.note}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">{fmt(h.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Update status</h2>
            <form onSubmit={onUpdateStatus} className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="status">Status</label>
                <select id="status" className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="note">Note (optional)</label>
                <textarea id="note" rows={3} className="input" value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Spoke with father, visiting campus Saturday" />
              </div>
              <div>
                <label className="label" htmlFor="followUpAt">Follow-up date (optional)</label>
                <input id="followUpAt" type="date" className="input" value={form.followUpAt}
                  onChange={(e) => setForm((f) => ({ ...f, followUpAt: e.target.value }))} />
              </div>
              {saveMsg && (
                <p className={`flex items-center gap-1.5 text-xs font-medium ${saveMsg.includes('updated') ? 'text-brand-700' : 'text-red-600'}`}>
                  {saveMsg.includes('updated') && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />} {saveMsg}
                </p>
              )}
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…</> : 'Save status'}
              </button>
            </form>
          </section>

          {a.assignedTo && (
            <section className="card p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Assigned to</h2>
              <p className="mt-2 text-sm font-semibold text-navy-800">{a.assignedTo.name}</p>
              <p className="text-xs text-slate-500">{a.assignedTo.email}</p>
            </section>
          )}

          {user && OWNER_ROLES.includes(user.role) && (
            <section className="card p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Danger zone</h2>
              <p className="mt-2 text-xs text-slate-500">Permanently deletes this record. This cannot be undone.</p>
              <button type="button" onClick={onDelete} disabled={deleting} className="btn-outline mt-4 w-full border-red-300 text-red-700 hover:bg-red-50">
                {deleting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Deleting…</> : <><Trash2 className="h-4 w-4" aria-hidden /> Delete record</>}
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
