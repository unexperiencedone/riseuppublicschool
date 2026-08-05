'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, GraduationCap, Inbox, FileText, IndianRupee, Image as ImageIcon,
  MessageSquare, Loader2, AlertCircle, LogOut, ExternalLink,
} from 'lucide-react';
import { authedFetch, readSession, logout } from '@/lib/auth';

const money = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const QUICK_ACTIONS = [
  { label: 'Publish a notice', hint: 'POST /admin/notices', href: '/notices' },
  { label: 'Add gallery photos', hint: 'POST /admin/gallery', href: '/gallery' },
  { label: 'Review admission enquiries', hint: 'GET /admin/admissions', href: '/admissions' },
  { label: 'Update fee structure', hint: 'PATCH /admin/settings', href: '/admissions/fees' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = readSession();
    if (!session?.token) { router.replace('/admin/login'); return; }
    setUser(session.user);
    authedFetch('/admin/dashboard')
      .then((json) => setState({ loading: false, data: json.data, error: '' }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, [router]);

  const signOut = async () => { await logout(); router.replace('/admin/login'); };

  if (state.loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" /></div>;
  }

  if (state.error) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md card p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" aria-hidden />
          <h1 className="mt-4 font-display text-lg font-bold">Could not load the dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">{state.error}</p>
          <p className="mt-2 text-xs text-slate-500">This page requires an admin, principal or super-admin account.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="btn-primary">Try again</button>
            <button type="button" onClick={signOut} className="btn-outline">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  const c = state.data?.counters || {};
  const tiles = [
    { Icon: GraduationCap, label: 'Active students', value: c.students, tone: 'bg-brand-600' },
    { Icon: Users, label: 'Staff', value: c.staff, tone: 'bg-navy-600' },
    { Icon: Inbox, label: 'New enquiries', value: c.newEnquiries, sub: `${c.enquiriesLast30Days || 0} in last 30 days`, tone: 'bg-amber-500' },
    { Icon: MessageSquare, label: 'Unread messages', value: c.unreadMessages, tone: 'bg-teal-600' },
    { Icon: IndianRupee, label: 'Collected (30 days)', value: money(c.collectedLast30Days), sub: `${c.paymentsLast30Days || 0} payments`, tone: 'bg-emerald-600' },
    { Icon: IndianRupee, label: 'Outstanding fees', value: money(c.outstandingFees), sub: `${c.outstandingInvoices || 0} invoices`, tone: 'bg-rose-600' },
    { Icon: FileText, label: 'Published notices', value: c.notices, tone: 'bg-slate-600' },
    { Icon: ImageIcon, label: 'Gallery albums', value: c.albums, tone: 'bg-fuchsia-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="eyebrow">School Administration</p>
            <h1 className="mt-1 font-display text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Signed in as {user?.name} ({user?.role?.replace('_', ' ')})</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn-outline"><ExternalLink className="h-4 w-4" aria-hidden /> View site</Link>
            <button type="button" onClick={signOut} className="btn-ghost"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="container-page space-y-8 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ Icon, label, value, sub, tone }) => (
            <article key={label} className="card p-5">
              <span className={`inline-flex rounded-lg ${tone} p-2.5 text-white`}><Icon className="h-4 w-4" aria-hidden /></span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-navy-800">{value ?? 0}</p>
              {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Students by class</h2>
            {state.data?.studentsByClass?.length ? (
              <ul className="mt-5 space-y-2.5">
                {state.data.studentsByClass.map((row) => {
                  const max = Math.max(...state.data.studentsByClass.map((r) => r.count));
                  return (
                    <li key={row._id} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm font-medium text-navy-800">{row._id}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${(row.count / max) * 100}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right text-sm font-semibold text-slate-600">{row.count}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No students enrolled yet. Add students under Admin → Students.</p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Upcoming events</h2>
            {state.data?.upcomingEvents?.length ? (
              <ul className="mt-4 space-y-3">
                {state.data.upcomingEvents.map((e) => (
                  <li key={e._id} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-700 text-white">
                      <span className="text-sm font-bold leading-none">{new Date(e.startDate).getDate()}</span>
                      <span className="text-[9px] uppercase">{new Date(e.startDate).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-800">{e.title}</p>
                      <p className="text-xs text-slate-500">{fmt(e.startDate)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No upcoming events.</p>
            )}
          </section>
        </div>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-600">
            Full CRUD screens for each module are backed by the endpoints listed in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">API_ENDPOINTS.md</code>.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href} className="rounded-lg border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50">
                <p className="text-sm font-semibold text-navy-800">{a.label}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">{a.hint}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
