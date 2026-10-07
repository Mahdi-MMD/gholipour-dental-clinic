'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ServicesProps {
  onOpenBooking: (serviceName?: string) => void;
}

type ServiceTab =
  | 'root-canal'
  | 'restoration'
  | 'crown'
  | 'composite-laminate'
  | 'denture'
  | 'implant';

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
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="عصب کشی"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/عصب-کشی.png"
                className="pill-fg"
                alt="عصب کشی"
                width={54}
                height={54}
                loading="eager"
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
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="ترمیم"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ترمیم-4.png"
                className="pill-fg"
                alt="ترمیم"
                width={54}
                height={54}
                loading="eager"
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
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="روکش"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="/assets/icons/crown.svg"
                className="pill-fg"
                alt="روکش"
                width={54}
                height={54}
                loading="eager"
              />
            </div>
            <span className="pill-title">روکش دندان</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'composite-laminate' ? 'active' : ''}`}
            onClick={() => setActiveTab('composite-laminate')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="کامپوزیت"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="/assets/icons/composite-smile.svg"
                className="pill-fg"
                alt="کامپوزیت"
                width={54}
                height={54}
                loading="eager"
              />
            </div>
            <span className="pill-title">کامپوزیت</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'denture' ? 'active' : ''}`}
            onClick={() => setActiveTab('denture')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="دندان مصنوعی"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="/assets/icons/denture-prosthesis.svg"
                className="pill-fg"
                alt="دندان مصنوعی"
                width={54}
                height={54}
                loading="eager"
              />
            </div>
            <span className="pill-title">دندان مصنوعی</span>
          </div>

          <div
            className={`service-pill ${activeTab === 'implant' ? 'active' : ''}`}
            onClick={() => setActiveTab('implant')}
            role="button"
            tabIndex={0}
          >
            <div className="pill-icon-box">
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/درمان-ربشه-3.png"
                className="pill-bg"
                alt="ایمپلنت"
                width={82}
                height={82}
                loading="eager"
              />
              <Image
                src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ایمپلنت-5.png"
                className="pill-fg"
                alt="ایمپلنت"
                width={54}
                height={54}
                loading="eager"
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
                  کلینیک دندانپزشکی قلی‌پور، کاشت ایمپلنت با استفاده از تجهیزات
                  پیشرفته و برندهای معتبر جهانی و توسط تیمی مجرب انجام می‌شود.
                  این فرایند با بی‌حسی موضعی مدرن بدون درد صورت می‌گیرد تا
                  تجربه‌ای امن، راحت و موفق را برای مراجعین فراهم آورد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('ایمپلنت دندان')}
                >
                  رزرو نوبت ایمپلنت
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ایمپلنت-5.png"
                  alt="ایمپلنت"
                  width={220}
                  height={220}
                  loading="eager"
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
                  طبیعی دندان‌های آسیب‌دیده. در کلینیک دندانپزشکی قلی‌پور، این خدمات
                  با مواد همرنگ دندان کامپوزیتی و سرامیکی با دوام بسیار بالا و
                  با ظرافت میکروسکوپی ارائه می‌شود تا زیبایی لبخند شما کاملاً حفظ
                  گردد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('ترمیم دندان')}
                >
                  رزرو نوبت ترمیم
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/ترمیم-4.png"
                  alt="ترمیم"
                  width={220}
                  height={220}
                  loading="eager"
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
                  از عصب‌کشی استفاده می‌شوند. در کلینیک دندانپزشکی قلی‌پور از روکش‌های مدرن
                  زیرکونیوم و E-max بدون لبه تیره با تطابق رنگی ۱۰۰٪ طبیعی با
                  دندان‌های مجاور استفاده می‌گردد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('روکش دندان')}
                >
                  رزرو نوبت روکش
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="/assets/icons/crown.svg"
                  alt="روکش دندان"
                  width={220}
                  height={220}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Tab 4: Composite & Laminate */}
          <div
            className={`service-tab-content ${activeTab === 'composite-laminate' ? 'active' : ''}`}
            id="tab-composite-laminate"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">
                  ونیر کامپوزیت و لمینت
                </h3>
                <p>
                  اصلاح طرح لبخند با ونیر کامپوزیت و لمینت‌های فوق‌نازک سرامیکی،
                  ظاهری یکدست، شفاف و درخشان به دندان‌ها می‌بخشد. در کلینیک
                  دندانپزشکی قلی‌پور با رعایت دقیق تناسبات طلایی چهره، فرم لثه
                  و بدون تراش یا با حداقل تراش ممکن، لبخندی طبیعی و متناسب با چهره
                  شما خلق می‌گردد.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('ونیر کامپوزیت و لمینت')}
                >
                  رزرو نوبت کامپوزیت و لمینت
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="/assets/icons/composite-smile.svg"
                  alt="ونیر کامپوزیت و لمینت"
                  width={220}
                  height={220}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Tab 5: Denture / Prosthetics */}
          <div
            className={`service-tab-content ${activeTab === 'denture' ? 'active' : ''}`}
            id="tab-denture"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">
                  پروتز متحرک و دندان مصنوعی
                </h3>
                <p>
                  پروتزهای دندانی متحرک (دست دندان کامل و پارسیل) راه‌حلی کارآمد و
                  مقرون‌به‌صرفه برای بازیابی قدرت جویدن، تکلم طبیعی و چهره‌ای شاداب
                  هستند. در کلینیک قلی‌پور انواع پروتزهای ژله‌ای (فلکسیبل)، کروم
                  کبالت و اوردنچر با تطابق بالا و حداکثر راحتی ساخته می‌شوند.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('پروتز و دندان مصنوعی')}
                >
                  رزرو نوبت دندان مصنوعی
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="/assets/icons/denture-prosthesis.svg"
                  alt="دندان مصنوعی"
                  width={220}
                  height={220}
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Tab 6: Root Canal */}
          <div
            className={`service-tab-content ${activeTab === 'root-canal' ? 'active' : ''}`}
            id="tab-root-canal"
          >
            <div className="service-tab-body">
              <div className="service-tab-text">
                <h3 className="service-tab-title">عصب‌کشی تخصصی و بدون درد</h3>
                <p>
                  عصب‌کشی روشی برای نجات دندان و حذف عفونت پالپ است. کلینیک
                  دندانپزشکی قلی‌پور با سیستم‌های روتاری مدرن و دستگاه‌های اپکس
                  لوکیتور دیجیتال، درمان ریشه دندان را در کوتاه‌ترین زمان و
                  کاملاً بدون درد به انجام می‌رساند.
                </p>
                <button
                  className="btn-primary open-booking-btn"
                  onClick={() => onOpenBooking('عصب‌کشی دندان')}
                >
                  رزرو نوبت عصب‌کشی
                </button>
              </div>
              <div className="service-tab-graphic">
                <Image
                  src="https://qafdentalclinic.com/wp-content/uploads/2025/08/عصب-کشی.png"
                  alt="عصب کشی"
                  width={220}
                  height={220}
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
