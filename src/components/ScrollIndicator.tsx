'use client';

import React, { useState, useEffect } from 'react';

interface ScrollIndicatorProps {
  threshold?: number;
}

export default function ScrollIndicator({ threshold = 350 }: ScrollIndicatorProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100));
        setScrollProgress(progress);
      }

      // Show button after user scrolls past threshold
      if (currentScrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG Circular progress math (Radius 20 -> Circumference ~125.66)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`scroll-progress-widget ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      role="button"
      tabIndex={0}
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالایی صفحه"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToTop();
        }
      }}
    >
      <svg
        className="progress-circle-svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        {/* Background track circle */}
        <circle
          className="progress-circle-bg"
          cx="24"
          cy="24"
          r={radius}
        />
        {/* Active animated progress fill circle */}
        <circle
          className="progress-circle-fill"
          cx="24"
          cy="24"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      {/* Central directional arrow indicator */}
      <span className="scroll-arrow-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </span>
    </div>
  );
}
