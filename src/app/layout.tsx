import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gholipourdental.com'),
  title: 'کلینیک دندانپزشکی قلی‌پور | خدمات تخصصی دندانپزشکی دیجیتال',
  description:
    'کلینیک دندانپزشکی قلی‌پور، ارائه دهنده خدمات تخصصی ایمپلنت دیجیتال، عصب‌کشی بدون درد، روکش و ترمیم دندان در محیطی مدرن و آرامش‌بخش.',
  keywords: [
    'کلینیک دندانپزشکی قلی پور',
    'ایمپلنت دندان',
    'عصب کشی دندان',
    'روکش زیرکونیا',
    'ترمیم دندان',
    'دندانپزشکی گیلان',
    'دندانپزشکی زیباکنار',
  ],
  icons: {
    icon: '/assets/logo.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Vazirmatn-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed - کلینیک دندانپزشکی قلی‌پور"
          href="/feed.xml"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
