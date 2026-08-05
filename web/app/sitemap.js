import { SITE_URL } from '@/lib/config';
import { apiGet } from '@/lib/api';
import { fallbackNotices, fallbackAlbums } from '@/lib/fallback';

export default async function sitemap() {
  const now = new Date();
  const staticRoutes = [
    ['', 1.0, 'weekly'], ['/about', 0.8, 'monthly'], ['/about/principal-message', 0.6, 'yearly'],
    ['/about/founder-message', 0.6, 'yearly'], ['/academics', 0.8, 'monthly'],
    ['/academics/calendar', 0.7, 'monthly'], ['/admissions', 0.95, 'weekly'],
    ['/admissions/fees', 0.7, 'monthly'], ['/admissions/track', 0.4, 'yearly'],
    ['/facilities', 0.7, 'monthly'], ['/faculty', 0.7, 'monthly'], ['/gallery', 0.7, 'weekly'],
    ['/events', 0.6, 'weekly'], ['/notices', 0.8, 'daily'], ['/downloads', 0.6, 'monthly'],
    ['/contact', 0.8, 'monthly'], ['/mandatory-disclosure', 0.6, 'monthly'], ['/privacy-policy', 0.3, 'yearly'],
  ].map(([path, priority, changeFrequency]) => ({
    url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority,
  }));

  const [notices, albums] = await Promise.all([
    apiGet('/notices?limit=100', { fallback: fallbackNotices }),
    apiGet('/gallery?limit=100', { fallback: fallbackAlbums }),
  ]);

  return [
    ...staticRoutes,
    ...(notices || []).map((n) => ({ url: `${SITE_URL}/notices/${n.slug}`, lastModified: new Date(n.publishAt || now), changeFrequency: 'monthly', priority: 0.5 })),
    ...(albums || []).map((a) => ({ url: `${SITE_URL}/gallery/${a.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 })),
  ];
}
