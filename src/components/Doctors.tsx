'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCards } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';

const doctorsData = [
  {
    name: 'دکتر فاطمه حیدری',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-heydari.webp',
  },
  {
    name: 'دکتر مهدی محمدنژاد',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-mohammadnezhad.webp',
  },
  {
    name: 'دکتر امیرحسین پورقاسم',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-pourghasem.webp',
  },
  {
    name: 'دکتر فاطمه حیدری',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-heydari.webp',
  },
  {
    name: 'دکتر مهدی محمدنژاد',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-mohammadnezhad.webp',
  },
  {
    name: 'دکتر امیرحسین پورقاسم',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-pourghasem.webp',
  },
];

export default function Doctors() {
  return (
    <section className="doctors-section" id="doctors">
      <div className="container">
        <div className="section-header">
          <span className="section-watermark">OUR TEAM</span>
          <h2 className="section-title">پزشکان کلینیک قلی‌پور</h2>
        </div>

        {/* Mobile View: Cards Swiper Effect */}
        <div className="doctors-cards-wrap-mobile">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards, Autoplay, Navigation]}
            loop={true}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.doctor-mobile-arrow-left',
              prevEl: '.doctor-mobile-arrow-right',
            }}
            className="doctors-cards-swiper"
          >
            {doctorsData.map((doc, idx) => (
              <SwiperSlide key={idx} className="doctor-cards-slide">
                <div className="doctor-cards-item">
                  <Image
                    src={doc.img}
                    alt={`${doc.name} - ${doc.title}`}
                    width={469}
                    height={512}
                    priority={idx === 0}
                  />
                  <div className="doctor-card-bottom-spacer" aria-hidden="true" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="doctor-mobile-nav">
            <button
              type="button"
              className="doctor-arrow-btn doctor-mobile-arrow-right"
              aria-label="پزشک بعدی"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <button
              type="button"
              className="doctor-arrow-btn doctor-mobile-arrow-left"
              aria-label="پزشک قبلی"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet View: Classic Carousel */}
        <div className="doctors-carousel-wrap doctors-carousel-wrap-desktop">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1.8}
            centeredSlides={true}
            spaceBetween={20}
            loop={true}
            speed={600}
            slideToClickedSlide={true}
            grabCursor={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.doctor-arrow-left',
              prevEl: '.doctor-arrow-right',
            }}
            breakpoints={{
              1024: {
                slidesPerView: 3,
                spaceBetween: 26,
                centeredSlides: true,
              },
            }}
            className="doctors-swiper center-carousel"
          >
            {doctorsData.map((doc, idx) => (
              <SwiperSlide key={idx} className="doctor-slide">
                <div className="doctor-card">
                  <Image
                    src={doc.img}
                    alt={`${doc.name} - ${doc.title}`}
                    width={469}
                    height={512}
                    loading="eager"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right Arrow: faces outward to the right */}
          <button
            type="button"
            className="doctor-arrow-btn doctor-arrow-right"
            aria-label="پزشک بعدی"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          {/* Left Arrow: faces outward to the left */}
          <button
            type="button"
            className="doctor-arrow-btn doctor-arrow-left"
            aria-label="پزشک قبلی"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
