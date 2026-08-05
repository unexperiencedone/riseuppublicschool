'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, Loader2, KeyRound } from 'lucide-react';
import { readSession, logout } from '@/lib/auth';

/** Minimal chrome for the parent/student portal — no public navbar or footer. */
export default function PortalShell({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = readSession();
    if (!session?.token) { router.replace('/portal/login'); return; }
    setUser(session.user);
    setChecking(false);
  }, [router]);

  const signOut = async () => { await logout(); router.replace('/portal/login'); };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-brand-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <Link href="/portal" className="flex items-center gap-2.5">
            <Image src="/images/brand/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold text-navy-800">Rise UP Public School</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600">Parent &amp; Student Portal</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/portal/change-password" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:flex">
              <KeyRound className="h-4 w-4" aria-hidden /> Password
            </Link>
            <Link href="/" target="_blank" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:flex">
              <ExternalLink className="h-4 w-4" aria-hidden /> Website
            </Link>
            <button type="button" onClick={signOut} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="container-page text-center text-xs text-slate-500">
          Need help? Call the school office on{' '}
          <a href="tel:+919170285353" className="font-semibold text-brand-700 hover:underline">+91 91702 85353</a>
          {user?.name ? ` · Signed in as ${user.name}` : ''}
        </div>
      </footer>
    </div>
  );
}
