'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Pin, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { authedFetch, readSession } from '@/lib/auth';
import { uploadFiles } from '@/lib/upload';
import { PageHeader, Body, Loading, ErrorBox, Empty, Toast, ConfirmButton } from '@/components/admin/ui';

const CATEGORIES = ['general', 'academic', 'examination', 'holiday', 'admission', 'event', 'circular', 'result', 'vacancy'];
const AUDIENCES = ['all', 'students', 'parents', 'staff'];

const emptyForm = {
  title: '', body: '', excerpt: '', category: 'general',
  audience: ['all'], pinned: false, isPublished: true, expiresAt: '',
};

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminNoticesPage() {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    authedFetch('/notices?limit=100')
      .then((json) => setState({ loading: false, items: json.data || [], error: '' }))
      .catch((err) => setState({ loading: false, items: [], error: err.message }));
  };

  useEffect(load, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setFiles([]); setDrawer(true); };

  const openEdit = async (slug) => {
    try {
      const json = await authedFetch(`/notices/${slug}`);
      const n = json.data;
      setForm({
        title: n.title, body: n.body, excerpt: n.excerpt || '', category: n.category,
        audience: n.audience?.length ? n.audience : ['all'],
        pinned: !!n.pinned, isPublished: !!n.isPublished,
        expiresAt: n.expiresAt ? String(n.expiresAt).slice(0, 10) : '',
      });
      setEditingId(n._id);
      setFiles([]);
      setDrawer(true);
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let attachments = [];
      if (files.length) {
        const token = readSession()?.token;
        attachments = await uploadFiles(files, { folder: 'notices', token, onProgress: setProgress });
        setProgress(null);
      }

      const payload = {
        ...form,
        expiresAt: form.expiresAt || undefined,
        excerpt: form.excerpt || undefined,
        ...(attachments.length ? { attachments } : {}),
      };

      if (editingId) await authedFetch(`/admin/notices/${editingId}`, { method: 'PATCH', body: payload });
      else await authedFetch('/admin/notices', { method: 'POST', body: payload });

      setToast({ message: editingId ? 'Notice updated' : 'Notice published', tone: 'success' });
      setDrawer(false);
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const remove = async (id) => {
    try {
      await authedFetch(`/admin/notices/${id}`, { method: 'DELETE' });
      setToast({ message: 'Notice deleted', tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    }
  };

  const togglePublish = async (n) => {
    try {
      await authedFetch(`/admin/notices/${n._id}`, { method: 'PATCH', body: { isPublished: !n.isPublished } });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <>
      <PageHeader
        title="Notices & Circulars"
        description="Anything published here appears on the website within about two minutes."
        action={<button type="button" onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" aria-hidden /> New notice</button>}
      />

      <Body>
        {state.loading ? <Loading /> : state.error ? <ErrorBox message={state.error} onRetry={load} /> : (
          state.items.length === 0 ? (
            <Empty title="No notices yet" description="Publish your first notice — admission announcements, holiday circulars, exam schedules."
              action={<button type="button" onClick={openNew} className="btn-primary mt-2">Create a notice</button>} />
          ) : (
            <ul className="space-y-2.5">
              {state.items.map((n) => (
                <li key={n._id || n.slug} className="card flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip bg-slate-100 text-slate-700 ring-slate-200">{n.category}</span>
                      {n.pinned && <span className="chip bg-gold-50 text-gold-700 ring-gold-200"><Pin className="h-3 w-3" aria-hidden /> Pinned</span>}
                      {!n.isPublished && <span className="chip bg-slate-200 text-slate-600 ring-slate-300">Draft</span>}
                      <time className="text-xs text-slate-400">{fmt(n.publishAt)}</time>
                      {n.views > 0 && <span className="text-xs text-slate-400">· {n.views} views</span>}
                    </div>
                    <p className="mt-1.5 font-semibold text-navy-800">{n.title}</p>
                    {n.excerpt && <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{n.excerpt}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => togglePublish(n)} title={n.isPublished ? 'Unpublish' : 'Publish'}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                      {n.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => openEdit(n.slug)} title="Edit" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <ConfirmButton onConfirm={() => remove(n._id)} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </Body>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={editingId ? 'Edit notice' : 'New notice'}>
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawer(false)} aria-hidden />
          <form onSubmit={save} className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy-800">{editingId ? 'Edit notice' : 'New notice'}</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="rounded p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 space-y-4 px-5 py-5">
              <div>
                <label className="label" htmlFor="n-title">Title <span className="text-red-600">*</span></label>
                <input id="n-title" required minLength={4} maxLength={200} className="input" value={form.title} onChange={set('title')} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="n-cat">Category</label>
                  <select id="n-cat" className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="n-exp">Expires on <span className="font-normal text-slate-400">(optional)</span></label>
                  <input id="n-exp" type="date" className="input" value={form.expiresAt} onChange={set('expiresAt')} />
                </div>
              </div>

              <fieldset>
                <legend className="label">Who is this for?</legend>
                <div className="flex flex-wrap gap-3">
                  {AUDIENCES.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form.audience.includes(a)}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          audience: e.target.checked ? [...f.audience, a] : f.audience.filter((x) => x !== a),
                        }))}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                      {a}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="label" htmlFor="n-body">Notice text <span className="text-red-600">*</span></label>
                <textarea id="n-body" required rows={10} className="input font-normal" value={form.body} onChange={set('body')}
                  placeholder="Leave a blank line between paragraphs." />
                <p className="mt-1 text-xs text-slate-500">Blank lines become paragraphs on the website.</p>
              </div>

              <div>
                <label className="label" htmlFor="n-exc">Short summary <span className="font-normal text-slate-400">(optional)</span></label>
                <input id="n-exc" maxLength={300} className="input" value={form.excerpt} onChange={set('excerpt')}
                  placeholder="Shown in listings. Generated from the notice text if left blank." />
              </div>

              <div>
                <label className="label" htmlFor="n-files">Attachments <span className="font-normal text-slate-400">(PDF or images, up to 5)</span></label>
                <input id="n-files" type="file" multiple accept=".pdf,image/*" className="input !py-2"
                  onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))} />
                {files.length > 0 && <p className="mt-1 text-xs text-slate-500">{files.length} file(s) selected</p>}
                {progress !== null && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-5 rounded-lg bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.pinned} onChange={set('pinned')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Pin to the top
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving…</> : editingId ? 'Save changes' : 'Publish notice'}
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
