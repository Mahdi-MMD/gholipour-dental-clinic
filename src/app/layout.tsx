import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://gholipourdental.com'),
  title: 'کلینیک دندانپزشکی قلی‌پور | زیباکنار، گیلان',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
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
          media="print"
          id="fa-css"
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.getElementById('fa-css');if(l){if(l.sheet){l.media='all'}else{l.addEventListener('load',function(){l.media='all'});setTimeout(function(){l.media='all'},3000)}}})()`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          />
        </noscript>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed - کلینیک دندانپزشکی قلی‌پور"
          href="/feed.xml"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
