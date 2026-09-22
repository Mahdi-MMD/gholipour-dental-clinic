'use client';

import React, { useState } from 'react';

interface ServicesProps {
  onOpenBooking: () => void;
}

type ServiceTab = 'root-canal' | 'restoration' | 'crown' | 'implant';

export default function Services({ onOpenBooking }: ServicesProps) {
  const [activeTab, setActiveTab] = useState<ServiceTab>('implant');

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-header">
          <span className="section-watermark">SERVICES</span>
          <h2 className="section-title">خدمات تخصصی</h2>
        </div>

        {/* Service Icons Selector */}
        <div className="services-pills">
          <div
            className={`service-pill ${activeTab === 'root-canal' ? 'active' : ''}`}
            onClick={() => setActiveTab('root-canal')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="عصب کشی"
              />
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/عصب-کشی.png"
                className="pill-fg"
                alt="عصب کشی"
              />
            </div>
            <span className="pill-title">عصب کشی</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'restoration' ? 'active' : ''}`}
            onClick={() => setActiveTab('restoration')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="ترمیم"
              />
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ترمیم-4.png"
                className="pill-fg"
                alt="ترمیم"
              />
            </div>
            <span className="pill-title">ترمیم دندان</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'crown' ? 'active' : ''}`}
            onClick={() => setActiveTab('crown')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="روکش"
              />
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/روکش-6.png"
                className="pill-fg"
                alt="روکش"
              />
            </div>
            <span className="pill-title">روکش دندان</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'implant' ? 'active' : ''}`}
            onClick={() => setActiveTab('implant')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="ایمپلنت"
              />
              <img
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ایمپلنت-5.png"
                className="pill-fg"
                alt="ایمپلنت"
              />
            </div>
            <span className="pill-title">کاشت ایمپلنت</span>
          </div>
        </div>

        {/* Services Content Cards */}
        <div className="services-tab-container">
          {/* Tab 1: Implant */}
          <div
            className={`service-tab-content ${activeTab === 'implant' ? 'active' : ''}`}
            id="tab-implant"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">ایمپلنت دندان دیجیتال</h3>
                <p>
                  ایمپلنت دندان یکی از مطمئن‌ترین روش‌ها برای جایگزینی دندان از
                  دست‌رفته است که لبخند طبیعی و عملکرد فک را بازمی‌گرداند. در
                  کلینیک تخصصی قلی‌پور، کاشت ایمپلنت با استفاده از تجهیزات
                  پیشرفته و برندهای معتبر جهانی و توسط تیمی مجرب انجام می‌شود.
                  این فرایند با بی‌حسی موضعی مدرن بدون درد صورت می‌گیرد تا
                  تجربه‌ای امن، راحت و موفق را برای مراجعین فراهم آورد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={onOpenBooking}
                >
                  رزرو نوبت ایمپلنت
                </button>
              </div>
              <div className="service-tab-graphic">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ایمپلنت-5.png"
                  alt="ایمپلنت"
                />
              </div>
            </div>
          </div>

          {/* Tab 2: Restoration */}
          <div
            className={`service-tab-content ${activeTab === 'restoration' ? 'active' : ''}`}
            id="tab-restoration"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">ترمیم و زیبایی دندان</h3>
                <p>
                  ترمیم دندان روشی است برای بازگرداندن سلامت، استحکام و ظاهر
                  طبیعی دندان‌های آسیب‌دیده. در کلینیک تخصصی قلی‌پور، این خدمات
                  با مواد همرنگ دندان کامپوزیتی و سرامیکی با دوام بسیار بالا و
                  با ظرافت میکروسکوپی ارائه می‌شود تا زیبایی لبخند شما کاملاً حفظ
                  گردد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={onOpenBooking}
                >
                  رزرو نوبت ترمیم
                </button>
              </div>
              <div className="service-tab-graphic">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ترمیم-4.png"
                  alt="ترمیم"
                />
              </div>
            </div>
          </div>

          {/* Tab 3: Crown */}
          <div
            className={`service-tab-content ${activeTab === 'crown' ? 'active' : ''}`}
            id="tab-crown"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">
                  روکش‌های تمام سرامیک و زیرکونیا
                </h3>
                <p>
                  روکش‌های دندانی برای محافظت و احیای دندان‌های آسیب‌دیده و پس
                  از عصب‌کشی استفاده می‌شوند. در کلینیک قلی‌پور از روکش‌های مدرن
                  زیرکونیوم و E-max بدون لبه تیره با تطابق رنگی ۱۰۰٪ طبیعی با
                  دندان‌های مجاور استفاده می‌گردد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={onOpenBooking}
                >
                  رزرو نوبت روکش
                </button>
              </div>
              <div className="service-tab-graphic">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/روکش-6.png"
                  alt="روکش"
                />
              </div>
            </div>
          </div>

          {/* Tab 4: Root Canal */}
          <div
            className={`service-tab-content ${activeTab === 'root-canal' ? 'active' : ''}`}
            id="tab-root-canal"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">عصب‌کشی تخصصی و بدون درد</h3>
                <p>
                  عصب‌کشی روشی برای نجات دندان و حذف عفونت پالپ است. کلینیک
                  تخصصی قلی‌پور با سیستم‌های روتاری مدرن و دستگاه‌های اپکس
                  لوکیتور دیجیتال، درمان ریشه دندان را در کوتاه‌ترین زمان و
                  کاملاً بدون درد به انجام می‌رساند.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={onOpenBooking}
                >
                  رزرو نوبت عصب‌کشی
                </button>
              </div>
              <div className="service-tab-graphic">
                <img
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/عصب-کشی.png"
                  alt="عصب کشی"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
