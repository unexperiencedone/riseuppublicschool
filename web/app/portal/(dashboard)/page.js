'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck, GraduationCap, BookOpen, IndianRupee, Bell, LogOut, Loader2, AlertCircle,
} from 'lucide-react';
import { authedFetch, readSession, logout } from '@/lib/auth';
import { SCHOOL } from '@/lib/config';

const money = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function PortalDashboard() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = readSession();
    if (!session?.token) { router.replace('/portal/login'); return; }
    setUser(session.user);
    authedFetch('/portal/dashboard')
      .then((json) => setState({ loading: false, data: json.data, error: '' }))
      .catch((err) => setState({ loading: false, data: null, error: err.message }));
  }, [router]);

  const signOut = async () => { await logout(); router.replace('/portal/login'); };

  if (state.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-md card p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" aria-hidden />
          <h1 className="mt-4 font-display text-lg font-bold">Could not load your portal</h1>
          <p className="mt-2 text-sm text-slate-600">{state.error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="btn-primary">Try again</button>
            <button type="button" onClick={signOut} className="btn-outline">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  const d = state.data || {};
  const student = d.student;

  const cards = [
    { Icon: CalendarCheck, label: 'Attendance this month',
      value: d.attendanceThisMonth?.percent != null ? `${d.attendanceThisMonth.percent}%` : '—',
      sub: `${d.attendanceThisMonth?.present || 0} of ${d.attendanceThisMonth?.totalMarked || 0} days marked`,
      tone: 'bg-brand-600' },
    { Icon: GraduationCap, label: 'Latest result',
      value: d.latestResult ? `${d.latestResult.percentage}%` : '—',
      sub: d.latestResult ? `${d.latestResult.examName || d.latestResult.examType} · Grade ${d.latestResult.grade}` : 'No result published yet',
      tone: 'bg-navy-600' },
    { Icon: IndianRupee, label: 'Outstanding fees', value: money(d.dues),
      sub: `${d.pendingInvoices?.length || 0} pending invoice(s)`, tone: d.dues > 0 ? 'bg-amber-500' : 'bg-slate-400' },
    { Icon: BookOpen, label: 'Recent homework', value: d.homework?.length || 0,
      sub: 'assignments in the last week', tone: 'bg-teal-600' },
  ];

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page py-6">
          <p className="eyebrow">Parent &amp; Student Portal</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-800">
            {student ? student.name : user?.name}
          </h1>
          {student && (
            <p className="mt-1 text-sm text-slate-600">
              Class {student.classLevel}-{student.section} · Admission No. {student.admissionNo}
            </p>
          )}
        </div>
      </div>

      <div className="container-page space-y-8 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, label, value, sub, tone }) => (
            <article key={label} className="card p-5">
              <span className={`inline-flex rounded-lg ${tone} p-2.5 text-white`}><Icon className="h-4 w-4" aria-hidden /></span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-navy-800">{value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-bold">Recent homework</h2>
            {d.homework?.length ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {d.homework.map((h) => (
                  <li key={h._id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-navy-800">{h.title}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{h.subject}</p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-500">
                      {h.dueDate ? `Due ${fmt(h.dueDate)}` : fmt(h.assignedOn)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No homework has been posted recently.</p>
            )}
          </section>

          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Bell className="h-4 w-4 text-brand-600" aria-hidden /> School notices
            </h2>
            {d.notices?.length ? (
              <ul className="mt-4 space-y-3">
                {d.notices.map((n) => (
                  <li key={n.slug}>
                    <Link href={`/notices/${n.slug}`} className="block rounded-lg p-2 -mx-2 transition hover:bg-slate-50">
                      <p className="text-sm font-semibold text-navy-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{fmt(n.publishAt)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No notices right now.</p>
            )}
          </section>
        </div>

        {d.pendingInvoices?.length > 0 && (
          <section className="card p-6">
            <h2 className="font-display text-lg font-bold">Fee invoices</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="pb-2 pr-4">Invoice</th>
                    <th scope="col" className="pb-2 pr-4">Period</th>
                    <th scope="col" className="pb-2 pr-4">Due date</th>
                    <th scope="col" className="pb-2 pr-4 text-right">Amount</th>
                    <th scope="col" className="pb-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {d.pendingInvoices.map((inv) => (
                    <tr key={inv._id}>
                      <td className="py-3 pr-4 font-medium text-navy-800">{inv.invoiceNo}</td>
                      <td className="py-3 pr-4 text-slate-600">{inv.period}</td>
                      <td className="py-3 pr-4 text-slate-600">{fmt(inv.dueDate)}</td>
                      <td className="py-3 pr-4 text-right text-slate-600">{money(inv.totalAmount)}</td>
                      <td className="py-3 text-right font-semibold text-amber-700">{money(inv.totalAmount - inv.amountPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Online payment is being enabled. Until then, fees may be paid at the school office —
              call {SCHOOL.phoneDisplay} for assistance.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
