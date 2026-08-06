import Link from 'next/link';
import { FileText, Paperclip } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackNotices } from '@/lib/fallback';
import { CATEGORY_STYLES } from '@/lib/calendar';
import { PageHero, EmptyState } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 120;
export const metadata = buildMetadata({
  title: 'Notices & Circulars',
  description: 'Latest notices, circulars and announcements from Rise UP Public School, Pipargaon Aurai Bhadohi.',
  path: '/notices',
});

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

export default async function NoticesPage() {
  const notices = (await apiGet('/notices?limit=50', { fallback: fallbackNotices, tags: ['notices'] })) || [];
  const pinned = notices.filter((n) => n.pinned);
  const rest = notices.filter((n) => !n.pinned);

  const Card = ({ n }) => {
    const style = CATEGORY_STYLES[n.category] || { chip: 'bg-slate-100 text-slate-700 ring-slate-200' };
    return (
      <li>
        <Link href={`/notices/${n.slug}`} className="card-hover group flex gap-4 p-5">
          <span className="mt-0.5 hidden shrink-0 rounded-lg bg-brand-50 p-3 text-brand-600 sm:block" aria-hidden>
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${style.chip}`}>{n.category}</span>
              {n.pinned && <span className="chip bg-gold-50 text-gold-700 ring-gold-200">Pinned</span>}
              <time className="text-xs text-slate-400" dateTime={n.publishAt}>{fmt(n.publishAt)}</time>
              {n.attachments?.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Paperclip className="h-3 w-3" aria-hidden /> {n.attachments.length}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-lg font-bold leading-snug text-navy-800 group-hover:text-brand-700">{n.title}</h2>
            {n.excerpt && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{n.excerpt}</p>}
            <p className="mt-3 text-sm font-semibold text-brand-700">Read the full notice →</p>
          </div>
        </Link>
      </li>
    );
  };

  return (
    <>
      <PageHero eyebrow="Announcements" title="Notices & Circulars"
        subtitle="Everything the school communicates to parents and students, published here as well as on the school notice board."
        breadcrumb={[{ label: 'Notices' }]} />

      <section className="section">
        <div className="container-page max-w-4xl">
          {notices.length === 0 ? (
            <EmptyState title="No notices yet" description="When the school publishes a notice or circular, it will appear here." />
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Pinned</h2>
                  <ul className="space-y-3">{pinned.map((n) => <Card key={n.slug} n={n} />)}</ul>
                </>
              )}
              {rest.length > 0 && (
                <>
                  <h2 className={`mb-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 ${pinned.length ? 'mt-10' : ''}`}>All notices</h2>
                  <ul className="space-y-3">{rest.map((n) => <Card key={n.slug} n={n} />)}</ul>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
