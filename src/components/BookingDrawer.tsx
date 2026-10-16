'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PersianDatePicker from '@/components/PersianDatePicker';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

type VisitedStatus = 'yes' | 'no' | null;

export default function BookingDrawer({ isOpen, onClose, initialService }: BookingDrawerProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const cleanInitialService = typeof initialService === 'string' ? initialService : '';
  const [service, setService] = useState(cleanInitialService);
  const [visitedBefore, setVisitedBefore] = useState<VisitedStatus>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Update service when initialService prop changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      setService(typeof initialService === 'string' ? initialService : '');
      setVisitedBefore(null);
      setProposedDate('');
      setIsCalendarOpen(false);
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialService]);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    service?: string;
    visitedBefore?: string;
    proposedDate?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    phone?: boolean;
    service?: boolean;
    visitedBefore?: boolean;
    proposedDate?: boolean;
  }>({});

  // Convert English and Arabic-Indic digits to Persian digits
  const toPersianDigits = (str: string): string => {
    const persianMap: Record<string, string> = {
      '0': '۰',
      '1': '۱',
      '2': '۲',
      '3': '۳',
      '4': '۴',
      '5': '۵',
      '6': '۶',
      '7': '۷',
      '8': '۸',
      '9': '۹',
      '٠': '۰',
      '١': '۱',
      '٢': '۲',
      '٣': '۳',
      '٤': '۴',
      '٥': '۵',
      '٦': '۶',
      '٧': '۷',
      '٨': '۸',
      '٩': '۹',
    };
    return str.replace(/[0-9\u0660-\u0669]/g, char => persianMap[char] || char);
  };

  // Convert Persian/Arabic digits to English digits for standard validation/processing
  const toEnglishDigits = (str: string): string => {
    return str
      .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
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

  const validateVisitedBefore = (val: VisitedStatus): string | undefined => {
    if (!val) {
      return 'لطفاً مشخص فرمایید که آیا قبلاً ویزیت شده‌اید یا خیر.';
    }
    return undefined;
  };

  const validateProposedDate = (val: string, visited: VisitedStatus): string | undefined => {
    if (!visited) return undefined;
    if (!val || !val.trim()) {
      return visited === 'yes'
        ? 'لطفاً تاریخ درمان پیشنهادی خود را انتخاب نمایید.'
        : 'لطفاً تاریخ ویزیت پیشنهادی خود را انتخاب نمایید.';
    }
    return undefined;
  };

  const handleVisitedChange = (status: 'yes' | 'no') => {
    setVisitedBefore(status);
    setTouched(prev => ({ ...prev, visitedBefore: true }));
    setErrors(prev => ({
      ...prev,
      visitedBefore: undefined,
      proposedDate: validateProposedDate(proposedDate, status),
    }));
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

    setTouched({
      name: true,
      phone: true,
      service: true,
      visitedBefore: true,
      proposedDate: true,
    });

    const rawPhoneDigits = toEnglishDigits(phone);
    const nameErr = validateName(name);
    const phoneErr = validatePhone(rawPhoneDigits);
    const serviceErr = validateService(service);
    const visitedErr = validateVisitedBefore(visitedBefore);
    const dateErr = validateProposedDate(proposedDate, visitedBefore);

    const newErrors = {
      name: nameErr,
      phone: phoneErr,
      service: serviceErr,
      visitedBefore: visitedErr,
      proposedDate: dateErr,
    };
    setErrors(newErrors);

    if (nameErr || phoneErr || serviceErr || visitedErr || dateErr) {
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
        setVisitedBefore(null);
        setProposedDate('');
        setIsCalendarOpen(false);
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
        inert={!isOpen ? true : undefined}
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
        <div className={`drawer-body ${isCalendarOpen ? 'calendar-open' : ''}`}>
          <div
            className={`drawer-calendar-backdrop ${isCalendarOpen ? 'open' : ''}`}
            onClick={() => setIsCalendarOpen(false)}
            aria-hidden="true"
          />
          {!submitted ? (
            <>
              <p className="drawer-desc">
                <span className="drawer-desc-desktop">
                  لطفاً مشخصات و خدمت درخواستی خود را ثبت نمایید تا همکاران ما در اولین فرصت جهت
                  هماهنگی با شما تماس بگیرند.
                </span>
                <span className="drawer-desc-mobile">
                  لطفاً مشخصات و خدمت درخواستی خود را ثبت نمایید تا همکاران ما جهت هماهنگی با شما
                  تماس بگیرند.
                </span>
              </p>
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
                    onChange={e => {
                      setName(e.target.value);
                      if (touched.name) {
                        setErrors(prev => ({ ...prev, name: validateName(e.target.value) }));
                      }
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, name: true }));
                      setErrors(prev => ({ ...prev, name: validateName(name) }));
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
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, phone: true }));
                      const rawDigits = toEnglishDigits(phone);
                      setErrors(prev => ({ ...prev, phone: validatePhone(rawDigits) }));
                    }}
                    className="form-input"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    aria-invalid={!!(touched.phone && errors.phone)}
                    aria-describedby={
                      touched.phone && errors.phone ? 'patientPhoneError' : undefined
                    }
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
                    onChange={e => {
                      setService(e.target.value);
                      if (touched.service) {
                        setErrors(prev => ({ ...prev, service: validateService(e.target.value) }));
                      }
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, service: true }));
                      setErrors(prev => ({ ...prev, service: validateService(service) }));
                    }}
                    className="form-input"
                    placeholder="مثال: روکش دندان"
                    dir="rtl"
                    aria-invalid={!!(touched.service && errors.service)}
                    aria-describedby={
                      touched.service && errors.service ? 'serviceTypeError' : undefined
                    }
                  />
                  {touched.service && errors.service && (
                    <span className="form-error-msg" id="serviceTypeError">
                      {errors.service}
                    </span>
                  )}
                </div>

                {/* آیا قبلاً ویزیت شده‌اید؟ بله / خیر */}
                <div className="form-group">
                  <label className="form-label">آیا قبلاً ویزیت شده‌اید؟</label>
                  <div
                    className={`booking-toggle-group ${touched.visitedBefore && errors.visitedBefore ? 'has-error' : ''}`}
                    role="radiogroup"
                    aria-label="آیا قبلاً ویزیت شده‌اید؟"
                    aria-invalid={!!(touched.visitedBefore && errors.visitedBefore)}
                    aria-describedby={
                      touched.visitedBefore && errors.visitedBefore
                        ? 'visitedBeforeError'
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={visitedBefore === 'yes'}
                      className={`booking-toggle-btn ${visitedBefore === 'yes' ? 'active' : ''}`}
                      onClick={() => handleVisitedChange('yes')}
                    >
                      <span className="toggle-indicator">
                        {visitedBefore === 'yes' && <i className="fa-solid fa-check"></i>}
                      </span>
                      <span>بله</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={visitedBefore === 'no'}
                      className={`booking-toggle-btn ${visitedBefore === 'no' ? 'active' : ''}`}
                      onClick={() => handleVisitedChange('no')}
                    >
                      <span className="toggle-indicator">
                        {visitedBefore === 'no' && <i className="fa-solid fa-check"></i>}
                      </span>
                      <span>خیر</span>
                    </button>
                  </div>
                  {touched.visitedBefore && errors.visitedBefore && (
                    <span className="form-error-msg" id="visitedBeforeError">
                      {errors.visitedBefore}
                    </span>
                  )}
                </div>

                {/* تاریخ پیشنهادی بر اساس وضعیت ویزیت */}
                {visitedBefore && (
                  <div className="form-group form-group-reveal form-group-datepicker">
                    <label htmlFor="proposedDatePicker" className="form-label">
                      {visitedBefore === 'yes'
                        ? 'لطفاً تاریخ درمان پیشنهادی خود را انتخاب کنید:'
                        : 'لطفاً تاریخ ویزیت پیشنهادی خود را انتخاب کنید:'}
                    </label>
                    <PersianDatePicker
                      id="proposedDatePicker"
                      value={proposedDate}
                      isOpen={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                      onChange={formattedDate => {
                        setProposedDate(formattedDate);
                        setIsCalendarOpen(false);
                        setTouched(prev => ({ ...prev, proposedDate: true }));
                        setErrors(prev => ({ ...prev, proposedDate: undefined }));
                      }}
                      error={touched.proposedDate ? errors.proposedDate : undefined}
                      placeholder={
                        visitedBefore === 'yes'
                          ? 'انتخاب تاریخ پیشنهادی درمان...'
                          : 'انتخاب تاریخ پیشنهادی ویزیت...'
                      }
                    />
                    {touched.proposedDate && errors.proposedDate && (
                      <span className="form-error-msg" id="proposedDateError">
                        {errors.proposedDate}
                      </span>
                    )}
                  </div>
                )}

                <button type="submit" className="btn-primary btn-block">
                  <span>ثبت درخواست نوبت</span>
                </button>
              </form>
            </>
          ) : (
            <div
              className="booking-success-msg"
              id="bookingSuccessMsg"
              style={{ display: 'block' }}
            >
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
