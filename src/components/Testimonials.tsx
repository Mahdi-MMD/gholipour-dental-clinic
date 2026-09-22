'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Testimonial {
  text: string;
}

const testimonialsData: Testimonial[] = [
  {
    text: 'سلام آقای دکتر محمدنژاد، خدا قوت و خسته نباشید میگم به شما و تیم حرفه‌ای کلینیک قلی‌پور. واقعاً واقعاً ایمپلنت درد نداره، من که یک ذره درد حس نکردم و خیلی راضیم. پیشنهاد می‌کنم به همه که کار دندانپزشکی و ایمپلنت رو پیش شما تجربه کنن.',
  },
  {
    text: 'من به کار کلینیک قلی‌پور، آقای دکتر محمدنژاد و آقای دکتر پورقاسم و کادر عالیشون ایمان دارم. بسیار محیط تمیز، جدید و به روز و واقعاً درمان بدون درد. موفق و موید و سلامت باشید عزیزان.',
  },
  {
    text: 'با اختلاف بهترین کلینیک و بهترین دندانپزشک. چه از نظر تخصص و مهارت و چه از نظر اخلاق کاری و برخورد کادر، صمیمانه از آقای دکتر پورقاسم و مجموعه کلینیک قلی‌پور سپاسگزارم و بهترین‌ها رو براشون آرزو می‌کنم. موفق‌تر از همیشه باشید.',
  },
  {
    text: 'برای کامپوزیت و طراحی لبخند پیش آقای دکتر محمدنژاد رفتم. نتیجه کار فوق‌العاده طبیعی و دقیق شد و اصلاً حس دندان مصنوعی نمیده. از اخلاق حرفه‌ای، دقت و حوصله ایشون و کادر درمان واقعاً سپاسگزارم.',
  },
  {
    text: 'همیشه از عصب‌کشی و دندانپزشکی ترس شدیدی داشتم ولی با مهارت و دست سبک آقای دکتر پورقاسم و تجهیزات پیشرفته کلینیک قلی‌پور اصلاً متوجه درد نشدم. به همه دوستان و خانواده توصیه‌شون کردم.',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = testimonialsData.length;
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Auto slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3800);
    return () => clearInterval(timer);
  }, [total]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || e.touches.length === 0) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 40) {
      handlePrev();
      startYRef.current = null;
    } else if (deltaY < -40) {
      handleNext();
      startYRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY;
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || startYRef.current === null) return;
    const deltaY = e.clientY - startYRef.current;
    if (deltaY > 40) {
      handlePrev();
      startYRef.current = null;
      isDraggingRef.current = false;
    } else if (deltaY < -40) {
      handleNext();
      startYRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    startYRef.current = null;
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container testimonials-wrapper">
        {/* Right Column: Title & COMMENTS Watermark */}
        <div className="testimonials-header-col">
          <div className="testimonials-watermark-wrap">
            <img
              src="/assets/COMMENTS.png"
              alt="COMMENTS"
              className="testimonials-watermark-img"
            />
          </div>
          <h2 className="testimonials-title">نظرات مراجعین</h2>
        </div>

        {/* Left Column: Vertical Carousel */}
        <div className="vertical-carousel-section">
          <div
            className="vertical-carousel-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {testimonialsData.map((item, idx) => {
              let posClass = '';
              if (idx === currentIndex) {
                posClass = 'active';
              } else if (idx === (currentIndex - 1 + total) % total) {
                posClass = 'prev';
              } else if (idx === (currentIndex + 1) % total) {
                posClass = 'next';
              }

              return (
                <div
                  key={idx}
                  className={`vertical-carousel-item ${posClass}`}
                  data-index={idx}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <div className="v-card-inner">
                    <div className="v-card-header">
                      <div className="v-card-avatar">
                        <img
                          src="/assets/user-avatar.png"
                          alt="مراجع کلینیک قلی‌پور"
                        />
                      </div>
                      <div className="v-card-meta">
                        <span className="v-card-name">مراجع کلینیک قلی‌پور</span>
                        <div className="v-card-stars">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                        </div>
                      </div>
                    </div>
                    <div className="v-card-body">
                      <p className="v-card-text">{item.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="carousel-dots">
            {testimonialsData.map((_, idx) => (
              <div
                key={idx}
                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
