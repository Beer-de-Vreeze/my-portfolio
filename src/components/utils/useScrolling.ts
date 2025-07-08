import { useEffect, useState } from 'react';

/**
 * Custom hook for consistent scrolling behavior across all pages
 * Handles smooth scrolling, mobile optimization, and scroll restoration
 * Optimized to reduce repaints and layout shifts
 */
export const useScrolling = () => {
  useEffect(() => {
    // Enable smooth scrolling for the entire document - set once
    if (document.documentElement.style.scrollBehavior !== 'smooth') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Only apply minimal JavaScript optimizations to avoid conflicts with CSS
    if (typeof window !== 'undefined') {
      // Add passive event listeners for better touch performance - but only once
      const options = { passive: true };
      
      // Simple no-op handlers to improve touch scrolling performance
      const touchHandler = () => {};
      
      // Improve touch scrolling performance
      document.addEventListener('touchstart', touchHandler, options);
      document.addEventListener('touchmove', touchHandler, options);
      document.addEventListener('touchend', touchHandler, options);
      
      // Cleanup function
      return () => {
        document.removeEventListener('touchstart', touchHandler);
        document.removeEventListener('touchmove', touchHandler);
        document.removeEventListener('touchend', touchHandler);
      };
    }
  }, []); // Empty dependency array - only run once

  // Utility function to scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Utility function to scroll to element smoothly
  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Utility function to handle scroll restoration
  const scrollToPosition = (position: number) => {
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  };

  return {
    scrollToTop,
    scrollToElement,
    scrollToPosition
  };
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
    
    // Throttled handler to call on window resize (reduced frequency to prevent constant repaints)
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
      }, 100); // Throttle resize events to every 100ms to reduce repaints
    }
    
    // Add event listener with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
