'use client';

import React from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/data/galleryData';
import { Fancybox } from '@fancyapps/ui/dist/fancybox/fancybox.js';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

interface StagesCardProps {
  item: GalleryItem;
}

export default function StagesCard({ item }: StagesCardProps) {
  const stages = item.stages || [];
  const coverImage = stages[0]?.image || item.afterImg || item.beforeImg;
  const stageCount = stages.length;

  const handleOpenFancybox = () => {
    if (!stages || stages.length === 0) return;

    // Build items formatted for Fancybox v5/v6 with caption and zoom capability
    const fancyboxSlides = stages.map((st) => ({
      src: st.image,
      caption: `
        <div style="direction: rtl; text-align: right; font-family: inherit;">
          <h4 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #1c83aa;">${st.title}</h4>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">${st.description}</p>
        </div>
      `,
    }));

    Fancybox.show(
      fancyboxSlides,
      {
        theme: 'dark',
        dragToClose: true,
        Carousel: {
          Toolbar: {
            display: {
              left: ['infobar'],
              middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
              right: ['thumbs', 'close'],
            },
          },
          Thumbs: {
            type: 'classic',
          },
        },
      } as any
    );
  };

  return (
    <div className="stages-card-cover-wrap" onClick={handleOpenFancybox}>
      <Image
        src={coverImage}
        alt={`مراحل درمان - ${item.title}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="stages-card-img"
        loading="lazy"
      />

      {/* Stage count pill on top right */}
      <div className="stages-count-badge">
        <i className="fa-solid fa-layer-group" />
        <span>{stageCount} مرحله درمانی</span>
      </div>

      {/* Hover visual overlay with zoom prompt */}
      <div className="stages-hover-overlay">
        <div className="stages-zoom-btn">
          <i className="fa-solid fa-expand" />
          <span className="stages-zoom-text-desktop">مشاهده مراحل درمان و بزرگ‌نمایی</span>
          <span className="stages-zoom-text-mobile">مشاهده مراحل</span>
        </div>
      </div>
    </div>
  );
}
