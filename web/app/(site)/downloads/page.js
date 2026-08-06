import { FileText, Download as DownloadIcon } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackDownloads } from '@/lib/fallback';
import { PageHero, SectionHeading, EmptyState } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 600;
export const metadata = buildMetadata({
  title: 'Downloads & Forms',
  description: 'Download the academic calendar, admission forms, syllabus, transport routes and other documents from Rise UP Public School.',
  path: '/downloads',
});

const GROUPS = [
  { key: 'calendar', label: 'Academic Calendar' },
  { key: 'admission', label: 'Admission Forms' },
  { key: 'academics', label: 'Academics' },
  { key: 'syllabus', label: 'Syllabus' },
  { key: 'transport', label: 'Transport' },
  { key: 'forms', label: 'General Forms' },
  { key: 'result', label: 'Results' },
  { key: 'mandatory_disclosure', label: 'Mandatory Disclosure' },
  { key: 'other', label: 'Other Documents' },
];

export default async function DownloadsPage() {
  const files = (await apiGet('/downloads', { fallback: fallbackDownloads, tags: ['downloads'] })) || [];

  return (
    <>
      <PageHero eyebrow="Resources" title="Downloads & Forms"
        subtitle="Documents, calendars and forms — available to download at any time."
        breadcrumb={[{ label: 'Downloads' }]} />

      <section className="section">
        <div className="container-page max-w-4xl">
          {files.length === 0 ? (
            <EmptyState title="No documents uploaded yet" description="Forms and documents published by the school will appear here." />
          ) : (
            <div className="space-y-10">
              {GROUPS.map((g) => {
                const group = files.filter((f) => f.category === g.key);
                if (!group.length) return null;
                return (
                  <section key={g.key}>
                    <SectionHeading align="left" title={g.label} className="!max-w-none" />
                    <ul className="mt-5 space-y-2.5">
                      {group.map((f) => (
                        <li key={f.title}>
                          <a href={f.file?.url} target="_blank" rel="noopener noreferrer" download
                            className="card-hover group flex items-center gap-4 p-4">
                            <span className="shrink-0 rounded-lg bg-brand-50 p-3 text-brand-600" aria-hidden>
                              <FileText className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-navy-800 group-hover:text-brand-700">{f.title}</p>
                              {f.description && <p className="mt-0.5 line-clamp-1 text-sm text-slate-600">{f.description}</p>}
                              <p className="mt-1 text-xs text-slate-400">
                                {(f.file?.mime || '').includes('pdf') ? 'PDF' : 'Document'}
                                {f.file?.sizeKb ? ` · ${f.file.sizeKb} KB` : ''}
                                {f.session ? ` · Session ${f.session}` : ''}
                              </p>
                            </div>
                            <DownloadIcon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
