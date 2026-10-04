'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BookingDrawer from '@/components/BookingDrawer';
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

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Array<{
    title: string;
    slug: string;
    sectionId?: string;
    sectionTitle?: string;
  }>;
  usedInternalKnowledge?: boolean;
}

// Smart Title Compressor for 3D wheel
function formatWheelTitle(title: string, maxWords: number = 8, maxChars: number = 48): string {
  if (!title) return '';
  const trimmed = title.trim();
  const words = trimmed.split(/\s+/);
  
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  
  if (trimmed.length > maxChars) {
    return trimmed.slice(0, maxChars).trim() + '...';
  }
  
  return trimmed;
}

// Formatted Chat Message supporting bold headers, inline bolding, and bullet lists
function FormattedChatMessage({ text }: { text: string }) {
  if (!text) return null;

  const parseInline = (str: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="chat-ai-bold">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: number | string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="chat-ai-bullet-list">
          {currentList.map((item, idx) => (
            <li key={idx} className="chat-ai-bullet-item">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    let trimmed = line.trim();
    if (!trimmed) {
      flushList(index);
      return;
    }

    // Strip Markdown header hashes if any (e.g. ### **عنوان** or ## عنوان)
    const headerMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    let isHeader = false;
    if (headerMatch) {
      trimmed = headerMatch[1];
      isHeader = true;
    }

    // Check for bullet list item: starts with -, *, or •
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
      return;
    }

    // Flush any pending list
    flushList(index);

    elements.push(
      <div
        key={`p-${index}`}
        className={isHeader ? 'chat-ai-heading' : 'chat-ai-paragraph'}
      >
        {parseInline(trimmed)}
      </div>
    );
  });

  flushList('end');

  return <div className="chat-ai-formatted-body">{elements}</div>;
}

export default function ArticlesPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const defaultMiddleIndex = ARTICLES_DATA.length > 0 ? Math.floor(ARTICLES_DATA.length / 2) : 0;
  const [activeIndex, setActiveIndex] = useState(defaultMiddleIndex);

  // AI Mode States
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Conversational Chat History in AI Mode
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const swiperRef = useRef<SwiperType | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const lastUserMsgRef = useRef<HTMLDivElement | null>(null);

  // Scroll only within the chat container to the exact user question without moving the page or outer card
  useEffect(() => {
    if (lastUserMsgRef.current && chatScrollRef.current) {
      const container = chatScrollRef.current;
      const targetElement = lastUserMsgRef.current;
      const offsetTop = targetElement.offsetTop - container.offsetTop;
      container.scrollTo({ top: Math.max(0, offsetTop - 10), behavior: 'smooth' });
    }
  }, [chatHistory, isAiLoading]);

  // Initialize MiniSearch index
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

  // Compute matched articles using MiniSearch
  const filteredArticles = useMemo<SearchResultItem[]>(() => {
    const targetQuery = submittedQuery.trim() || searchQuery.trim();

    if (!targetQuery) {
      return ARTICLES_DATA;
    }

    const results = searchIndex.search(targetQuery);

    return results
      .map((res) => {
        const orig = ARTICLES_DATA.find((a) => a.id === res.id);
        if (!orig) return null;

        let matchedSectionId: string | undefined;
        let matchedSectionTitle: string | undefined;
        let matchedSnippet = '';

        if (orig.sections && orig.sections.length > 0) {
          const normQuery = normalizePersian(targetQuery);
          for (const sec of orig.sections) {
            const normSec = normalizePersian(`${sec.title} ${sec.body}`);
            if (normSec.includes(normQuery)) {
              matchedSectionId = sec.id;
              matchedSectionTitle = sec.title;
              matchedSnippet = extractSnippet(sec.body, targetQuery);
              break;
            }
          }
        }

        if (!matchedSnippet) {
          const allText = orig.content ? orig.content.join(' ') : orig.summary;
          matchedSnippet = extractSnippet(allText, targetQuery);
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
  }, [submittedQuery, searchQuery, searchIndex]);

  const totalCount = filteredArticles.length;
  const middleIndex = totalCount > 0 ? Math.floor(totalCount / 2) : 0;

  // Ensure at least 6 slides so Swiper's 5-per-view vertical loop & infinite auto-scroll rotate seamlessly
  const wheelArticles = useMemo(() => {
    if (totalCount === 0) return [];
    if (totalCount < 6) {
      const repeat = Math.ceil(6 / totalCount);
      return Array.from({ length: repeat }, () => filteredArticles).flat();
    }
    return filteredArticles;
  }, [filteredArticles, totalCount]);

  // Handle Search Submission (Enter key or search click)
  const handlePerformSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) return;

    if (isAiMode) {
      // In AI mode: send message and clear the top search box
      setSearchQuery('');
      await handleSendChatMessage(q);
    } else {
      // Standard search: display matching article list only
      setSubmittedQuery(q);
    }
  };

  // Send message in Conversational AI Mode
  const handleSendChatMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: msgText.trim() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setSearchQuery('');
    setFollowUpInput('');
    setIsAiLoading(true);

    try {
      const historyPayload = newHistory.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/articles/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: msgText,
          history: historyPayload.slice(0, -1),
          mode: 'chat',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          role: 'model',
          text: data.answer,
          sources: (data.sources && data.sources.length > 0) ? data.sources.slice(0, 3) : [],
          usedInternalKnowledge: data.usedInternalKnowledge ?? (!data.sources || data.sources.length === 0),
        };
        setChatHistory([...newHistory, aiMsg]);
      } else {
        const aiMsg: ChatMessage = {
          role: 'model',
          text: 'متأسفانه در برقراری ارتباط با دستیار هوشمند مشکلی رخ داد. لطفاً مجدداً تلاش کنید یا سوال خود را در ربات تلگرام @Qolipur-bot مطرح نمایید.',
        };
        setChatHistory([...newHistory, aiMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: 'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی نمایید.',
      };
      setChatHistory([...newHistory, aiMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const currentActiveArticle = wheelArticles[activeIndex] || filteredArticles[0] || null;

  // Highlight matched search tokens
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

      {/* Ambient Floating Geometry */}
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
        <div className="articles-showcase-glow-container">
          <section className="articles-showcase-card" aria-label="بخش مقالات و هوش مصنوعی کلینیک">
            <div className="card-ambient-glow" aria-hidden="true" />

            {/* 1. Page Title */}
            <div className="articles-page-header">
              <h1 className="articles-page-title">
                {isAiMode ? 'دستیار هوشمند دندانپزشکی' : 'مقالات و دانشنامه دندانپزشکی'}
              </h1>
              <p className="articles-page-subtitle">
                {isAiMode
                  ? 'پاسخ هوشمند و دقیقتر، با استناد به مقالات علمی و تجارب بالینی'
                  : 'جستجوی هوشمند در علائم، داروها، درمانها و مقالات تخصصی'}
              </p>
            </div>

            {/* 2. Google-Style Search Bar with internal "AI Mode" button */}
            <div className="articles-search-wrap">
              <div className="articles-search-inner-box">
                {/* Right side: Traditional Search Magnifier Button (for Persian RTL) */}
                <button
                  type="button"
                  className="articles-search-icon"
                  onClick={() => handlePerformSearch()}
                  aria-label="جستجو یا ارسال سوال"
                  title="جستجو یا ارسال سوال"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>

                {/* Center: Search Text Input */}
                <input
                  type="text"
                  className="articles-search-input"
                  placeholder={
                    isAiMode
                      ? 'سوال دندانپزشکی خود را بپرسید...'
                      : isMobile
                      ? 'جستجوی مقاله ...'
                      : 'جستجوی مقاله، علائم، داروها یا موضوعات...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePerformSearch();
                    }
                  }}
                  aria-label="کادر جستجوی مقالات"
                />

                {/* Left side actions: Clear 'X' button + Google "AI Mode" button */}
                <div className="articles-search-left-actions">
                  {searchQuery && (
                    <button
                      type="button"
                      className="articles-clear-search-btn"
                      onClick={() => {
                        setSearchQuery('');
                        setSubmittedQuery('');
                        setActiveIndex(defaultMiddleIndex);
                      }}
                      aria-label="پاک کردن جستجو"
                      title="پاک کردن"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}

                  {/* Google-Style "AI Mode" Pill Button */}
                  <div className={`google-ai-mode-pill-wrapper ${isAiMode ? 'is-active-reactor' : ''}`}>
                    <button
                      type="button"
                      className={`google-ai-mode-pill ${isAiMode ? 'is-active' : 'is-inactive'}`}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        const nextMode = !isAiMode;
                        setIsAiMode(nextMode);
                        if (!nextMode) {
                          setActiveIndex(defaultMiddleIndex);
                        }
                        if (nextMode && searchQuery.trim() && chatHistory.length === 0) {
                          handleSendChatMessage(searchQuery.trim());
                        }
                      }}
                      title={isAiMode ? 'خاموش کردن حالت هوشمند' : 'روشن کردن حالت هوشمند'}
                      aria-label="Google AI Mode toggle"
                    >
                      <span className="google-ai-mode-label google-ai-mode-label-desktop">AI Mode</span>
                      <span className="google-ai-mode-label google-ai-mode-label-mobile">AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CONDITIONAL VIEWS: Google AI Mode vs Google Search Results vs 3D Title Wheel */}
            {isAiMode ? (
              /* ========================================================
                 GOOGLE AI CHAT MODE ENVIRONMENT (Single Top Search Bar)
                 ======================================================== */
              <div className="google-ai-chat-stage">
                <div className="ai-chat-history-scroll" ref={chatScrollRef}>
                  {chatHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
                      <div style={{ fontSize: '36px', color: '#0284c7', marginBottom: '12px' }}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                        دستیار هوشمند کلینیک دندانپزشکی قلی‌پور
                      </h3>
                      <p style={{ fontSize: '14px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
                        هر سوالی درباره دندان‌درد، مراحل درمان، مراقبت‌های پس از جراحی یا تفاوت روش‌ها دارید در کادر بالا بپرسید؛ هوش مصنوعی با استناد به دانشنامه علمی کلینیک به شما پاسخ خواهد داد.
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => {
                      const isLatestUserMsg =
                        msg.role === 'user' &&
                        (idx === chatHistory.length - 1 || idx === chatHistory.length - 2);

                      return (
                        <div
                          key={idx}
                          ref={isLatestUserMsg ? lastUserMsgRef : null}
                          className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}
                        >
                          {msg.role === 'model' && (
                            <div className="chat-ai-header">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fa-solid fa-sparkles"></i>
                                <span>دستیار کلینیک دندانپزشکی قلی‌پور</span>
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>هوش مصنوعی</span>
                            </div>
                          )}

                          <FormattedChatMessage text={msg.text} />

                          {/* Reference sources (1 to 3 articles) OR internal knowledge indicator */}
                          {msg.role === 'model' && (
                            msg.sources && msg.sources.length > 0 ? (
                              <div className="ai-overview-sources">
                                <div className="ai-overview-sources-title">
                                  <i className="fa-solid fa-book-open" style={{ marginLeft: '6px' }}></i>
                                  <span>مقالات مرجع در سایت ({msg.sources.slice(0, 3).length} مقاله):</span>
                                </div>
                                <div className="ai-overview-sources-list">
                                  {msg.sources.slice(0, 3).map((src, sIdx) => (
                                    <Link
                                      key={sIdx}
                                      href={`/articles/${src.slug}${src.sectionId ? '#' + src.sectionId : ''}`}
                                      className="ai-source-chip"
                                    >
                                      <span>{src.title}</span>
                                      <i className="fa-solid fa-arrow-left" style={{ fontSize: '9px' }}></i>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="ai-overview-sources ai-internal-source-box">
                                <div className="ai-internal-source-content">
                                  <i className="fa-solid fa-brain" style={{ marginLeft: '6px', color: '#0284c7' }}></i>
                                  <span>منبع پاسخ: استخراج و تدوین‌شده بر پایه <strong>دانش تخصصی دندانپزشکی</strong> (بدون مقاله مرجع در دانشنامه سایت)</span>
                                </div>
                              </div>
                            )
                          )}

                          {/* Telegram Bot redirection banner */}
                          {msg.role === 'model' && (
                            <div className="chat-telegram-cta">
                              <span>
                                نیاز به معاینه یا سوال اختصاصی دارید؟
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <a
                                  href="https://t.me/Qolipur_bot"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="telegram-bot-badge"
                                >
                                  <i className="fa-brands fa-telegram"></i>
                                  <span>ارتباط با ربات تلگرام (@Qolipur-bot)</span>
                                </a>
                                <button
                                  type="button"
                                  className="btn-primary"
                                  style={{ padding: '4px 12px', fontSize: '12px' }}
                                  onClick={handleOpenBooking}
                                >
                                  رزرو نوبت
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {isAiLoading && (
                    <div className="chat-msg-ai-loading">
                      <div className="ai-typing-inline-wrap">
                        <span className="ai-typing-text ai-typing-text-desktop">
                          دستیار در حال بررسی مقالات و نگارش پاسخ است
                        </span>
                        <span className="ai-typing-text ai-typing-text-mobile">
                          درحال بررسی مقالات
                        </span>
                        <div className="ai-typing-indicator">
                          <span className="ai-typing-dot" />
                          <span className="ai-typing-dot" />
                          <span className="ai-typing-dot" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Safe bottom margin spacer so the bottom-most message / telegram card never hits the card border */}
                  <div className="chat-bottom-safe-spacer" />
                </div>
              </div>
            ) : submittedQuery.trim() || searchQuery.trim() ? (
              /* ========================================================
                 GOOGLE-STYLE SEARCH RESULTS LAYOUT (AI MODE OFF)
                 ======================================================== */
              <div className="google-results-container">
                <div className="google-results-meta">
                  <span>
                    حدود {totalCount} نتیجه برای «<strong>{submittedQuery || searchQuery}</strong>»
                  </span>
                </div>

                {/* Google-like List of Search Results */}
                {totalCount === 0 ? (
                  <div className="articles-no-results">
                    <div className="no-results-icon-wrap">
                      <i className="fa-regular fa-folder-open"></i>
                    </div>
                    <p>مقاله‌ای مطابق با جستجوی شما یافت نشد.</p>
                  </div>
                ) : (
                  filteredArticles.map((item) => {
                    const targetUrl = item.matchedSectionId
                      ? `/articles/${item.slug}#${item.matchedSectionId}`
                      : `/articles/${item.slug}`;

                    return (
                      <Link
                        key={item.id}
                        href={targetUrl}
                        className="google-result-item"
                      >
                        <div className="google-result-breadcrumb">
                          <span>کلینیک دندانپزشکی قلی‌پور</span>
                          <i className="fa-solid fa-chevron-left"></i>
                          <span>مقالات</span>
                          <i className="fa-solid fa-chevron-left"></i>
                          <span>{item.category}</span>
                        </div>

                        <h3 className="google-result-title">
                          {renderHighlighted(item.title, submittedQuery || searchQuery)}
                        </h3>

                        <p className="google-result-snippet">
                          {item.matchedSnippet ? (
                            renderHighlighted(item.matchedSnippet, submittedQuery || searchQuery)
                          ) : (
                            item.summary
                          )}
                        </p>

                        {item.matchedSectionTitle && (
                          <span className="google-result-section-chip">
                            <i className="fa-solid fa-hashtag"></i>
                            <span>بخش مرتبط: {item.matchedSectionTitle}</span>
                          </span>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            ) : (
              /* ========================================================
                 DEFAULT VIEW: 3D VERTICAL TITLE WHEEL DRAWER
                 ======================================================== */
              <div className="articles-drawer-container">
                <div className="articles-swiper-layout">
                  <div className="articles-swiper-wrapper-box">
                    <Swiper
                      modules={[Mousewheel, Scrollbar, Autoplay]}
                      direction="vertical"
                      slidesPerView={5}
                      centeredSlides={true}
                      loop={wheelArticles.length >= 5}
                      speed={800}
                      initialSlide={middleIndex}
                      mousewheel={{
                        forceToAxis: true,
                        releaseOnEdges: false,
                        sensitivity: 1,
                      }}
                      scrollbar={{
                        el: '.articles-vertical-scrollbar',
                        draggable: true,
                        dragClass: 'articles-scrollbar-drag',
                      }}
                      autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }}
                      onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                        if (middleIndex > 0) {
                          if (swiper.params.loop) {
                            swiper.slideToLoop(middleIndex, 0);
                          } else {
                            swiper.slideTo(middleIndex, 0);
                          }
                          requestAnimationFrame(() => {
                            if (!swiper.destroyed) {
                              if (swiper.params.loop) {
                                swiper.slideToLoop(middleIndex, 0);
                              } else {
                                swiper.slideTo(middleIndex, 0);
                              }
                              // Ensure autoplay is actively ticking
                              if (swiper.autoplay && !swiper.autoplay.running) {
                                swiper.autoplay.start();
                              }
                            }
                          });
                        }
                      }}
                      onSlideChange={(swiper) => {
                        setActiveIndex(swiper.realIndex);
                      }}
                      className="articles-vertical-swiper"
                    >
                      {wheelArticles.map((item, index) => (
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
                                    {formatWheelTitle(item.title, 8, 48)}
                                  </span>
                                  <span className="title-text-inner title-mobile">
                                    {formatWheelTitle(item.title, 6, 32)}
                                  </span>
                                </Link>
                              </div>
                            );
                          }}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  <div className="articles-scrollbar-container">
                    <div className="articles-vertical-scrollbar" />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Controls for standard 3D wheel */}
            {!isAiMode && !submittedQuery && !searchQuery.trim() && currentActiveArticle && (
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

      {/* Booking Drawer */}
      <BookingDrawer isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
