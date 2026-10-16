'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface PersianDatePickerProps {
  id?: string;
  value?: string; // Formatted Persian date string, e.g. "شنبه، ۲۵ مهر ۱۴۰۵"
  onChange: (formattedDate: string, gregorianDate: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface JalaliParts {
  year: number;
  month: number;
  day: number;
}

// Persian numerals mapping
const toPersianDigits = (num: number | string): string => {
  const persianMap: Record<string, string> = {
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '۴',
    '5': '۵',
    '6': '۶',
    '7': '۷',
    '8': '۸',
    '9': '۹',
  };
  return String(num).replace(/[0-9]/g, digit => persianMap[digit] || digit);
};

// Helper: Extract Jalali year, month, day using standard ECMAScript Intl
const getJalaliParts = (date: Date): JalaliParts => {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  return {
    year: parseInt(parts.find(p => p.type === 'year')?.value || '1400', 10),
    month: parseInt(parts.find(p => p.type === 'month')?.value || '1', 10),
    day: parseInt(parts.find(p => p.type === 'day')?.value || '1', 10),
  };
};

// Persian month names
const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

// Weekday headers in Persian starting with Saturday (شنبه)
const WEEKDAY_NAMES = [
  { short: 'ش', full: 'شنبه' },
  { short: 'ی', full: 'یکشنبه' },
  { short: 'د', full: 'دوشنبه' },
  { short: 'س', full: 'سه‌شنبه' },
  { short: 'چ', full: 'چهارشنبه' },
  { short: 'پ', full: 'پنجشنبه' },
  { short: 'ج', full: 'جمعه' },
];

export default function PersianDatePicker({
  id = 'persian-date-picker',
  value,
  onChange,
  error,
  placeholder = 'انتخاب تاریخ از تقویم...',
  disabled = false,
  isOpen: propsIsOpen,
  onOpenChange,
}: PersianDatePickerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    if (onOpenChange) {
      onOpenChange(val);
    } else {
      setInternalIsOpen(val);
    }
  };

  const [selectedJalali, setSelectedJalali] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  // Clear selected date if value is reset
  useEffect(() => {
    if (!value) {
      setSelectedJalali(null);
    }
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Today reference at noon to eliminate DST / timezone offset issues
  const todayDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  }, []);

  const todayJalali = useMemo(() => getJalaliParts(todayDate), [todayDate]);

  // First day of current Jalali month
  const firstOfCurrentMonth = useMemo(() => {
    return new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() - (todayJalali.day - 1),
      12,
      0,
      0
    );
  }, [todayDate, todayJalali.day]);

  // Viewed month cursor (represented by the Gregorian Date of the 1st of that Jalali month)
  const [viewedFirstOfMonth, setViewedFirstOfMonth] = useState<Date>(firstOfCurrentMonth);

  // Calculate Jalali parts for viewed month
  const viewedJalali = useMemo(() => getJalaliParts(viewedFirstOfMonth), [viewedFirstOfMonth]);

  // When opening calendar, sync viewed month to selected date if already selected
  useEffect(() => {
    if (isOpen && selectedJalali) {
      if (
        viewedJalali.year !== selectedJalali.year ||
        viewedJalali.month !== selectedJalali.month
      ) {
        const monthDiff =
          (selectedJalali.year - todayJalali.year) * 12 +
          (selectedJalali.month - todayJalali.month);
        let cursor = new Date(firstOfCurrentMonth);
        for (let i = 0; i < monthDiff; i++) {
          const nextTarget = new Date(
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate() + 32,
            12,
            0,
            0
          );
          const nextParts = getJalaliParts(nextTarget);
          cursor = new Date(
            nextTarget.getFullYear(),
            nextTarget.getMonth(),
            nextTarget.getDate() - (nextParts.day - 1),
            12,
            0,
            0
          );
        }
        setViewedFirstOfMonth(cursor);
      }
    }
  }, [isOpen, selectedJalali]);

  // Month navigation: disable prev button if we are in current month or earlier
  const canGoPrev = useMemo(() => {
    if (viewedJalali.year > todayJalali.year) return true;
    if (viewedJalali.year === todayJalali.year) {
      return viewedJalali.month > todayJalali.month;
    }
    return false;
  }, [viewedJalali, todayJalali]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    const prevTarget = new Date(
      viewedFirstOfMonth.getFullYear(),
      viewedFirstOfMonth.getMonth(),
      viewedFirstOfMonth.getDate() - 15,
      12,
      0,
      0
    );
    const prevParts = getJalaliParts(prevTarget);
    const firstOfPrev = new Date(
      prevTarget.getFullYear(),
      prevTarget.getMonth(),
      prevTarget.getDate() - (prevParts.day - 1),
      12,
      0,
      0
    );
    setViewedFirstOfMonth(firstOfPrev);
  };

  const handleNextMonth = () => {
    const nextTarget = new Date(
      viewedFirstOfMonth.getFullYear(),
      viewedFirstOfMonth.getMonth(),
      viewedFirstOfMonth.getDate() + 32,
      12,
      0,
      0
    );
    const nextParts = getJalaliParts(nextTarget);
    const firstOfNext = new Date(
      nextTarget.getFullYear(),
      nextTarget.getMonth(),
      nextTarget.getDate() - (nextParts.day - 1),
      12,
      0,
      0
    );
    setViewedFirstOfMonth(firstOfNext);
  };

  // Compute number of days in the currently viewed month
  const daysInViewedMonth = useMemo(() => {
    const nextTarget = new Date(
      viewedFirstOfMonth.getFullYear(),
      viewedFirstOfMonth.getMonth(),
      viewedFirstOfMonth.getDate() + 32,
      12,
      0,
      0
    );
    const nextParts = getJalaliParts(nextTarget);
    const firstOfNext = new Date(
      nextTarget.getFullYear(),
      nextTarget.getMonth(),
      nextTarget.getDate() - (nextParts.day - 1),
      12,
      0,
      0
    );
    return Math.round((firstOfNext.getTime() - viewedFirstOfMonth.getTime()) / 86400000);
  }, [viewedFirstOfMonth]);

  // Weekday offset of Day 1 (Saturday = 0, Sunday = 1, ..., Friday = 6)
  const startDayOffset = useMemo(() => {
    return (viewedFirstOfMonth.getDay() + 1) % 7;
  }, [viewedFirstOfMonth]);

  // Generate days array
  const monthDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= daysInViewedMonth; d++) {
      const dayDate = new Date(
        viewedFirstOfMonth.getFullYear(),
        viewedFirstOfMonth.getMonth(),
        viewedFirstOfMonth.getDate() + (d - 1),
        12,
        0,
        0
      );

      // Check if day is strictly future (i.e. > today)
      // Note constraint: "limit the calendar date to future dates, not today and not previous dates."
      const isPastOrToday =
        viewedJalali.year < todayJalali.year ||
        (viewedJalali.year === todayJalali.year && viewedJalali.month < todayJalali.month) ||
        (viewedJalali.year === todayJalali.year &&
          viewedJalali.month === todayJalali.month &&
          d <= todayJalali.day);

      const isToday =
        viewedJalali.year === todayJalali.year &&
        viewedJalali.month === todayJalali.month &&
        d === todayJalali.day;

      days.push({
        dayNumber: d,
        date: dayDate,
        isDisabled: isPastOrToday,
        isToday,
      });
    }
    return days;
  }, [viewedFirstOfMonth, daysInViewedMonth, viewedJalali, todayJalali]);

  // Handle clicking outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectDay = (dayDate: Date, dayNum: number) => {
    const weekdayName = WEEKDAY_NAMES[(dayDate.getDay() + 1) % 7].full;
    const monthName = PERSIAN_MONTH_NAMES[viewedJalali.month - 1];
    const yearStr = toPersianDigits(viewedJalali.year);
    const dayStr = toPersianDigits(dayNum);

    setSelectedJalali({
      year: viewedJalali.year,
      month: viewedJalali.month,
      day: dayNum,
    });

    // Formatted date string in Persian
    const formattedDate = `${weekdayName}، ${dayStr} ${monthName} ${yearStr}`;

    onChange(formattedDate, dayDate);
    setIsOpen(false);
  };

  const currentMonthTitle = `${PERSIAN_MONTH_NAMES[viewedJalali.month - 1]} ${toPersianDigits(viewedJalali.year)}`;

  return (
    <div
      ref={containerRef}
      className={`persian-datepicker-container ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {/* Trigger Button / Input Display */}
      <button
        type="button"
        id={id}
        className={`persian-datepicker-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className="trigger-icon">
          <i className="fa-regular fa-calendar-days"></i>
        </span>
        <span className={`trigger-text ${!value ? 'placeholder' : ''}`}>
          {value || placeholder}
        </span>
        <span className="trigger-arrow">
          <i className={`fa-solid fa-chevron-${isOpen ? 'down' : 'up'}`}></i>
        </span>
      </button>

      {/* Popover Calendar Card with smooth CSS transition */}
      <div
        className={`persian-datepicker-popover ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="تقویم شمسی انتخاب تاریخ نوبت"
        aria-hidden={!isOpen}
      >
        {/* Calendar Header with Month Navigation */}
        <div className="calendar-header">
          <button
            type="button"
            className="calendar-nav-btn next-month-btn"
            onClick={handleNextMonth}
            title="ماه بعد"
            aria-label="ماه بعد"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="calendar-month-label">{currentMonthTitle}</div>

          <button
            type="button"
            className={`calendar-nav-btn prev-month-btn ${!canGoPrev ? 'disabled' : ''}`}
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            title="ماه قبل"
            aria-label="ماه قبل"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        </div>

        {/* Weekday Names */}
        <div className="calendar-weekdays" aria-hidden="true">
          {WEEKDAY_NAMES.map((w, index) => (
            <div
              key={w.short}
              className={`calendar-weekday ${index === 6 ? 'is-friday' : ''}`}
              title={w.full}
            >
              {w.short}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="calendar-grid">
          {/* Blank cells for alignment */}
          {Array.from({ length: startDayOffset }).map((_, index) => (
            <div key={`blank-${index}`} className="calendar-day blank" aria-hidden="true" />
          ))}

          {/* Month Day Cells */}
          {monthDays.map(item => {
            const isSelected = Boolean(
              selectedJalali &&
              selectedJalali.year === viewedJalali.year &&
              selectedJalali.month === viewedJalali.month &&
              selectedJalali.day === item.dayNumber
            );

            return (
              <button
                key={`day-${item.dayNumber}`}
                type="button"
                className={`calendar-day ${item.isDisabled ? 'disabled' : 'selectable'} ${isSelected ? 'selected' : ''} ${item.isToday ? 'is-today' : ''}`}
                disabled={item.isDisabled}
                onClick={() => !item.isDisabled && handleSelectDay(item.date, item.dayNumber)}
                aria-label={`${item.dayNumber} ${PERSIAN_MONTH_NAMES[viewedJalali.month - 1]}`}
                title={
                  item.isToday
                    ? 'امروز (غیرقابل انتخاب - فقط روزهای آینده مجاز است)'
                    : item.isDisabled
                      ? 'تاریخ گذشته (غیرقابل انتخاب)'
                      : `${item.dayNumber} ${PERSIAN_MONTH_NAMES[viewedJalali.month - 1]}`
                }
              >
                <span className="day-number">{toPersianDigits(item.dayNumber)}</span>
                {item.isToday && <span className="today-badge">امروز</span>}
              </button>
            );
          })}
        </div>

        {/* Calendar Footer Tip */}
        <div className="calendar-footer-tip">
          <i className="fa-solid fa-circle-info"></i>
          <span>تنها تاریخ‌های بعد از امروز برای نوبت‌دهی قابل انتخاب می‌باشند.</span>
        </div>
      </div>
    </div>
  );
}
