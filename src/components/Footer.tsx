import Link from 'next/link';

interface FooterProps {
  onOpenBooking: () => void;
}

export default function Footer({ onOpenBooking }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" id="about">
      <div className="container footer-card-container">
        <div className="footer-card">
          {/* Col 1: Brand & About (Right) */}
          <div className="footer-col footer-col-brand">
            <div className="footer-logo">
              <Link href="/">
                <img
                  src="/assets/logo.png"
                  alt="کلینیک دندانپزشکی قلی‌پور"
                  className="footer-logo-img"
                />
              </Link>
            </div>
            <p className="footer-text">
              کلینیک تخصصی قلی‌پور با تمرکز بر ارائه خدمات دندانپزشکی دقیق و مدرن،
              تجربه‌ای آرام و مطمئن برای مراجعین فراهم می‌کند. خدمات این مرکز
              شامل ایمپلنت، درمان‌های ترمیمی، روکش و عصب‌کشی می‌باشد.
            </p>
          </div>

          {/* Links Section: Quick Links & Useful Links */}
          <div className="footer-links-group">
            {/* Col 2: Quick Links */}
            <div className="footer-col footer-col-links">
              <h4 className="footer-card-title">دسترسی سریع</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/">صفحه اصلی</Link>
                </li>
                <li>
                  <Link href="/contact" prefetch={false}>تماس با ما</Link>
                </li>
                <li>
                  <a href="/#portfolio">نمونه کارها</a>
                </li>
                <li>
                  <a href="/#articles">مقالات</a>
                </li>
                <li>
                  <a
                    href="#bookingDrawer"
                    className="open-booking-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenBooking();
                    }}
                  >
                    رزرو نوبت
                  </a>
                </li>
                <li>
                  <a href="/#faq">سوالات متداول</a>
                </li>
                <li>
                  <Link href="/about" prefetch={false}>درباره ما</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Useful Links */}
            <div className="footer-col footer-col-links">
              <h4 className="footer-card-title">لینک های مفید</h4>
              <ul className="footer-links">
                <li>
                  <a href="/#services">ایمپلنت تخصصی</a>
                </li>
                <li>
                  <a href="/#services">ترمیم دندان</a>
                </li>
                <li>
                  <a href="/#services">روکش دندان</a>
                </li>
                <li>
                  <a href="/#services">درمان ریشه دندان</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Social Icons (Left) */}
          <div className="footer-col footer-col-socials">
            <div className="social-vertical-list">
              <a
                href="https://instagram.com/Qolipur_clinic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-circle-btn"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://t.me/Qolipur_clinic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="social-circle-btn"
              >
                <i className="fa-brands fa-telegram"></i>
              </a>
              <a
                href="https://wa.me/989166264776"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="social-circle-btn"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a
                href="tel:09166264776"
                aria-label="Phone"
                className="social-circle-btn"
              >
                <i className="fa-solid fa-phone"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Structure: Smooth Arch Divider & Bottom Colored Bar */}
        <div className="footer-bottom-wrapper">
          {/* Desktop SVG */}
          <svg
            className="footer-svg-container footer-svg-desktop"
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,0 L 0,30 L 470,30 C 535,30 555,2 600,2 C 645,2 665,30 730,30 L 1200,30 L 1200,0 Z"
              fill="#ffffff"
            />
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="30"
              stroke="#e9eff5"
              strokeWidth="1"
            />
            <line
              x1="1199.5"
              y1="0"
              x2="1199.5"
              y2="30"
              stroke="#e9eff5"
              strokeWidth="1"
            />
            <path
              d="M 0,30 L 470,30 C 535,30 555,2 600,2 C 645,2 665,30 730,30 L 1200,30"
              fill="none"
              stroke="#e9eff5"
              strokeWidth="1.2"
            />
            <path
              d="M 0,80 L 0,43 L 475,43 C 538,43 557,15 600,15 C 643,15 662,43 725,43 L 1200,43 L 1200,80 Z"
              fill="#1c83aa"
            />
          </svg>

          {/* Mobile SVG */}
          <svg
            className="footer-svg-container footer-svg-mobile"
            viewBox="0 0 400 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0,0 L 0,30 L 100,30 C 145,30 165,2 200,2 C 235,2 255,30 300,30 L 400,30 L 400,0 Z"
              fill="#ffffff"
            />
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="30"
              stroke="#e9eff5"
              strokeWidth="1"
            />
            <line
              x1="399.5"
              y1="0"
              x2="399.5"
              y2="30"
              stroke="#e9eff5"
              strokeWidth="1"
            />
            <path
              d="M 0,30 L 100,30 C 145,30 165,2 200,2 C 235,2 255,30 300,30 L 400,30"
              fill="none"
              stroke="#e9eff5"
              strokeWidth="1.2"
            />
            <path
              d="M 0,80 L 0,43 L 105,43 C 148,43 167,15 200,15 C 233,15 252,43 295,43 L 400,43 L 400,80 Z"
              fill="#1c83aa"
            />
          </svg>

          <div className="footer-bottom-bar">
            <button
              className="scroll-top-btn"
              id="scrollTopBtn"
              aria-label="بازگشت به بالا"
              onClick={scrollToTop}
            >
              <i className="fa-solid fa-chevron-up"></i>
            </button>
            <p className="copyright-text">
              تمام حقوق برای کلینیک دندانپزشکی قلی‌پور محفوظ است
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
