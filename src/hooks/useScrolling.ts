import { useEffect, useState } from 'react';

/**
 * Custom hook for consistent scrolling behavior across all pages
 * Handles smooth scrolling, mobile optimization, and scroll restoration
 */
export const useScrolling = () => {
  useEffect(() => {
    if (document.documentElement.style.scrollBehavior !== 'smooth') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    if (typeof window !== 'undefined') {
      const options = { passive: true };
      const touchHandler = () => {};

      document.addEventListener('touchstart', touchHandler, options);
      document.addEventListener('touchmove', touchHandler, options);
      document.addEventListener('touchend', touchHandler, options);

      return () => {
        document.removeEventListener('touchstart', touchHandler);
        document.removeEventListener('touchmove', touchHandler);
        document.removeEventListener('touchend', touchHandler);
      };
    }
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToPosition = (position: number) =>
    window.scrollTo({ top: position, behavior: 'smooth' });

  return { scrollToTop, scrollToElement, scrollToPosition };
};

/**
 * Custom hook for window size with proper SSR handling
 * Includes mobile-first responsive breakpoints and throttled resize events
 */
export const useResponsiveSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  }>({
    width: undefined,
    height: undefined,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({
          width,
          height,
          isMobile: width <= 768,
          isTablet: width > 768 && width <= 1024,
          isDesktop: width > 1024,
        });
      }, 100);
    }

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
