import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Paperclip, Download } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackNotices } from '@/lib/fallback';
import { CATEGORY_STYLES } from '@/lib/calendar';
import { PageHero, Prose, CtaBanner } from '@/components/ui';
import { buildMetadata, JsonLd, articleSchema, breadcrumbSchema } from '@/lib/seo';

export const revalidate = 120;

export async function generateStaticParams() {
  return fallbackNotices.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const notice = await getNotice(params.slug);
  if (!notice) return { title: 'Notice not found' };
  return buildMetadata({
    title: notice.title,
    description: notice.excerpt || String(notice.body).replace(/\s+/g, ' ').slice(0, 155),
    path: `/notices/${params.slug}`,
    type: 'article',
    publishedTime: notice.publishAt,
  });
}

async function getNotice(slug) {
  const fallback = fallbackNotices.find((n) => n.slug === slug) || null;
  return apiGet(`/notices/${slug}`, { fallback, tags: ['notices'] });
}

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

export default async function NoticePage({ params }) {
  const notice = await getNotice(params.slug);
  if (!notice) notFound();

  const style = CATEGORY_STYLES[notice.category] || { chip: 'bg-slate-100 text-slate-700 ring-slate-200' };

  return (
    <>
      <JsonLd data={articleSchema({
        title: notice.title,
        description: notice.excerpt || '',
        path: `/notices/${params.slug}`,
        published: notice.publishAt,
        modified: notice.updatedAt,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Notices', path: '/notices' },
        { name: notice.title, path: `/notices/${params.slug}` },
      ])} />

      <PageHero eyebrow={notice.category} title={notice.title}
        breadcrumb={[{ label: 'Notices', href: '/notices' }, { label: 'Notice' }]} />

      <article className="section">
        <div className="container-page max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-5">
            <span className={`chip ${style.chip}`}>{notice.category}</span>
            <time className="text-sm text-slate-500" dateTime={notice.publishAt}>Published {fmt(notice.publishAt)}</time>
            {notice.audience?.length > 0 && (
              <span className="text-sm text-slate-500">· For: {notice.audience.join(', ')}</span>
            )}
          </div>

          <Prose text={notice.body} className="mt-8 text-base" />

          {notice.attachments?.length > 0 && (
            <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold">
                <Paperclip className="h-4 w-4 text-brand-600" aria-hidden /> Attachments
              </h2>
              <ul className="mt-4 space-y-2">
                {notice.attachments.map((a) => (
                  <li key={a.url}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" download
                      className="flex items-center justify-between gap-4 rounded-lg bg-white px-4 py-3 text-sm transition hover:bg-brand-50">
                      <span className="truncate font-medium text-navy-800">{a.name || 'Attachment'}</span>
                      <Download className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link href="/notices" className="btn-ghost mt-10">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all notices
          </Link>
        </div>
      </article>

      <CtaBanner />
    </>
  );
}
