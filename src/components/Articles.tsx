'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ARTICLES_DATA } from '@/data/articlesData';

import 'swiper/css';
import 'swiper/css/navigation';

interface ArticlesProps {
  onOpenBooking?: () => void;
}

export default function Articles({ onOpenBooking }: ArticlesProps) {
  // Always select the 5 most recent articles
  const latestArticles = React.useMemo(() => {
    return [...ARTICLES_DATA].slice(-5).reverse();
  }, []);

  return (
    <section className="articles-section" id="articles">
      <div className="container">
        {/* Section Header with Watermark and Carousel Navigation Arrows */}
        <div className="articles-header-bar">
          <div className="articles-title-group">
            <div className="articles-watermark-wrap">
              <Image
                src="/assets/LAST-NEWS.webp"
                alt="LAST NEWS"
                className="articles-watermark-img"
                width={210}
                height={42}
                loading="eager"
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
            {latestArticles.map((art) => {
              const articleHref = `/articles/${art.slug}`;
              const imageSrc = art.image || '/assets/article-implant-care.webp';
              const displayTitle = art.seoTitle || art.title;
              const excerptText = art.tldr || art.summary;

              return (
                <SwiperSlide key={art.id || art.slug} className="article-slide">
                  <article className="article-interactive-card">
                    <div className="article-photo-wrap">
                      <Link
                        href={articleHref}
                        className="article-photo-link"
                      >
                        <Image
                          src={imageSrc}
                          alt={art.imageAlt || displayTitle}
                          width={600}
                          height={420}
                          loading="eager"
                        />
                      </Link>
                    </div>
                    <div className="article-floating-box">
                      <div className="article-title-row">
                        <span className="article-accent-bar"></span>
                        <h3 className="article-box-title">
                          <Link href={articleHref} title={art.title}>
                            {displayTitle}
                          </Link>
                        </h3>
                      </div>
                      <p className="article-box-excerpt">{excerptText}</p>
                      <div className="article-card-footer">
                        <Link
                          href={articleHref}
                          className="article-read-more"
                        >
                          <span>مشاهده جزئیات</span>
                          <i className="fa-solid fa-arrow-left"></i>
                        </Link>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
