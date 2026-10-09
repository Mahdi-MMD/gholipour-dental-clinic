'use client';

import React, { useEffect, useState } from 'react';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(
    service.slug === 'implant' ? null : 0,
  );

  useEffect(() => {
    if (service.slug !== 'implant') return;

    const frame = window.requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>('.service-page-implant .mobile-card-rail')
        .forEach((rail) => {
          const middleCard = rail.children[
            Math.floor(rail.children.length / 2)
          ] as HTMLElement | undefined;
          if (!middleCard) return;

          const railRect = rail.getBoundingClientRect();
          const cardRect = middleCard.getBoundingClientRect();
          const offset =
            cardRect.left + cardRect.width / 2 - (railRect.left + railRect.width / 2);
          rail.scrollLeft += offset;
        });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [service.slug]);

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

      <main className={`service-page-main service-page-${service.slug}`}>
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
                  <i className="fa-solid fa-cube" aria-hidden="true"></i>
                  {service.heroBadge}
                </span>
                <h1 className="service-hero-title">
                  <span>{service.heroHeadline}</span>
                  {service.heroHeadlineAccent && (
                    <span className="service-hero-title-accent">
                      {service.heroHeadlineAccent}
                    </span>
                  )}
                </h1>
                <p className="service-hero-desc">{service.heroSubheadline}</p>

                <div className="service-hero-actions">
                  <button
                    type="button"
                    className="btn-primary open-booking-btn"
                    onClick={handleOpenBooking}
                  >
                    <i className="fa-regular fa-calendar-check" aria-hidden="true"></i>
                    <span>رزرو جلسه مشاوره</span>
                  </button>
                  <a
                    href="tel:01333512753"
                    className="service-hero-call-link"
                    aria-label="تماس با کلینیک قلی‌پور با شماره ۰۱۳-۳۳۵۱۲۷۵۳"
                  >
                    <i className="fa-solid fa-phone-volume" aria-hidden="true"></i>
                    <span>تماس مستقیم کلینیک</span>
                  </a>
                </div>
              </div>

              <div className="service-hero-graphic-card" aria-hidden="true">
                <div className="implant-hero-dot-pattern"></div>
                <div className="implant-hero-orbit implant-hero-orbit-outer"></div>
                <div className="implant-hero-orbit implant-hero-orbit-inner"></div>
                <div className="implant-hero-orbit implant-hero-orbit-accent"></div>
                <span className="implant-hero-node implant-hero-node-top"></span>
                <span className="implant-hero-node implant-hero-node-bottom"></span>
                <div className="graphic-image-wrapper">
                  <Image
                    src={service.heroIllustration}
                    alt="نمای سه‌بعدی ایمپلنت دندان در استخوان فک"
                    width={700}
                    height={600}
                    className="graphic-image modern-implant-img"
                    priority
                  />
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
              <h2 className="section-head-title">
                <span className="desktop-copy">{service.painManagementHeadline}</span>
                <span className="mobile-copy">
                  {service.mobilePainManagementHeadline ?? service.painManagementHeadline}
                </span>
              </h2>
              <p className="section-head-lead">
                <span className="lead-desktop">{service.painManagementLead}</span>
                <span className="lead-mobile">
                  {service.mobilePainManagementLead ?? service.painManagementLead}
                </span>
              </p>
            </div>

            <div
              className="pain-pillars-grid mobile-card-rail"
              role="region"
              aria-label="روش‌های کنترل درد و اضطراب"
              tabIndex={0}
            >
              {service.painManagementPillars.map((pillar, idx) => (
                <div className="pain-pillar-card" key={idx}>
                  <div className="pillar-icon-box">
                    <i className={pillar.icon}></i>
                  </div>
                  <h3 className="pillar-card-title">
                    <span className="desktop-copy">{pillar.title}</span>
                    <span className="mobile-copy">
                      {pillar.mobileTitle ?? pillar.title}
                    </span>
                  </h3>
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
              <h2 className="section-head-title">
                <span className="desktop-copy">{service.diagnosisHeadline}</span>
                <span className="mobile-copy">
                  {service.mobileDiagnosisHeadline ?? service.diagnosisHeadline}
                </span>
              </h2>
              <p className="section-head-lead">
                <span className="lead-desktop">{service.diagnosisLead}</span>
                <span className="lead-mobile">
                  {service.mobileDiagnosisLead ?? service.diagnosisLead}
                </span>
              </p>
            </div>

            <div
              className="diagnosis-grid mobile-card-rail"
              role="region"
              aria-label="روش‌های تشخیص و برنامه‌ریزی دیجیتال"
              tabIndex={0}
            >
              {service.diagnosisFeatures.map((feat, idx) => (
                <div className="diagnosis-card" key={idx}>
                  <div className="pillar-icon-box" aria-hidden="true">
                    <i className={feat.icon}></i>
                  </div>
                  <h3 className="diag-title">
                    <span className="desktop-copy">{feat.title}</span>
                    <span className="mobile-copy">
                      {feat.mobileTitle ?? feat.title}
                    </span>
                  </h3>
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
              <h2 className="section-head-title">
                <span className="desktop-copy">{service.journeyHeadline}</span>
                <span className="mobile-copy">
                  {service.mobileJourneyHeadline ?? service.journeyHeadline}
                </span>
              </h2>
              <p className="section-head-lead">
                <span className="lead-desktop">{service.journeyLead}</span>
                <span className="lead-mobile">
                  {service.mobileJourneyLead ?? service.journeyLead}
                </span>
              </p>
            </div>

            <div className="timeline-track">
              {service.journeySteps.map((step, idx) => (
                <div className="timeline-step-row" key={idx}>
                  <div className="timeline-step-marker">{step.stepNumber}</div>
                  <div className="timeline-step-card">
                    <div className="step-card-header">
                      <h3 className="step-card-title">
                        <span className="desktop-copy">{step.title}</span>
                        <span className="mobile-copy">
                          {step.mobileTitle ?? step.title}
                        </span>
                      </h3>
                      <span className="step-card-duration">{step.duration}</span>
                    </div>
                    <p className="step-card-summary">{step.summary}</p>
                    <div className="timeline-desktop-details">
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
                    <details className="timeline-mobile-details">
                      <summary>جزئیات و نکته مراقبتی</summary>
                      <ul className="step-card-list">
                        {step.details.map((detail, dIdx) => (
                          <li key={dIdx}>
                            <i className="fa-solid fa-angle-left" aria-hidden="true"></i>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="step-comfort-box">
                        <i className="fa-regular fa-smile" aria-hidden="true"></i>
                        <span>{step.patientComfortTip}</span>
                      </div>
                    </details>
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
              <h2 className="section-head-title">
                <span className="desktop-copy">{service.supportHeadline}</span>
                <span className="mobile-copy">
                  {service.mobileSupportHeadline ?? service.supportHeadline}
                </span>
              </h2>
              <p className="section-head-lead">
                <span className="lead-desktop">{service.supportLead}</span>
                <span className="lead-mobile">
                  {service.mobileSupportLead ?? service.supportLead}
                </span>
              </p>
            </div>

            <div
              className="support-cards-grid mobile-card-rail"
              role="region"
              aria-label="پشتیبانی و مراقبت پس از درمان"
              tabIndex={0}
            >
              {service.supportCommitments.map((item, idx) => (
                <div className="support-card" key={idx}>
                  <div className="support-icon-wrap">
                    <i className={item.icon}></i>
                  </div>
                  <h3 className="support-card-title">
                    <span className="desktop-copy">{item.title}</span>
                    <span className="mobile-copy">
                      {item.mobileTitle ?? item.title}
                    </span>
                  </h3>
                  <p className="support-card-desc">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Quality Standards Banner */}
            <div className="quality-standard-banner">
              <div className="quality-text-col">
                <h3>
                  <span className="desktop-copy">{service.qualityStandardTitle}</span>
                  <span className="mobile-copy">
                    {service.mobileQualityStandardTitle ?? service.qualityStandardTitle}
                  </span>
                </h3>
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
              <h2 className="section-head-title">
                <span className="desktop-copy">پاسخ به سوالات و نگرانی‌های متداول شما</span>
                <span className="mobile-copy">پرسش‌های رایج ایمپلنت</span>
              </h2>
              <p className="section-head-lead">
                <span className="lead-desktop">
                  شفافیت بالینی اصل اول ماست. در اینجا به رایج‌ترین پرسش‌های مراجعین پیش از درمان پاسخ داده‌ایم:
                </span>
                <span className="lead-mobile">
                  پاسخ پرسش‌های رایج درباره درد، نقاهت، هزینه و ماندگاری ایمپلنت.
                </span>
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
            <h3>
              <span className="desktop-copy">آماده بازگرداندن لبخند کامل و جویدن بدون درد هستید؟</span>
              <span className="mobile-copy">برای شروع ایمپلنت آماده‌اید؟</span>
            </h3>
            <p>
              برای بررسی وضعیت فک و دریافت مشاوره تخصصی در کلینیک دندانپزشکی قلی‌پور، همین حالا نوبت خود را آنلاین ثبت کنید یا با شماره کلینیک تماس بگیرید.
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
                <span>تماس مستقیم: ۰۱۳۳۳۵۱۲۷۵۳</span>
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
