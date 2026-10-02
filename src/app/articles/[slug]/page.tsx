import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ARTICLES_DATA } from '@/data/articlesData';
import ArticleClientWrapper, {
  ArticleBookingButton,
  ArticleFaqAccordion,
} from './ArticleClientWrapper';

interface ArticleDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticleDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'مقاله مورد نظر یافت نشد | کلینیک دندانپزشکی شهید قلی‌پور',
    };
  }

  const pageUrl = `/articles/${article.slug}`;
  const ogImages = article.image
    ? [
        {
          url: article.image.startsWith('http')
            ? article.image
            : `https://gholipourdental.com${article.image}`,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ]
    : undefined;

  return {
    title: `${article.title} | کلینیک دندانپزشکی شهید قلی‌پور`,
    description: article.summary,
    keywords: article.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: pageUrl,
      type: 'article',
      locale: 'fa_IR',
      siteName: 'کلینیک دندانپزشکی شهید قلی‌پور',
      authors: [article.author || 'دکتر مهدی محمدنژاد'],
      tags: article.keywords,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.image ? [article.image] : undefined,
    },
  };
}

// Helper to render inline markdown (bold text **text** and links [label](url))
function renderInlineFormatting(inlineText: string): React.ReactNode {
  if (!inlineText) return null;

  // Process markdown links [label](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const segments: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(inlineText)) !== null) {
    if (match.index > lastIdx) {
      const boldNodes = parseBold(inlineText.slice(lastIdx, match.index));
      segments.push(...boldNodes);
    }
    const [_, linkText, url] = match;
    segments.push(
      <Link
        key={`link-${match.index}`}
        href={url}
        style={{
          color: 'var(--color-primary)',
          fontWeight: 700,
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        }}
      >
        {linkText}
      </Link>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < inlineText.length) {
    const boldNodes = parseBold(inlineText.slice(lastIdx));
    segments.push(...boldNodes);
  }

  return segments;
}

// Sub-helper to parse **bold** into <strong> tags
function parseBold(text: string): React.ReactNode[] {
  if (!text) return [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  if (!boldRegex.test(text)) {
    return [text];
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  boldRegex.lastIndex = 0;

  while ((m = boldRegex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    parts.push(
      <strong key={`bold-${m.index}`} style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
        {m[1]}
      </strong>
    );
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// Structured block parser for section body: handles paragraphs, lists (ordered/unordered), and headings
function renderFormattedBody(text: string) {
  if (!text) return null;

  // Split by double line breaks into distinct block elements
  const rawBlocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'justify' }}>
      {rawBlocks.map((block, blockIdx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        // Check if block is a sub-heading (### Heading)
        if (block.startsWith('###')) {
          const headingText = block.replace(/^###\s*/, '');
          return (
            <h3
              key={`h3-${blockIdx}`}
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--color-primary-dark)',
                margin: '8px 0 2px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                }}
              />
              <span>{headingText}</span>
            </h3>
          );
        }

        // Check if all lines are numbered list items (e.g. "۱. ...", "1. ...")
        const isOrderedList = lines.every((line) => /^[0-9۰-۹]+[\.\-]\s+/.test(line));
        if (isOrderedList && lines.length > 0) {
          return (
            <ol
              key={`ol-${blockIdx}`}
              style={{
                margin: '4px 0',
                paddingRight: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                listStyleType: 'decimal',
              }}
            >
              {lines.map((line, lineIdx) => {
                const itemContent = line.replace(/^[0-9۰-۹]+[\.\-]\s+/, '');
                return (
                  <li key={`oli-${lineIdx}`} style={{ lineHeight: 1.9, color: 'var(--color-text-body)' }}>
                    {renderInlineFormatting(itemContent)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Check if all lines are bullet list items (e.g. "- ...", "* ...")
        const isBulletList = lines.every((line) => /^[\-\*•]\s+/.test(line));
        if (isBulletList && lines.length > 0) {
          return (
            <ul
              key={`ul-${blockIdx}`}
              style={{
                margin: '4px 0',
                paddingRight: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                listStyleType: 'disc',
              }}
            >
              {lines.map((line, lineIdx) => {
                const itemContent = line.replace(/^[\-\*•]\s+/, '');
                return (
                  <li key={`uli-${lineIdx}`} style={{ lineHeight: 1.9, color: 'var(--color-text-body)' }}>
                    {renderInlineFormatting(itemContent)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Mixed block: has lines starting with bullet/number or plain paragraph
        if (lines.length > 1 && lines.some((l) => /^([0-9۰-۹]+[\.\-]|[\-\*•])\s+/.test(l))) {
          return (
            <div key={`mixed-${blockIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((line, lineIdx) => {
                if (/^[0-9۰-۹]+[\.\-]\s+/.test(line)) {
                  return (
                    <div key={`mline-${lineIdx}`} style={{ paddingRight: '12px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                        {line.match(/^[0-9۰-۹]+[\.\-]/)?.[0]}
                      </span>
                      <span style={{ lineHeight: 1.9 }}>
                        {renderInlineFormatting(line.replace(/^[0-9۰-۹]+[\.\-]\s+/, ''))}
                      </span>
                    </div>
                  );
                }
                if (/^[\-\*•]\s+/.test(line)) {
                  return (
                    <div key={`mline-${lineIdx}`} style={{ paddingRight: '12px', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                      <span style={{ color: 'var(--color-primary)', fontSize: '14px' }}>•</span>
                      <span style={{ lineHeight: 1.9 }}>
                        {renderInlineFormatting(line.replace(/^[\-\*•]\s+/, ''))}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={`mline-${lineIdx}`} style={{ margin: 0, lineHeight: 2.1 }}>
                    {renderInlineFormatting(line)}
                  </p>
                );
              })}
            </div>
          );
        }

        // Regular paragraph block
        return (
          <p key={`p-${blockIdx}`} style={{ margin: 0, lineHeight: 2.1 }}>
            {renderInlineFormatting(block)}
          </p>
        );
      })}
    </div>
  );
}

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  // Related articles based on shared category or keywords
  const relatedArticles = ARTICLES_DATA.filter(
    (a) =>
      a.id !== article.id &&
      (a.category === article.category ||
        a.keywords.some((k) => article.keywords.includes(k)))
  ).slice(0, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: article.title,
    description: article.summary,
    url: `https://gholipourdental.com/articles/${article.slug}`,
    inLanguage: 'fa-IR',
    ...(article.image
      ? {
          image: {
            '@type': 'ImageObject',
            url: article.image.startsWith('http')
              ? article.image
              : `https://gholipourdental.com${article.image}`,
          },
        }
      : {}),
    author: {
      '@type': 'Person',
      name: article.author || 'دکتر مهدی محمدنژاد',
      jobTitle: 'دکترای حرفه‌ای دندان‌پزشکی',
      identifier: '229353',
      worksFor: {
        '@type': 'DentalClinic',
        name: 'کلینیک دندانپزشکی شهید قلی‌پور',
      },
    },
    reviewedBy: {
      '@type': 'Person',
      name: 'دکتر مهدی محمدنژاد',
      jobTitle: 'دکترای حرفه‌ای دندان‌پزشکی',
      identifier: '229353',
    },
    publisher: {
      '@type': 'DentalClinic',
      name: 'کلینیک دندانپزشکی شهید قلی‌پور',
      url: 'https://gholipourdental.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gholipourdental.com/assets/logo.webp',
      },
    },
    ...(article.citations && article.citations.length > 0
      ? {
          citation: article.citations.map((c) => ({
            '@type': 'CreativeWork',
            name: c.title,
            publisher: c.source,
            ...(c.url ? { url: c.url } : {}),
          })),
        }
      : {}),
    ...(article.sections && article.sections.some((s) => s.doctorComment)
      ? {
          hasPart: article.sections
            .filter((s) => s.doctorComment)
            .map((s) => ({
              '@type': 'Comment',
              name: `یادداشت بالینی: ${s.title}`,
              text: s.doctorComment,
              author: {
                '@type': 'Person',
                name: 'دکتر مهدی محمدنژاد',
                identifier: '229353',
              },
            })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'صفحه اصلی',
        item: 'https://gholipourdental.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'مقالات دندانپزشکی',
        item: 'https://gholipourdental.com/articles',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `https://gholipourdental.com/articles/${article.slug}`,
      },
    ],
  };

  const faqSchema =
    article.faqs && article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <ArticleClientWrapper>
      {/* Structured Data Scripts (JSON-LD) for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main
        style={{
          minHeight: '80vh',
          backgroundColor: '#ffffff',
          paddingBottom: '70px',
        }}
      >
        {/* Banner & Breadcrumb Section */}
        <header
          style={{
            backgroundColor: '#f8fdff',
            borderBottom: '1px solid #d8eef5',
            padding: '48px 0 32px',
          }}
        >
          <div
            className="container"
            style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px' }}
          >
            {/* Visual Breadcrumb Navigation */}
            <nav
              aria-label="مسیر راهنما"
              style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}
            >
              <Link
                href="/"
                style={{
                  color: '#4e707e',
                  textDecoration: 'none',
                }}
              >
                صفحه اصلی
              </Link>
              <span>/</span>
              <Link
                href="/articles"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>مقالات</span>
              </Link>
              <span>/</span>
              <span style={{ color: '#859ba4' }}>{article.category}</span>
            </nav>

            <span
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-sky-tint)',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 700,
                padding: '4px 14px',
                borderRadius: '20px',
                marginBottom: '16px',
              }}
            >
              {article.category}
            </span>

            <h1
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--color-primary-dark)',
                lineHeight: 1.4,
                marginBottom: '16px',
              }}
            >
              {article.title}
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>
                <i
                  className="fa-regular fa-clock"
                  style={{ marginLeft: '6px' }}
                ></i>
                زمان مطالعه: {article.readTime}
              </span>
              <span>
                <i
                  className="fa-regular fa-calendar"
                  style={{ marginLeft: '6px' }}
                ></i>
                {article.date}
              </span>
              <span>
                <i
                  className="fa-solid fa-user-doctor"
                  style={{ marginLeft: '6px', color: 'var(--color-primary)' }}
                ></i>
                نویسنده و بازبین علمی: {article.author}
              </span>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <section style={{ padding: '40px 0' }}>
          <div
            className="container"
            style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px' }}
          >
            {/* Featured Article Image (Modern Editorial Hero with 16:9 Aspect Ratio) */}
            {article.image && (
              <figure
                style={{
                  margin: '0 0 36px 0',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px rgba(28, 67, 79, 0.09)',
                  border: '1px solid #d8eef5',
                  backgroundColor: '#f6fbfd',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16 / 9',
                    maxHeight: '440px',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    fill
                    priority
                    sizes="(max-width: 850px) 100vw, 850px"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
                {article.imageCaption && (
                  <figcaption
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                      backgroundColor: '#f8fdff',
                      borderTop: '1px solid #eef6f9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <i
                      className="fa-solid fa-camera"
                      style={{ color: 'var(--color-primary)', fontSize: '12px' }}
                    ></i>
                    <span>{article.imageCaption}</span>
                  </figcaption>
                )}
              </figure>
            )}

            {/* TL;DR / Quick Expert Summary Box (Fast Scanning & Featured Snippet) */}
            {article.tldr && (
              <div
                style={{
                  backgroundColor: '#eef8ff',
                  border: '1.5px solid #bce1f5',
                  borderRight: '5px solid var(--color-primary)',
                  borderRadius: '14px',
                  padding: '18px 22px',
                  marginBottom: '22px',
                  boxShadow: '0 2px 10px rgba(45, 106, 122, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 800,
                    fontSize: '15px',
                  }}
                >
                  <i className="fa-solid fa-bolt" style={{ color: '#0284c7' }}></i>
                  <span>خلاصه سریع و نکات کلیدی (TL;DR)</span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--color-text-body)',
                    fontWeight: 600,
                    textAlign: 'justify',
                  }}
                >
                  {article.tldr}
                </p>
              </div>
            )}

            {/* Quick Table of Contents / Outline */}
            {article.sections && article.sections.length > 0 && (
              <nav
                aria-label="فهرست عناوین مقاله"
                style={{
                  backgroundColor: '#fbfcfd',
                  border: '1px solid #e2edf1',
                  borderRadius: '14px',
                  padding: '18px 24px',
                  marginBottom: '36px',
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-list-ul"></i>
                  <span>فهرست بخش‌های این مقاله:</span>
                </div>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {article.sections.map((sec, i) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        style={{
                          color: '#2a6478',
                          fontSize: '14px',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        <span style={{ color: '#0284c7', fontSize: '12px' }}>
                          {i + 1}.
                        </span>
                        <span>{sec.title}</span>
                      </a>
                    </li>
                  ))}
                  {article.faqs && article.faqs.length > 0 && (
                    <li>
                      <a
                        href="#frequently-asked-questions"
                        style={{
                          color: '#2a6478',
                          fontSize: '14px',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ color: '#0284c7', fontSize: '12px' }}>
                          {article.sections.length + 1}.
                        </span>
                        <span>پرسش‌های متداول بیماران</span>
                      </a>
                    </li>
                  )}
                </ul>
              </nav>
            )}

            {/* Structured Sections with deep-link anchors */}
            <article
              style={{
                fontSize: '16px',
                lineHeight: 2.1,
                color: 'var(--color-text-body)',
              }}
            >
              {article.sections && article.sections.length > 0
                ? article.sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      style={{
                        marginBottom: '32px',
                        scrollMarginTop: '100px',
                      }}
                    >
                      <h2
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: 'var(--color-primary-dark)',
                          marginBottom: '12px',
                          paddingBottom: '8px',
                          borderBottom: '1px dashed #d8eef5',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <i
                          className="fa-solid fa-circle-check"
                          style={{
                            color: 'var(--color-primary)',
                            fontSize: '16px',
                          }}
                        ></i>
                        <span>{section.title}</span>
                      </h2>
                      <div style={{ margin: 0, textAlign: 'justify' }}>
                        {renderFormattedBody(section.body)}
                      </div>

                      {/* Inline Physician Annotation / Chairside Commentary */}
                      {section.doctorComment && (
                        <aside
                          aria-label={`یادداشت بالینی دکتر مهدی محمدنژاد برای ${section.title}`}
                          style={{
                            marginTop: '16px',
                            backgroundColor: '#f6fbfd',
                            borderRight: '4px solid #0284c7',
                            borderTop: '1px solid #e1eff5',
                            borderBottom: '1px solid #e1eff5',
                            borderLeft: '1px solid #e1eff5',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              marginBottom: '8px',
                            }}
                          >
                            <div
                              style={{
                                position: 'relative',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0,
                                border: '1.5px solid #0284c7',
                              }}
                            >
                              <Image
                                src="/assets/doctor-portrait.webp"
                                alt="دکتر مهدی محمدنژاد"
                                fill
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '13.5px',
                                  fontWeight: 800,
                                  color: 'var(--color-primary-dark)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <span>نکته بالینی دکتر مهدی محمدنژاد</span>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    padding: '1px 7px',
                                    borderRadius: '10px',
                                  }}
                                >
                                  تجربه مطب
                                </span>
                              </div>
                            </div>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '14px',
                              lineHeight: 1.85,
                              color: '#335362',
                              fontWeight: 500,
                              textAlign: 'justify',
                            }}
                          >
                            {renderFormattedBody(section.doctorComment)}
                          </p>
                        </aside>
                      )}
                    </section>
                  ))
                : article.content.map((paragraph, index) => (
                    <p
                      key={index}
                      style={{ marginBottom: '22px', textAlign: 'justify' }}
                    >
                      {renderFormattedBody(paragraph)}
                    </p>
                  ))}
            </article>

            {/* FAQ Accordion Section */}
            {article.faqs && article.faqs.length > 0 && (
              <ArticleFaqAccordion faqs={article.faqs} />
            )}

            {/* Author E-E-A-T Bio Box */}
            <aside
              aria-label="اطلاعات نویسنده و بازبین علمی"
              style={{
                marginTop: '44px',
                padding: '24px',
                backgroundColor: '#fbfdfe',
                border: '1.5px solid #dbeef3',
                borderRadius: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2.5px solid var(--color-primary)',
                  boxShadow: '0 4px 14px rgba(28, 67, 79, 0.1)',
                }}
              >
                <Image
                  src="/assets/doctor-portrait.webp"
                  alt="دکتر مهدی محمدنژاد"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: 'var(--color-primary-dark)',
                    }}
                  >
                    نویسنده و بازبین علمی: دکتر مهدی محمدنژاد
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-sky-tint)',
                      color: 'var(--color-primary)',
                      padding: '2px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    تایید شده پزشکی
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    margin: '0 0 6px 0',
                    lineHeight: 1.6,
                  }}
                >
                  دکترای حرفه‌ای دندان‌پزشکی کلینیک تخصصی دندانپزشکی شهید قلی‌پور | <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>کد نظام پزشکی: ۲۲۹۳۵۳</span>
                </p>
                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#4e707e',
                    margin: 0,
                    lineHeight: 1.8,
                    textAlign: 'justify',
                  }}
                >
                  این مقاله بر اساس آخرین شواهد و ژورنال‌های معتبر بین‌المللی دندانپزشکی نگارش یافته و با هدف ارتقای آگاهی بیماران، توسط دکتر مهدی محمدنژاد (کد نظام پزشکی ۲۲۹۳۵۳) بازبینی علمی و تایید شده است.
                </p>
              </div>
            </aside>

            {/* Scientific Sources & DOI Citations Footer (Factual Lineage & E-E-A-T) */}
            {article.citations && article.citations.length > 0 && (
              <footer
                aria-label="منابع علمی و ژورنال‌های معتبر بین‌المللی"
                style={{
                  marginTop: '32px',
                  padding: '20px 24px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#1e293b',
                    marginBottom: '12px',
                  }}
                >
                  <i className="fa-solid fa-book-medical" style={{ color: 'var(--color-primary)' }}></i>
                  <span>منابع علمی و مقالات استناد شده (DOI / Medical Journals):</span>
                </div>
                <ol
                  style={{
                    margin: 0,
                    paddingRight: '20px',
                    fontSize: '13px',
                    lineHeight: 1.9,
                    color: '#475569',
                  }}
                >
                  {article.citations.map((cite, index) => (
                    <li key={index} style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{cite.title}</span> —{' '}
                      <span style={{ color: '#0284c7' }}>{cite.source}</span>
                      {cite.doi && (
                        <span style={{ fontSize: '11.5px', color: '#64748b', marginRight: '6px' }}>
                          (DOI: {cite.doi})
                        </span>
                      )}
                      {cite.url && (
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginRight: '8px',
                            color: 'var(--color-primary)',
                            fontSize: '12px',
                            textDecoration: 'underline',
                          }}
                        >
                          مشاهده مقاله اصلی ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </footer>
            )}

            {/* Keywords / Tags for SEO & Contextual Navigation */}
            {article.keywords && article.keywords.length > 0 && (
              <div
                style={{
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px solid #edf4f7',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#7a8f98',
                    marginBottom: '10px',
                  }}
                >
                  <i
                    className="fa-solid fa-tags"
                    style={{ marginLeft: '6px' }}
                  ></i>
                  کلیدواژه‌ها و موضوعات مرتبط:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {article.keywords.map((kw) => (
                    <Link
                      key={kw}
                      href={`/articles?q=${encodeURIComponent(kw)}`}
                      style={{
                        backgroundColor: '#f0f7f9',
                        color: '#1d5467',
                        fontSize: '12.5px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      #{kw}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div
                style={{
                  marginTop: '48px',
                  paddingTop: '28px',
                  borderTop: '1.5px solid #e5f1f5',
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--color-primary-dark)',
                    marginBottom: '18px',
                  }}
                >
                  مقالات مرتبط دیگر
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/articles/${rel.slug}`}
                      style={{
                        display: 'block',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #dbeef3',
                        backgroundColor: '#fbfdfe',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-primary)',
                          fontWeight: 700,
                        }}
                      >
                        {rel.category}
                      </span>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--color-primary-dark)',
                          margin: '6px 0 8px',
                          lineHeight: 1.5,
                        }}
                      >
                        {rel.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#68828d' }}>
                        مطالعه مقاله{' '}
                        <i
                          className="fa-solid fa-arrow-left"
                          style={{ marginRight: '4px' }}
                        ></i>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation CTA Banner */}
            <div
              style={{
                marginTop: '45px',
                padding: '30px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #d8eef5',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(28, 67, 79, 0.05)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--color-primary-dark)',
                    margin: 0,
                  }}
                >
                  نیاز به مشاوره دندانپزشکی در این زمینه دارید؟
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-muted)',
                    margin: '6px 0 0',
                  }}
                >
                  همکاران ما در کلینیک دندانپزشکی شهید قلی‌پور آماده پاسخگویی و ارائه نوبت هستند.
                </p>
              </div>

              <ArticleBookingButton />
            </div>
          </div>
        </section>
      </main>
    </ArticleClientWrapper>
  );
}
