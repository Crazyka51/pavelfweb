export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/services/article-service';

// Base URL for the site
const baseUrl = 'https://fiserpavel.cz';

// Static routes that should be included in sitemap
const staticRoutes = [
  {
    url: '',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
  },
  {
    url: '/privacy-policy',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: '/terms-of-service', 
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: '/data-deletion',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  },
  {
    url: '/aktuality',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
];

function generateSitemapXml(urls: Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}>) {
  const xmlUrls = urls.map(({ url, lastModified, changeFrequency, priority }) => {
    const fullUrl = `${baseUrl}${url}`;
    const isoDate = lastModified.toISOString();
    
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${isoDate}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

export async function GET() {
  try {
    // Start with static routes
    const urls = [...staticRoutes];

    // Add dynamic article routes
    try {
      // Get all published articles (we want them all for sitemap, so use a large limit)
      const { articles } = await getPublishedArticles(1, 1000);
      
      for (const article of articles) {
        urls.push({
          url: `/aktuality/${article.slug}`,
          lastModified: article.updatedAt || article.publishedAt || article.createdAt,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        });
      }
    } catch (error) {
      console.error('Error fetching articles for sitemap:', error);
      // Continue with static routes if article fetch fails
    }

    const sitemapXml = generateSitemapXml(urls);

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap with just static routes as fallback
    const basicSitemapXml = generateSitemapXml(staticRoutes);
    
    return new NextResponse(basicSitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }
}