import Link from 'next/link';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { fallbackAlbums } from '@/lib/fallback';
import { PageHero, EmptyState } from '@/components/ui';

export const revalidate = 600;
export const metadata = {
  title: 'Photo Gallery',
  description: 'Photographs from Sports Day, the Science Exhibition, the Annual Function, investiture ceremonies and educational tours at Rise UP Public School.',
};

export default async function GalleryPage() {
  const albums = (await apiGet('/gallery?limit=40', { fallback: fallbackAlbums, tags: ['gallery'] })) || [];

  return (
    <>
      <PageHero eyebrow="Campus Life" title="Photo Gallery"
        subtitle="Moments from our classrooms, grounds, stages and tours — the school as our students experience it."
        breadcrumb={[{ label: 'Gallery' }]} />

      <section className="section">
        <div className="container-page">
          {albums.length === 0 ? (
            <EmptyState title="No albums yet" description="Photographs from school events will appear here." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a) => (
                <Link key={a.slug} href={`/gallery/${a.slug}`} className="card-hover group overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Image src={a.cover?.url || '/images/campus/school-building.jpg'} alt={a.title} fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-navy-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      <Camera className="h-3 w-3" aria-hidden /> {a.photoCount ?? a.photos?.length ?? 0}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="chip bg-brand-50 text-brand-700 ring-brand-200">{a.category}</span>
                    <h2 className="mt-2 font-display text-lg font-bold group-hover:text-brand-700">{a.title}</h2>
                    {a.description && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{a.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
