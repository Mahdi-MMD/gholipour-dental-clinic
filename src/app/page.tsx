'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import FloatingBubble from '@/components/FloatingBubble';
import ScrollIndicator from '@/components/ScrollIndicator';

const Doctors = dynamic(() => import('@/components/Doctors'), {
  loading: () => <div style={{ minHeight: '300px' }} />,
});

const Articles = dynamic(() => import('@/components/Articles'), {
  loading: () => <div style={{ minHeight: '300px' }} />,
});

const BookingDrawer = dynamic(() => import('@/components/BookingDrawer'), {
  ssr: false,
});

export default function HomePage() {
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
    <>
      <Header
        onOpenBooking={handleOpenBooking}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main>
        <Hero onOpenBooking={handleOpenBooking} />
        <Services onOpenBooking={handleOpenBooking} />
        <Portfolio />
        <Testimonials />
        <Doctors />
        <Articles onOpenBooking={handleOpenBooking} />
      </main>
      <Footer onOpenBooking={handleOpenBooking} />
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
    </>
  );
}
