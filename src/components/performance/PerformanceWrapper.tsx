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
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback for non-critical tasks
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          // Cleanup unused event listeners
        });
      }
    }
  }, []);

  return (
    <>
      {enableWebVitals && <WebVitals />}
      {children}
    </>
  );
}
