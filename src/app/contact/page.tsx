import type { Metadata } from 'next';
import ContactClientView from './ContactClientView';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

export const metadata: Metadata = {
  title: 'تماس با ما و آدرس کلینیک | کلینیک دندانپزشکی قلی‌پور زیباکنار',
  description:
    'راه‌های ارتباطی، شماره تلفن ثابت، شماره تماس، آدرس دقیق، نقشه و ساعات کاری کلینیک دندانپزشکی قلی‌پور در استان گیلان (زیباکنار).',
  keywords: [
    'تماس با کلینیک دندانپزشکی قلی پور',
    'آدرس دندانپزشکی زیباکنار',
    'شماره تلفن دندانپزشکی زیباکنار',
    'نوبت دهی دندانپزشکی قلی پور',
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'تماس با ما | کلینیک دندانپزشکی قلی‌پور',
    description:
      'آدرس و شماره‌های تماس کلینیک دندانپزشکی قلی‌پور در گیلان، زیباکنار. امکان ارسال پیام مستقیم و مسیریابی آنلاین.',
    url: `${siteUrl}/contact`,
    siteName: 'کلینیک دندانپزشکی قلی‌پور',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/assets/clinic-reception.webp`,
        width: 1200,
        height: 630,
        alt: 'تماس با کلینیک دندانپزشکی قلی‌پور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تماس با ما | کلینیک دندانپزشکی قلی‌پور',
    description: 'اطلاعات تماس، آدرس و مسیریابی کلینیک دندانپزشکی قلی‌پور در گیلان.',
    images: [`${siteUrl}/assets/clinic-reception.webp`],
  },
};

export default function ContactPage() {
  return <ContactClientView />;
}
