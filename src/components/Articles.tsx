'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

interface ArticlesProps {
  onOpenBooking: () => void;
}

const articlesData = [
  {
    title: 'مراقبت‌های بعد از جراحی ایمپلنت دندانی',
    excerpt:
      'راهنمای کامل بیماران کلینیک دندانپزشکی قلی‌پور؛ نکات طلایی تغذیه، کاهش تورم و بهداشت اصولی دهان پس از کاشت دندان برای بهبودی سریع و ماندگاری موفقیت‌آمیز ایمپلنت.',
    img: '/assets/article-implant-care.jpg',
  },
  {
    title: 'بلیچینگ دندان چیست و چه تفاوتی با لمینیت دارد؟',
    excerpt:
      'سفید بودن دندان‌ها نقش کلیدی در زیبایی لبخند دارد؛ بررسی تفاوت‌های اساسی بلیچینگ مطبی با لمینیت سرامیکی و نحوه انتخاب بهترین روش در مرکز تخصصی قلی‌پور.',
    img: '/assets/article-whitening.jpg',
  },
  {
    title: 'بهترین خمیر دندان برای استفاده روزمره کدام است؟',
    excerpt:
      'انتخاب خمیر دندان مناسب نقش بنیادین در پیشگیری از پوسیدگی دندان دارد؛ معیارهای انتخاب خمیر دندان حاوی فلوراید، ضدحساسیت و کنترل‌کننده پلاک دندانی.',
    img: '/assets/article-toothpaste.jpg',
  },
  {
    title: 'روش‌های نوین بی‌حسی، دندان‌پزشکی بدون درد',
    excerpt:
      'کنترل اضطراب و درد بیماران یکی از اهداف اصلی کلینیک قلی‌پور است؛ معرفی تکنیک‌های بی‌حسی موضعی و کامپیوتری پیشرفته برای درمانی بدون هیچ‌گونه ترس یا احساس ناخوشایند.',
    img: '/assets/article-anesthesia.jpg',
  },
  {
    title: 'ارتودنسی دندان چقدر طول می‌کشد و چه مراحلی دارد؟',
    excerpt:
      'ارتودنسی تخصصی به اصلاح موقعیت دندان‌ها و نظم فک‌ها می‌پردازد؛ بررسی طول دوره درمان، فازهای نگهدارنده و مراقبت‌های بهداشتی با براکت‌های ثابت و نامرئی.',
    img: '/assets/article-orthodontics.jpg',
  },
  {
    title: 'بایدها و نبایدهای حیاتی پس از کاشت ایمپلنت',
    excerpt:
      'ایمپلنت دندان زمانی پایدارترین نتیجه را دارد که توصیه‌های بعد از جراحی رعایت شوند؛ از مصرف آنتی‌بیوتیک‌ها تا محافظت از بافت پیوندی لثه در روزهای نخست.',
    img: '/assets/article-implant-dos-donts.jpg',
  },
];

export default function Articles({ onOpenBooking }: ArticlesProps) {
  return (
    <section className="articles-section" id="articles">
      <div className="container">
        {/* Section Header with Watermark and Carousel Navigation Arrows */}
        <div className="articles-header-bar">
          <div className="articles-title-group">
            <div className="articles-watermark-wrap">
              <img
                src="/assets/LAST-NEWS.png"
                alt="LAST NEWS"
                className="articles-watermark-img"
              />
            </div>
            <h2 className="articles-section-title">جدیدترین مقالات</h2>
          </div>

          <div className="articles-nav-btns">
            <button
              className="articles-swiper-btn articles-swiper-btn-prev"
              type="button"
              aria-label="مقاله قبلی"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button
              className="articles-swiper-btn articles-swiper-btn-next"
              type="button"
              aria-label="مقاله بعدی"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </div>

        {/* Interactive Swiper Carousel */}
        <div className="articles-swiper-container">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={28}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.articles-swiper-btn-next',
              prevEl: '.articles-swiper-btn-prev',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
            }}
          >
            {articlesData.map((art, idx) => (
              <SwiperSlide key={idx} className="article-slide">
                <article className="article-interactive-card">
                  <div className="article-photo-wrap">
                    <a
                      href="#bookingDrawer"
                      className="open-booking-btn article-photo-link"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenBooking();
                      }}
                    >
                      <img
                        src={art.img}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  </div>
                  <div className="article-floating-box">
                    <div className="article-title-row">
                      <span className="article-accent-bar"></span>
                      <h3 className="article-box-title">
                        <a
                          href="#bookingDrawer"
                          className="open-booking-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenBooking();
                          }}
                        >
                          {art.title}
                        </a>
                      </h3>
                    </div>
                    <p className="article-box-excerpt">{art.excerpt}</p>
                    <div className="article-card-footer">
                      <a
                        href="#bookingDrawer"
                        className="open-booking-btn article-read-more"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenBooking();
                        }}
                      >
                        <span>مشاهده جزئیات</span>
                        <i className="fa-solid fa-arrow-left"></i>
                      </a>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
