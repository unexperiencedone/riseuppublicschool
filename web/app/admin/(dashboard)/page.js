'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, GraduationCap, Inbox, FileText, IndianRupee, Image as ImageIcon,
  MessageSquare, Megaphone, CalendarCheck, ArrowRight,
} from 'lucide-react';
import { authedFetch } from '@/lib/auth';
import { PageHeader, Body, Loading, ErrorBox } from '@/components/admin/ui';

const money = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

/** Links point at real admin screens — never at public pages. */
const QUICK_ACTIONS = [
  { label: 'Publish a notice', desc: 'Circulars, holidays, exam schedules', href: '/admin/notices', Icon: Megaphone },
  { label: 'Mark attendance', desc: "Today's class register", href: '/admin/attendance', Icon: CalendarCheck },
  { label: 'Add gallery photos', desc: 'Events, functions, sports day', href: '/admin/gallery', Icon: ImageIcon },
  { label: 'Review enquiries', desc: 'New admission applications', href: '/admin/admissions', Icon: Inbox },
];

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true, data: null, error: '' });

  const load = () => {
    setState((s) => ({ ...s, loading: true }));
    authedFetch('/admin/dashboard')
      .then((json) => setState({ loading: false, data: json.data, error: '' }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  };

  useEffect(load, []);

  if (state.loading) return <Loading />;

  if (state.error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Body><ErrorBox message={state.error} onRetry={load} /></Body>
      </>
    );
  }

  const c = state.data?.counters || {};
  const tiles = [
    { Icon: GraduationCap, label: 'Active students', value: c.students, tone: 'bg-brand-600' },
    { Icon: Users, label: 'Staff', value: c.staff, tone: 'bg-navy-600' },
    { Icon: Inbox, label: 'New enquiries', value: c.newEnquiries, sub: `${c.enquiriesLast30Days || 0} in last 30 days`, tone: 'bg-amber-500', href: '/admin/admissions' },
    { Icon: MessageSquare, label: 'Unread messages', value: c.unreadMessages, tone: 'bg-teal-600', href: '/admin/messages' },
    { Icon: IndianRupee, label: 'Collected (30 days)', value: money(c.collectedLast30Days), sub: `${c.paymentsLast30Days || 0} payments`, tone: 'bg-emerald-600' },
    { Icon: IndianRupee, label: 'Outstanding fees', value: money(c.outstandingFees), sub: `${c.outstandingInvoices || 0} invoices`, tone: 'bg-rose-600' },
    { Icon: FileText, label: 'Published notices', value: c.notices, tone: 'bg-slate-600', href: '/admin/notices' },
    { Icon: ImageIcon, label: 'Gallery albums', value: c.albums, tone: 'bg-fuchsia-600', href: '/admin/gallery' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Everything at a glance, refreshed each time you open this page." />
      <Body>
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map(({ Icon, label, value, sub, tone, href }) => {
              const inner = (
                <>
                  <span className={`inline-flex rounded-lg ${tone} p-2.5 text-white`}><Icon className="h-4 w-4" aria-hidden /></span>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-navy-800">{value ?? 0}</p>
                  {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
                </>
              );
              return href
                ? <Link key={label} href={href} className="card-hover block p-5">{inner}</Link>
                : <article key={label} className="card p-5">{inner}</article>;
            })}
          </section>

          <section>
            <h2 className="mb-4 font-display text-lg font-bold text-navy-800">Quick actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {QUICK_ACTIONS.map(({ label, desc, href, Icon }) => (
                <Link key={href} href={href} className="card-hover group flex items-start gap-3 p-4">
                  <span className="shrink-0 rounded-lg bg-brand-50 p-2.5 text-brand-600"><Icon className="h-4 w-4" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-800">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="card p-6 lg:col-span-2">
              <h2 className="font-display text-lg font-bold text-navy-800">Students by class</h2>
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
                <p className="mt-4 text-sm text-slate-500">
                  No students enrolled yet. Student records are added under Admin → Students, which is not built yet —
                  use the API directly, or admit an application from the Enquiries screen.
                </p>
              )}
            </section>

            <section className="card p-6">
              <h2 className="font-display text-lg font-bold text-navy-800">Upcoming events</h2>
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
                <p className="mt-4 text-sm text-slate-500">Nothing scheduled ahead.</p>
              )}
              <Link href="/admin/events" className="btn-outline mt-5 w-full !text-xs">Manage events</Link>
            </section>
          </div>
        </div>
      </Body>
    </>
  );
}
