'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface MeridiqSliderProps {
  beforeImg: string;
  afterImg: string;
  title: string;
}

export default function MeridiqSlider({ beforeImg, afterImg, title }: MeridiqSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div
      className="meridiq-slider-container"
      style={{ '--slider-pos': `${sliderPos}%` } as React.CSSProperties}
      dir="ltr"
    >
      {/* Before Image (Base Layer - visible on right) */}
      <div className="meridiq-img-wrap meridiq-before-layer">
        <Image
          src={beforeImg}
          alt={`قبل - ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="meridiq-img"
          loading="lazy"
        />
      </div>

      {/* After Image (Clipped Layer - visible on left) */}
      <div className="meridiq-img-wrap meridiq-after-layer">
        <Image
          src={afterImg}
          alt={`بعد - ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="meridiq-img"
          loading="lazy"
        />
      </div>

      {/* Native Range Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="meridiq-range-input"
        aria-label={`اسلایدر مقایسه قبل و بعد ${title}`}
      />

      {/* Dividing Line */}
      <div className="meridiq-divider-line" />

      {/* Meridiq Handle Button */}
      <div className="meridiq-handle-button">
        <i className="fa-solid fa-arrows-left-right" />
      </div>

      {/* Badges matching reference screenshot */}
      <span className="meridiq-badge meridiq-badge-after">بعد</span>
      <span className="meridiq-badge meridiq-badge-before">قبل</span>
    </div>
  );
}
