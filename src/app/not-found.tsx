import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: 'var(--font-vazirmatn, sans-serif)'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#1c83aa', margin: '0 0 16px' }}>۴۰۴</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f4b6a', margin: '0 0 20px' }}>صفحه مورد نظر یافت نشد</h2>
      <p style={{ color: '#6a8c9b', maxWidth: '420px', lineHeight: 1.8, marginBottom: '28px' }}>
        متأسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد یا تغییر مکان داده است.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#1c83aa',
          color: '#ffffff',
          padding: '12px 28px',
          borderRadius: '30px',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(28, 131, 170, 0.25)'
        }}
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
