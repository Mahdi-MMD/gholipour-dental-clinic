'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import ScrollIndicator from '@/components/ScrollIndicator';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import '@/app/about.css';

const clinicGalleryImages = [
  {
    src: '/assets/clinic-waiting-room.jpg',
    title: 'سالن انتظار و پذیرش مراجعین',
    subtitle: 'فضای انتظار آرام، ارگونومیک و مجهز به سیستم تهویه مطبوع',
    tag: 'بخش انتظار',
  },
  {
    src: '/assets/clinic-dental-unit.jpg',
    title: 'یونیت‌های تخصصی دندانپزشکی',
    subtitle: 'تجهیزات مدرن با بالاترین استانداردهای استریلیزاسیون و راحتی بیمار',
    tag: 'بخش دندانپزشکی',
  },
  {
    src: '/assets/clinic-reception.jpg',
    title: 'کانتر پذیرش و اطلاعات کلینیک',
    subtitle: 'پاسخگویی منظم و هدایت سریع بیماران با سیستم نوبت‌دهی مکانیزه',
    tag: 'پذیرش و تریاژ',
  },
  {
    src: '/assets/clinic-pharmacy.jpg',
    title: 'داروخانه مرکز',
    subtitle: 'تأمین کامل داروها و اقلام بهداشتی-درمانی مورد نیاز مراجعین',
    tag: 'داروخانه',
  },
  {
    src: '/assets/clinic-inpatient-ward.jpg',
    title: 'بخش تحت نظر و بستری موقت',
    subtitle: 'تخت‌های بستری استاندارد با مراقبت مستمر کادر درمانی و پرستاری',
    tag: 'بستری و تحت‌نظر',
  },
];

export default function AboutPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="about"
      />

      <main className="about-page-main">
        {/* Top Banner / Hero Title */}
        <section className="about-hero-banner">
          <div className="container">
            <h1 className="about-main-title">درباره ما</h1>
          </div>
        </section>

        {/* Description Section */}
        <section className="about-desc-section">
          <div className="container about-desc-container">
            <div className="about-desc-card">
              <div className="about-desc-header">
                <div className="about-desc-header-icon">
                  <i className="fa-solid fa-circle-info"></i>
                </div>
                <h2 className="about-desc-heading">
                  درباره درمانگاه تخصصی شهید قلی‌پور
                </h2>
              </div>

              <p className="about-desc-text">
                درمانگاه تخصصی شهید قلی‌پور زیباکنار از سال ۱۴۰۵ فعالیت رسمی خود را با هدف ارائه خدمات یکپارچه و ارتقای سطح سلامت عمومی آغاز کرده است. این مجموعه با تجمیع بخش‌های تخصصی شامل آزمایشگاه، داروخانه، فیزیوتراپی، رادیولوژی، دندانپزشکی و پلی‌کلینیک پزشکان متخصص در یک فضا، امکانی را فراهم آورده است تا مراجعین محترم تمامی نیازهای تشخیصی و درمانی خود را بدون نیاز به جابه‌جایی میان مراکز مختلف و با سهولت کامل دریافت نمایند.
              </p>

              <p className="about-desc-text">
                بخش دندانپزشکی این مرکز با رویکرد ارائه مراقبت‌های نوین و در دسترس، تعریفی تازه از خدمات در یک مرکز نیمه‌دولتی ایجاد کرده است. تجهیز این بخش به چهار یونیت فعال و دستگاه‌های تصویربرداری رادیوگرافی در کنار استفاده از معتبرترین متریال درمانی، ضمن ارتقای دقت تشخیصی، زمان انتظار مراجعین را به حداقل ممکن رسانده است. همچنین پیاده‌سازی سیستم نوبت‌دهی مکانیزه، پیگیری درمانی و بهره‌گیری از تجهیزات استاندارد روز دنیا، تضمین‌کننده تجربه‌ای منظم، باکیفیت و مقرون‌به‌صرفه در محیطی مدرن است.
              </p>

              {/* Highlights feature boxes */}
              <div className="about-highlights-grid">
                <div className="about-highlight-box">
                  <div className="about-highlight-icon">
                    <i className="fa-solid fa-tooth"></i>
                  </div>
                  <h3 className="about-highlight-title">۴ یونیت دندانپزشکی</h3>
                  <p className="about-highlight-desc">فعال با استانداردهای روز و کاهش حداکثری زمان انتظار مراجعین</p>
                </div>

                <div className="about-highlight-box">
                  <div className="about-highlight-icon">
                    <i className="fa-solid fa-x-ray"></i>
                  </div>
                  <h3 className="about-highlight-title">رادیوگرافی دیجیتال</h3>
                  <p className="about-highlight-desc">تصویربرداری پیشرفته در محل بدون نیاز به ارجاع به مراکز دیگر</p>
                </div>

                <div className="about-highlight-box">
                  <div className="about-highlight-icon">
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  <h3 className="about-highlight-title">خدمات جامع درمانی</h3>
                  <p className="about-highlight-desc">تجمیع آزمایشگاه، داروخانه، فیزیوتراپی و تخصص‌های دندانپزشکی</p>
                </div>

                <div className="about-highlight-box">
                  <div className="about-highlight-icon">
                    <i className="fa-solid fa-calendar-check"></i>
                  </div>
                  <h3 className="about-highlight-title">نوبت‌دهی مکانیزه</h3>
                  <p className="about-highlight-desc">سیستم نوبت‌دهی هوشمند و پیگیری مستمر روند درمان مراجعین</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Carousel Section */}
        <section className="clinic-gallery-section" id="gallery">
          <div className="container">
            <div className="section-header">
              <span className="section-watermark">GALLERY</span>
              <h2 className="section-title">تصاویر محیط درمانگاه</h2>
            </div>

            <div className="gallery-carousel-wrap">
              <Swiper
                modules={[Navigation, Autoplay]}
                slidesPerView={1}
                centeredSlides={true}
                spaceBetween={16}
                loop={true}
                speed={700}
                slideToClickedSlide={true}
                grabCursor={true}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{
                  nextEl: '.gallery-arrow-left',
                  prevEl: '.gallery-arrow-right',
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 1.8,
                    spaceBetween: 20,
                    centeredSlides: true,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                    centeredSlides: true,
                  },
                }}
                className="clinic-gallery-swiper"
              >
                {clinicGalleryImages.map((item, idx) => (
                  <SwiperSlide key={idx} className="gallery-slide">
                    <div className="gallery-card">
                      <div className="gallery-card-img-wrap">
                        <img src={item.src} alt={item.title} />
                        <div className="gallery-card-overlay">
                          <span className="gallery-card-tag">{item.tag}</span>
                          <h4 className="gallery-card-title">{item.title}</h4>
                          <p className="gallery-card-desc">{item.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Right Arrow: faces outward to the right (> in LTR, or right chevron) */}
              <button
                type="button"
                className="gallery-arrow-btn gallery-arrow-right"
                aria-label="اسلاید راست"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>

              {/* Left Arrow: faces outward to the left (< in LTR, or left chevron) */}
              <button
                type="button"
                className="gallery-arrow-btn gallery-arrow-left"
                aria-label="اسلاید چپ"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            </div>
          </div>
        </section>

        {/* Doctors Section: "پزشکان مرکز" */}
        <section className="about-doctors-section" id="doctors">
          <div className="container">
            <div className="section-header">
              <span className="section-watermark">DOCTORS</span>
              <h2 className="section-title">پزشکان مرکز</h2>
            </div>

            <div className="doctor-hybrid-showcase">
              {/* 1. Doctor Portrait Card (Right on desktop in RTL, Top on mobile) */}
              <div className="doctor-hybrid-card doctor-hybrid-portrait">
                <img
                  src="/assets/doctor-portrait.jpg"
                  alt="دکتر مهدی محمد نژاد - دکترای حرفه‌ای دندان‌پزشکی"
                  className="doctor-portrait-image"
                />
              </div>

              {/* 2. Doctor Details / Explanations Card (Left on desktop in RTL, Underneath/Bottom on mobile) */}
              <div className="doctor-hybrid-card doctor-hybrid-details">
                <h3 className="doctor-details-heading">مسئول فنی دندانپزشکی</h3>
                <ul className="doctor-details-list">
                  <li>
                    <span className="details-dot"></span>
                    <span className="details-text">دندانپزشک و مسئول فنی بخش</span>
                  </li>
                  <li>
                    <span className="details-dot"></span>
                    <span className="details-text">فارغ التحصیل از دانشگاه گیلان با معدل الف</span>
                  </li>
                  <li>
                    <span className="details-dot"></span>
                    <span className="details-text">دو گواهی ثبت اختراع و یک گواهی در دست اقدام</span>
                  </li>
                  <li>
                    <span className="details-dot"></span>
                    <span className="details-text">ثبت مقاله در ژورنال DMFR دانشگاه آکسفورد انگلستان</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenBooking={handleOpenBooking} />

      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
    </>
  );
}
