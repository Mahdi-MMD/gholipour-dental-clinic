import type { Metadata } from 'next';
import ArticlesClientView from './ArticlesClientView';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';

export const metadata: Metadata = {
  title: 'دانشنامه و مقالات تخصصی دندانپزشکی | کلینیک دندانپزشکی قلی‌پور',
  description:
    'مجموعه مقالات علمی و معتبر دندانپزشکی شامل راهنمای جامع ایمپلنت، مراقبت‌های بعد از جراحی، عصب‌کشی، ارتودنسی، دندانپزشکی کودکان و بهداشت دهان و دندان.',
  keywords: [
    'مقالات دندانپزشکی',
    'دانشنامه دندانپزشکی قلی پور',
    'مراقبت های بعد از ایمپلنت',
    'درمان ریشه دندان',
    'بهداشت دهان و دندان',
    'دندانپزشکی کودکان',
  ],
  alternates: {
    canonical: `${siteUrl}/articles`,
  },
  openGraph: {
    title: 'دانشنامه و مقالات تخصصی دندانپزشکی | کلینیک دندانپزشکی قلی‌پور',
    description:
      'مطالعه جدیدترین مقالات و آموزش‌های تخصصی دندانپزشکی به قلم پزشکان متخصص درمانگاه شهید قلی‌پور زیباکنار.',
    url: `${siteUrl}/articles`,
    siteName: 'کلینیک دندانپزشکی قلی‌پور',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/assets/clinic-dental-unit.webp`,
        width: 1200,
        height: 630,
        alt: 'مقالات کلینیک دندانپزشکی قلی‌پور',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دانشنامه و مقالات تخصصی دندانپزشکی | کلینیک دندانپزشکی قلی‌پور',
    description: 'مقالات علمی، آموزشی و مراقبت‌های دندانپزشکی به قلم متخصصان کلینیک قلی‌پور.',
    images: [`${siteUrl}/assets/clinic-dental-unit.webp`],
  },
};

export default function ArticlesPage() {
  return <ArticlesClientView />;
}
