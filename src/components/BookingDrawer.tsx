'use client';

import React, { useState, useEffect } from 'react';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDrawer({ isOpen, onClose }: BookingDrawerProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Lock body scroll, blur header, and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('booking-drawer-open');
    } else {
      document.body.classList.remove('booking-drawer-open');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('booking-drawer-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setPhone('');
      }, 400);
    }, 3000);
  };

  return (
    <>
      <div
        className={`booking-drawer-overlay ${isOpen ? 'active' : ''}`}
        id="bookingOverlay"
        onClick={onClose}
      />
      <aside
        className={`booking-drawer ${isOpen ? 'active' : ''}`}
        id="bookingDrawer"
        aria-hidden={!isOpen}
      >
        <div className="drawer-header">
          <div className="drawer-brand">
            <img
              src="/assets/logo.png"
              alt="کلینیک دندانپزشکی قلی‌پور"
              className="drawer-logo-img"
            />
          </div>
          <button
            className="drawer-close-btn"
            id="closeDrawerBtn"
            aria-label="بستن"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="drawer-body">
          <p className="drawer-desc">
            لطفاً نام و شماره تماس خود را ثبت نمایید تا همکاران ما در کوتاه‌ترین
            زمان جهت هماهنگی نوبت درمان با شما تماس بگیرند.
          </p>

          {!submitted ? (
            <form id="bookingForm" className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="patientName" className="form-label">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="مثال: مهدی قلی‌پور"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="patientPhone" className="form-label">
                  شماره تماس همراه
                </label>
                <input
                  type="tel"
                  id="patientPhone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  required
                />
              </div>
              <button type="submit" className="btn-primary btn-block">
                <span>ثبت درخواست نوبت</span>
              </button>
            </form>
          ) : (
            <div className="booking-success-msg" id="bookingSuccessMsg" style={{ display: 'block' }}>
              <i className="fa-solid fa-circle-check"></i>
              <h4>درخواست شما با موفقیت ثبت شد</h4>
              <p>کارشناسان کلینیک قلی‌پور به زودی با شما تماس خواهند گرفت.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
