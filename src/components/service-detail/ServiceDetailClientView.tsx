'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import ScrollIndicator from '@/components/ScrollIndicator';
import { ServiceDetailData } from '@/data/servicesData';
import '@/app/services/services.css';

interface ServiceDetailClientViewProps {
  service: ServiceDetailData;
}

export default function ServiceDetailClientView({
  service,
}: ServiceDetailClientViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="service-page-main">
        {/* ====================================================
            1. HERO SECTION
            ==================================================== */}
        <section className="service-hero-section">
          <div className="service-hero-pattern"></div>
          <div className="container">
            {/* Breadcrumbs */}
            <nav className="service-breadcrumbs" aria-label="موقعیت در سایت">
              <Link href="/">صفحه اصلی</Link>
              <span className="separator">/</span>
              <a href="/#services">خدمات تخصصی</a>
              <span className="separator">/</span>
              <span className="current">{service.title}</span>
            </nav>

            <div className="service-hero-grid">
              <div className="service-hero-text">
                <span className="service-badge-pill">
                  <i className="fa-solid fa-certificate"></i>
                  {service.heroBadge}
                </span>
                <h1 className="service-hero-title">{service.heroHeadline}</h1>
                <p className="service-hero-desc">{service.heroSubheadline}</p>

                <div className="service-hero-actions">
                  <button
                    className="btn-primary open-booking-btn"
                    onClick={handleOpenBooking}
                  >
                    <i className="fa-regular fa-calendar-check"></i>
                    <span>رزرو نوبت مشاوره و معاینه</span>
                  </button>
                  <a href="tel:01333512753" className="btn-secondary-outline">
                    <i className="fa-solid fa-phone-volume"></i>
                    <span>تماس مستقیم کلینیک</span>
                  </a>
                </div>

                <div className="service-trust-features">
                  <div className="trust-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>بی‌حسی مدرن و بدون درد</span>
                  </div>
                  <div className="trust-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>اسکن سه‌بعدی و هدایت دیجیتال</span>
                  </div>
                  <div className="trust-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>پشتیبانی شبانه‌روزی پس از درمان</span>
                  </div>
                </div>
              </div>

              {/* Graphic Card */}
              <div className="service-hero-graphic-card">
                <div className="graphic-glow"></div>
                <div className="graphic-image-wrapper">
                  <Image
                    src={service.heroIllustration}
                    alt={service.title}
                    width={260}
                    height={260}
                    className="graphic-image"
                    priority
                  />
                </div>
                <div className="floating-experience-pill">
                  <i className="fa-solid fa-shield-heart"></i>
                  <span>تمرکز بر تجربه آرام و بدون استرس بیمار</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            2. PAIN & ANXIETY MANAGEMENT PROTOCOL
            ==================================================== */}
        <section className="service-section-wrap" id="pain-control">
          <div className="container">
            <div className="section-head-center">
              <span className="section-kicker">PAIN & ANXIETY CONTROL</span>
              <h2 className="section-head-title">{service.painManagementHeadline}</h2>
              <p className="section-head-lead">{service.painManagementLead}</p>
            </div>

            <div className="pain-pillars-grid">
              {service.painManagementPillars.map((pillar, idx) => (
                <div className="pain-pillar-card" key={idx}>
                  <div className="pillar-icon-box">
                    <i className={pillar.icon}></i>
                  </div>
                  <h3 className="pillar-card-title">{pillar.title}</h3>
                  <p className="pillar-card-desc">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            3. 3D DIAGNOSIS & TECH PRECISION
            ==================================================== */}
        <section className="service-section-wrap alt-bg" id="diagnosis">
          <div className="container">
            <div className="section-head-center">
              <span className="section-kicker">PRECISION DIAGNOSIS</span>
              <h2 className="section-head-title">{service.diagnosisHeadline}</h2>
              <p className="section-head-lead">{service.diagnosisLead}</p>
            </div>

            <div className="diagnosis-grid">
              {service.diagnosisFeatures.map((feat, idx) => (
                <div className="diagnosis-card" key={idx}>
                  <span className="diag-badge">{feat.badge}</span>
                  <h3 className="diag-title">{feat.title}</h3>
                  <p className="diag-desc">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            4. STEP-BY-STEP PATIENT JOURNEY TIMELINE
            ==================================================== */}
        <section className="service-section-wrap" id="journey">
          <div className="container">
            <div className="section-head-center">
              <span className="section-kicker">PATIENT JOURNEY</span>
              <h2 className="section-head-title">{service.journeyHeadline}</h2>
              <p className="section-head-lead">{service.journeyLead}</p>
            </div>

            <div className="timeline-track">
              {service.journeySteps.map((step, idx) => (
                <div className="timeline-step-row" key={idx}>
                  <div className="timeline-step-marker">{step.stepNumber}</div>
                  <div className="timeline-step-card">
                    <div className="step-card-header">
                      <h3 className="step-card-title">{step.title}</h3>
                      <span className="step-card-duration">{step.duration}</span>
                    </div>
                    <p className="step-card-summary">{step.summary}</p>
                    <ul className="step-card-list">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx}>
                          <i className="fa-solid fa-angle-left"></i>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="step-comfort-box">
                      <i className="fa-regular fa-smile"></i>
                      <span>{step.patientComfortTip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            5. FULL SUPPORT & POST-OP CARE GUARANTEE
            ==================================================== */}
        <section className="service-section-wrap alt-bg" id="aftercare">
          <div className="container">
            <div className="section-head-center">
              <span className="section-kicker">POST-OP SUPPORT & CARE</span>
              <h2 className="section-head-title">{service.supportHeadline}</h2>
              <p className="section-head-lead">{service.supportLead}</p>
            </div>

            <div className="support-cards-grid">
              {service.supportCommitments.map((item, idx) => (
                <div className="support-card" key={idx}>
                  <div className="support-icon-wrap">
                    <i className={item.icon}></i>
                  </div>
                  <h3 className="support-card-title">{item.title}</h3>
                  <p className="support-card-desc">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Quality Standards Banner */}
            <div className="quality-standard-banner">
              <div className="quality-text-col">
                <h3>{service.qualityStandardTitle}</h3>
                <p>{service.qualityStandardDesc}</p>
              </div>
              <div className="quality-list-col">
                {service.qualityHighlights.map((hl, idx) => (
                  <div className="quality-check-item" key={idx}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            6. PATIENT ANXIETY FAQS
            ==================================================== */}
        <section className="service-section-wrap" id="faq">
          <div className="container">
            <div className="section-head-center">
              <span className="section-kicker">FAQ & ANSWERS</span>
              <h2 className="section-head-title">پاسخ به سوالات و نگرانی‌های متداول شما</h2>
              <p className="section-head-lead">
                شفافیت بالینی اصل اول ماست. در اینجا به رایج‌ترین پرسش‌های مراجعین پیش از درمان پاسخ داده‌ایم:
              </p>
            </div>

            <div className="service-faq-container">
              {service.faqs.map((faq, idx) => (
                <div className="service-faq-item" key={idx}>
                  <button
                    type="button"
                    className="service-faq-question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={openFaqIndex === idx}
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`service-faq-icon ${
                        openFaqIndex === idx ? 'open' : ''
                      }`}
                    >
                      <i className="fa-solid fa-angle-down"></i>
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <div className="service-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            7. CONVERSION CTA BANNER
            ==================================================== */}
        <section className="container">
          <div className="service-cta-banner">
            <h3>آماده بازگرداندن لبخند کامل و لذت جویدن بدون درد هستید؟</h3>
            <p>
              برای بررسی وضعیت فک و دریافت مشاوره تخصصی از دکتر قلی‌پور، همین حالا نوبت خود را آنلاین ثبت کنید یا با شماره کلینیک تماس بگیرید.
            </p>
            <div className="service-cta-buttons">
              <button
                type="button"
                className="btn-cta-white"
                onClick={handleOpenBooking}
              >
                <i className="fa-regular fa-calendar-check"></i>
                <span>رزرو نوبت مشاوره حضوری</span>
              </button>
              <a href="tel:01333512753" className="btn-cta-phone">
                <i className="fa-solid fa-phone-volume"></i>
                <span>تماس مستقیم: ۰۱۳-۳۳۵۱۲۷۵۳</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenBooking={handleOpenBooking} />
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={service.serviceKey}
      />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
    </>
  );
}
