'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import ScrollIndicator from '@/components/ScrollIndicator';
import MeridiqSlider from '@/components/gallery/MeridiqSlider';
import StagesCard from '@/components/gallery/StagesCard';
import { GALLERY_ITEMS, GALLERY_CATEGORIES, GalleryItem } from '@/data/galleryData';
import '@/app/gallery.css';

export default function GalleryClient() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gallery view controls
  const [galleryMode, setGalleryMode] = useState<'before-after' | 'stages'>('before-after');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Responsive initial count: 3 on mobile (<=768px), 6 on desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setVisibleCount((prev) => (mobile ? Math.min(prev, 3) : Math.max(prev, 6)));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.gallery-cat-mobile-dropdown-wrap')) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [categoryDropdownOpen]);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  // Filter items according to category
  const filteredItems = useMemo(() => {
    const activeCatObj = GALLERY_CATEGORIES.find((c) => c.id === selectedCategory);

    return GALLERY_ITEMS.filter((item) => {
      if (selectedCategory === 'all') return true;
      if (!activeCatObj?.match) return true;
      return activeCatObj.match.some(
        (m) =>
          item.categoryLabel.includes(m) ||
          item.subCategoryLabel.includes(m) ||
          item.tags.some((t) => t.includes(m))
      );
    });
  }, [selectedCategory]);

  const displayedList = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="gallery"
      />

      <main className="gallery-page-main" dir="rtl">
        {/* HERO BANNER - Exact match with reference screenshot */}
        <section className="gallery-hero-banner">
          {/* Full-width aesthetic smile background image positioned to the right with soft fade to white */}
          <div className="gallery-hero-bg-wrap">
            <Image
              src="/assets/gallery/hero-smile-banner-hd.webp"
              alt="طراحی لبخند کلینیک دندانپزشکی دکتر قلی‌پور"
              fill
              className="gallery-hero-bg-img"
              priority
            />
            <div className="gallery-hero-gradient-overlay" />
          </div>

          {/* Dedicated mobile view background image */}
          <div className="gallery-hero-bg-mobile-wrap" aria-hidden="true">
            <Image
              src="/assets/gallery/hero-banner-mobile.webp"
              alt="طراحی لبخند دندانپزشکی"
              fill
              className="gallery-hero-bg-mobile-img"
              priority
            />
            <div className="gallery-hero-mobile-gradient-overlay" />
          </div>

          <div className="container gallery-hero-container">
            {/* Text content aligned completely to the left side margin matching reference image */}
            <div className="gallery-hero-content">
              <span className="gallery-hero-watermark">PORTFOLIO</span>
              <h1 className="gallery-hero-title">نمونه کارهای درمانی</h1>
              <p className="gallery-hero-subtitle">
                برخی از لبخندهای زیبا که با اعتماد شما، در کلینیک قلی‌پور خلق شده‌اند
              </p>
            </div>
          </div>
        </section>

        {/* CONTROLS SECTION: Category pills on right, Dual Mode Button on left */}
        <section className="gallery-controls-section">
          <div className="container gallery-controls-container">
            {/* Right side: Desktop Category Chips */}
            <div className="gallery-categories gallery-categories-desktop" role="tablist">
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                  className={`gallery-cat-pill ${
                    selectedCategory === cat.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setVisibleCount(isMobile ? 3 : 6);
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right side: Mobile Category Button & Dropdown Menu */}
            <div className="gallery-cat-mobile-dropdown-wrap">
              <button
                type="button"
                className={`gallery-cat-mobile-btn ${categoryDropdownOpen ? 'active' : ''}`}
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                aria-expanded={categoryDropdownOpen}
                aria-label="انتخاب دسته‌بندی"
              >
                {/* 3 horizontal rounded bars icon matching user reference at right side */}
                <span className="gallery-cat-menu-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="gallery-cat-menu-svg">
                    <rect x="2" y="3.5" width="20" height="4" rx="2" />
                    <rect x="2" y="10" width="20" height="4" rx="2" />
                    <rect x="2" y="16.5" width="20" height="4" rx="2" />
                  </svg>
                </span>
                <span className="gallery-cat-mobile-btn-text">
                  {selectedCategory === 'all'
                    ? 'دسته‌بندی'
                    : GALLERY_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'دسته‌بندی'}
                </span>
              </button>

              {/* Mobile Category Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="gallery-cat-mobile-dropdown-menu" role="menu">
                  {GALLERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="menuitem"
                      className={`gallery-cat-mobile-menu-item ${
                        selectedCategory === cat.id ? 'selected' : ''
                      }`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setVisibleCount(3);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.id && (
                        <i className="fa-solid fa-check" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Left side: Dual Mode Pill Button (مراحل کار / قبل و بعد) */}
            <div className="gallery-mode-pill-toggle" role="group" aria-label="انتخاب نوع نمایش گالری">
              {/* Left half: مراحل کار */}
              <button
                type="button"
                className={`gallery-mode-half-btn ${
                  galleryMode === 'stages' ? 'active' : 'inactive'
                }`}
                onClick={() => setGalleryMode('stages')}
              >
                <span>مراحل کار</span>
              </button>

              {/* Right half: قبل و بعد */}
              <button
                type="button"
                className={`gallery-mode-half-btn ${
                  galleryMode === 'before-after' ? 'active' : 'inactive'
                }`}
                onClick={() => setGalleryMode('before-after')}
              >
                <span>قبل و بعد</span>
              </button>
            </div>
          </div>
        </section>

        {/* GALLERY CARDS GRID */}
        <section className="gallery-grid-section">
          <div className="container">
            <div className="gallery-cards-grid">
              {displayedList.map((item) => (
                <article key={item.id} className="gallery-item-card">
                  {/* Mode 1: Before & After Split Screen Slider | Mode 2: Treatment Stages with Fancybox */}
                  {galleryMode === 'before-after' ? (
                    <MeridiqSlider
                      beforeImg={item.beforeImg}
                      afterImg={item.afterImg}
                      title={item.title}
                    />
                  ) : (
                    <StagesCard item={item} />
                  )}

                  {/* Card Footer matching reference screenshot */}
                  <div className="gallery-card-footer">
                    <div className="gallery-card-text">
                      <h3 className="gallery-card-title">{item.title}</h3>
                      <div className="gallery-card-tags">
                        <span className="gallery-tag-pill">{item.categoryLabel}</span>
                        {item.subCategoryLabel && (
                          <>
                            <span>•</span>
                            <span>{item.subCategoryLabel}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="gallery-card-cta-btn"
                      onClick={() => setActiveModalItem(item)}
                      aria-label={`مشاهده جزئیات ${item.title}`}
                      title="مشاهده جزئیات و بزرگ‌نمایی"
                    >
                      <i className="fa-solid fa-angle-left" />
                    </button>
                  </div>
                </article>
              ))}

              {filteredItems.length === 0 && (
                <div className="gallery-empty-state">
                  <i className="fa-regular fa-folder-open" />
                  <h3>نمونه کاری در این دسته‌بندی یافت نشد</h3>
                  <p>لطفاً عبارت دیگری را جستجو کنید یا دسته‌بندی «همه موارد» را انتخاب نمایید.</p>
                </div>
              )}
            </div>

            {/* LOAD MORE BUTTON - Modern Minimalist Clinic Design */}
            {hasMore && (
              <div className="gallery-load-more-wrap">
                <button
                  type="button"
                  className="gallery-load-more-btn"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                  aria-label="مشاهده نمونه کارهای بیشتر"
                >
                  <span className="gallery-load-more-text">نمایش موارد بیشتر</span>
                  <span className="gallery-load-more-icon-circle" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="gallery-load-more-chevron-svg"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* DETAIL MODAL / LIGHTBOX */}
      {activeModalItem && (
        <div
          className="gallery-modal-overlay"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="gallery-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button
              type="button"
              className="gallery-modal-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="بستن پنجره"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="gallery-modal-slider-box">
              <MeridiqSlider
                beforeImg={activeModalItem.beforeImg}
                afterImg={activeModalItem.afterImg}
                title={activeModalItem.title}
              />
            </div>

            <div className="gallery-modal-body">
              <h2 className="gallery-modal-title">{activeModalItem.title}</h2>
              <p className="gallery-modal-desc">{activeModalItem.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER & GLOBAL COMPONENTS */}
      <Footer onOpenBooking={handleOpenBooking} />
      <BookingDrawer isOpen={isBookingOpen} onClose={handleCloseBooking} />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
    </>
  );
}
