import { apiGet } from '@/lib/api';
import { fallbackNotices, fallbackAlbums } from '@/lib/fallback';
import Hero from '@/components/home/Hero';
import AnnouncementBar from '@/components/home/AnnouncementBar';
import StatsBand from '@/components/home/StatsBand';
import Highlights from '@/components/home/Highlights';
import Stages from '@/components/home/Stages';
import LeadershipStrip from '@/components/home/LeadershipStrip';
import NoticesEvents from '@/components/home/NoticesEvents';
import GalleryPreview from '@/components/home/GalleryPreview';
import AdmissionSteps from '@/components/home/AdmissionSteps';
import { CtaBanner } from '@/components/ui';
import { buildMetadata } from '@/lib/seo';
import { SCHOOL } from '@/lib/config';

export const revalidate = 300;

export const metadata = buildMetadata({
  description: `${SCHOOL.name}, Pipargaon (Aurai), Sant Ravidas Nagar Bhadohi — English medium, CBSE pattern school for ${SCHOOL.classesOffered}. Admissions open for session ${SCHOOL.session}. Call ${SCHOOL.phoneDisplay}.`,
  path: '/',
});

export default async function HomePage() {
  const [notices, albums, events] = await Promise.all([
    apiGet('/notices?limit=6', { fallback: fallbackNotices, tags: ['notices'] }),
    apiGet('/gallery?limit=6', { fallback: fallbackAlbums, tags: ['gallery'] }),
    apiGet('/events/upcoming?limit=6', { fallback: [], tags: ['events'] }),
  ]);

  return (
    <>
      <AnnouncementBar notices={notices} />
      <Hero />
      <StatsBand />
      <Highlights />
      <Stages />
      <NoticesEvents notices={notices} events={events} />
      <GalleryPreview albums={albums} />
      <LeadershipStrip />
      <AdmissionSteps />
      <CtaBanner />
    </>
  );
}
