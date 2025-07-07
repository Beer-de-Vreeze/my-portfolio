import { useEffect, useState } from 'react';

/**
 * Custom hook for consistent scrolling behavior across all pages
 * Handles smooth scrolling, mobile optimization, and scroll restoration
 */
export const useScrolling = () => {
  useEffect(() => {
    // Enable smooth scrolling for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Only apply minimal JavaScript optimizations to avoid conflicts with CSS
    if (typeof window !== 'undefined') {
      // Add passive event listeners for better touch performance
      const options = { passive: true };
      
      // Improve touch scrolling performance
      document.addEventListener('touchstart', () => {}, options);
      document.addEventListener('touchmove', () => {}, options);
      document.addEventListener('touchend', () => {}, options);
    }
    
    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.scrollBehavior = '';
        // Remove event listeners
        document.removeEventListener('touchstart', () => {});
        document.removeEventListener('touchmove', () => {});
        document.removeEventListener('touchend', () => {});
      }
    };
  }, []);

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
 * Includes mobile-first responsive breakpoints
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
    // Handler to call on window resize
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({
        width,
        height,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
