'use client';

import React, { useState } from 'react';
import { ArticleItem } from '@/data/articlesData';

interface ArticlePreviewProps {
  article: ArticleItem;
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
      <strong key={`bold-${m.index}`} style={{ fontWeight: 700, color: '#1c434f' }}>
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

// Helper to render inline markdown links and bold
function renderInlineFormatting(inlineText: string): React.ReactNode {
  if (!inlineText) return null;

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
      <span
        key={`link-${match.index}`}
        style={{
          color: '#1c83aa',
          fontWeight: 700,
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
          cursor: 'pointer',
        }}
        title={`لینک به: ${url}`}
      >
        {linkText}
      </span>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < inlineText.length) {
    const boldNodes = parseBold(inlineText.slice(lastIdx));
    segments.push(...boldNodes);
  }

  return segments;
}

// Structured block parser for section body: handles paragraphs, lists, tables, headings, callouts
function renderFormattedBody(text: string) {
  if (!text) return null;

  const rawBlocks = text
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'justify' }}>
      {rawBlocks.map((block, blockIdx) => {
        const lines = block
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        // Sub-heading (### Heading)
        if (block.startsWith('###')) {
          const headingText = block.replace(/^###\s*/, '');
          return (
            <h3
              key={`h3-${blockIdx}`}
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#1c434f',
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
                  backgroundColor: '#1c83aa',
                }}
              />
              <span>{headingText}</span>
            </h3>
          );
        }

        // Markdown Table
        const isTable =
          lines.length >= 2 &&
          lines[0].includes('|') &&
          lines.some(l => /^\|?\s*:?-+:?\s*\|/.test(l));

        if (isTable) {
          const tableLines = lines.filter(l => l.includes('|'));
          const separatorIdx = tableLines.findIndex(l => /^\|?\s*:?-+:?\s*\|/.test(l));
          const headerLine = separatorIdx > 0 ? tableLines[0] : null;
          const bodyLines = separatorIdx >= 0 ? tableLines.slice(separatorIdx + 1) : tableLines;

          const parseRow = (rowStr: string) =>
            rowStr
              .replace(/^\|/, '')
              .replace(/\|$/, '')
              .split('|')
              .map(c => c.trim());

          const headers = headerLine ? parseRow(headerLine) : [];

          return (
            <div
              key={`table-wrap-${blockIdx}`}
              style={{
                width: '100%',
                overflowX: 'auto',
                margin: '8px 0 16px 0',
                borderRadius: '12px',
                border: '1px solid #d8eef5',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'right',
                  fontSize: '14px',
                  lineHeight: 1.8,
                }}
              >
                {headers.length > 0 && (
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#e3f9ff',
                        borderBottom: '2px solid #1c83aa',
                      }}
                    >
                      {headers.map((h, hIdx) => (
                        <th
                          key={`th-${hIdx}`}
                          style={{
                            padding: '10px 14px',
                            fontWeight: 700,
                            color: '#1c434f',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {renderInlineFormatting(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {bodyLines.map((rowStr, rIdx) => {
                    const cells = parseRow(rowStr);
                    const isEven = rIdx % 2 === 0;
                    return (
                      <tr
                        key={`tr-${rIdx}`}
                        style={{
                          backgroundColor: isEven ? 'transparent' : '#f8fdff',
                          borderBottom:
                            rIdx === bodyLines.length - 1 ? 'none' : '1px solid #edf5f7',
                        }}
                      >
                        {cells.map((cell, cIdx) => (
                          <td
                            key={`td-${cIdx}`}
                            style={{
                              padding: '10px 14px',
                              color: '#2d4f5c',
                            }}
                          >
                            {renderInlineFormatting(cell)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Ordered List
        const isOrderedList = lines.every(line => /^[0-9۰-۹]+[\.\-]\s+/.test(line));
        if (isOrderedList && lines.length > 0) {
          return (
            <ol
              key={`ol-${blockIdx}`}
              style={{
                margin: '4px 0',
                paddingRight: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                listStyleType: 'decimal',
              }}
            >
              {lines.map((line, lineIdx) => {
                const itemContent = line.replace(/^[0-9۰-۹]+[\.\-]\s+/, '');
                return (
                  <li key={`oli-${lineIdx}`} style={{ lineHeight: 1.9, color: '#2d4f5c' }}>
                    {renderInlineFormatting(itemContent)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Bullet List
        const isBulletList = lines.every(line => /^[\-\*•]\s+/.test(line));
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
                  <li key={`uli-${lineIdx}`} style={{ lineHeight: 1.9, color: '#2d4f5c' }}>
                    {renderInlineFormatting(itemContent)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Callout (> **نکته:** ...)
        if (block.startsWith('>')) {
          const calloutText = block.replace(/^>\s*/, '');
          return (
            <div
              key={`callout-${blockIdx}`}
              style={{
                backgroundColor: '#fffbeb',
                borderRight: '4px solid #f59e0b',
                padding: '12px 16px',
                borderRadius: '8px',
                margin: '6px 0',
                fontSize: '14px',
                lineHeight: 1.8,
                color: '#78350f',
              }}
            >
              {renderInlineFormatting(calloutText)}
            </div>
          );
        }

        // Regular paragraph block
        return (
          <div key={`p-${blockIdx}`} style={{ margin: 0, lineHeight: 2.0, color: '#2d4f5c' }}>
            {renderInlineFormatting(block)}
          </div>
        );
      })}
    </div>
  );
}

export default function ArticlePreview({ article }: ArticlePreviewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div
      className="admin-preview-wrapper"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #d8eef5',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(28, 67, 79, 0.06)',
        direction: 'rtl',
        fontFamily: 'inherit',
      }}
    >
      {/* Live Preview Watermark / Top Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c434f 0%, #1c83aa 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 6px #10b981',
            }}
          />
          <span>پیش‌نمایش زنده محیط گرافیکی کاربر (Live Preview)</span>
        </div>
        <span style={{ opacity: 0.85, fontSize: '12px' }}>
          /articles/{article.slug || 'url-slug'}
        </span>
      </div>

      {/* Banner & Breadcrumb Header */}
      <header
        style={{
          backgroundColor: '#f8fdff',
          borderBottom: '1px solid #d8eef5',
          padding: '32px 24px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Breadcrumbs */}
          <nav
            style={{
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              color: '#5a7d8c',
            }}
          >
            <span>صفحه اصلی</span>
            <span>/</span>
            <span style={{ color: '#1c83aa', fontWeight: 600 }}>مقالات کلینیک</span>
            <span>/</span>
            <span style={{ color: '#859ba4' }}>{article.category || 'دسته‌بندی'}</span>
          </nav>

          {/* Category Badge */}
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#e3f9ff',
              color: '#1c83aa',
              fontSize: '12px',
              fontWeight: 700,
              padding: '3px 12px',
              borderRadius: '16px',
              marginBottom: '14px',
            }}
          >
            {article.category || 'دسته‌بندی مقاله'}
          </span>

          {/* Title */}
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#1c434f',
              lineHeight: 1.45,
              marginBottom: '14px',
            }}
          >
            {article.title || 'عنوان مقاله'}
          </h1>

          {/* Metadata Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '12.5px',
              color: '#5a7d8c',
            }}
          >
            {article.readTime && <span>⏱️ زمان مطالعه: {article.readTime}</span>}
            {article.date && <span>📅 {article.date}</span>}
            {article.author && (
              <span style={{ color: '#1c83aa', fontWeight: 600 }}>
                👨‍⚕️ نویسنده و بازبین: {article.author}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ padding: '28px 24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Featured Image */}
        {article.image && (
          <figure
            style={{
              margin: '0 0 28px 0',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 6px 20px rgba(28, 67, 79, 0.08)',
              border: '1px solid #d8eef5',
              backgroundColor: '#f6fbfd',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '380px',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '380px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            {article.imageCaption && (
              <figcaption
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  color: '#5a7d8c',
                  backgroundColor: '#f8fdff',
                  borderTop: '1px solid #eef6f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📷</span>
                <span>{article.imageCaption}</span>
              </figcaption>
            )}
          </figure>
        )}

        {/* Lead / Summary */}
        {article.summary && (
          <div
            style={{
              fontSize: '15px',
              lineHeight: 1.9,
              color: '#1c434f',
              fontWeight: 600,
              marginBottom: '22px',
              padding: '14px 18px',
              backgroundColor: '#f9fbfc',
              borderRadius: '12px',
              borderRight: '3px solid #1c83aa',
            }}
          >
            {article.summary}
          </div>
        )}

        {/* TL;DR Box */}
        {article.tldr && (
          <div
            style={{
              backgroundColor: '#eef8ff',
              border: '1.5px solid #bce1f5',
              borderRight: '5px solid #1c83aa',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#1c434f',
                fontWeight: 800,
                fontSize: '14.5px',
              }}
            >
              <span>⚡</span>
              <span>خلاصه سریع و نکات کلیدی</span>
            </div>
            <div
              style={{
                margin: 0,
                fontSize: '14px',
                lineHeight: 1.85,
                color: '#2d4f5c',
                fontWeight: 600,
                textAlign: 'justify',
              }}
            >
              {article.tldr}
            </div>
          </div>
        )}

        {/* Table of Contents */}
        {article.sections && article.sections.length > 0 && (
          <nav
            style={{
              backgroundColor: '#fbfcfd',
              border: '1px solid #e2edf1',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#1c83aa',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📋</span>
              <span>فهرست بخش‌های این مقاله:</span>
            </div>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {article.sections.map((sec, i) => (
                <li key={sec.id || i}>
                  <a
                    href={`#${sec.id || `sec-${i}`}`}
                    style={{
                      color: '#2a6478',
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: '#1c83aa', fontSize: '12px' }}>{i + 1}.</span>
                    <span>{sec.title}</span>
                  </a>
                </li>
              ))}
              {article.faqs && article.faqs.length > 0 && (
                <li>
                  <a
                    href="#faq-section-preview"
                    style={{
                      color: '#2a6478',
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span style={{ color: '#1c83aa', fontSize: '12px' }}>
                      {article.sections.length + 1}.
                    </span>
                    <span>پرسش‌های متداول بیماران</span>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        )}

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {article.sections?.map((section, idx) => (
            <section
              key={section.id || idx}
              id={section.id || `sec-${idx}`}
              style={{
                paddingBottom: '20px',
                borderBottom: idx < article.sections.length - 1 ? '1px dashed #e2edf1' : 'none',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#1c434f',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #eef5f8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ color: '#1c83aa' }}>✓</span>
                <span>{section.title}</span>
              </h2>

              {renderFormattedBody(section.body)}

              {/* Doctor Comment */}
              {section.doctorComment && (
                <aside
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#f6fbfd',
                    borderRight: '4px solid #1c83aa',
                    borderTop: '1px solid #e1eff5',
                    borderBottom: '1px solid #e1eff5',
                    borderLeft: '1px solid #e1eff5',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: '0 2px 8px rgba(28, 131, 170, 0.04)',
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
                        border: '1.5px solid #1c83aa',
                        backgroundColor: '#e3f9ff',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/doctor-portrait.webp"
                        alt="دکتر مهدی محمدنژاد"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#1c434f',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>نکته بالینی دکتر مهدی محمدنژاد</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#1c83aa',
                            backgroundColor: '#e3f9ff',
                            padding: '2px 8px',
                            borderRadius: '10px',
                          }}
                        >
                          مشاهده مطب
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      lineHeight: 1.85,
                      color: '#2d4f5c',
                      fontStyle: 'italic',
                      textAlign: 'justify',
                    }}
                  >
                    «{section.doctorComment}»
                  </div>
                </aside>
              )}
            </section>
          ))}
        </div>

        {/* FAQs Section */}
        {article.faqs && article.faqs.length > 0 && (
          <div id="faq-section-preview" style={{ marginTop: '36px' }}>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#1c434f',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>❓</span>
              <span>پرسش‌های متداول بیماران ({article.faqs.length})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {article.faqs.map((faq, fIdx) => (
                <div
                  key={fIdx}
                  style={{
                    border: '1px solid #d8eef5',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: openFaqIndex === fIdx ? '#f0f9fc' : '#ffffff',
                      border: 'none',
                      textAlign: 'right',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1c434f',
                    }}
                  >
                    <span>{faq.question || 'سوال...'}</span>
                    <span style={{ color: '#1c83aa', fontSize: '12px' }}>
                      {openFaqIndex === fIdx ? '▲' : '▼'}
                    </span>
                  </button>
                  {openFaqIndex === fIdx && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #edf5f7',
                        fontSize: '13.5px',
                        lineHeight: 1.85,
                        color: '#2d4f5c',
                        backgroundColor: '#fbfdfe',
                      }}
                    >
                      {faq.answer || 'پاسخ...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author E-E-A-T Bio Box */}
        <aside
          style={{
            marginTop: '36px',
            padding: '20px',
            backgroundColor: '#fbfdfe',
            border: '1.5px solid #dbeef3',
            borderRadius: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid #1c83aa',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/doctor-portrait.webp"
              alt="دکتر مهدی محمدنژاد"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#1c434f' }}>
                نویسنده و بازبین علمی: {article.author || 'دکتر مهدی محمدنژاد'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#e3f9ff',
                  color: '#1c83aa',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}
              >
                تایید شده پزشکی
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#5a7d8c', margin: '0 0 4px 0' }}>
              دکترای حرفه‌ای دندان‌پزشکی کلینیک قلی‌پور | کد نظام پزشکی: ۲۲۹۳۵۳
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#4e707e',
                margin: 0,
                lineHeight: 1.7,
                textAlign: 'justify',
              }}
            >
              این مقاله بر اساس آخرین شواهد و ژورنال‌های معتبر دندانپزشکی نگارش یافته و با هدف
              ارتقای آگاهی بیماران، توسط {article.author || 'دکتر مهدی محمدنژاد'} بازبینی علمی شده
              است.
            </div>
          </div>
        </aside>

        {/* Citations Section */}
        {article.citations && article.citations.length > 0 && (
          <div
            style={{
              marginTop: '36px',
              padding: '20px',
              backgroundColor: '#f8fdff',
              border: '1px solid #d8eef5',
              borderRadius: '12px',
            }}
          >
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#1c434f',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📚</span>
              <span>منابع و مقالات معتبر علمی ({article.citations.length})</span>
            </h3>
            <ul
              style={{
                margin: 0,
                paddingRight: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                color: '#5a7d8c',
              }}
            >
              {article.citations.map((cite, cIdx) => (
                <li key={cIdx}>
                  <strong style={{ color: '#1c434f' }}>{cite.title}</strong>
                  {cite.source && <span> — {cite.source}</span>}
                  {cite.doi && (
                    <span style={{ marginRight: '6px', color: '#1c83aa' }}>(DOI: {cite.doi})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Keywords Tags */}
        {article.keywords && article.keywords.length > 0 && (
          <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#5a7d8c', alignSelf: 'center' }}>
              کلمات کلیدی:
            </span>
            {article.keywords.map((kw, kIdx) => (
              <span
                key={kIdx}
                style={{
                  backgroundColor: '#edf5f7',
                  color: '#2d4f5c',
                  padding: '3px 10px',
                  borderRadius: '14px',
                  fontSize: '12px',
                }}
              >
                #{kw}
              </span>
            ))}
          </div>
        )}

        {/* Booking CTA Banner */}
        <div
          style={{
            marginTop: '36px',
            background: 'linear-gradient(135deg, #1c434f 0%, #1c83aa 100%)',
            borderRadius: '14px',
            padding: '24px',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <h4 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>
            نیاز به مشاوره دندانپزشکی در زیباکنار و گیلان دارید؟
          </h4>
          <p style={{ fontSize: '13.5px', opacity: 0.9, marginBottom: '16px' }}>
            کلینیک دندانپزشکی شهید قلی‌پور با بهره‌گیری از تجهیزات مدرن در خدمت شماست.
          </p>
          <button
            type="button"
            style={{
              padding: '10px 24px',
              backgroundColor: '#ffffff',
              color: '#1c83aa',
              fontWeight: 800,
              fontSize: '14px',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            تماس و رزرو نوبت کلینیک
          </button>
        </div>
      </div>
    </div>
  );
}
