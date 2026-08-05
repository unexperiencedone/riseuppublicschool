import Link from 'next/link';
import Image from 'next/image';
import { Camera, ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui';

export default function GalleryPreview({ albums = [] }) {
  const list = albums.slice(0, 6);
  if (!list.length) return null;

  return (
    <section className="section">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading align="left" eyebrow="Campus Life"
            title="School is more than the syllabus"
            description="Sports Week, the Science Exhibition, the Annual Function, investiture, karate, dance and educational tours — the moments our students remember."
          />
          <Link href="/gallery" className="btn-outline shrink-0">
            <Camera className="h-4 w-4" aria-hidden /> Full Gallery
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => (
            <Link
              key={a.slug} href={`/gallery/${a.slug}`}
              className={`group relative overflow-hidden rounded-xl bg-navy-900 ${i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
            >
              <div className={`relative ${i === 0 ? 'aspect-[16/10] sm:aspect-[4/3]' : 'aspect-[16/11]'}`}>
                <Image
                  src={a.cover?.url || '/images/campus/school-building.jpg'}
                  alt={a.title}
                  fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="chip mb-2 bg-white/15 text-white ring-white/25 backdrop-blur">{a.category}</span>
                <h3 className={`font-display font-bold text-white ${i === 0 ? 'text-xl sm:text-2xl' : 'text-base'}`}>{a.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                  {a.photoCount || a.photos?.length || 0} photos
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
