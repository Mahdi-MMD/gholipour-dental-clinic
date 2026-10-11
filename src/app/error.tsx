'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error
    console.error('Next.js route runtime error:', error);
  }, [error]);

  return (
    <div
      role="alert"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        direction: 'rtl',
        fontFamily: "var(--font-base, 'PeydaWeb', 'Vazirmatn', sans-serif)",
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#ffebee',
          color: '#e53935',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '20px',
        }}
      >
        ⚠️
      </div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#1c434f',
          margin: '0 0 12px',
        }}
      >
        خطایی در بارگذاری رخ داد
      </h1>
      <p
        style={{
          color: '#5a7d8c',
          maxWidth: '460px',
          lineHeight: 1.8,
          marginBottom: '28px',
          fontSize: '0.95rem',
        }}
      >
        متأسفانه در اجرای این بخش از صفحه مشکلی موقت پیش آمده است. می‌توانید دوباره امتحان کنید یا
        به صفحه اصلی بازگردید.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1c83aa',
            color: '#ffffff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(28, 131, 170, 0.25)',
            transition: 'background-color 0.2s ease',
          }}
        >
          تلاش مجدد
        </button>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fdff',
            color: '#1c434f',
            border: '1px solid #d8eef5',
            padding: '12px 28px',
            borderRadius: '30px',
            fontWeight: 700,
            fontSize: '0.95rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(28, 67, 79, 0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>

      {process.env.NODE_ENV !== 'production' && error.message && (
        <details
          style={{
            marginTop: '32px',
            maxWidth: '600px',
            textAlign: 'left',
            direction: 'ltr',
            fontSize: '0.8rem',
            color: '#c62828',
            background: '#fff3e0',
            padding: '12px 16px',
            borderRadius: '8px',
            overflowX: 'auto',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error details (dev only)</summary>
          <pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
        </details>
      )}
    </div>
  );
}
