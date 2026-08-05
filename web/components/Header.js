'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, ChevronDown, LogIn, MapPin } from 'lucide-react';
import { SCHOOL, NAV } from '@/lib/config';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setOpenGroup(null); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-navy-700 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <a href={`tel:+91${SCHOOL.phone}`} className="flex items-center gap-1.5 hover:text-gold-400 transition">
              <Phone className="h-3.5 w-3.5" aria-hidden /> {SCHOOL.phoneDisplay}
            </a>
            <a href={`mailto:${SCHOOL.email}`} className="flex items-center gap-1.5 hover:text-gold-400 transition">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {SCHOOL.email}
            </a>
            <span className="flex items-center gap-1.5 text-white/70">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {SCHOOL.address.line1}, Bhadohi
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/mandatory-disclosure" className="hover:text-gold-400 transition">Mandatory Disclosure</Link>
            <Link href="/downloads" className="hover:text-gold-400 transition">Downloads</Link>
            <Link href="/portal/login" className="flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 font-semibold hover:bg-white/20 transition">
              <LogIn className="h-3.5 w-3.5" aria-hidden /> Parent Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className={`border-b bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'}`}>
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${SCHOOL.name} home`}>
            <Image src="/images/brand/logo.png" alt="" width={52} height={52} priority className="h-11 w-11 object-contain sm:h-[52px] sm:w-[52px]" />
            <span className="leading-tight">
              <span className="block font-display text-[17px] font-bold text-navy-800 sm:text-xl">{SCHOOL.name}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600 sm:text-[11px]">{SCHOOL.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
            {NAV.map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[14px] font-semibold transition ${
                    isActive(item.href) ? 'text-brand-700' : 'text-navy-800 hover:text-brand-700'}`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden />}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-0 top-full w-64 translate-y-1 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lift transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/admissions#enquiry" className="btn-primary hidden sm:inline-flex">Apply Now</Link>
            <button
              type="button" onClick={() => setOpen((v) => !v)}
              className="rounded-lg p-2 text-navy-800 hover:bg-slate-100 xl:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-white xl:hidden">
          <nav className="container-page py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <div key={item.label} className="border-b border-slate-100">
                <div className="flex items-center">
                  <Link href={item.href} className="flex-1 py-3.5 font-semibold text-navy-800">{item.label}</Link>
                  {item.children && (
                    <button
                      type="button" aria-label={`Toggle ${item.label} submenu`}
                      onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                      className="p-3 text-slate-500"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {item.children && openGroup === item.label && (
                  <div className="pb-3 pl-4">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="block py-2 text-sm text-slate-600">{c.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6 grid gap-3">
              <Link href="/admissions#enquiry" className="btn-primary w-full">Apply Now</Link>
              <Link href="/portal/login" className="btn-outline w-full">Parent Portal Login</Link>
              <a href={`tel:+91${SCHOOL.phone}`} className="btn-ghost w-full">
                <Phone className="h-4 w-4" /> {SCHOOL.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
