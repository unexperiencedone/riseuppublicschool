import { SITE_URL } from '@/lib/config';
import { apiGet } from '@/lib/api';
import { fallbackNotices, fallbackAlbums } from '@/lib/fallback';

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    ['', 1.0, 'weekly'],
    ['/admissions', 0.95, 'weekly'],
    ['/about', 0.8, 'monthly'],
    ['/academics', 0.8, 'monthly'],
    ['/notices', 0.8, 'daily'],
    ['/contact', 0.8, 'monthly'],
    ['/academics/calendar', 0.7, 'monthly'],
    ['/admissions/fees', 0.7, 'monthly'],
    ['/facilities', 0.7, 'monthly'],
    ['/faculty', 0.7, 'monthly'],
    ['/gallery', 0.7, 'weekly'],
    ['/about/principal-message', 0.6, 'yearly'],
    ['/about/founder-message', 0.6, 'yearly'],
    ['/events', 0.6, 'weekly'],
    ['/downloads', 0.6, 'monthly'],
    ['/mandatory-disclosure', 0.6, 'monthly'],
    ['/admissions/track', 0.4, 'yearly'],
    ['/privacy-policy', 0.3, 'yearly'],
  ].map(([path, priority, changeFrequency]) => ({
    url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority,
  }));

  const [notices, albums] = await Promise.all([
    apiGet('/notices?limit=100', { fallback: fallbackNotices }),
    apiGet('/gallery?limit=100', { fallback: fallbackAlbums }),
  ]);

  const noticeRoutes = (notices || []).map((n) => ({
    url: `${SITE_URL}/notices/${n.slug}`,
    lastModified: new Date(n.updatedAt || n.publishAt || now),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const albumRoutes = (albums || []).map((a) => ({
    url: `${SITE_URL}/gallery/${a.slug}`,
    lastModified: new Date(a.updatedAt || now),
    changeFrequency: 'monthly',
    priority: 0.5,
    // Google Images uses these to index the school's photographs.
    images: a.cover?.url
      ? [a.cover.url.startsWith('http') ? a.cover.url : `${SITE_URL}${a.cover.url}`]
      : [],
  }));

  return [...staticRoutes, ...noticeRoutes, ...albumRoutes];
}
