import { useCallback, useRef } from 'react';
import { ResourcePreloader } from '@/lib/performanceUtils';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Extended Navigator interface for device memory
 */
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

/**
 * Performance optimization hook for managing resources and memory
 */
export function usePerformance() {
  const resourcePreloader = useRef(ResourcePreloader.getInstance());

  // Preload critical resources
  const preloadResources = useCallback((resources: string[]) => {
    return resourcePreloader.current.preloadImages(resources);
  }, []);

  // Preload a single resource
  const preloadResource = useCallback((src: string, priority: 'high' | 'low' = 'low') => {
    return resourcePreloader.current.preloadImage(src, priority);
  }, []);

  // Optimize for reduced motion — delegates to the shared single source
  const shouldReduceMotion = useCallback(() => prefersReducedMotion(), []);

  // Memory pressure detection
  const isLowMemory = useCallback((): boolean => {
    if (typeof navigator === 'undefined') return false;
    const extendedNavigator = navigator as ExtendedNavigator;
    return (extendedNavigator.deviceMemory ?? 4) < 4;
  }, []);

  return {
    preloadResources,
    preloadResource,
    shouldReduceMotion,
    isLowMemory,
  };
}
