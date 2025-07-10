// Performance optimization utilities

// Critical Resource Preloader
export class ResourcePreloader {
  private static instance: ResourcePreloader;
  private preloadedResources = new Set<string>();

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader();
    }
    return ResourcePreloader.instance;
  }

  preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      
      if (priority === 'high') {
        img.fetchPriority = 'high';
      }
      
      img.src = src;
    });
  }

  preloadImages(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preloadImage(src)));
  }

  preloadFont(url: string, family: string): void {
    if (this.preloadedResources.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = url;
    link.crossOrigin = 'anonymous';
    link.type = 'font/woff2';
    
    // Add fallback for older browsers
    link.onerror = () => {
      console.warn(`Failed to preload font: ${family}`);
    };
    
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }
}

// Lazy loading utilities
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Bundle size optimization helpers
export function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  return importFn().catch((error) => {
    console.warn('Dynamic import failed:', error);
    if (fallback) {
      return Promise.resolve(fallback);
    }
    throw error;
  });
}

// Memory management utilities
export class MemoryManager {
  private static cleanupCallbacks: Array<() => void> = [];

  static addCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  static cleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
    this.cleanupCallbacks = [];
  }

  static checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usagePercent > 80) {
        console.warn('High memory usage detected:', {
          usage: `${usagePercent.toFixed(1)}%`,
          used: `${(memory.usedJSHeapSize / 1048576).toFixed(1)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(1)} MB`,
        });
        
        // Trigger cleanup
        this.cleanup();
      }
    }
  }
}

// Performance monitoring
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// Debounce for performance-sensitive operations
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle for scroll/resize events
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Critical path CSS injection
export function injectCriticalCSS(css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// Service Worker registration helper
export function registerServiceWorker(path: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker.register(path)
    .then(registration => {
      console.log('Service Worker registered successfully');
      return registration;
    })
    .catch(error => {
      console.warn('Service Worker registration failed:', error);
      return null;
    });
}
