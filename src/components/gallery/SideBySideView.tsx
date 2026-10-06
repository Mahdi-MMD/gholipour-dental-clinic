'use client';

import React from 'react';
import Image from 'next/image';

interface SideBySideViewProps {
  beforeImg: string;
  afterImg: string;
  title: string;
}

export default function SideBySideView({ beforeImg, afterImg, title }: SideBySideViewProps) {
  return (
    <div className="side-by-side-container" dir="rtl">
      {/* Before Box (Right side in Persian RTL) */}
      <div className="side-frame">
        <Image
          src={beforeImg}
          alt={`قبل از درمان - ${title}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="side-img"
          loading="lazy"
        />
        <span className="side-badge before">قبل</span>
      </div>

      {/* After Box (Left side in Persian RTL) */}
      <div className="side-frame">
        <Image
          src={afterImg}
          alt={`بعد از درمان - ${title}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="side-img"
          loading="lazy"
        />
        <span className="side-badge after">بعد</span>
      </div>
    </div>
  );
}
