'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MeridiqSlider from '@/components/gallery/MeridiqSlider';
import StagesCard, { openStagesFancybox } from '@/components/gallery/StagesCard';
import { GalleryItem } from '@/data/galleryData';
import '@/app/gallery.css';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

interface GalleryPreviewProps {
  item: GalleryItem;
}

export default function GalleryPreview({ item }: GalleryPreviewProps) {
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);
  const isStages = item.type === 'stages';

  const hasBeforeImg = Boolean(item.beforeImg && item.beforeImg.trim());
  const hasAfterImg = Boolean(item.afterImg && item.afterImg.trim());
  const hasBothBeforeAfter = hasBeforeImg && hasAfterImg;

  const validStages = (item.stages || []).filter(s => Boolean(s.image && s.image.trim()));
  const hasAnyStageImg = validStages.length > 0;

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
            padding: '4px 12px',
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
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <article className="gallery-item-card admin-gallery-card-preview-target">
            {/* Visual Media Slot */}
            {isStages ? (
              hasAnyStageImg ? (
                <StagesCard item={item} />
              ) : (
                /* Framed Stages Placeholder */
                <div
                  className="stages-card-cover-wrap"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1c434f 0%, #1c83aa 100%)',
                    color: '#ffffff',
                    cursor: 'default',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <strong style={{ fontSize: '15px', fontWeight: 800 }}>
                    عکس یک (مراحل درمان)
                  </strong>
                  <span style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
                    تصاویر مراحل کار هنوز بارگذاری نشده‌اند
                  </span>
                  <div className="stages-count-badge">
                    <i className="fa-solid fa-layer-group" />
                    <span>{(item.stages || []).length || 2} مرحله درمانی</span>
                  </div>
                </div>
              )
            ) : hasBothBeforeAfter ? (
              <MeridiqSlider
                beforeImg={item.beforeImg!}
                afterImg={item.afterImg!}
                title={item.title || 'نمونه‌کار'}
              />
            ) : (
              /* Framed Before/After Placeholder */
              <div
                className="meridiq-slider-container"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: '#f0f9fc',
                  border: '1.5px dashed #b6dbe6',
                  cursor: 'default',
                }}
              >
                {/* Before side (Right in RTL) */}
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: '1.5px solid #d8eef5',
                    background: hasBeforeImg ? '#000000' : 'rgba(227, 249, 255, 0.5)',
                  }}
                >
                  {hasBeforeImg ? (
                    <img
                      src={item.beforeImg!}
                      alt="عکس قبل"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>
                        📷
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#1c434f', display: 'block' }}>
                        عکس قبل
                      </strong>
                      <span style={{ fontSize: '11px', color: '#8faab6' }}>هنوز بارگذاری نشده</span>
                    </div>
                  )}
                  <span className="meridiq-badge meridiq-badge-before">قبل</span>
                </div>

                {/* After side (Left in RTL) */}
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: hasAfterImg ? '#000000' : 'rgba(240, 249, 252, 0.5)',
                  }}
                >
                  {hasAfterImg ? (
                    <img
                      src={item.afterImg!}
                      alt="عکس بعد"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>
                        ✨
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#1c434f', display: 'block' }}>
                        عکس بعد
                      </strong>
                      <span style={{ fontSize: '11px', color: '#8faab6' }}>هنوز بارگذاری نشده</span>
                    </div>
                  )}
                  <span className="meridiq-badge meridiq-badge-after">بعد</span>
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div
              className="gallery-card-footer"
              onClick={() => {
                if (isStages && hasAnyStageImg) {
                  openStagesFancybox(item);
                } else if (!isStages && hasBothBeforeAfter) {
                  setActiveModalItem(item);
                }
              }}
              title={
                isStages
                  ? 'مشاهده مراحل درمان و بزرگ‌نمایی'
                  : 'مشاهده جزئیات نمونه‌کار و بزرگ‌نمایی'
              }
            >
              <div className="gallery-card-text">
                <h3 className="gallery-card-title" title={item.title}>
                  {item.title || 'عنوان نمونه‌کار ثبت نشده است'}
                </h3>
                <div className="gallery-card-tags">
                  <span className="gallery-tag-pill">
                    {item.categoryLabel || 'دسته‌بندی عمومی'}
                  </span>
                  {item.subCategoryLabel && (
                    <>
                      <span>•</span>
                      <span>{item.subCategoryLabel}</span>
                    </>
                  )}
                </div>
              </div>

              <button type="button" className="gallery-card-cta-btn" aria-label="مشاهده جزئیات">
                <i className="fa-solid fa-angle-left" />
              </button>
            </div>
          </article>
        </div>

        {/* Detailed Metadata Preview Block (Similar to modal info) */}
        <div className="admin-gallery-meta-preview-box">
          <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 10px 0', color: '#1c434f' }}>
            اطلاعات تکمیلی پرونده درمان
          </h4>
          <p
            style={{ fontSize: '13.5px', color: '#5a7d8c', lineHeight: 1.7, margin: '0 0 16px 0' }}
          >
            {item.description || 'توضیحات تکمیلی برای این نمونه‌کار ثبت نشده است.'}
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
                        background: '#f0f9fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {st.image ? (
                        <img
                          src={st.image}
                          alt={st.title || `عکس ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: '11.5px', color: '#8faab6', fontWeight: 600 }}>
                          عکس {idx + 1}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'block',
                        color: '#1c83aa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {st.title || `عکس ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL / LIGHTBOX (Faithfully matching GalleryClient modal) */}
      {activeModalItem && (
        <div
          className="gallery-modal-overlay"
          onClick={() => setActiveModalItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gallery-modal-dialog" onClick={e => e.stopPropagation()} dir="rtl">
            <button
              type="button"
              className="gallery-modal-close"
              onClick={() => setActiveModalItem(null)}
              aria-label="بستن پنجره"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="gallery-modal-slider-box">
              {isStages ? (
                <StagesCard item={activeModalItem} />
              ) : (
                <MeridiqSlider
                  beforeImg={activeModalItem.beforeImg || ''}
                  afterImg={activeModalItem.afterImg || ''}
                  title={activeModalItem.title}
                />
              )}
            </div>

            <div className="gallery-modal-body">
              <h2 className="gallery-modal-title">{activeModalItem.title}</h2>
              <p className="gallery-modal-desc">{activeModalItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
