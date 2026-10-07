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

    // Helper to dynamically inject script tag with failover
    const loadScriptWithFallback = (urls: string[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        let index = 0;

        const tryNext = () => {
          if (index >= urls.length) {
            reject(new Error('All script mirrors failed'));
            return;
          }
          const src = urls[index++];
          const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
          if (existing && existing.dataset.loaded === 'true') {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
          };
          script.onerror = () => {
            script.remove();
            tryNext();
          };
          document.head.appendChild(script);
        };

        tryNext();
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
        // 1. Load CSS
        loadStyle('https://cdn.jsdelivr.net/npm/nanogallery2@3/dist/css/nanogallery2.min.css');

        // 2. Load jQuery (with CDN failover)
        if (!window.jQuery) {
          await loadScriptWithFallback([
            'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
          ]);
        }

        // 3. Load nanogallery2 (with CDN failover)
        if (!window.jQuery?.fn?.nanogallery2) {
          await loadScriptWithFallback([
            'https://cdn.jsdelivr.net/npm/nanogallery2@3/dist/jquery.nanogallery2.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/nanogallery2/3.0.5/jquery.nanogallery2.min.js',
          ]);
        }

        if (!isMounted || !galleryRef.current || !window.jQuery?.fn?.nanogallery2) {
          return;
        }

        const $ = window.jQuery;
        const $gallery = $(galleryRef.current);

        // Prepare items array formatted for nanogallery2
        const items = PORTFOLIO_WORK_SAMPLES.map((item) => ({
          src: item.src,
          srct: item.srct,
          title: '',
          description: '',
        }));

        // Mosaic pattern: 12 elements interlocking nicely
        const mosaicPattern = [
          { c: 1, r: 1, w: 2, h: 2 }, // Item 1 (portrait) -> 2x2 hero
          { c: 3, r: 1, w: 1, h: 2 }, // Item 2 (landscape) -> 1x2
          { c: 4, r: 1, w: 2, h: 1 }, // Item 3 (landscape) -> 2x1
          { c: 4, r: 2, w: 2, h: 1 }, // Item 4 (portrait) -> 2x1
          { c: 6, r: 1, w: 1, h: 2 }, // Item 5 (landscape) -> 1x2

          { c: 1, r: 3, w: 2, h: 1 }, // Item 6 (landscape) -> 2x1
          { c: 3, r: 3, w: 1, h: 2 }, // Item 7 (portrait) -> 1x2
          { c: 4, r: 3, w: 2, h: 2 }, // Item 8 (portrait) -> 2x2 hero
          { c: 6, r: 3, w: 1, h: 2 }, // Item 9 (landscape) -> 1x2
          { c: 1, r: 4, w: 2, h: 1 }, // Item 10 (portrait) -> 2x1

          { c: 1, r: 5, w: 3, h: 1 }, // Item 11 (portrait) -> 3x1
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
          galleryTheme: {
            thumbnail: {
              background: '#e9f1f5',
              borderColor: 'transparent',
            },
          },
          thumbnailHeight: 180,
          thumbnailWidth: 180,
          galleryMosaic: mosaicPattern,
          thumbnailGutterWidth: 14,
          thumbnailGutterHeight: 14,
          thumbnailBorderHorizontal: 0,
          thumbnailBorderVertical: 0,
          thumbnailDisplayTransition: 'slideUp',
          thumbnailDisplayInterval: 20,
          thumbnailHoverEffect2: null,
          thumbnailAlignment: 'center',
          thumbnailLabel: {
            display: false,
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
        console.error('Failed to initialize nanogallery2, falling back to clean CSS grid:', err);
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
        <div className="nanogallery-fallback-mosaic" dir="ltr">
          {PORTFOLIO_WORK_SAMPLES.map((item, idx) => (
            <div key={item.id} className={`fallback-tile fallback-tile-${idx + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.srct || item.src}
                alt="نمونه کار کلینیک دندانپزشکی قلی‌پور"
                loading="lazy"
              />
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
