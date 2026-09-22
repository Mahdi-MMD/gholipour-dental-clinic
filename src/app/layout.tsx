import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'کلینیک دندانپزشکی قلی‌پور | خدمات تخصصی دندانپزشکی دیجیتال',
  description: 'کلینیک دندانپزشکی قلی‌پور، ارائه دهنده خدمات تخصصی ایمپلنت دیجیتال، عصب‌کشی بدون درد، روکش و ترمیم دندان در محیطی مدرن و آرامش‌بخش.',
  keywords: ['کلینیک دندانپزشکی قلی پور', 'ایمپلنت دندان', 'عصب کشی دندان', 'روکش زیرکونیا', 'ترمیم دندان', 'دندانپزشکی قم'],
  icons: {
    icon: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
