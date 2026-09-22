'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function FloatingBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      className="floating-social-bubble-container"
      id="floatingBubbleContainer"
      ref={containerRef}
    >
      {/* Pop-up Action Cards */}
      <div className="social-box3" id="socialBox3">
        {/* Item 1: Instagram */}
        <div
          className={`social-bubble-card ${isOpen ? 'active' : ''}`}
          style={{ transitionDelay: isOpen ? '300ms' : '0ms' }}
        >
          <a
            href="https://instagram.com/Qolipur_clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="social-bubble-link"
          >
            <span className="social-bubble-title">اینستاگرام</span>
            <span className="social-bubble-icon">
              <i className="fa-brands fa-instagram"></i>
            </span>
          </a>
        </div>

        {/* Item 2: Telegram */}
        <div
          className={`social-bubble-card ${isOpen ? 'active' : ''}`}
          style={{ transitionDelay: isOpen ? '200ms' : '100ms' }}
        >
          <a
            href="https://t.me/Qolipur_clinic"
            target="_blank"
            rel="noopener noreferrer"
            className="social-bubble-link"
          >
            <span className="social-bubble-title">تلگرام</span>
            <span className="social-bubble-icon">
              <i className="fa-brands fa-telegram"></i>
            </span>
          </a>
        </div>

        {/* Item 3: Call Mobile */}
        <div
          className={`social-bubble-card ${isOpen ? 'active' : ''}`}
          style={{ transitionDelay: isOpen ? '100ms' : '200ms' }}
        >
          <a href="tel:09166264776" className="social-bubble-link">
            <span className="social-bubble-title">تلفن همراه</span>
            <span className="social-bubble-icon">
              <i className="fa-solid fa-mobile-screen-button"></i>
            </span>
          </a>
        </div>

        {/* Item 4: Call Landline */}
        <div
          className={`social-bubble-card ${isOpen ? 'active' : ''}`}
          style={{ transitionDelay: isOpen ? '0ms' : '300ms' }}
        >
          <a href="tel:01333512753" className="social-bubble-link">
            <span className="social-bubble-title">تلفن ثابت</span>
            <span className="social-bubble-icon">
              <i className="fa-solid fa-phone"></i>
            </span>
          </a>
        </div>
      </div>

      {/* Main Floating Trigger Button */}
      <div className="social-btn-icon3" id="socialBtnIcon3">
        <label
          className="hamburger3"
          htmlFor="socialBubbleInput"
          aria-label="ارتباط سریع"
        >
          <input
            type="checkbox"
            id="socialBubbleInput"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
          />
          <svg viewBox="0 0 32 32">
            <path
              className="lines line-top-bottom"
              d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
            ></path>
            <path className="lines" d="M7 16 27 16"></path>
          </svg>
        </label>
      </div>
    </div>
  );
}
