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
      authors: [article.author || 'دکتر مهدی محمد نژاد'],
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

// Helper to render markdown links [label](url) inside section body
function renderFormattedBody(text: string) {
  if (!text) return null;
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  if (!linkRegex.test(text)) {
    return text;
  }
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  text.replace(linkRegex, (match, linkText, url, offset) => {
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }
    parts.push(
      <Link
        key={offset}
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
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
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
      name: article.author || 'دکتر مهدی محمد نژاد',
      jobTitle: 'دکترای حرفه‌ای دندان‌پزشکی',
      identifier: '229353',
      worksFor: {
        '@type': 'DentalClinic',
        name: 'کلینیک دندانپزشکی شهید قلی‌پور',
      },
    },
    reviewedBy: {
      '@type': 'Person',
      name: 'دکتر مهدی محمد نژاد',
      jobTitle: 'دکترای حرفه‌ای دندان‌پزشکی',
      identifier: '229353',
    },
    publisher: {
      '@type': 'DentalClinic',
      name: 'کلینیک دندانپزشکی شهید قلی‌پور',
      url: 'https://gholipourdental.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://gholipourdental.com/assets/logo.png',
      },
    },
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

            {/* Summary Callout Box */}
            <div
              style={{
                backgroundColor: '#f1faff',
                borderRight: '4px solid var(--color-primary)',
                padding: '20px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-primary-dark)',
                lineHeight: 1.9,
                marginBottom: '32px',
              }}
            >
              {article.summary}
            </div>

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
                      <p style={{ margin: 0, textAlign: 'justify' }}>
                        {renderFormattedBody(section.body)}
                      </p>
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
                  src="/assets/doctor-mohammadnezhad.jpg"
                  alt="دکتر مهدی محمد نژاد"
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
                    نویسنده و بازبین علمی: دکتر مهدی محمد نژاد
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
                  این مقاله بر اساس آخرین شواهد و ژورنال‌های معتبر بین‌المللی دندانپزشکی نگارش یافته و با هدف ارتقای آگاهی بیماران، توسط دکتر مهدی محمد نژاد (کد نظام پزشکی ۲۲۹۳۵۳) بازبینی علمی و تایید شده است.
                </p>
              </div>
            </aside>

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
