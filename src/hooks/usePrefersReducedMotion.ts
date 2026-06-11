'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * One-shot, non-reactive check — for use outside React rendering
 * (callbacks, utilities). Returns false during SSR.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

/**
 * Reactive hook — the single source of truth for reduced-motion across the
 * app. Subscribes to the media query so a mid-session OS toggle propagates.
 * Returns false on the server and while hydrating.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
