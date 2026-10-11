export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '40px 20px',
        fontFamily: "var(--font-base, 'PeydaWeb', 'Vazirmatn', sans-serif)",
        direction: 'rtl',
      }}
    >
      <div
        className="clinic-loading-spinner"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid #c4eaf7',
          borderTopColor: '#1c83aa',
          animation: 'clinic-spin 0.8s linear infinite',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            color: '#1c434f',
            fontSize: '1rem',
            fontWeight: 700,
            margin: '0 0 6px',
          }}
        >
          کلینیک دندانپزشکی قلی‌پور
        </p>
        <span
          style={{
            color: '#5a7d8c',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          در حال بارگذاری صفحه...
        </span>
      </div>
      <style>{`
        @keyframes clinic-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
