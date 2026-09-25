'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

const doctorsData = [
  {
    name: 'دکتر فاطمه حیدری',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-heydari.jpg',
  },
  {
    name: 'دکتر مهدی محمد نژاد',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-mohammadnezhad.jpg',
  },
  {
    name: 'دکتر امیرحسین پورقاسم',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-pourghasem.jpg',
  },
  {
    name: 'دکتر فاطمه حیدری',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-heydari.jpg',
  },
  {
    name: 'دکتر مهدی محمد نژاد',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-mohammadnezhad.jpg',
  },
  {
    name: 'دکتر امیرحسین پورقاسم',
    title: 'دکترای حرفه‌ای دندان‌پزشکی',
    img: '/assets/doctor-pourghasem.jpg',
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

        <div className="doctors-carousel-wrap">
          <Swiper
            modules={[Navigation, Autoplay]}
            slidesPerView={1.15}
            centeredSlides={true}
            spaceBetween={14}
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
              nextEl: '.doctor-next',
              prevEl: '.doctor-prev',
            }}
            breakpoints={{
              640: {
                slidesPerView: 1.8,
                spaceBetween: 20,
                centeredSlides: true,
              },
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
                  <img
                    src={doc.img}
                    alt={`${doc.name} - ${doc.title}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className="swiper-button-prev doctor-prev"
            aria-label="پزشک قبلی"
          ></div>
          <div
            className="swiper-button-next doctor-next"
            aria-label="پزشک بعدی"
          ></div>
        </div>
      </div>
    </section>
  );
}
