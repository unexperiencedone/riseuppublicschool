import Link from 'next/link';
import { Megaphone } from 'lucide-react';

export default function AnnouncementBar({ notices = [] }) {
  if (!notices.length) return null;
  const items = [...notices, ...notices];   // duplicated for a seamless marquee loop

  return (
    <div className="border-b border-slate-200 bg-gold-50">
      <div className="container-page flex items-center gap-4 py-2.5">
        <span className="flex shrink-0 items-center gap-2 rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          <Megaphone className="h-3.5 w-3.5" aria-hidden /> Latest
        </span>
        <div className="group relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
            {items.map((n, i) => (
              <Link key={`${n.slug}-${i}`} href={`/notices/${n.slug}`}
                className="whitespace-nowrap text-sm text-navy-800 hover:text-brand-700 hover:underline">
                • {n.title}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/notices" className="hidden shrink-0 text-xs font-semibold text-brand-700 hover:underline sm:block">
          View all →
        </Link>
      </div>
    </div>
  );
}
