'use client';
/**
 * Wraps all client-only, dynamically-loaded dev/UI features.
 * `ssr: false` is only valid inside 'use client' modules, so this
 * thin wrapper lives here rather than in the Server Component layout.
 */
import dynamic from 'next/dynamic';

// DevConsole: defers mathjs, sql-formatter, nasa-api, qrcode, etc.
// until AFTER hydration — not part of the initial JS payload.
const DevConsole = dynamic(
  () => import('@/components/features/DevConsole'),
  { ssr: false },
);

// PerformanceDashboard: dev-only widget, fully stripped from production bundle.
const PerformanceDashboard =
  process.env.NODE_ENV === 'development'
    ? dynamic(
        () =>
          import('@/components/performance/PerformanceDashboard').then(
            (m) => ({ default: m.PerformanceDashboard }),
          ),
        { ssr: false },
      )
    : () => null;

export function ClientOnlyFeatures() {
  return (
    <>
      <DevConsole />
      <PerformanceDashboard />
    </>
  );
}
