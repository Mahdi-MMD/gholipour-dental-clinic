'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PORTFOLIO_WORK_SAMPLES } from '@/data/portfolioData';

declare global {
  interface Window {
    jQuery?: any;
    $?: any;
  }
}

export default function NanoPortfolioGallery() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Helper to dynamically inject script tag
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        if (existing) {
          if (existing.dataset.loaded === 'true') {
            resolve();
            return;
          }
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject());
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => {
          script.dataset.loaded = 'true';
          resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    // Helper to dynamically inject stylesheet
    const loadStyle = (href: string) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    const initializeGallery = async () => {
      try {
        // 1. Ensure CSS is loaded
        loadStyle('https://cdnjs.cloudflare.com/ajax/libs/nanogallery2/3.0.5/css/nanogallery2.min.css');

        // 2. Load jQuery first
        if (!window.jQuery) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js');
        }

        // 3. Load nanogallery2
        if (!window.jQuery?.fn?.nanogallery2) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/nanogallery2/3.0.5/jquery.nanogallery2.min.js');
        }

        if (!isMounted || !galleryRef.current || !window.jQuery?.fn?.nanogallery2) {
          return;
        }

        const $ = window.jQuery;
        const $gallery = $(galleryRef.current);

        // Prepare items array formatted for nanogallery2 (without captions as requested)
        const items = PORTFOLIO_WORK_SAMPLES.map((item) => ({
          src: item.src,
          srct: item.srct,
          title: '',
          description: '',
        }));

        // Mosaic pattern: 12 elements interlocking nicely
        const mosaicPattern = [
          { c: 1, r: 1, w: 2, h: 2 }, // Item 1 (portrait) -> 2x2 hero
          { c: 3, r: 1, w: 1, h: 2 }, // Item 2 (portrait) -> 1x2
          { c: 4, r: 1, w: 2, h: 1 }, // Item 7 (landscape) -> 2x1
          { c: 4, r: 2, w: 2, h: 1 }, // Item 8 (landscape) -> 2x1
          { c: 6, r: 1, w: 1, h: 2 }, // Item 3 (portrait) -> 1x2

          { c: 1, r: 3, w: 2, h: 1 }, // Item 9 (landscape) -> 2x1
          { c: 3, r: 3, w: 1, h: 2 }, // Item 4 (portrait) -> 1x2
          { c: 4, r: 3, w: 2, h: 2 }, // Item 5 (portrait) -> 2x2 hero
          { c: 6, r: 3, w: 1, h: 2 }, // Item 6 (portrait) -> 1x2
          { c: 1, r: 4, w: 2, h: 1 }, // Item 10 (landscape) -> 2x1

          { c: 1, r: 5, w: 3, h: 1 }, // Item 11 (landscape) -> 3x1
          { c: 4, r: 5, w: 3, h: 1 }, // Item 12 (landscape) -> 3x1
        ];

        // Destroy any previous instance if re-rendering
        if ($gallery.hasClass('nanogallery2')) {
          try {
            $gallery.nanogallery2('destroy');
          } catch (e) {
            // Ignore
          }
        }

        $gallery.nanogallery2({
          items: items,
          galleryTheme: 'light',
          thumbnailHeight: 180,
          thumbnailWidth: 180,
          galleryMosaic: mosaicPattern,
          thumbnailGutterWidth: 14,
          thumbnailGutterHeight: 14,
          thumbnailBorderHorizontal: 0,
          thumbnailBorderVertical: 0,
          thumbnailDisplayTransition: 'slideUp',
          thumbnailDisplayInterval: 30,
          thumbnailHoverEffect2: null, // Disabled JS hover animation to prevent null reading length error (handled smoothly via CSS)
          thumbnailAlignment: 'center',
          thumbnailLabel: {
            display: false, // User requested no caption needed
          },
          viewerToolbar: {
            display: true,
            standard: 'minimizeButton, shareButton, fullscreenButton, closeButton',
            minimized: 'minimizeButton, fullscreenButton, closeButton',
          },
          viewerTools: {
            topLeft: '',
            topRight: 'playPauseButton, zoomButton, fullscreenButton, closeButton',
          },
          locationHash: false,
          touchAnimation: false,
          touchAutoOpenDelay: -1,
        });

        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to initialize nanogallery2:', err);
        if (isMounted) setHasError(true);
      }
    };

    initializeGallery();

    return () => {
      isMounted = false;
      if (galleryRef.current && window.jQuery?.fn?.nanogallery2) {
        try {
          window.jQuery(galleryRef.current).nanogallery2('destroy');
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <div className="nanogallery-wrapper" dir="ltr">
      {!isLoaded && !hasError && (
        <div className="nanogallery-skeleton">
          <div className="nanogallery-skeleton-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="nanogallery-skeleton-tile" />
            ))}
          </div>
        </div>
      )}

      {hasError && (
        <div className="nanogallery-fallback-grid" dir="rtl">
          {PORTFOLIO_WORK_SAMPLES.map((item) => (
            <div key={item.id} className="fallback-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt="نمونه کار درمان کلینیک قلی‌پور" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div
        ref={galleryRef}
        id="nanogallery_portfolio"
        className="nanogallery-container"
        style={{ width: '100%' }}
      />
    </div>
  );
}
