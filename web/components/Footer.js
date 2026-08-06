import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { SCHOOL, NAV, QUICK_LINKS } from '@/lib/config';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy-800 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Identity */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <Image src="/images/brand/logo.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" />
            <div>
              <p className="font-display text-lg font-bold text-white">{SCHOOL.name}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">{SCHOOL.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            Run by the {SCHOOL.trust}. Established in {SCHOOL.established}, offering {SCHOOL.classesOffered} in
            {' '}{SCHOOL.address.district}, Uttar Pradesh.
          </p>
          {/* Only renders links that actually exist — an icon pointing at "#"
              looks broken and hurts trust more than having no icon at all. */}
          {(() => {
            const links = [
              { Icon: Facebook, label: 'Facebook', href: SCHOOL.social.facebook },
              { Icon: Instagram, label: 'Instagram', href: SCHOOL.social.instagram },
              { Icon: Youtube, label: 'YouTube', href: SCHOOL.social.youtube },
            ].filter((l) => l.href);
            if (!links.length) return null;
            return (
              <div className="mt-5 flex gap-2">
                {links.map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="rounded-lg bg-white/10 p-2.5 text-white transition hover:bg-gold-500 hover:text-navy-800">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Explore */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Explore</h3>
          <ul className="space-y-2.5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="transition hover:text-gold-400">{n.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Information</h3>
          <ul className="space-y-2.5 text-sm">
            {QUICK_LINKS.map((n) => (
              <li key={n.href}><Link href={n.href} className="transition hover:text-gold-400">{n.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Reach Us</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <span>{SCHOOL.address.line1}<br />{SCHOOL.address.district}<br />{SCHOOL.address.state} – {SCHOOL.address.pincode}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <a href={`tel:+91${SCHOOL.phone}`} className="hover:text-gold-400">{SCHOOL.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <a href={`mailto:${SCHOOL.email}`} className="break-all hover:text-gold-400">{SCHOOL.email}</a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden />
              <span>{SCHOOL.officeHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© {year} {SCHOOL.name}. All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-gold-400">Privacy Policy</Link>
            <Link href="/mandatory-disclosure" className="hover:text-gold-400">Mandatory Disclosure</Link>
            <Link href="/contact" className="hover:text-gold-400">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
