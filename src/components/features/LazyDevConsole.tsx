'use client';

import { lazy, Suspense } from 'react';

// Lazy load the DevConsole component to reduce initial bundle size
const DevConsole = lazy(() => import('./DevConsole'));

export default function LazyDevConsole() {
  return (
    <Suspense fallback={null}>
      <DevConsole />
    </Suspense>
  );
}