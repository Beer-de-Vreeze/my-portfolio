'use client';
import Link from 'next/link';

// global-error.tsx catches errors thrown in the root layout (layout.tsx).
// It must include its own <html> and <body> tags since layout is unavailable.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            gap: '1.5rem',
          }}
        >
          <div style={{ fontSize: '4rem' }}>⚡</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#22d3ee' }}>
            Critical Error
          </h1>
          <p style={{ color: '#9ca3af' }}>
            The application encountered a fatal error.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <pre
              style={{
                fontSize: '0.75rem',
                color: '#f87171',
                background: '#111',
                border: '1px solid #7f1d1d',
                borderRadius: '0.5rem',
                padding: '1rem',
                maxWidth: '32rem',
                overflow: 'auto',
                textAlign: 'left',
              }}
            >
              {error.message}
            </pre>
          )}
          {error?.digest && (
            <p style={{ fontSize: '0.7rem', color: '#374151', fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(to right, #06b6d4, #7c3aed)',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #374151',
                color: '#d1d5db',
                fontWeight: 600,
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
