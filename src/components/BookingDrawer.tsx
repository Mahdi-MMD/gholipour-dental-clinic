'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export default function BookingDrawer({ isOpen, onClose, initialService }: BookingDrawerProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const cleanInitialService = typeof initialService === 'string' ? initialService : '';
  const [service, setService] = useState(cleanInitialService);

  // Update service when initialService prop changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setService(typeof initialService === 'string' ? initialService : '');
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialService]);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    service?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    service?: boolean;
  }>({});

  // Convert English and Arabic-Indic digits to Persian digits
  const toPersianDigits = (str: string): string => {
    const persianMap: Record<string, string> = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
      '٠': '۰', '١': '۱', '٢': '۲', '٣': '۳', '٤': '۴',
      '٥': '۵', '٦': '۶', '٧': '۷', '٨': '۸', '٩': '۹'
    };
    return str.replace(/[0-9\u0660-\u0669]/g, (char) => persianMap[char] || char);
  };

  // Convert Persian/Arabic digits to English digits for standard validation/processing
  const toEnglishDigits = (str: string): string => {
    return str
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  };

  // Check if string contains only Persian letters, spaces, half-spaces (and standard punctuation if needed)
  const isPersianText = (str: string): boolean => {
    const trimmed = str.trim();
    if (!trimmed) return false;
    // Persian alphabet range + ZWNJ (\u200C) + whitespace
    const persianRegex = /^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\s]+$/;
    return persianRegex.test(trimmed);
  };

  // Handle phone change: allow Persian and English digits, normalize and display in Persian
  const handlePhoneChange = (val: string) => {
    const englishDigits = toEnglishDigits(val).replace(/\D/g, '').slice(0, 11);
    const persianDisplay = toPersianDigits(englishDigits);
    setPhone(persianDisplay);

    if (touched.phone) {
      validatePhone(englishDigits);
    }
  };

  const validatePhone = (digits: string): string | undefined => {
    if (!digits) {
      return 'لطفاً شماره تماس همراه را وارد نمایید.';
    }
    if (!digits.startsWith('09')) {
      return 'شماره همراه باید با ۰۹ شروع شود.';
    }
    if (digits.length !== 11) {
      return 'شماره همراه باید ۱۱ رقم باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹).';
    }
    return undefined;
  };

  const validateName = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'لطفاً نام و نام خانوادگی را وارد نمایید.';
    }
    if (!isPersianText(trimmed)) {
      return 'نام و نام خانوادگی باید با حروف فارسی نوشته شود.';
    }
    if (trimmed.length < 3) {
      return 'نام و نام خانوادگی کوتاه است.';
    }
    return undefined;
  };

  const validateService = (val: string): string | undefined => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'لطفاً نام خدمت مورد نظر را وارد نمایید.';
    }
    if (!isPersianText(trimmed)) {
      return 'نام خدمت باید با حروف فارسی نوشته شود.';
    }
    return undefined;
  };

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

    setTouched({ name: true, phone: true, service: true });

    const rawPhoneDigits = toEnglishDigits(phone);
    const nameErr = validateName(name);
    const phoneErr = validatePhone(rawPhoneDigits);
    const serviceErr = validateService(service);

    const newErrors = {
      name: nameErr,
      phone: phoneErr,
      service: serviceErr,
    };
    setErrors(newErrors);

    if (nameErr || phoneErr || serviceErr) {
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setPhone('');
        setService('');
        setErrors({});
        setTouched({});
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
            <Image
              src="/assets/logo.webp"
              alt="کلینیک دندانپزشکی قلی‌پور"
              className="drawer-logo-img"
              width={140}
              height={45}
              loading="eager"
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
            لطفاً مشخصات و خدمت درخواستی خود را ثبت نمایید تا همکاران ما در کوتاه‌ترین
            زمان جهت هماهنگی نوبت درمان با شما تماس بگیرند.
          </p>

          {!submitted ? (
            <form id="bookingForm" className="booking-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="patientName" className="form-label">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  id="patientName"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) {
                      setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, name: true }));
                    setErrors((prev) => ({ ...prev, name: validateName(name) }));
                  }}
                  className="form-input"
                  placeholder="مثال: مهدی قلی‌پور"
                  dir="rtl"
                  aria-invalid={!!(touched.name && errors.name)}
                  aria-describedby={touched.name && errors.name ? 'patientNameError' : undefined}
                />
                {touched.name && errors.name && (
                  <span className="form-error-msg" id="patientNameError">
                    {errors.name}
                  </span>
                )}
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
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, phone: true }));
                    const rawDigits = toEnglishDigits(phone);
                    setErrors((prev) => ({ ...prev, phone: validatePhone(rawDigits) }));
                  }}
                  className="form-input"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  aria-invalid={!!(touched.phone && errors.phone)}
                  aria-describedby={touched.phone && errors.phone ? 'patientPhoneError' : undefined}
                />
                {touched.phone && errors.phone && (
                  <span className="form-error-msg" id="patientPhoneError">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="serviceType" className="form-label">
                  نام خدمت مورد نظر
                </label>
                <input
                  type="text"
                  id="serviceType"
                  name="service"
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    if (touched.service) {
                      setErrors((prev) => ({ ...prev, service: validateService(e.target.value) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, service: true }));
                    setErrors((prev) => ({ ...prev, service: validateService(service) }));
                  }}
                  className="form-input"
                  placeholder="مثال: روکش دندان"
                  dir="rtl"
                  aria-invalid={!!(touched.service && errors.service)}
                  aria-describedby={touched.service && errors.service ? 'serviceTypeError' : undefined}
                />
                {touched.service && errors.service && (
                  <span className="form-error-msg" id="serviceTypeError">
                    {errors.service}
                  </span>
                )}
              </div>

              <button type="submit" className="btn-primary btn-block">
                <span>ثبت درخواست نوبت</span>
              </button>
            </form>
          ) : (
            <div className="booking-success-msg" id="bookingSuccessMsg" style={{ display: 'block' }}>
              <i className="fa-solid fa-circle-check"></i>
              <h4>درخواست شما با موفقیت ثبت شد</h4>
              <p>کارشناسان کلینیک دندانپزشکی قلی‌پور به زودی با شما تماس خواهند گرفت.</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
