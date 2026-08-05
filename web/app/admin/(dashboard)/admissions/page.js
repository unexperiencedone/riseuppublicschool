'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { authedFetch, readSession } from '@/lib/auth';
import { PageHeader, Body } from '@/components/admin/ui';
import { EmptyState } from '@/components/ui';

const CLASS_LEVELS = ['Play Group', 'Nursery', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const STATUS_META = {
  new: { label: 'New', tone: 'bg-blue-50 text-blue-700 ring-blue-200' },
  contacted: { label: 'Contacted', tone: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  documents_pending: { label: 'Docs pending', tone: 'bg-amber-50 text-amber-800 ring-amber-200' },
  shortlisted: { label: 'Shortlisted', tone: 'bg-teal-50 text-teal-700 ring-teal-200' },
  admitted: { label: 'Admitted', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  rejected: { label: 'Rejected', tone: 'bg-red-50 text-red-700 ring-red-200' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-700 ring-slate-200' },
};

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdmissionsListPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', classLevel: '', search: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, items: [], meta: null, error: '' });

  useEffect(() => {
    if (!readSession()?.token) router.replace('/admin/login');
  }, [router]);

  // Debounce free-text search so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setFilters((f) => ({ ...f, search: searchInput.trim() }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    const params = new URLSearchParams({ page: String(page), limit: '20', sort: '-createdAt' });
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.classLevel) params.set('classLevel', filters.classLevel);
    if (filters.search) params.set('search', filters.search);

    authedFetch(`/admin/admissions?${params.toString()}`)
      .then((json) => setState({ loading: false, items: json.data || [], meta: json.meta, error: '' }))
      .catch((err) => setState({ loading: false, items: [], meta: null, error: err.message }));
  }, [page, filters.status, filters.type, filters.classLevel, filters.search]);

  return (
    <>
      <PageHeader
        title="Admission Enquiries"
        description={state.meta
          ? `${state.meta.total} record${state.meta.total === 1 ? '' : 's'}`
          : 'Enquiries and applications submitted through the website.'}
      />

      <Body>
        <div className="space-y-6">
        <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="text" placeholder="Search name, phone, application no." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select className="input" value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <select className="input" value={filters.type} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, type: e.target.value })); }}>
            <option value="">Enquiries &amp; applications</option>
            <option value="enquiry">Enquiries only</option>
            <option value="application">Applications only</option>
          </select>
          <select className="input lg:col-start-1" value={filters.classLevel} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, classLevel: e.target.value })); }}>
            <option value="">All classes</option>
            {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {state.loading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" />
          </div>
        )}

        {!state.loading && state.error && (
          <div role="alert" className="card flex gap-3 p-5 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden /><p>{state.error}</p>
          </div>
        )}

        {!state.loading && !state.error && state.items.length === 0 && (
          <EmptyState title="No records match these filters" description="Try clearing the search or status filter." />
        )}

        {!state.loading && !state.error && state.items.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3">Application No.</th>
                    <th scope="col" className="px-4 py-3">Student</th>
                    <th scope="col" className="px-4 py-3">Class</th>
                    <th scope="col" className="px-4 py-3">Parent / Guardian</th>
                    <th scope="col" className="px-4 py-3">Contact</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.items.map((a) => {
                    const meta = STATUS_META[a.status] || STATUS_META.new;
                    return (
                      <tr
                        key={a._id} onClick={() => router.push(`/admin/admissions/${a._id}`)}
                        className="cursor-pointer transition hover:bg-brand-50/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-800">{a.applicationNo}</td>
                        <td className="px-4 py-3 font-medium text-navy-800">
                          {a.student?.firstName} {a.student?.lastName || ''}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{a.student?.classApplyingFor}</td>
                        <td className="px-4 py-3 text-slate-600">{a.parent?.guardianName}</td>
                        <td className="px-4 py-3">
                          <a
                            href={`tel:+91${a.parent?.phone}`} onClick={(e) => e.stopPropagation()}
                            className="font-medium text-brand-700 hover:underline"
                          >
                            {a.parent?.phone}
                          </a>
                        </td>
                        <td className="px-4 py-3"><span className={`chip ${meta.tone}`}>{meta.label}</span></td>
                        <td className="px-4 py-3 text-slate-500">{fmt(a.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {state.meta && state.meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">Page {state.meta.page} of {state.meta.totalPages}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={!state.meta.hasPrev} onClick={() => setPage((p) => p - 1)} className="btn-outline px-3 py-1.5 text-xs">
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden /> Previous
                  </button>
                  <button type="button" disabled={!state.meta.hasNext} onClick={() => setPage((p) => p + 1)} className="btn-outline px-3 py-1.5 text-xs">
                    Next <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </Body>
    </>
  );
}
