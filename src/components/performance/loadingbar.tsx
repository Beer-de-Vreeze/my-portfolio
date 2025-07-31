"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Enhanced NProgress configuration
NProgress.configure({ 
  showSpinner: false, 
  speed: 500, 
  minimum: 0.1,
  easing: 'ease-out',
  trickleSpeed: 300,
  template: '<div class="bar" role="bar"><div class="peg"></div></div>'
});

interface LoadingBarProps {
  color?: string;
  height?: number;
  options?: {
    easing?: string;
    speed?: number;
    minimum?: number;
    trickleSpeed?: number;
  };
}

const LoadingBar: React.FC<LoadingBarProps> = ({
  color = "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
  height = 3,
  options = {}
}) => {
  const pathname = usePathname();
  const [isRouting, setIsRouting] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize progress options to prevent re-renders
  const progressOptions = useMemo(() => ({
    showSpinner: false,
    speed: 500,
    minimum: 0.1,
    easing: 'ease-out',
    trickleSpeed: 300,
    ...options
  }), [options]);

  useEffect(() => {
    // Configure NProgress with merged options
    NProgress.configure(progressOptions);
  }, [progressOptions]);

  useEffect(() => {
    const handleStart = () => {
      setIsRouting(true);
      NProgress.start();
    };

    const handleComplete = () => {
      setIsRouting(false);
      NProgress.done();
    };

    // Enhanced custom styles with animations and effects
    const createCustomStyles = () => {
      // Remove any existing loadingbar styles (including orphaned ones)
      const existingStyles = document.querySelectorAll('style[data-nprogress-loadingbar="true"]');
      existingStyles.forEach(style => {
        try {
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        } catch (error) {
          console.warn('Failed to remove existing style:', error);
        }
      });
      
      // Clear the reference to ensure we don't try to remove it again
      styleRef.current = null;
      
      // Create new style element
      const newStyleElement = document.createElement('style');
      newStyleElement.setAttribute('data-nprogress-loadingbar', 'true');
      newStyleElement.textContent = `
        #nprogress {
          pointer-events: none;
          z-index: 99999;
        }
        
        #nprogress .bar {
          background: ${color};
          position: fixed;
          z-index: 99999;
          top: 0;
          left: 0;
          width: 100%;
          height: ${height}px;
          border-radius: 0 0 2px 2px;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
          animation: pulse 2s ease-in-out infinite alternate;
          transition: all 0.3s ease;
        }
        
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(3deg) translate(0px, -4px);
          animation: shimmer 1s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
          }
          100% {
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.3);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: rotate(3deg) translate(-100px, -4px);
          }
          100% {
            transform: rotate(3deg) translate(100px, -4px);
          }
        }
        
        /* Gaming-themed enhancement - controller pulse effect */
        #nprogress .bar::before {
          content: '';
          position: absolute;
          top: ${height}px;
          left: 20px;
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          animation: controllerPulse 1.5s ease-in-out infinite;
          box-shadow: 
            15px 0 0 #fff,
            30px 0 0 #fff;
        }
        
        @keyframes controllerPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          #nprogress .bar {
            height: ${Math.max(2, height - 1)}px;
          }
          
          #nprogress .bar::before {
            width: 4px;
            height: 4px;
            box-shadow: 
              10px 0 0 #fff,
              20px 0 0 #fff;
          }
        }
        
        /* Dark mode compatibility */
        @media (prefers-color-scheme: dark) {
          #nprogress .bar {
            filter: brightness(1.1);
          }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          #nprogress .bar {
            background: #0066cc !important;
            box-shadow: none !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          #nprogress .bar,
          #nprogress .peg,
          #nprogress .bar::before {
            animation: none !important;
            transition: none !important;
          }
        }
      `;
      
      // Store reference and append to document
      styleRef.current = newStyleElement;
      document.head.appendChild(newStyleElement);
    };

    // Handle route changes
    const handleRouteChange = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      handleStart();
      
      // Add realistic loading delay with progressive completion
      const baseDelay = 200;
      const randomDelay = Math.random() * 300;
      
      timeoutRef.current = setTimeout(() => {
        handleComplete();
      }, baseDelay + randomDelay);
    };

    createCustomStyles();
    handleRouteChange();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clean up any loadingbar styles
      const existingStyles = document.querySelectorAll('style[data-nprogress-loadingbar="true"]');
      existingStyles.forEach(style => {
        try {
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        } catch (error) {
          console.warn('Style cleanup failed:', error);
        }
      });
      styleRef.current = null;
      handleComplete();
    };
  }, [pathname, color, height]);

  // Handle browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      setIsRouting(true);
      NProgress.start();
      
      setTimeout(() => {
        setIsRouting(false);
        NProgress.done();
      }, 300);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Preload critical resources to improve perceived performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload next page resources
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"]');
      if (prefetchLinks.length === 0) {
        // Add prefetch for common pages
        const commonPages = ['/about', '/projects', '/contact'];
        commonPages.forEach(page => {
          if (pathname !== page) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
          }
        });
      }
    }
  }, [pathname]);

  return (
    <>
      {/* Optional loading indicator for screen readers */}
      {isRouting && (
        <div 
          aria-live="polite" 
          aria-label="Page loading"
          className="sr-only"
        >
          Loading new page...
        </div>
      )}
    </>
  );
};

export default LoadingBar;
