import { NextResponse } from 'next/server';
import { ARTICLES_DATA } from '@/data/articlesData';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

  const itemsXml = ARTICLES_DATA.map(article => {
    const articleUrl = `${siteUrl}/articles/${article.slug}`;
    const escapedTitle = escapeXml(article.title);
    const escapedSummary = escapeXml(article.summary || '');
    const escapedCategory = escapeXml(article.category || 'دندانپزشکی');
    const escapedAuthor = escapeXml(article.author || 'کلینیک دندانپزشکی قلی‌پور');

    return `    <item>
      <title>${escapedTitle}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${escapedSummary}</description>
      <category>${escapedCategory}</category>
      <author>${escapedAuthor}</author>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>دانشنامه و مقالات کلینیک دندانپزشکی قلی‌پور</title>
    <link>${siteUrl}/articles</link>
    <description>آخرین مقالات علمی و آموزشی دندانپزشکی، مراقبت‌های پس از درمان، ایمپلنت، ارتودنسی و دندانپزشکی کودکان در کلینیک دندانپزشکی قلی‌پور.</description>
    <language>fa</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
