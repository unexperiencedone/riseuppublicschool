import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackAlbums } from '@/lib/fallback';
import { PageHero } from '@/components/ui';
import { buildMetadata, JsonLd, breadcrumbSchema } from '@/lib/seo';
import Lightbox from '@/components/Lightbox';

export const revalidate = 600;

export async function generateStaticParams() {
  return fallbackAlbums.map((a) => ({ slug: a.slug }));
}

async function getAlbum(slug) {
  const fallback = fallbackAlbums.find((a) => a.slug === slug) || null;
  return apiGet(`/gallery/${slug}`, { fallback, tags: ['gallery'] });
}

export async function generateMetadata({ params }) {
  const album = await getAlbum(params.slug);
  if (!album) return { title: 'Album not found' };
  return buildMetadata({
    title: album.title,
    description: album.description || `Photographs from ${album.title} at Rise UP Public School.`,
    path: `/gallery/${params.slug}`,
    image: album.cover?.url,
  });
}

export default async function AlbumPage({ params }) {
  const album = await getAlbum(params.slug);
  if (!album) notFound();

  const photos = (album.photos || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Gallery', path: '/gallery' },
        { name: album.title, path: `/gallery/${params.slug}` },
      ])} />

      <PageHero eyebrow={album.category} title={album.title} subtitle={album.description}
        image={album.cover?.url || '/images/campus/school-building.jpg'}
        breadcrumb={[{ label: 'Gallery', href: '/gallery' }, { label: album.title }]} />

      <section className="section">
        <div className="container-page">
          <p className="mb-6 text-sm text-slate-500">{photos.length} photograph{photos.length === 1 ? '' : 's'} — click any image to view it full size.</p>
          <Lightbox photos={photos} title={album.title} />
          <Link href="/gallery" className="btn-ghost mt-10">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all albums
          </Link>
        </div>
      </section>
    </>
  );
}
