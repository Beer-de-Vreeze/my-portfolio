'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * One-shot, non-reactive check — for use outside React rendering
 * (callbacks, utilities). Returns false during SSR.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Reactive hook — the single source of truth for reduced-motion across the
 * app. Subscribes to the media query so a mid-session OS toggle propagates.
 * Returns false on the server and during the first client render.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
