'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Inbox, MessageSquare, CalendarCheck, Megaphone, Images, CalendarDays,
  GraduationCap, ClipboardList, BookOpen, IndianRupee, Users, FileDown, FileText, Settings,
  Menu, X, LogOut, ExternalLink, Loader2, Lock,
} from 'lucide-react';
import { ADMIN_NAV, ROLE_LABEL } from '@/lib/adminNav';
import { readSession, logout, authedFetch } from '@/lib/auth';

const ICONS = {
  LayoutDashboard, Inbox, MessageSquare, CalendarCheck, Megaphone, Images, CalendarDays,
  GraduationCap, ClipboardList, BookOpen, IndianRupee, Users, FileDown, FileText, Settings,
};

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const session = readSession();
    if (!session?.token) { router.replace('/admin/login'); return; }
    setUser(session.user);
    setChecking(false);

    // Badge counts come from the dashboard endpoint we already call anyway.
    authedFetch('/admin/dashboard')
      .then((json) => setCounts(json.data?.counters || {}))
      .catch(() => {});
  }, [router]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const signOut = async () => { await logout(); router.replace('/admin/login'); };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" />
      </div>
    );
  }

  const canSee = (item) => !item.roles || item.roles.includes(user?.role);
  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const Nav = () => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Admin sections">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter(canSee);
        if (!items.length) return null;
        return (
          <div key={group.section}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon] || FileText;
                const badge = item.badge ? counts[item.badge] : 0;
                const active = isActive(item.href);

                if (item.disabled) {
                  return (
                    <li key={item.label}>
                      <span
                        title="Screen not built yet — the API endpoint exists"
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="flex-1 truncate">{item.label}</span>
                        <Lock className="h-3 w-3 shrink-0" aria-hidden />
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-navy-800'}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge > 0 && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          active ? 'bg-white/25 text-white' : 'bg-red-100 text-red-700'}`}>
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-4">
          <Image src="/images/brand/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-navy-800">Rise UP Public School</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Admin Panel</p>
          </div>
        </div>
        <Nav />
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-semibold text-navy-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{ROLE_LABEL[user?.role] || user?.role}</p>
          </div>
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            <ExternalLink className="h-4 w-4" aria-hidden /> View website
          </Link>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <span className="font-display text-sm font-bold text-navy-800">Admin Panel</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="rounded p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <Nav />
            <div className="border-t border-slate-200 p-3">
              <p className="px-3 pb-2 text-sm font-semibold text-navy-800">{user?.name}</p>
              <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <Image src="/images/brand/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="font-display text-sm font-bold text-navy-800">Admin Panel</span>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
