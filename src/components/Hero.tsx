'use client';

import React from 'react';
import Image from 'next/image';

interface HeroProps {
  onOpenBooking: () => void;
}

export default function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <span className="hero-subtitle">جایی که لبخندت از همیشه زیبا‌تره!</span>
          <h1 className="hero-title">کلینیک دندانپزشکی قلی‌پور</h1>
          <p className="hero-description">
            کلینیک تخصصی قلی‌پور با بهره‌گیری از فناوری‌های دیجیتال و تیمی از
            متخصصان باتجربه، خدمات جامع دندان‌پزشکی از جمله ایمپلنت، عصب‌کشی،
            روکش و ترمیم دندان را با دقت، سرعت و کمترین میزان درد ارائه می‌دهد.
            ما در این کلینیک تلاش می‌کنیم تا با ترکیب دانش روز، تجهیزات پیشرفته
            و رویکردی دقیق در درمان، سلامت، عملکرد و زیبایی لبخند شما را به
            بهترین شکل ممکن بازگردانیم.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary btn-large open-booking-btn"
              onClick={onOpenBooking}
            >
              رزرو نوبت
            </button>
            <a href="#portfolio" className="btn-secondary btn-large">
              <i className="fa-regular fa-circle-dot"></i>
              <span>مشاهده نمونه کارها</span>
            </a>
          </div>
        </div>
        <div className="hero-image-wrap">
          <Image
            src="/assets/hero-doctors.png"
            alt="تیم پزشکان کلینیک دندانپزشکی قلی‌پور"
            className="hero-img"
            width={600}
            height={660}
            priority={true}
            quality={90}
            sizes="(max-width: 768px) 100vw, 550px"
            style={{ width: 'auto', height: 'auto', maxWidth: '95%' }}
          />
        </div>
      </div>
    </section>
  );
}
