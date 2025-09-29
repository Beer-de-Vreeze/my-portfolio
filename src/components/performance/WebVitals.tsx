'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsProps {
  reportWebVitals?: (metric: Metric) => void;
}

declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters: Record<string, unknown>) => void;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    };
  }
}

export function WebVitals({ reportWebVitals }: WebVitalsProps) {
  useEffect(() => {
    const handleWebVitals = (metric: Metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Web Vital:', metric);
      }
      
      // Send to analytics service
      if (reportWebVitals) {
        reportWebVitals(metric);
      }
      
      // Send to Vercel Analytics if available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          custom_map: { metric_id: 'web_vitals' },
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // Measure all Web Vitals
    onCLS(handleWebVitals);
    onINP(handleWebVitals);
    onFCP(handleWebVitals);
    onLCP(handleWebVitals);
    onTTFB(handleWebVitals);
  }, [reportWebVitals]);

  return null;
}

// Custom hook for performance monitoring
export function usePerformanceMonitor() {
  useEffect(() => {
    let observer: PerformanceObserver | null = null;
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Longtask observer not supported
      }
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    // Monitor memory usage (Chrome only)
    if (performance.memory) {
      const logMemoryUsage = () => {
        const memory = performance.memory!;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected:', {
            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
          });
        }
      };

      interval = setInterval(logMemoryUsage, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []); // Empty dependency array to ensure this only runs once
}
