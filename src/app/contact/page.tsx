'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';

export default function ContactPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', phone: '', subject: '', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    }, 400);
  };

  const googleMapsUrl = 'https://www.google.com/maps/@37.4368492,49.8711579,18.72z?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D';
  const googleMapsEmbed = 'https://maps.google.com/maps?q=37.4368492,49.8711579&z=17&output=embed';

  return (
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="contact"
      />

      <main className="contact-subpage">
        {/* Page Header / Hero Banner */}
        <section className="contact-banner">
          <div className="container">
            <div className="contact-banner-content">
              <h1 className="contact-banner-title">تماس با ما</h1>
            </div>
          </div>
        </section>

        {/* Main Content: Form & Info Cards + Map */}
        <section className="contact-content-section">
          <div className="container">
            <div className="contact-grid">
              
              {/* Right Side: Contact Form */}
              <div className="contact-form-column">
                <div className="contact-form-card">
                  <div className="form-header">
                    <h2 className="form-title">تماس با ما</h2>
                    <p className="form-subtitle">
                      پیام شما می‌تواند شروع یک مکالمه سازنده باشد
                    </p>
                  </div>

                  {formSubmitted ? (
                    <div className="contact-success-box">
                      <div className="success-icon">
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                      <h3>پیام شما با موفقیت ثبت شد!</h3>
                      <p>
                        از همراهی شما متشکریم. کارشناسان کلینیک تخصصی دندانپزشکی قلی‌پور به زودی با شما تماس خواهند گرفت.
                      </p>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setFormSubmitted(false)}
                      >
                        ارسال پیام جدید
                      </button>
                    </div>
                  ) : (
                    <form className="contact-form-inner" onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="contact-name">نام و نام خانوادگی</label>
                        <input
                          type="text"
                          id="contact-name"
                          name="name"
                          required
                          placeholder="نام خود را وارد کنید"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-phone">شماره تماس</label>
                        <input
                          type="tel"
                          id="contact-phone"
                          name="phone"
                          required
                          dir="ltr"
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-subject">موضوع پیام</label>
                        <input
                          type="text"
                          id="contact-subject"
                          name="subject"
                          required
                          placeholder="موضوع پیام خود را وارد کنید"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-message">متن پیام</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          required
                          placeholder="توضیحات را وارد کنید"
                          value={formData.message}
                          onChange={handleChange}
                        ></textarea>
                      </div>

                      <button type="submit" className="btn-primary contact-submit-btn">
                        <span>ارسال پیام</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Left Side: Contact Information Cards & Map */}
              <div className="contact-info-column">
                
                {/* Info Cards Grid */}
                <div className="contact-cards-list">
                  
                  {/* Card 1: Address */}
                  <div className="contact-info-card address-card">
                    <div className="card-icon-wrapper">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div className="card-details">
                      <h3 className="card-title">آدرس کلینیک</h3>
                      <p className="card-text">
                        گیلان، زیباکنار، جنب پل، پایین تر از پاسگاه نیرو انتظامی
                      </p>
                    </div>
                  </div>

                  {/* Row 1: Phone Numbers (Landline & Mobile) */}
                  <div className="contact-phones-row">
                    {/* Card 2: Landline (Red Box) */}
                    <a href="tel:01333512753" className="contact-info-card interactive-card">
                      <div className="card-icon-wrapper">
                        <i className="fa-solid fa-phone"></i>
                      </div>
                      <div className="card-details">
                        <h3 className="card-title">تلفن ثابت</h3>
                        <p className="card-text phone-number" dir="ltr">
                          ۰۱۳-۳۳۵۱۲۷۵۳
                        </p>
                      </div>
                    </a>

                    {/* Card 3: Mobile Contact (Green Box) */}
                    <a href="tel:09166264776" className="contact-info-card interactive-card">
                      <div className="card-icon-wrapper">
                        <i className="fa-solid fa-phone-volume"></i>
                      </div>
                      <div className="card-details">
                        <h3 className="card-title">تلفن تماس</h3>
                        <p className="card-text phone-number" dir="ltr">
                          ۰۹۱۶۶۲۶۴۷۷۶
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Row 2: Telegram & Instagram */}
                  <div className="contact-social-row">
                    {/* Card 4: Telegram */}
                    <a
                      href="https://t.me/Qolipur_clinic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info-card interactive-card"
                    >
                      <div className="card-icon-wrapper">
                        <i className="fa-brands fa-telegram"></i>
                      </div>
                      <div className="card-details">
                        <h3 className="card-title">تلگرام</h3>
                        <p className="card-text" dir="ltr">
                          @Qolipur_clinic
                        </p>
                      </div>
                    </a>

                    {/* Card 5: Instagram */}
                    <a
                      href="https://instagram.com/Qolipur_clinic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info-card interactive-card"
                    >
                      <div className="card-icon-wrapper">
                        <i className="fa-brands fa-instagram"></i>
                      </div>
                      <div className="card-details">
                        <h3 className="card-title">اینستاگرام</h3>
                        <p className="card-text" dir="ltr">
                          Qolipur_clinic
                        </p>
                      </div>
                    </a>
                  </div>

                </div>

                {/* Map Embed Card */}
                <div className="contact-map-card">
                  <div className="map-header">
                    <div className="map-title-wrap">
                      <i className="fa-solid fa-map-location-dot"></i>
                      <span>موقعیت مکانی کلینیک روی نقشه</span>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-external-link"
                    >
                      <span>باز کردن در گوگل مپ</span>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                  </div>
                  <div className="map-frame-wrapper">
                    <iframe
                      src={googleMapsEmbed}
                      title="موقعیت مکانی کلینیک دندانپزشکی شهید قلی پور"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>

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
      
      <FloatingBubble />
    </>
  );
}
