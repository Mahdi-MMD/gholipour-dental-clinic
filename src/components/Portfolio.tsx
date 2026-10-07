'use client';

import React from 'react';
import Link from 'next/link';
import NanoPortfolioGallery from './NanoPortfolioGallery';

export default function Portfolio() {
  return (
    <section className="portfolio-section" id="portfolio">
      <div className="container">
        <div className="section-header">
          <span className="section-watermark">PORTFOLIO</span>
          <h2 className="section-title">نمونه کارهای درمانی</h2>
          <p className="section-subtitle">
            برگزیده‌ای از نتایج درمان و اصلاح طرح لبخند مراجعین گرامی
          </p>
        </div>

        {/* nanogallery2 Mosaic Gallery */}
        <div className="portfolio-mosaic-wrap">
          <NanoPortfolioGallery />
        </div>

        {/* CTA Button to Full Gallery Page */}
        <div className="portfolio-cta-wrap">
          <Link href="/gallery" className="portfolio-all-btn">
            <span>مشاهده تمامی نمونه‌کارها</span>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
