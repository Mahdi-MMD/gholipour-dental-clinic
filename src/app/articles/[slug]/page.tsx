'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import { ARTICLES_DATA } from '@/data/articlesData';

interface ArticleDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ArticleDetailPage({ params }: ArticleDetailProps) {
  const unwrappedParams = React.use(params);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const article = ARTICLES_DATA.find((a) => a.slug === unwrappedParams.slug);

  if (!article) {
    notFound();
  }

  // Related articles based on shared category or keywords
  const relatedArticles = ARTICLES_DATA
    .filter((a) => a.id !== article.id && (a.category === article.category || a.keywords.some((k) => article.keywords.includes(k))))
    .slice(0, 3);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  // Helper to render markdown links [label](url) inside section body
  const renderFormattedBody = (text: string) => {
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
  };

  return (
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="articles"
      />

      <main style={{ minHeight: '80vh', backgroundColor: '#ffffff', paddingBottom: '70px' }}>
        {/* Banner Section */}
        <section
          style={{
            backgroundColor: '#f8fdff',
            borderBottom: '1px solid #d8eef5',
            padding: '48px 0 32px',
          }}
        >
          <div className="container" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Link
                href="/articles"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                <i className="fa-solid fa-arrow-right"></i>
                <span>بازگشت به فهرست مقالات</span>
              </Link>
            </div>

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
                <i className="fa-regular fa-clock" style={{ marginLeft: '6px' }}></i>
                زمان مطالعه: {article.readTime}
              </span>
              <span>
                <i className="fa-regular fa-calendar" style={{ marginLeft: '6px' }}></i>
                {article.date}
              </span>
              <span>
                <i className="fa-solid fa-user-doctor" style={{ marginLeft: '6px' }}></i>
                {article.author}
              </span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ padding: '40px 0' }}>
          <div className="container" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px' }}>
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
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-list-ul"></i>
                  <span>فهرست بخش‌های این مقاله:</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#0284c7')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#2a6478')}
                      >
                        <span style={{ color: '#0284c7', fontSize: '12px' }}>{i + 1}.</span>
                        <span>{sec.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Structured Sections with deep-link anchors */}
            <article style={{ fontSize: '16px', lineHeight: 2.1, color: 'var(--color-text-body)' }}>
              {article.sections && article.sections.length > 0 ? (
                article.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    style={{
                      marginBottom: '32px',
                      scrollMarginTop: '100px', // allows comfortable scrolling beneath fixed header
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
                      <i className="fa-solid fa-circle-check" style={{ color: 'var(--color-primary)', fontSize: '16px' }}></i>
                      <span>{section.title}</span>
                    </h2>
                    <p style={{ margin: 0, textAlign: 'justify' }}>
                      {renderFormattedBody(section.body)}
                    </p>
                  </section>
                ))
              ) : (
                article.content.map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '22px', textAlign: 'justify' }}>
                    {renderFormattedBody(paragraph)}
                  </p>
                ))
              )}
            </article>

            {/* Keywords / Tags for SEO & Contextual Navigation */}
            {article.keywords && article.keywords.length > 0 && (
              <div
                style={{
                  marginTop: '40px',
                  paddingTop: '20px',
                  borderTop: '1px solid #edf4f7',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#7a8f98', marginBottom: '10px' }}>
                  <i className="fa-solid fa-tags" style={{ marginLeft: '6px' }}></i>
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f7f9';
                        e.currentTarget.style.color = '#1d5467';
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
              <div style={{ marginTop: '48px', paddingTop: '28px', borderTop: '1.5px solid #e5f1f5' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '18px' }}>
                  مقالات مرتبط دیگر
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#dbeef3';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {rel.category}
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-dark)', margin: '6px 0 8px', lineHeight: 1.5 }}>
                        {rel.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#68828d' }}>
                        مطالعه مقاله <i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }}></i>
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
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  نیاز به مشاوره دندانپزشکی در این زمینه دارید؟
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '6px 0 0' }}>
                  همکاران ما در کلینیک دندانپزشکی شهید قلی‌پور آماده پاسخگویی و ارائه نوبت هستند.
                </p>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenBooking}
              >
                <span>رزرو نوبت معاینه</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenBooking={handleOpenBooking} />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <BookingDrawer isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </>
  );
}
