'use client';

import React from 'react';
import Image from 'next/image';
import MeridiqSlider from '@/components/gallery/MeridiqSlider';
import StagesCard from '@/components/gallery/StagesCard';
import { GalleryItem } from '@/data/galleryData';

interface GalleryPreviewProps {
  item: GalleryItem;
}

export default function GalleryPreview({ item }: GalleryPreviewProps) {
  const isStages = item.type === 'stages';

  return (
    <div className="admin-gallery-preview-wrapper" dir="rtl">
      {/* Notice Header */}
      <div className="admin-gallery-preview-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>👁️</span>
          <span style={{ fontWeight: 700, fontSize: '14.5px', color: '#1c434f' }}>
            پیش‌نمایش زنده در قالب وب‌سایت کلینیک
          </span>
        </div>
        <span
          style={{
            fontSize: '12px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontWeight: 700,
            background: isStages ? '#e0e7ff' : '#e3f9ff',
            color: isStages ? '#4338ca' : '#1c83aa',
          }}
        >
          {isStages ? 'مراحل درمان (جریان کار)' : 'مقایسه قبل و بعد'}
        </span>
      </div>

      {/* Card Simulated Container */}
      <div className="admin-gallery-preview-canvas">
        <article className="gallery-item-card admin-gallery-card-preview-target">
          {/* Main Visual Display */}
          {isStages ? (
            <StagesCard item={item} />
          ) : (
            <MeridiqSlider
              beforeImg={item.beforeImg || '/assets/gallery/stage-1.webp'}
              afterImg={item.afterImg || '/assets/gallery/stage-4.webp'}
              title={item.title || 'عنوان نمونه کار'}
            />
          )}

          {/* Card Footer */}
          <div className="gallery-card-footer">
            <div className="gallery-card-text">
              <h3 className="gallery-card-title" title={item.title}>
                {item.title || 'عنوان نمونه کار ثبت نشده است'}
              </h3>
              <div className="gallery-card-tags">
                <span className="gallery-tag-pill">{item.categoryLabel || 'دسته‌بندی عمومی'}</span>
                {item.subCategoryLabel && (
                  <>
                    <span>•</span>
                    <span>{item.subCategoryLabel}</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              className="gallery-card-action-btn"
              aria-label="مشاهده جزئیات نمونه کار"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </article>

        {/* Detailed Metadata Preview Block (Similar to modal info) */}
        <div className="admin-gallery-meta-preview-box">
          <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 10px 0', color: '#1c434f' }}>
            اطلاعات تکمیلی پرونده درمان
          </h4>
          <p
            style={{ fontSize: '13.5px', color: '#5a7d8c', lineHeight: 1.7, margin: '0 0 16px 0' }}
          >
            {item.description || 'توضیحات تکمیلی برای این نمونه کار ثبت نشده است.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '14px',
              background: '#f8fdff',
              borderRadius: '12px',
              border: '1px solid #d8eef5',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#8faab6', display: 'block' }}>
                طول درمان:
              </span>
              <strong style={{ fontSize: '13px', color: '#1c434f' }}>{item.duration || '—'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#8faab6', display: 'block' }}>
                تعداد جلسات:
              </span>
              <strong style={{ fontSize: '13px', color: '#1c434f' }}>{item.sessions || '—'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#8faab6', display: 'block' }}>
                پزشک معالج:
              </span>
              <strong style={{ fontSize: '13px', color: '#1c434f' }}>{item.doctor || '—'}</strong>
            </div>
          </div>

          {/* If Stages mode, show thumbnail sequence below */}
          {isStages && item.stages && item.stages.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h5
                style={{
                  fontSize: '13.5px',
                  fontWeight: 700,
                  margin: '0 0 10px 0',
                  color: '#1c434f',
                }}
              >
                ترتیب مراحل درمان ({item.stages.length} مرحله):
              </h5>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                {item.stages.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #d8eef5',
                      borderRadius: '10px',
                      padding: '8px',
                      background: '#ffffff',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '80px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '6px',
                      }}
                    >
                      <Image
                        src={st.image || '/assets/gallery/stage-1.webp'}
                        alt={st.title || `مرحله ${idx + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'block',
                        color: '#1c83aa',
                      }}
                    >
                      {st.title || `مرحله ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
