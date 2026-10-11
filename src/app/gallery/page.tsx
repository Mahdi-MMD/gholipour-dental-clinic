import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

export const metadata: Metadata = {
  title: 'گالری و نمونه کارهای درمانی | کلینیک دندانپزشکی قلی‌پور',
  description:
    'مشاهده نمونه کارهای درمانی، اصلاح طرح لبخند، کامپوزیت ونیر، لمینت سرامیکی و ایمپلنت دندان با اسلایدر مقایسه قبل و بعد در کلینیک دندانپزشکی قلی‌پور.',
  keywords: [
    'نمونه کار دندانپزشکی',
    'قبل و بعد کامپوزیت',
    'قبل و بعد ایمپلنت',
    'اصلاح طرح لبخند گیلان',
    'گالری کلینیک دندانپزشکی قلی پور',
  ],
  alternates: {
    canonical: `${siteUrl}/gallery`,
  },
  openGraph: {
    title: 'گالری و نمونه کارهای درمانی | کلینیک دندانپزشکی قلی‌پور',
    description:
      'مشاهده آنلاین قبل و بعد درمان‌های دندانپزشکی تخصصی، زیبایی، ایمپلنت، روکش و اطفال.',
    url: `${siteUrl}/gallery`,
    siteName: 'کلینیک دندانپزشکی قلی‌پور',
    type: 'website',
    locale: 'fa_IR',
    images: [
      {
        url: `${siteUrl}/assets/clinic-dental-unit.webp`,
        width: 1200,
        height: 630,
        alt: 'گالری کلینیک دندانپزشکی قلی‌پور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'گالری و نمونه کارهای درمانی | کلینیک دندانپزشکی قلی‌پور',
    description: 'نمونه کارهای درمانی، ایمپلنت و زیبایی کلینیک دندانپزشکی قلی‌پور.',
    images: [`${siteUrl}/assets/clinic-dental-unit.webp`],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
