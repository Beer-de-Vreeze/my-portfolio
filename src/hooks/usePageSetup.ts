import { useState, useEffect, useCallback } from 'react';

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const handleReducedMotionChange = useCallback(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  // Mount flag + reduced-motion detection
  useEffect(() => {
    setIsMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handleReducedMotionChange);
    return () => mq.removeEventListener('change', handleReducedMotionChange);
  }, [handleReducedMotionChange]);

  // Scroll-lock lifecycle
  useEffect(() => {
    if (!isMounted) return;

    const width = window.innerWidth;
    const shouldLock =
      (scrollMode === 'home' && width >= 1024) ||
      (scrollMode === 'subpage' && width >= 1440);

    if (shouldLock) {
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
    };
  }, [isMounted, scrollMode]);

  return { isMounted, prefersReducedMotion };
}
