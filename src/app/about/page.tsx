import type { Metadata } from 'next';
import AboutClientView from './AboutClientView';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

export const metadata: Metadata = {
  title: 'درباره ما | معرفی درمانگاه و کلینیک دندانپزشکی قلی‌پور زیباکنار',
  description:
    'آشنایی با تاریخچه، تجهیزات پیشرفته، ۴ یونیت فعال، تصویربرداری رادیوگرافی و کادر تخصصی دندانپزشکی درمانگاه شهید قلی‌پور زیباکنار در استان گیلان.',
  keywords: [
    'درباره کلینیک دندانپزشکی قلی پور',
    'درمانگاه شهید قلی پور زیباکنار',
    'دندانپزشکان گیلان',
    'دکتر مهدی محمدنژاد دندانپزشک',
    'امکانات کلینیک دندانپزشکی قلی پور',
  ],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'درباره ما | کلینیک دندانپزشکی قلی‌پور',
    description:
      'معرفی امکانات، تجهیزات مدرن، کادر دندانپزشکان مجرب و خدمات درمانگاه تخصصی شهید قلی‌پور زیباکنار.',
    url: `${siteUrl}/about`,
    siteName: 'کلینیک دندانپزشکی قلی‌پور',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/assets/clinic-waiting-room.webp`,
        width: 1200,
        height: 630,
        alt: 'درباره کلینیک دندانپزشکی قلی‌پور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'درباره ما | کلینیک دندانپزشکی قلی‌پور',
    description: 'معرفی درمانگاه تخصصی شهید قلی‌پور و بخش دندانپزشکی در گیلان، زیباکنار.',
    images: [`${siteUrl}/assets/clinic-waiting-room.webp`],
  },
};

export default function AboutPage() {
  return <AboutClientView />;
}
