import { useEffect, useCallback, useRef } from 'react';
import { ResourcePreloader, MemoryManager } from '@/lib/performanceUtils';

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

  // Clean up memory on unmount
  useEffect(() => {
    const cleanup = () => {
      MemoryManager.cleanup();
    };
    
    return cleanup;
  }, []);

  // Optimize for reduced motion
  const shouldReduceMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Memory pressure detection
  const isLowMemory = useCallback(() => {
    if (typeof navigator === 'undefined') return false;
    const extendedNavigator = navigator as ExtendedNavigator;
    return extendedNavigator.deviceMemory && extendedNavigator.deviceMemory < 4;
  }, []);

  return {
    preloadResources,
    preloadResource,
    shouldReduceMotion,
    isLowMemory,
  };
}
