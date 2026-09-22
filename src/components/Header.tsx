'use client';

import Link from 'next/link';

interface HeaderProps {
  onOpenBooking: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePage?: 'home' | 'contact';
}

export default function Header({
  onOpenBooking,
  mobileMenuOpen,
  setMobileMenuOpen,
  activePage = 'home',
}: HeaderProps) {
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isHome = activePage === 'home';
  const prefix = isHome ? '' : '/';

  return (
    <header className="site-header">
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
            <li className="nav-item">
              <a href={`${prefix}#about`} className="nav-link" onClick={closeMobileMenu}>
                درباره ما
              </a>
            </li>
            <li className={`nav-item ${activePage === 'contact' ? 'active' : ''}`}>
              <Link href="/contact" className="nav-link" onClick={closeMobileMenu}>
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
          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-toggle-btn"
            id="mobileToggleBtn"
            aria-label="منوی موبایل"
            onClick={toggleMobileMenu}
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
