import { SITE_URL } from '@/lib/config';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Staff and parent areas hold personal data about children — keep them
        // out of every index. They are behind auth as well; this is belt and braces.
        disallow: ['/admin', '/admin/', '/portal', '/portal/', '/api/', '/admissions/track'],
      },
      // Explicitly welcome the crawlers that matter for a local school.
      { userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'], allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
