import type { Metadata } from 'next';
import HomeClientView from './HomeClientView';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

export const metadata: Metadata = {
  title: 'کلینیک دندانپزشکی قلی‌پور | خدمات تخصصی دندانپزشکی دیجیتال در گیلان',
  description:
    'کلینیک دندانپزشکی قلی‌پور ارائه دهنده خدمات تخصصی ایمپلنت دیجیتال، عصب‌کشی بدون درد، روکش زیرکونیا و اصلاح طرح لبخند در محیطی مدرن در استان گیلان (زیباکنار).',
  keywords: [
    'کلینیک دندانپزشکی قلی پور',
    'ایمپلنت دندان گیلان',
    'دندانپزشکی زیباکنار',
    'عصب کشی دندان',
    'روکش زیرکونیا',
    'کامپوزیت ونیر',
    'لمینت دندان رشت',
    'دندانپزشکی دیجیتال',
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'کلینیک دندانپزشکی قلی‌پور | خدمات تخصصی دندانپزشکی دیجیتال در گیلان',
    description:
      'کلینیک دندانپزشکی قلی‌پور ارائه دهنده خدمات تخصصی ایمپلنت دیجیتال، عصب‌کشی بدون درد، روکش زیرکونیا و اصلاح طرح لبخند در محیطی مدرن در استان گیلان (زیباکنار).',
    url: siteUrl,
    siteName: 'کلینیک دندانپزشکی قلی‌پور',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/assets/clinic-dental-unit.webp`,
        width: 1200,
        height: 630,
        alt: 'کلینیک دندانپزشکی قلی‌پور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'کلینیک دندانپزشکی قلی‌پور | خدمات تخصصی دندانپزشکی دیجیتال در گیلان',
    description:
      'ارائه خدمات تخصصی ایمپلنت، درمان ریشه، زیبایی و ترمیم دندان در استان گیلان و زیباکنار.',
    images: [`${siteUrl}/assets/clinic-dental-unit.webp`],
  },
};

const clinicSchema = {
  '@context': 'https://schema.org',
  '@type': ['Dentist', 'MedicalClinic'],
  name: 'کلینیک دندانپزشکی قلی‌پور',
  alternateName: 'Gholipour Dental Clinic',
  url: siteUrl,
  logo: `${siteUrl}/assets/logo.webp`,
  image: `${siteUrl}/assets/clinic-dental-unit.webp`,
  description:
    'کلینیک دندانپزشکی قلی‌پور ارائه دهنده خدمات تخصصی ایمپلنت دیجیتال، عصب‌کشی، روکش زیرکونیا و زیبایی در استان گیلان، زیباکنار.',
  telephone: ['+981333512753', '+989166264776'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'زیباکنار، جنب پل، پایین‌تر از پاسگاه نیروی انتظامی',
    addressLocality: 'زیباکنار',
    addressRegion: 'گیلان',
    addressCountry: 'IR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.4368492,
    longitude: 49.8711579,
  },
  sameAs: ['https://instagram.com/Qolipur_clinic', 'https://t.me/Qolipur_clinic'],
  priceRange: '$$',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
      />
      <HomeClientView />
    </>
  );
}
