'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Upload, X, Loader2, Images } from 'lucide-react';
import { authedFetch, readSession } from '@/lib/auth';
import { uploadFiles } from '@/lib/upload';
import { PageHeader, Body, Loading, ErrorBox, Empty, Toast, ConfirmButton } from '@/components/admin/ui';

const CATEGORIES = ['campus', 'academics', 'cultural', 'sports', 'celebration', 'trip', 'ceremony', 'other'];

export default function AdminGalleryPage() {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', eventDate: '' });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    authedFetch('/gallery?limit=50')
      .then((json) => setState({ loading: false, items: json.data || [], error: '' }))
      .catch((err) => setState({ loading: false, items: [], error: err.message }));
  };

  useEffect(load, []);

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!files.length) { setToast({ message: 'Select at least one photo', tone: 'error' }); return; }
    setSaving(true);
    try {
      const token = readSession()?.token;
      const photos = await uploadFiles(files, { folder: 'gallery', token, onProgress: setProgress });
      await authedFetch('/admin/gallery', {
        method: 'POST',
        body: { ...form, eventDate: form.eventDate || undefined, description: form.description || undefined, photos },
      });
      setToast({ message: `Album created with ${photos.length} photo(s)`, tone: 'success' });
      setDrawer(false);
      setForm({ title: '', description: '', category: 'other', eventDate: '' });
      setFiles([]);
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const addPhotos = async (albumId, fileList) => {
    if (!fileList.length) return;
    setAddingTo(albumId);
    try {
      const token = readSession()?.token;
      const photos = await uploadFiles(Array.from(fileList), { folder: 'gallery', token, onProgress: setProgress });
      await authedFetch(`/admin/gallery/${albumId}/photos`, { method: 'POST', body: { photos } });
      setToast({ message: `${photos.length} photo(s) added`, tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    } finally {
      setAddingTo(null);
      setProgress(null);
    }
  };

  const removeAlbum = async (id) => {
    try {
      await authedFetch(`/admin/gallery/${id}`, { method: 'DELETE' });
      setToast({ message: 'Album deleted', tone: 'success' });
      load();
    } catch (err) {
      setToast({ message: err.message, tone: 'error' });
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        description="Photos upload straight to Cloudinary from your browser, so large files are fine."
        action={<button type="button" onClick={() => setDrawer(true)} className="btn-primary"><Plus className="h-4 w-4" aria-hidden /> New album</button>}
      />

      <Body>
        {state.loading ? <Loading /> : state.error ? <ErrorBox message={state.error} onRetry={load} /> : (
          state.items.length === 0 ? (
            <Empty title="No albums yet" description="Create an album for an event — Sports Day, Annual Function, Science Exhibition."
              action={<button type="button" onClick={() => setDrawer(true)} className="btn-primary mt-2">Create an album</button>} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {state.items.map((a) => (
                <article key={a._id || a.slug} className="card overflow-hidden">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {a.cover?.url ? (
                      <Image src={a.cover.url} alt="" fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Images className="h-8 w-8 text-slate-300" aria-hidden /></div>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-navy-900/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {a.photoCount ?? a.photos?.length ?? 0} photos
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="chip bg-brand-50 text-brand-700 ring-brand-200">{a.category}</span>
                    <h3 className="mt-2 font-display text-base font-bold text-navy-800">{a.title}</h3>
                    {a.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.description}</p>}

                    <div className="mt-4 flex items-center gap-2">
                      <label className="btn-outline flex-1 cursor-pointer !px-3 !py-1.5 !text-xs">
                        {addingTo === (a._id) ? <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Uploading…</> : <><Upload className="h-3.5 w-3.5" aria-hidden /> Add photos</>}
                        <input type="file" multiple accept="image/*" className="hidden"
                          onChange={(e) => { addPhotos(a._id, e.target.files); e.target.value = ''; }} />
                      </label>
                      <ConfirmButton onConfirm={() => removeAlbum(a._id)} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </ConfirmButton>
                    </div>
                    {addingTo === a._id && progress !== null && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </Body>

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="New album">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawer(false)} aria-hidden />
          <form onSubmit={createAlbum} className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="font-display text-lg font-bold text-navy-800">New album</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="rounded p-1.5 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 space-y-4 px-5 py-5">
              <div>
                <label className="label" htmlFor="g-title">Album title <span className="text-red-600">*</span></label>
                <input id="g-title" required minLength={3} className="input" value={form.title} onChange={set('title')}
                  placeholder="Annual Sports Day 2026" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="g-cat">Category</label>
                  <select id="g-cat" className="input" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="g-date">Event date</label>
                  <input id="g-date" type="date" className="input" value={form.eventDate} onChange={set('eventDate')} />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="g-desc">Description</label>
                <textarea id="g-desc" rows={3} className="input" value={form.description} onChange={set('description')} />
              </div>
              <div>
                <label className="label" htmlFor="g-files">Photos <span className="text-red-600">*</span></label>
                <input id="g-files" type="file" multiple accept="image/*" required className="input !py-2"
                  onChange={(e) => setFiles(Array.from(e.target.files))} />
                {files.length > 0 && <p className="mt-1 text-xs text-slate-500">{files.length} photo(s) selected. The first becomes the cover.</p>}
                {progress !== null && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Uploading… {progress}%</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Uploading…</> : 'Create album'}
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
