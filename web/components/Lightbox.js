'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ photos = [], title = '' }) {
  const [index, setIndex] = useState(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, close, prev, next]);

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.url}>
            <button
              type="button" onClick={() => setIndex(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100"
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              <Image src={p.url} alt={p.alt || `${title} photo ${i + 1}`} fill
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-navy-900/0 transition group-hover:bg-navy-900/20" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${title} — photo viewer`}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/95 p-4">
          <button type="button" onClick={close} aria-label="Close viewer"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button type="button" onClick={prev} aria-label="Previous photo"
                className="absolute left-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={next} aria-label="Next photo"
                className="absolute right-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <figure className="max-h-full w-full max-w-5xl">
            <div className="relative mx-auto aspect-[3/2] w-full">
              <Image src={photos[index].url} alt={photos[index].alt || title} fill sizes="100vw" className="object-contain" priority />
            </div>
            <figcaption className="mt-4 text-center text-sm text-white/70">
              {photos[index].caption || title} · {index + 1} of {photos.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
