'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
  activePage?: 'home' | 'contact';
}

export default function MobileMenu({
  isOpen,
  onClose,
  onOpenBooking,
  activePage = 'home',
}: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manage mount/unmount for exit animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else if (shouldRender) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimatingOut(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!shouldRender || !mounted) return null;

  const isHome = activePage === 'home';
  const prefix = isHome ? '' : '/';

  const handleLinkClick = () => {
    onClose();
  };

  const handleBookingClick = () => {
    onClose();
    onOpenBooking();
  };

  const animationClass = isAnimatingOut ? 'anim-closing' : 'anim-opening';

  return createPortal(
    <div
      className={`mobile-offcanvas-root ${animationClass}`}
      id="mobileOffcanvasRoot"
      role="dialog"
      aria-modal="true"
      aria-label="منوی موبایل"
    >
      {/* Dark Blurred Backdrop */}
      <div
        className="mobile-offcanvas-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Left Side Containers: Close Button (Top) & Rapid Access Pill (Bottom) */}
      <div className="mobile-offcanvas-left-boxes">
        {/* Top-Left Close Button */}
        <button
          type="button"
          className="mobile-offcanvas-close-btn"
          onClick={onClose}
          aria-label="بستن منو"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Bottom-Left Rapid Access Social Pill (Replaces Floating Bubble) */}
        <div className="mobile-offcanvas-rapid-access" role="list">
          {/* Instagram */}
          <a
            href="https://instagram.com/Qolipur_clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="rapid-access-link instagram"
            aria-label="اینستاگرام"
            role="listitem"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>

          {/* Telegram (Outline Paper Plane) */}
          <a
            href="https://t.me/Qolipur_clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="rapid-access-link telegram"
            aria-label="تلگرام"
            role="listitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/989166264776"
            target="_blank"
            rel="noopener noreferrer"
            className="rapid-access-link whatsapp"
            aria-label="واتساپ"
            role="listitem"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>

          {/* Phone Call */}
          <a
            href="tel:01333512753"
            className="rapid-access-link phone"
            aria-label="تماس تلفنی"
            role="listitem"
          >
            <i className="fa-solid fa-phone"></i>
          </a>
        </div>
      </div>

      {/* Right Side: Main Navigation Drawer Card */}
      <div className="mobile-offcanvas-drawer">
        <div className="mobile-offcanvas-card">
          {/* Drawer Header: Clinic Logo */}
          <div className="mobile-drawer-header">
            <Link href="/" onClick={handleLinkClick} className="mobile-drawer-logo">
              <img
                src="/assets/logo.png"
                alt="کلینیک دندانپزشکی قلی‌پور"
                className="drawer-logo-img"
              />
            </Link>
          </div>

          {/* Drawer Nav Items */}
          <nav className="mobile-drawer-nav">
            <ul className="drawer-nav-list">
              {/* Home */}
              <li className={`drawer-nav-item ${isHome ? 'active' : ''}`}>
                <Link href="/" className="drawer-nav-link" onClick={handleLinkClick}>
                  <span>صفحه اصلی</span>
                </Link>
              </li>

              {/* Services Dropdown Accordion */}
              <li className={`drawer-nav-item has-submenu ${isServicesOpen ? 'submenu-open' : ''}`}>
                <div
                  className="drawer-nav-link services-toggle-row"
                  onClick={() => setIsServicesOpen((prev) => !prev)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isServicesOpen}
                >
                  <span>خدمات</span>
                  <span className={`services-chevron ${isServicesOpen ? 'rotated' : ''}`}>
                    <i className="fa-solid fa-angle-down"></i>
                  </span>
                </div>

                {/* Submenu Accordion */}
                <div className={`drawer-submenu ${isServicesOpen ? 'open' : ''}`}>
                  <ul className="drawer-submenu-list">
                    <li>
                      <a href={`${prefix}#services`} onClick={handleLinkClick}>
                        <i className="fa-solid fa-chevron-left sub-dot"></i>
                        <span>ایمپلنت دندان</span>
                      </a>
                    </li>
                    <li>
                      <a href={`${prefix}#services`} onClick={handleLinkClick}>
                        <i className="fa-solid fa-chevron-left sub-dot"></i>
                        <span>عصب کشی دندان</span>
                      </a>
                    </li>
                    <li>
                      <a href={`${prefix}#services`} onClick={handleLinkClick}>
                        <i className="fa-solid fa-chevron-left sub-dot"></i>
                        <span>ترمیم دندان</span>
                      </a>
                    </li>
                    <li>
                      <a href={`${prefix}#services`} onClick={handleLinkClick}>
                        <i className="fa-solid fa-chevron-left sub-dot"></i>
                        <span>روکش دندان</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Portfolio */}
              <li className="drawer-nav-item">
                <a href={`${prefix}#portfolio`} className="drawer-nav-link" onClick={handleLinkClick}>
                  <span>نمونه کارها</span>
                </a>
              </li>

              {/* Articles */}
              <li className="drawer-nav-item">
                <a href={`${prefix}#articles`} className="drawer-nav-link" onClick={handleLinkClick}>
                  <span>مقالات</span>
                </a>
              </li>

              {/* About Us */}
              <li className="drawer-nav-item">
                <a href={`${prefix}#about`} className="drawer-nav-link" onClick={handleLinkClick}>
                  <span>درباره ما</span>
                </a>
              </li>

              {/* Contact Us */}
              <li className={`drawer-nav-item ${activePage === 'contact' ? 'active' : ''}`}>
                <Link href="/contact" className="drawer-nav-link" onClick={handleLinkClick}>
                  <span>تماس با ما</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Bottom Actions CTA */}
          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="btn-primary btn-block drawer-booking-btn"
              onClick={handleBookingClick}
            >
              <i className="fa-regular fa-calendar-check"></i>
              <span>رزرو نوبت آنلاین</span>
            </button>

            <a href="tel:01333512753" className="drawer-phone-cta">
              <i className="fa-solid fa-phone-volume"></i>
              <span dir="ltr">۰۱۳-۳۳۵۱۲۷۵۳</span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
