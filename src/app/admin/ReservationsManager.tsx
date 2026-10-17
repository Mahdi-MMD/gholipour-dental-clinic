'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ReservationItem, ReservationFilter } from '@/types/reservation';
import { toPersianDigits, cleanPhoneForTel } from '@/lib/reservationFormatters';

interface ReservationsManagerProps {
  reservations: ReservationItem[];
  setReservations: React.Dispatch<React.SetStateAction<ReservationItem[]>>;
  onRefresh: () => Promise<void>;
  onTriggerToast: (message?: string) => void;
}

export default function ReservationsManager({
  reservations,
  setReservations,
  onRefresh,
  onTriggerToast,
}: ReservationsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationFilter>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [reservationToDelete, setReservationToDelete] = useState<ReservationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedReservation(null);
        setReservationToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered and Sorted list
  const filteredReservations = useMemo(() => {
    let result = [...reservations];

    // Status filter
    if (statusFilter === 'pending') {
      result = result.filter(r => !r.isConfirmed);
    } else if (statusFilter === 'confirmed') {
      result = result.filter(r => r.isConfirmed);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(r => {
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.service.toLowerCase().includes(q) ||
          r.proposedDate.toLowerCase().includes(q) ||
          r.formattedDate.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
        );
      });
    }

    // Sort order by date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reservations, statusFilter, searchQuery, sortOrder]);

  // Statistics
  const totalCount = reservations.length;
  const pendingCount = reservations.filter(r => !r.isConfirmed).length;
  const confirmedCount = reservations.filter(r => r.isConfirmed).length;

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      onTriggerToast('لیست نوبت‌ها با موفقیت به‌روزرسانی شد');
    } catch {
      onTriggerToast('خطا در به‌روزرسانی نوبت‌ها');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle Confirmed / Reviewed Status
  const handleToggleStatus = async (item: ReservationItem) => {
    const nextStatus = !item.isConfirmed;
    setUpdatingId(item.id);

    // Optimistic UI update
    setReservations(prev =>
      prev.map(r =>
        r.id === item.id
          ? {
              ...r,
              isConfirmed: nextStatus,
              confirmedAt: nextStatus ? new Date().toISOString() : null,
            }
          : r
      )
    );

    if (selectedReservation?.id === item.id) {
      setSelectedReservation(prev =>
        prev
          ? {
              ...prev,
              isConfirmed: nextStatus,
              confirmedAt: nextStatus ? new Date().toISOString() : null,
            }
          : null
      );
    }

    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, isConfirmed: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback
        setReservations(prev => prev.map(r => (r.id === item.id ? item : r)));
        onTriggerToast('خطا در به‌روزرسانی وضعیت نوبت');
      } else {
        onTriggerToast(
          nextStatus
            ? `نوبت «${item.patientName}» تایید و بررسی شد`
            : `وضعیت نوبت «${item.patientName}» به در انتظار بررسی تغییر یافت`
        );
      }
    } catch {
      // Rollback
      setReservations(prev => prev.map(r => (r.id === item.id ? item : r)));
      onTriggerToast('خطا در ارتباط با سرور');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Reservation
  const handleDeleteConfirm = async () => {
    if (!reservationToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/reservations?id=${encodeURIComponent(reservationToDelete.id)}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setReservations(prev => prev.filter(r => r.id !== reservationToDelete.id));
        if (selectedReservation?.id === reservationToDelete.id) {
          setSelectedReservation(null);
        }
        onTriggerToast(`درخواست نوبت «${reservationToDelete.patientName}» با موفقیت حذف شد`);
        setReservationToDelete(null);
      } else {
        onTriggerToast('خطا در حذف نوبت');
      }
    } catch {
      onTriggerToast('خطا در ارتباط با سرور هنگام حذف نوبت');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Phone helper
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    onTriggerToast(`شماره تماس ${phone} کپی شد`);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  return (
    <div className="admin-card admin-reservations-wrapper">
      {/* Top Header & Overview */}
      <div className="admin-reservations-header">
        <div>
          <h3 className="admin-reservations-title">مدیریت نوبت‌دهی و رزروهای آنلاین</h3>
          <p className="admin-reservations-subtitle">
            بررسی، تایید و پیگیری درخواست‌های نوبت‌دهی مراجعین کلینیک دندانپزشکی قلی‌پور.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="admin-reservations-refresh-btn"
          title="به‌روزرسانی و همگام‌سازی اطلاعات با دیتابیس"
        >
          <svg
            className={isRefreshing ? 'admin-spin' : ''}
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{isRefreshing ? 'در حال همگام‌سازی...' : 'همگام‌سازی'}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="admin-reservations-stats">
        <div
          className={`admin-res-stat-card ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="admin-res-stat-icon all">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <div className="admin-res-stat-info">
            <span className="admin-res-stat-label">کل درخواست‌ها</span>
            <span className="admin-res-stat-value">{toPersianDigits(totalCount)}</span>
          </div>
        </div>

        <div
          className={`admin-res-stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          <div className="admin-res-stat-icon pending">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="admin-res-stat-info">
            <span className="admin-res-stat-label">در انتظار بررسی</span>
            <span className="admin-res-stat-value">{toPersianDigits(pendingCount)}</span>
          </div>
        </div>

        <div
          className={`admin-res-stat-card ${statusFilter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
        >
          <div className="admin-res-stat-icon confirmed">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="admin-res-stat-info">
            <span className="admin-res-stat-label">تایید و بررسی شده</span>
            <span className="admin-res-stat-value">{toPersianDigits(confirmedCount)}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Sort */}
      <div className="admin-reservations-controls">
        <div className="admin-reservations-search-wrap">
          <svg
            className="admin-reservations-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-input admin-reservations-search-input"
            placeholder="جستجو بر اساس نام بیمار، شماره تماس، نام خدمت یا تاریخ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="admin-search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="پاک کردن جستجو"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="admin-reservations-filters">
          <div className="admin-reservations-pills">
            <button
              type="button"
              className={`admin-res-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              همه ({toPersianDigits(totalCount)})
            </button>
            <button
              type="button"
              className={`admin-res-pill ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              در انتظار ({toPersianDigits(pendingCount)})
            </button>
            <button
              type="button"
              className={`admin-res-pill ${statusFilter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('confirmed')}
            >
              تایید شده ({toPersianDigits(confirmedCount)})
            </button>
          </div>

          <button
            type="button"
            className="admin-res-sort-btn"
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            title={
              sortOrder === 'desc'
                ? 'مرتب‌سازی: جدیدترین به قدیمی‌ترین'
                : 'مرتب‌سازی: قدیمی‌ترین به جدیدترین'
            }
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>{sortOrder === 'desc' ? 'جدیدترین درخواست‌ها' : 'قدیمی‌ترین درخواست‌ها'}</span>
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="admin-reservations-table-container">
        {filteredReservations.length === 0 ? (
          <div className="admin-reservations-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h4>هیچ درخواست نوبتی یافت نشد</h4>
            <p>
              {searchQuery.trim()
                ? 'با فیلتر جستجوی فعلی نتیجه‌ای پیدا نشد. لطفاً عبارت جستجو را تغییر دهید.'
                : 'هنوز هیچ درخواست نوبتی در این بخش ثبت نشده است.'}
            </p>
          </div>
        ) : (
          <table className="admin-reservations-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>ردیف</th>
                <th style={{ textAlign: 'right' }}>نام بیمار</th>
                <th style={{ textAlign: 'center' }}>شماره تماس</th>
                <th style={{ textAlign: 'center' }}>خدمت درخواستی</th>
                <th style={{ textAlign: 'center' }}>تاریخ پیشنهادی</th>
                <th style={{ textAlign: 'center' }}>تاریخ ثبت</th>
                <th style={{ textAlign: 'center' }}>وضعیت</th>
                <th style={{ width: '60px', textAlign: 'center' }}>تایید</th>
                <th style={{ width: '130px', textAlign: 'center' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((item, index) => {
                const isConfirmed = item.isConfirmed;
                const isUpdating = updatingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`admin-res-row ${isConfirmed ? 'is-confirmed-row' : ''}`}
                  >
                    {/* Row / List Number */}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#5a7d8c' }}>
                      {toPersianDigits(item.listNumber || index + 1)}
                    </td>

                    {/* Patient Name */}
                    <td>
                      <div className="admin-res-patient-name">
                        <span className="patient-name-text">{item.patientName}</span>
                        {item.visitedBefore === 'yes' && (
                          <span
                            className="patient-tag previous-patient"
                            title="سابقه قبلی ویزیت در کلینیک"
                          >
                            بیمار قبلی
                          </span>
                        )}
                        {item.visitedBefore === 'no' && (
                          <span className="patient-tag new-patient" title="مراجعه‌کننده جدید">
                            مراجعه جدید
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="admin-res-phone-cell">
                        <a
                          href={`tel:${cleanPhoneForTel(item.phone)}`}
                          className="admin-res-phone-link"
                          dir="ltr"
                          title="تماس تلفنی با بیمار"
                        >
                          {toPersianDigits(item.phone)}
                        </a>
                        <button
                          type="button"
                          className="admin-res-phone-copy-btn"
                          onClick={() => handleCopyPhone(item.phone)}
                          title="کپی شماره تماس"
                        >
                          {copiedPhone === item.phone ? (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Service */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="admin-badge admin-badge-service">{item.service}</span>
                    </td>

                    {/* Proposed Date */}
                    <td
                      style={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#1c434f',
                        fontWeight: 600,
                      }}
                    >
                      {item.proposedDate ? toPersianDigits(item.proposedDate) : '—'}
                    </td>

                    {/* Request Submission Date */}
                    <td style={{ textAlign: 'center', fontSize: '12.5px', color: '#5a7d8c' }}>
                      {toPersianDigits(item.formattedDate)}
                    </td>

                    {/* Status Badge */}
                    <td style={{ textAlign: 'center' }}>
                      {isConfirmed ? (
                        <span className="admin-res-status-badge confirmed">
                          <svg
                            width="11"
                            height="11"
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
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>در انتظار بررسی</span>
                        </span>
                      )}
                    </td>

                    {/* Checkmark / Checkbox for Confirmed Status (At left side of the list) */}
                    <td style={{ textAlign: 'center' }}>
                      <label
                        className="admin-res-checkbox-wrap"
                        title={
                          isConfirmed
                            ? 'علامت‌گذاری به عنوان در انتظار بررسی'
                            : 'تایید و ثبت بررسی این درخواست'
                        }
                      >
                        <input
                          type="checkbox"
                          checked={isConfirmed}
                          disabled={isUpdating}
                          onChange={() => handleToggleStatus(item)}
                          className="admin-res-checkbox-input"
                        />
                        <span
                          className={`admin-res-custom-checkbox ${isConfirmed ? 'checked' : ''}`}
                        >
                          {isConfirmed && (
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
                          )}
                        </span>
                      </label>
                    </td>

                    {/* Action Buttons: View Full Detail, Open New Tab, & Delete (At left side of list) */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="admin-table-actions">
                        {/* Full View Modal Popup Button */}
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn-view"
                          onClick={() => setSelectedReservation(item)}
                          title="مشاهده جزئیات کامل درخواست (پنجره پاپ‌آپ)"
                          aria-label="مشاهده جزئیات"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>مشاهده</span>
                        </button>

                        {/* Open in New Tab Button (for crowded list / direct navigation) */}
                        <a
                          href={`/admin/reservations/${item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-action-btn admin-action-btn-newtab"
                          title="باز کردن صفحه کامل در تب جدید مرورگر"
                          aria-label="باز کردن در تب جدید"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn-delete"
                          onClick={() => setReservationToDelete(item)}
                          title="حذف درخواست نوبت"
                          aria-label="حذف نوبت"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* FULL VIEW MODAL (Middle of page with blurry background & 'X' button at top-left) */}
      {selectedReservation && (
        <div
          className="admin-res-modal-backdrop"
          onClick={() => setSelectedReservation(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="admin-res-modal-card" onClick={e => e.stopPropagation()} dir="rtl">
            {/* Close 'X' Button at Top-Left Corner */}
            <button
              type="button"
              className="admin-res-modal-close-btn"
              onClick={() => setSelectedReservation(null)}
              title="بستن پنجره"
              aria-label="بستن پنجره"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="admin-res-modal-header">
              <div className="admin-res-modal-tag">
                <span>درخواست نوبت #{toPersianDigits(selectedReservation.listNumber || 1)}</span>
                <span className="admin-res-modal-id">({selectedReservation.id})</span>
              </div>
              <h2 className="admin-res-modal-title">{selectedReservation.patientName}</h2>
              <div className="admin-res-modal-badges">
                {selectedReservation.isConfirmed ? (
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
                {selectedReservation.visitedBefore === 'yes' && (
                  <span className="patient-tag previous-patient">سابقه مراجعه قبلی دارد</span>
                )}
                {selectedReservation.visitedBefore === 'no' && (
                  <span className="patient-tag new-patient">مراجعه‌کننده جدید</span>
                )}
              </div>
            </div>

            {/* Modal Details Grid */}
            <div className="admin-res-modal-grid">
              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>شماره تماس همراه</span>
                </span>
                <div className="admin-res-phone-action-row">
                  <span className="admin-res-item-value phone-val" dir="ltr">
                    {toPersianDigits(selectedReservation.phone)}
                  </span>
                  <a
                    href={`tel:${cleanPhoneForTel(selectedReservation.phone)}`}
                    className="admin-res-call-btn"
                    title="برقراری تماس مستقیم"
                  >
                    تماس تلفنی
                  </a>
                  <button
                    type="button"
                    className="admin-res-copy-pill"
                    onClick={() => handleCopyPhone(selectedReservation.phone)}
                  >
                    {copiedPhone === selectedReservation.phone ? 'کپی شد!' : 'کپی شماره'}
                  </button>
                </div>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span>خدمت دندانپزشکی درخواستی</span>
                </span>
                <span className="admin-res-item-value highlight-value">
                  {selectedReservation.service}
                </span>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>تاریخ پیشنهادی بیمار جهت مراجعه</span>
                </span>
                <span className="admin-res-item-value">
                  {selectedReservation.proposedDate
                    ? toPersianDigits(selectedReservation.proposedDate)
                    : 'مشخص نشده'}
                </span>
              </div>

              <div className="admin-res-modal-item">
                <span className="admin-res-item-label">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>تاریخ و ساعت ثبت درخواست</span>
                </span>
                <span className="admin-res-item-value">
                  {toPersianDigits(selectedReservation.formattedDate)}
                </span>
              </div>

              {selectedReservation.notes && (
                <div className="admin-res-modal-item full-width">
                  <span className="admin-res-item-label">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>توضیحات و یادداشت بیمار</span>
                  </span>
                  <p className="admin-res-notes-text">{selectedReservation.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="admin-res-modal-actions">
              <button
                type="button"
                className={`admin-res-toggle-action-btn ${selectedReservation.isConfirmed ? 'is-confirmed' : ''}`}
                onClick={() => handleToggleStatus(selectedReservation)}
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
                  {selectedReservation.isConfirmed
                    ? 'لغو تایید (تغییر به در انتظار)'
                    : 'تایید و بررسی درخواست'}
                </span>
              </button>

              <button
                type="button"
                className="admin-res-newtab-btn"
                onClick={() =>
                  window.open(`/admin/reservations/${selectedReservation.id}`, '_blank')
                }
                title="باز کردن صفحه کامل در تب جدید مرورگر"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>باز کردن در تب جدید</span>
              </button>

              <button
                type="button"
                className="admin-res-delete-btn"
                onClick={() => {
                  setReservationToDelete(selectedReservation);
                  setSelectedReservation(null);
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>حذف این رزرو</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {reservationToDelete && (
        <div
          className="admin-res-modal-backdrop"
          onClick={() => !isDeleting && setReservationToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="admin-res-delete-modal-card" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="admin-res-delete-icon-wrap">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h3 className="admin-res-delete-title">حذف درخواست نوبت</h3>
            <p className="admin-res-delete-desc">
              آیا از حذف درخواست نوبت <strong>«{reservationToDelete.patientName}»</strong> برای خدمت{' '}
              <strong>«{reservationToDelete.service}»</strong> مطمئن هستید؟ این عمل غیرقابل بازگشت
              است.
            </p>
            <div className="admin-res-delete-buttons">
              <button
                type="button"
                className="admin-res-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'در حال حذف...' : 'بله، حذف شود'}
              </button>
              <button
                type="button"
                className="admin-res-delete-cancel-btn"
                onClick={() => setReservationToDelete(null)}
                disabled={isDeleting}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
