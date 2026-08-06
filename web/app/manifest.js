import { SCHOOL } from '@/lib/config';

export default function manifest() {
  return {
    name: SCHOOL.name,
    short_name: 'Rise UP',
    description: `English medium, CBSE pattern school in Pipargaon, Aurai, Bhadohi. ${SCHOOL.classesOffered}.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B5D34',
    lang: 'en-IN',
    categories: ['education'],
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
