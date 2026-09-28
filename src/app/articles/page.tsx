'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import { ARTICLES_DATA, ArticleItem } from '@/data/articlesData';
import {
  createArticlesSearchIndex,
  extractSnippet,
  normalizePersian,
  SearchableArticleDoc,
} from '@/lib/search';

// Swiper Components & Modules
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Mousewheel, Scrollbar, Autoplay } from 'swiper/modules';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/scrollbar';
import '@/app/articles.css';

interface SearchResultItem extends ArticleItem {
  matchedSnippet?: string;
  matchedSectionId?: string;
  matchedSectionTitle?: string;
  score?: number;
}

// Smart Title Compressor: Truncates long titles gracefully by word count with ellipsis
function formatWheelTitle(title: string, maxWords: number = 8): string {
  if (!title) return '';
  const words = title.trim().split(/\s+/);
  if (words.length <= maxWords) return title;
  return words.slice(0, maxWords).join(' ') + '...';
}

export default function ArticlesPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const swiperRef = useRef<SwiperType | null>(null);

  // Initialize MiniSearch index with enriched searchable fields
  const searchIndex = useMemo(() => {
    const docs: SearchableArticleDoc[] = ARTICLES_DATA.map((art) => ({
      id: art.id,
      slug: art.slug,
      title: art.title,
      category: art.category,
      summary: art.summary,
      keywords: (art.keywords || []).join(' '),
      content: [
        art.summary,
        ...(art.sections ? art.sections.map((s) => `${s.title} ${s.body}`) : art.content || []),
      ].join(' '),
      author: art.author,
    }));
    return createArticlesSearchIndex(docs);
  }, []);

  // Compute matched articles using MiniSearch when query exists
  const filteredArticles = useMemo<SearchResultItem[]>(() => {
    const cleanQuery = searchQuery.trim();

    if (!cleanQuery) {
      return ARTICLES_DATA;
    }

    // Perform MiniSearch query
    const results = searchIndex.search(cleanQuery);

    return results
      .map((res) => {
        const orig = ARTICLES_DATA.find((a) => a.id === res.id);
        if (!orig) return null;

        // Check which section matched best to provide deep-link
        let matchedSectionId: string | undefined;
        let matchedSectionTitle: string | undefined;
        let matchedSnippet = '';

        if (orig.sections && orig.sections.length > 0) {
          const normQuery = normalizePersian(cleanQuery);
          for (const sec of orig.sections) {
            const normSec = normalizePersian(`${sec.title} ${sec.body}`);
            if (normSec.includes(normQuery)) {
              matchedSectionId = sec.id;
              matchedSectionTitle = sec.title;
              matchedSnippet = extractSnippet(sec.body, cleanQuery);
              break;
            }
          }
        }

        // Fallback to summary or full body snippet
        if (!matchedSnippet) {
          const allText = orig.content ? orig.content.join(' ') : orig.summary;
          matchedSnippet = extractSnippet(allText, cleanQuery);
        }

        return {
          ...orig,
          score: res.score,
          matchedSnippet,
          matchedSectionId,
          matchedSectionTitle,
        };
      })
      .filter(Boolean) as SearchResultItem[];
  }, [searchQuery, searchIndex]);

  const totalCount = filteredArticles.length;

  // Reset active index & jump swiper to top if search changes
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(0, 400);
    }
  }, [searchQuery]);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const currentActiveArticle = filteredArticles[activeIndex] || null;

  // Helper to render text with matched query highlighted
  const renderHighlighted = (text: string, query: string) => {
    if (!query || !text) return text;
    const parts = query.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return text;

    const regex = new RegExp(`(${parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const chunks = text.split(regex);

    return (
      <>
        {chunks.map((chunk, i) =>
          parts.some((p) => normalizePersian(p) === normalizePersian(chunk)) ? (
            <mark key={i} className="highlight-term">
              {chunk}
            </mark>
          ) : (
            chunk
          )
        )}
      </>
    );
  };

  return (
    <div className="articles-page-wrapper">
      {/* Clinic Header */}
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="articles"
      />

      {/* Floating Animated Geometric Blobs & Sparkles */}
      <div className="articles-ambient-bg" aria-hidden="true">
        <div className="ambient-circle-1" />
        <div className="ambient-circle-2" />
        <div className="ambient-floating-orb orb-1" />
        <div className="ambient-floating-orb orb-2" />
        <div className="ambient-floating-orb orb-3" />
        <div className="floating-dental-sparkle s-1"><i className="fa-solid fa-sparkles"></i></div>
        <div className="floating-dental-sparkle s-2"><i className="fa-solid fa-star-of-life"></i></div>
      </div>

      {/* Main Content Area */}
      <main className="articles-stage">
        {/* Main Showcase Glowing Border Wrapper (Automated Gentle Movement) */}
        <div className="articles-showcase-glow-container">
          {/* Main Showcase Card */}
          <section className="articles-showcase-card" aria-label="بخش مقالات کلینیک">
            <div className="card-ambient-glow" aria-hidden="true" />

            {/* 1. Page Title */}
            <div className="articles-page-header">
            <h1 className="articles-page-title">مقالات و دانشنامه دندانپزشکی</h1>
            <p className="articles-page-subtitle">
              جستجوی هوشمند علائم، داروها، درمان‌ها و دانستنی‌های تخصصی کلینیک
            </p>
          </div>

          {/* 2. Front Search Box (Search icon on the right, Clear icon on the left) */}
          <div className="articles-search-wrap">
            <div className="articles-search-inner-box">
              {/* Search Magnifier Icon: Right side for Persian RTL */}
              <span className="articles-search-icon" aria-hidden="true">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>

              {/* Search Text Input */}
              <input
                type="text"
                className="articles-search-input"
                placeholder="جستجوی مقاله، علائم، داروها یا موضوعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="جستجوی هوشمند در محتوای مقالات"
              />

              {/* Clear Search Button: Left side */}
              {searchQuery && (
                <button
                  type="button"
                  className="articles-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="پاک کردن جستجو"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* 3. Render Search Results with deep-linking & snippets when search query active */}
          {totalCount === 0 ? (
            <div className="articles-no-results">
              <div className="no-results-icon-wrap">
                <i className="fa-regular fa-folder-open"></i>
              </div>
              <p>مقاله‌ای مطابق با جستجو یا فیلتر شما یافت نشد.</p>
              <button
                type="button"
                className="active-article-cta"
                onClick={() => {
                  setSearchQuery('');
                }}
              >
                نمایش تمام مقالات
              </button>
            </div>
          ) : searchQuery.trim().length > 0 ? (
            /* Rich Search Result Snippet List View */
            <div className="articles-search-results-list">
              <div style={{ fontSize: '13px', color: '#5b7d8d', fontWeight: 600, padding: '0 4px 6px' }}>
                یافته شده: {totalCount} مقاله مرتبط با «{searchQuery}»
              </div>
              {filteredArticles.map((item) => {
                const targetUrl = item.matchedSectionId
                  ? `/articles/${item.slug}#${item.matchedSectionId}`
                  : `/articles/${item.slug}`;

                return (
                  <Link
                    key={item.id}
                    href={targetUrl}
                    className="search-result-card"
                  >
                    <div className="search-result-header">
                      <span className="search-result-category">{item.category}</span>
                      <span className="search-match-badge">
                        <i className="fa-solid fa-bolt"></i> تطابق محتوایی
                      </span>
                    </div>

                    <h3 className="search-result-title">
                      {renderHighlighted(item.title, searchQuery)}
                    </h3>

                    {item.matchedSnippet && (
                      <div className="search-result-snippet">
                        {renderHighlighted(item.matchedSnippet, searchQuery)}
                      </div>
                    )}

                    {item.matchedSectionTitle && (
                      <div className="search-result-matched-section">
                        <i className="fa-solid fa-link"></i>
                        <span>بخش مرتبط: {item.matchedSectionTitle}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Standard Swiper Vertical Drawer when not actively searching */
            <div className="articles-drawer-container">
              <div className="articles-swiper-layout">
                <div className="articles-swiper-wrapper-box">
                  <Swiper
                    modules={[Mousewheel, Scrollbar, Autoplay]}
                    direction="vertical"
                    slidesPerView={5}
                    centeredSlides={true}
                    loop={totalCount >= 5}
                    speed={800}
                    mousewheel={{
                      forceToAxis: true,
                      releaseOnEdges: false,
                      sensitivity: 1,
                      thresholdDelta: 15,
                    }}
                    scrollbar={{
                      el: '.articles-vertical-scrollbar',
                      draggable: true,
                      dragClass: 'articles-scrollbar-drag',
                    }}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                      setActiveIndex(swiper.realIndex);
                    }}
                    className="articles-vertical-swiper"
                  >
                    {filteredArticles.map((item, index) => (
                      <SwiperSlide key={`${item.id}-${index}`} className="article-swiper-slide">
                        {({ isActive, isPrev, isNext }) => {
                          let focusState = 'slide-edge';
                          if (isActive) focusState = 'slide-active';
                          else if (isPrev || isNext) focusState = 'slide-near';

                          return (
                            <div className={`article-slide-content ${focusState}`}>
                              <Link
                                href={`/articles/${item.slug}`}
                                className="article-exact-title-link"
                              >
                                <span className="title-text-inner title-desktop">
                                  {formatWheelTitle(item.title, 8)}
                                </span>
                                <span className="title-text-inner title-mobile">
                                  {formatWheelTitle(item.title, 7)}
                                </span>
                              </Link>
                            </div>
                          );
                        }}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Elegant Custom Vertical Scrollbar */}
                <div className="articles-scrollbar-container">
                  <div className="articles-vertical-scrollbar" />
                </div>
              </div>
            </div>
          )}

          {/* Drawer Footer Controls, Quick Step Buttons & Direct Reading CTA */}
          {!searchQuery.trim() && currentActiveArticle && (
            <div className="articles-drawer-hint">
              <button
                type="button"
                className="drawer-step-btn"
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="موضوع قبلی"
                title="موضوع قبلی"
              >
                <i className="fa-solid fa-chevron-up"></i>
              </button>

              <Link
                href={`/articles/${currentActiveArticle.slug}`}
                className="active-article-cta"
              >
                <span>مطالعه کامل این مقاله</span>
                <i className="fa-solid fa-arrow-left"></i>
              </Link>

              <button
                type="button"
                className="drawer-step-btn"
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="موضوع بعدی"
                title="موضوع بعدی"
              >
                <i className="fa-solid fa-chevron-down"></i>
              </button>
            </div>
          )}
        </section>
      </div>
      </main>

      {/* Floating Action Button */}
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />

      {/* Booking Drawer */}
      <BookingDrawer isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
