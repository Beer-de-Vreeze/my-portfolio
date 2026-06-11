import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Controls how scroll-lock is applied for the page.
 *
 * - 'home'      → lock on 1024px+ (fits exactly on laptops & desktops)
 * - 'subpage'   → lock on 1440px+ only (about-page subpages)
 * - 'always-on' → always remove no-scroll (about page needs free scroll)
 */
export type ScrollMode = 'home' | 'subpage' | 'always-on';

export interface PageSetupOptions {
  scrollMode?: ScrollMode;
}

/**
 * Centralises the duplicated per-page boilerplate that previously lived in
 * every page component:
 *  - isMounted flag (prevents hydration flicker)
 *  - prefersReducedMotion (accessible animation control)
 *  - usePerformanceMonitor (Web Vitals tracing)
 *  - scroll-lock lifecycle (add/remove .no-scroll class)
 */
export function usePageSetup(options: PageSetupOptions = {}): {
  isMounted: boolean;
  prefersReducedMotion: boolean;
} {
  const { scrollMode = 'always-on' } = options;

  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Mount flag (prevents hydration flicker)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll lifecycle.
  //
  // We no longer hard-lock the page. The previous behaviour added a
  // `no-scroll` class that set `overflow: hidden` on the document, which
  // trapped content whenever it was taller than the viewport (e.g. the
  // Projects grid on laptops). The rule now is simple: if content fits, the
  // browser shows no scrollbar anyway; if it overflows, the user can scroll.
  // We keep this effect only to clear any stale `no-scroll` class.
  useEffect(() => {
    if (!isMounted) return;

    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }, [isMounted, scrollMode]);

  return { isMounted, prefersReducedMotion };
}
