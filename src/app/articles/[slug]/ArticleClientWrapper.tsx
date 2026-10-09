'use client';

import React, { useState, createContext, useContext } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';
import ScrollIndicator from '@/components/ScrollIndicator';
import { ArticleFAQ } from '@/data/articlesData';

interface BookingContextType {
  openBooking: () => void;
}

const BookingContext = createContext<BookingContextType>({
  openBooking: () => {},
});

export const useBookingModal = () => useContext(BookingContext);

export function ArticleBookingButton({
  children,
  className = 'btn-primary',
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { openBooking } = useBookingModal();
  return (
    <button type="button" className={className} style={style} onClick={openBooking}>
      {children || <span>رزرو نوبت معاینه</span>}
    </button>
  );
}

export function ArticleFaqAccordion({ faqs }: { faqs: ArticleFAQ[] }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section
      id="frequently-asked-questions"
      aria-label="پرسش‌های متداول بیماران"
      style={{
        marginTop: '44px',
        paddingTop: '28px',
        borderTop: '1.5px solid #e5f1f5',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            backgroundColor: '#edf7fa',
            padding: '4px 12px',
            borderRadius: '16px',
            display: 'inline-block',
            marginBottom: '8px',
          }}
        >
          پاسخ متخصصان کلینیک
        </span>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-primary-dark)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-circle-question" style={{ color: 'var(--color-primary)' }}></i>
          <span>پرسش‌های متداول بیماران درباره این درمان</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={idx}
              style={{
                border: isOpen ? '1.5px solid var(--color-primary)' : '1px solid #dcebf0',
                borderRadius: '14px',
                backgroundColor: isOpen ? '#fcfefe' : '#ffffff',
                transition: 'all 0.25s ease',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                style={{
                  width: '100%',
                  textAlign: 'right',
                  padding: '16px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
                aria-expanded={isOpen}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: isOpen ? 'var(--color-primary-dark)' : '#263b42',
                    lineHeight: 1.5,
                  }}
                >
                  {faq.question}
                </span>
                <i
                  className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                  style={{
                    color: isOpen ? 'var(--color-primary)' : '#7a8f98',
                    fontSize: '13px',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}
                ></i>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 20px 18px 20px',
                    color: 'var(--color-text-body)',
                    fontSize: '14.5px',
                    lineHeight: 1.9,
                    borderTop: '1px dashed #e8f2f5',
                    paddingTop: '12px',
                    textAlign: 'justify',
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ArticleClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenBooking = () => {
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <BookingContext.Provider value={{ openBooking: handleOpenBooking }}>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activePage="articles"
      />

      {children}

      <Footer onOpenBooking={handleOpenBooking} />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
      <BookingDrawer isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </BookingContext.Provider>
  );
}
