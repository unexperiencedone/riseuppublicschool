'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowUp } from 'lucide-react';
import { SCHOOL } from '@/lib/config';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
      {showTop && (
        <button
          type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="rounded-full bg-navy-700 p-3 text-white shadow-lg transition hover:bg-navy-800"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <a
        href={`https://wa.me/${SCHOOL.whatsapp}?text=${encodeURIComponent('Hello, I would like information about admission at Rise UP Public School.')}`}
        target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className="rounded-full bg-[#25D366] p-3.5 text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a href={`tel:+91${SCHOOL.phone}`} aria-label="Call the school"
        className="rounded-full bg-brand-600 p-3.5 text-white shadow-lg transition hover:scale-105 sm:hidden">
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
