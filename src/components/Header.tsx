'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onOpenBooking: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePage?: 'home' | 'contact' | 'about';
}

export default function Header({
  onOpenBooking,
  mobileMenuOpen,
  setMobileMenuOpen,
  activePage = 'home',
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isHome = activePage === 'home';
  const prefix = isHome ? '' : '/';

  return (
    <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="header-container">
        {/* Right: Logo & Brand */}
        <div className="header-logo">
          <Link href="/">
            <img
              src="/assets/logo.png"
              alt="کلینیک دندانپزشکی قلی‌پور"
              className="logo-img"
            />
          </Link>
        </div>

        {/* Center: Navigation Menu */}
        <nav className={`main-nav ${mobileMenuOpen ? 'active' : ''}`} id="mainNav">
          <ul className="nav-list">
            <li className={`nav-item ${isHome ? 'active' : ''}`}>
              <Link href="/" className="nav-link" onClick={closeMobileMenu}>
                صفحه اصلی
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a href={`${prefix}#services`} className="nav-link dropdown-toggle">
                خدمات <i className="fa-solid fa-angle-down"></i>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a href={`${prefix}#services`} onClick={closeMobileMenu}>
                    ایمپلنت دندان
                  </a>
                </li>
                <li>
                  <a href={`${prefix}#services`} onClick={closeMobileMenu}>
                    عصب کشی دندان
                  </a>
                </li>
                <li>
                  <a href={`${prefix}#services`} onClick={closeMobileMenu}>
                    ترمیم دندان
                  </a>
                </li>
                <li>
                  <a href={`${prefix}#services`} onClick={closeMobileMenu}>
                    روکش دندان
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a href={`${prefix}#portfolio`} className="nav-link" onClick={closeMobileMenu}>
                نمونه کارها
              </a>
            </li>
            <li className="nav-item">
              <a href={`${prefix}#articles`} className="nav-link" onClick={closeMobileMenu}>
                مقالات
              </a>
            </li>
            <li className={`nav-item ${activePage === 'about' ? 'active' : ''}`}>
              <Link href="/about" prefetch={false} className="nav-link" onClick={closeMobileMenu}>
                درباره ما
              </Link>
            </li>
            <li className={`nav-item ${activePage === 'contact' ? 'active' : ''}`}>
              <Link href="/contact" prefetch={false} className="nav-link" onClick={closeMobileMenu}>
                تماس با ما
              </Link>
            </li>
          </ul>
          <div className="nav-mobile-actions">
            <button
              className="btn-primary btn-block open-booking-btn"
              type="button"
              onClick={() => {
                closeMobileMenu();
                onOpenBooking();
              }}
            >
              <i className="fa-regular fa-calendar-check"></i>
              <span>رزرو نوبت آنلاین</span>
            </button>
            <a href="tel:01333512753" className="nav-mobile-phone">
              <i className="fa-solid fa-phone-volume"></i>
              <span>تماس مستقیم: ۰۱۳-۳۳۵۱۲۷۵۳</span>
            </a>
          </div>
        </nav>

        {/* Left: Contact & Booking CTA */}
        <div className="header-actions">
          <a href="tel:01333512753" className="phone-link">
            <span className="phone-num">۰۱۳-۳۳۵۱۲۷۵۳</span>
            <i className="fa-solid fa-phone-volume phone-icon"></i>
          </a>
          <button
            className="btn-primary open-booking-btn"
            type="button"
            onClick={onOpenBooking}
          >
            <span>رزرو نوبت</span>
          </button>
          {/* Mobile Menu Toggle Button */}
          <button
            className={`mobile-toggle-btn ${mobileMenuOpen ? 'active' : ''}`}
            id="mobileToggleBtn"
            aria-label={mobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="mobile-menu-icon close-icon"
              >
                <path
                  d="M12 12L36 36M36 12L12 36"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                className="mobile-menu-icon hamburger-icon"
              >
                <path
                  d="M8 12H20M8 24H40M8 36H28"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Modern Mobile Offcanvas Popup Menu matching reference */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onOpenBooking={onOpenBooking}
        activePage={activePage}
      />
    </header>
  );
}
