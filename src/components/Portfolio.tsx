'use client';

import React, { useState } from 'react';

interface BeforeAfterItemProps {
  beforeImg: string;
  afterImg: string;
  title?: string;
}

function BeforeAfterCard({ beforeImg, afterImg, title = 'درمان' }: BeforeAfterItemProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="ba-card">
      <div
        className="ba-slider-container"
        style={{ '--position': `${position}%` } as React.CSSProperties}
        dir="ltr"
      >
        <div className="ba-image-container">
          <img
            className="ba-image-before"
            src={beforeImg}
            alt={`قبل از درمان - ${title}`}
          />
          <img
            className="ba-image-after"
            src={afterImg}
            alt={`بعد از درمان - ${title}`}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="ba-range-slider"
          aria-label="اسلایدر مقایسه قبل و بعد"
        />
        <div className="ba-slider-line"></div>
        <div className="ba-slider-button">
          <i className="fa-solid fa-arrows-left-right"></i>
        </div>
        <span className="ba-label ba-label-before">قبل</span>
        <span className="ba-label ba-label-after">بعد</span>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<'before-after' | 'daily'>(
    'before-after'
  );

  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        <div className="section-header">
          <span className="section-watermark">PORTFOLIO</span>
          <h2 className="section-title">نمونه کارهای درمانی</h2>
        </div>

        {/* Filter Tabs: Exactly 2 subsections */}
        <div className="gallery-tabs">
          <button
            className={`gallery-tab-btn ${
              activeFilter === 'before-after' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('before-after')}
          >
            نمونه کارها
          </button>
          <button
            className={`gallery-tab-btn ${
              activeFilter === 'daily' ? 'active' : ''
            }`}
            onClick={() => setActiveFilter('daily')}
          >
            روزمرگی مطب
          </button>
        </div>

        {/* Tab 1: Interactive Before & After Sliders Grid */}
        {activeFilter === 'before-after' && (
          <div className="portfolio-tab-content active" id="tab-portfolio-before-after">
            <div className="before-after-grid">
              <BeforeAfterCard
                beforeImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg"
                afterImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg"
                title="طراحی و اصلاح طرح لبخند"
              />

              <BeforeAfterCard
                beforeImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg"
                afterImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg"
                title="کاشت ایمپلنت و بازسازی فک"
              />

              <BeforeAfterCard
                beforeImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg"
                afterImg="https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg"
                title="بلیچینگ و سفیدکردن دندان‌ها"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Daily Life at Clinic */}
        {activeFilter === 'daily' && (
          <div className="portfolio-tab-content active" id="tab-portfolio-daily">
            <div className="gallery-grid">
              <div className="gallery-card">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/Qaf-Daily-40.jpeg"
                  alt="روزمرگی مطب قلی‌پور"
                />
                <div className="gallery-overlay">
                  <span>محیط آرام و استاندارد کلینیک</span>
                </div>
              </div>
              <div className="gallery-card">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/Qaf-Daily-41.jpeg"
                  alt="تجهیزات مدرن مطب"
                />
                <div className="gallery-overlay">
                  <span>اتاق استریلیزاسیون و تجهیزات دیجیتال</span>
                </div>
              </div>
              <div className="gallery-card">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/Qaf-Daily-43.jpeg"
                  alt="روزمرگی کادر درمان"
                />
                <div className="gallery-overlay">
                  <span>همراهی صمیمانه با مراجعین</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
