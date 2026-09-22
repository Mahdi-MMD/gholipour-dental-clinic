'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import Doctors from '@/components/Doctors';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';
import BookingDrawer from '@/components/BookingDrawer';
import FloatingBubble from '@/components/FloatingBubble';

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
      <FloatingBubble />
    </>
  );
}
