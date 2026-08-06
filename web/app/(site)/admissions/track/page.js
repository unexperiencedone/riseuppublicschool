import { PageHero } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import TrackForm from '@/components/forms/TrackForm';

export const metadata = buildMetadata({
  title: 'Track Your Admission Application',
  description: 'Check the current status of your admission enquiry or application at Rise UP Public School.',
  path: '/admissions/track',
  noIndex: true,
});

export default function TrackPage() {
  return (
    <>
      <PageHero eyebrow="Admissions" title="Track your application"
        subtitle="Check where your enquiry or application currently stands."
        breadcrumb={[{ label: 'Admissions', href: '/admissions' }, { label: 'Track Application' }]} />
      <section className="section">
        <div className="container-page max-w-2xl"><TrackForm /></div>
      </section>
    </>
  );
}
