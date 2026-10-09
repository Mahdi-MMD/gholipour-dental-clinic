import { MetadataRoute } from 'next';
import { ARTICLES_DATA } from '@/data/articlesData';
import { SERVICES_DATA } from '@/data/servicesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

  const articleEntries: MetadataRoute.Sitemap = ARTICLES_DATA.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Only list canonical service URLs in sitemap, strictly excluding non-canonical alias URLs
  const CANONICAL_SERVICE_SLUGS = [
    'implant',
    'veneers',
    'root-canal',
    'restorations',
    'crowns',
    'dentures',
    'surgery',
    'pediatric',
  ];

  const serviceEntries: MetadataRoute.Sitemap = CANONICAL_SERVICE_SLUGS
    .filter((slug) => Boolean(SERVICES_DATA[slug]))
    .map((slug) => ({
      url: `${siteUrl}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

  return [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...serviceEntries,
    ...articleEntries,
  ];
}
