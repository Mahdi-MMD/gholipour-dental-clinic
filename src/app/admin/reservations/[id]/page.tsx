'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/app/admin/admin.css';
import { ReservationItem } from '@/types/reservation';
import { toPersianDigits, cleanPhoneForTel } from '@/lib/reservationFormatters';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [reservation, setReservation] = useState<ReservationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        // 1. Verify admin authentication
        const authRes = await fetch('/api/admin/auth');
        const authData = await authRes.json();
        if (!authData.authenticated) {
          router.replace('/admin');
          return;
        }

        // 2. Fetch target reservation directly
        const res = await fetch(`/api/admin/reservations?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.success && data.reservation) {
          setReservation(data.reservation);
        } else {
          setError('درخواست نوبت مورد نظر یافت نشد.');
        }
      } catch {
        setError('خطا در برقراری ارتباط با سرور.');
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [id, router]);

  const handleToggleStatus = async () => {
    if (!reservation) return;
    const nextStatus = !reservation.isConfirmed;
    setIsUpdating(true);

    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservation.id, isConfirmed: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReservation(prev => (prev ? { ...prev, isConfirmed: nextStatus } : null));
        showToast(
          nextStatus
            ? 'درخواست نوبت با موفقیت تایید و بررسی شد.'
            : 'وضعیت درخواست به در انتظار تغییر یافت.'
        );
      } else {
        showToast('خطا در تغییر وضعیت نوبت.');
      }
    } catch {
      showToast('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="admin-wrapper" dir="rtl">
      {/* Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1c434f' }}>
            کلینیک دندانپزشکی قلی‌پور
          </span>
          <span className="admin-nav-badge">جزئیات نوبت</span>
        </div>
        <div className="admin-nav-actions">
          <Link href="/admin" className="admin-nav-site-link">
            بازگشت به پنل مدیریت
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-container">
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              background: '#10b981',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            {toastMessage}
          </div>
        )}

        {loading ? (
          <div className="admin-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div className="admin-spin" style={{ display: 'inline-block', marginBottom: '12px' }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1c83aa"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <p style={{ color: '#5a7d8c', fontWeight: 600 }}>در حال بارگذاری اطلاعات نوبت...</p>
          </div>
        ) : error || !reservation ? (
          <div className="admin-card" style={{ padding: '50px', textAlign: 'center' }}>
            <h3 style={{ color: '#e11d48', marginBottom: '10px' }}>خطا</h3>
            <p style={{ color: '#5a7d8c', marginBottom: '20px' }}>{error || 'نوبت یافت نشد'}</p>
            <Link
              href="/admin"
              className="admin-btn-primary"
              style={{ display: 'inline-block', width: 'auto', padding: '10px 24px' }}
            >
              بازگشت به پنل مدیریت
            </Link>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: '32px' }}>
            {/* Header Area */}
            <div className="admin-res-modal-header" style={{ position: 'relative' }}>
              <div className="admin-res-modal-tag">
                <span>شناسه درخواست: {reservation.id}</span>
              </div>
              <h1 className="admin-res-modal-title" style={{ fontSize: '26px' }}>
                {reservation.patientName}
              </h1>

              <div className="admin-res-modal-badges">
                {reservation.isConfirmed ? (
                  <span className="admin-res-status-badge confirmed">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>تایید و بررسی شده</span>
                  </span>
                ) : (
                  <span className="admin-res-status-badge pending">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>در انتظار بررسی و تماس</span>
                  </span>
                )}

                {reservation.visitedBefore === 'yes' && (
                  <span className="patient-tag previous-patient">سابقه مراجعه قبلی دارد</span>
                )}
                {reservation.visitedBefore === 'no' && (
                  <span className="patient-tag new-patient">مراجعه‌کننده جدید</span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="admin-res-modal-grid">
              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">شماره تماس همراه</span>
                <div className="admin-res-phone-action-row">
                  <span className="admin-res-item-value phone-val" dir="ltr">
                    {toPersianDigits(reservation.phone)}
                  </span>
                  <a
                    href={`tel:${cleanPhoneForTel(reservation.phone)}`}
                    className="admin-res-call-btn"
                    title="برقراری تماس مستقیم با بیمار"
                  >
                    تماس مستقیم
                  </a>
                  <button
                    type="button"
                    className="admin-res-copy-pill"
                    onClick={() => {
                      navigator.clipboard?.writeText(reservation.phone);
                      setCopiedPhone(true);
                      showToast(`شماره تماس ${reservation.phone} کپی شد`);
                      setTimeout(() => setCopiedPhone(false), 2500);
                    }}
                  >
                    {copiedPhone ? 'کپی شد!' : 'کپی شماره'}
                  </button>
                </div>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">خدمت دندانپزشکی درخواستی</span>
                <span className="admin-res-item-value highlight-value">{reservation.service}</span>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">تاریخ پیشنهادی بیمار</span>
                <span className="admin-res-item-value">
                  {reservation.proposedDate ? toPersianDigits(reservation.proposedDate) : '—'}
                </span>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">زمان ثبت در سامانه</span>
                <span className="admin-res-item-value">
                  {toPersianDigits(reservation.formattedDate)}
                </span>
              </div>

              {reservation.notes && (
                <div className="admin-res-modal-item full-width">
                  <span className="admin-res-item-label">توضیحات و یادداشت</span>
                  <p className="admin-res-notes-text">{reservation.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="admin-res-modal-actions" style={{ marginTop: '20px' }}>
              <button
                type="button"
                className={`admin-res-toggle-action-btn ${reservation.isConfirmed ? 'is-confirmed' : ''}`}
                onClick={handleToggleStatus}
                disabled={isUpdating}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  {reservation.isConfirmed
                    ? 'لغو تایید (تغییر به در انتظار)'
                    : 'تایید و ثبت بررسی این درخواست'}
                </span>
              </button>

              <button
                type="button"
                className="admin-res-newtab-btn"
                onClick={() => window.print()}
                title="چاپ یا ذخیره به صورت PDF"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>چاپ جزئیات</span>
              </button>

              <button
                type="button"
                className="admin-res-newtab-btn"
                onClick={() => router.push('/admin')}
              >
                بازگشت به لیست نوبت‌ها
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
