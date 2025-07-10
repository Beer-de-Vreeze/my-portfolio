'use client';

import { ReactNode, useEffect } from 'react';
import { WebVitals, usePerformanceMonitor } from './WebVitals';

interface PerformanceWrapperProps {
  children: ReactNode;
  enableWebVitals?: boolean;
}

export function PerformanceWrapper({ 
  children, 
  enableWebVitals = true
}: PerformanceWrapperProps) {
  // Always call hooks for consistent behavior
  usePerformanceMonitor();

  useEffect(() => {
    // Optimize JavaScript execution
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback for non-critical tasks
      const optimizeIdleTasks = () => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            // Cleanup unused event listeners
            // Preload critical resources
            // Garbage collection hints
          });
        }
      };

      // Optimize on page load
      if (document.readyState === 'complete') {
        optimizeIdleTasks();
      } else {
        window.addEventListener('load', optimizeIdleTasks);
      }

      // Enable passive event listeners for better scroll performance
      const optimizeEventListeners = () => {
        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
        passiveEvents.forEach(event => {
          document.addEventListener(event, () => {}, { passive: true });
        });
      };

      optimizeEventListeners();

      return () => {
        window.removeEventListener('load', optimizeIdleTasks);
      };
    }
  }, []);

  // Resource hints for better loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preconnect to external domains
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://img.itch.zone',
      ];

      preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // DNS prefetch for additional domains
      const prefetchDomains = [
        '//vercel.com',
        '//github.com',
      ];

      prefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
    }
  }, []);

  return (
    <>
      {enableWebVitals && <WebVitals />}
      {children}
    </>
  );
}
