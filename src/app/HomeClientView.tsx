'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import Doctors from '@/components/Doctors';
import Articles from '@/components/Articles';
import Footer from '@/components/Footer';

const BookingDrawer = dynamic(() => import('@/components/BookingDrawer'), { ssr: false });
const FloatingBubble = dynamic(() => import('@/components/FloatingBubble'), { ssr: false });
const ScrollIndicator = dynamic(() => import('@/components/ScrollIndicator'), { ssr: false });

export default function HomeClientView() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');

  const handleOpenBooking = (serviceName?: string) => {
    setSelectedService(serviceName || '');
    setMobileMenuOpen(false);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <>
      <Header
        onOpenBooking={() => handleOpenBooking()}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main>
        <Hero onOpenBooking={() => handleOpenBooking()} />
        <Services onOpenBooking={handleOpenBooking} />
        <Portfolio />
        <Testimonials />
        <Doctors />
        <Articles onOpenBooking={() => handleOpenBooking()} />
      </main>
      <Footer onOpenBooking={() => handleOpenBooking()} />
      <BookingDrawer
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={selectedService}
      />
      <FloatingBubble isMobileMenuOpen={mobileMenuOpen} />
      <ScrollIndicator />
    </>
  );
}
