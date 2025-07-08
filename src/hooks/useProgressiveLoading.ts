"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface ProgressiveLoadingOptions {
  delay?: number;
  staggerDelay?: number;
  enablePreload?: boolean;
}

interface ProgressiveLoadingState {
  isLoading: boolean;
  hasLoaded: boolean;
  loadedItems: Set<string>;
  progress: number;
}

export const useProgressiveLoading = (
  items: string[] = [],
  options: ProgressiveLoadingOptions = {}
) => {
  const {
    delay = 100,
    staggerDelay = 50,
    enablePreload = true
  } = options;

  const [state, setState] = useState<ProgressiveLoadingState>({
    isLoading: true,
    hasLoaded: false,
    loadedItems: new Set(),
    progress: 0
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const mountedRef = useRef(true);

  // Preload critical resources
  const preloadResource = useCallback((src: string) => {
    if (!enablePreload) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      if (src.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
        img.src = src;
      } else if (src.match(/\.(mp4|webm|ogg)$/i)) {
        const video = document.createElement('video');
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error(`Failed to preload video: ${src}`));
        video.src = src;
        video.preload = 'metadata';
      } else {
        // For other resources, use fetch
        fetch(src, { method: 'HEAD' })
          .then(() => resolve())
          .catch(reject);
      }
    });
  }, [enablePreload]);

  // Load item with staggered timing
  const loadItem = useCallback((item: string, index: number) => {
    const timeout = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        await preloadResource(item);
        
        setState(prev => {
          const newLoadedItems = new Set(prev.loadedItems);
          newLoadedItems.add(item);
          const progress = (newLoadedItems.size / items.length) * 100;
          
          return {
            ...prev,
            loadedItems: newLoadedItems,
            progress,
            hasLoaded: newLoadedItems.size === items.length,
            isLoading: newLoadedItems.size < items.length
          };
        });
      } catch (error) {
        console.warn(`Failed to load item ${item}:`, error);
        // Still mark as loaded to prevent infinite loading
        setState(prev => {
          const newLoadedItems = new Set(prev.loadedItems);
          newLoadedItems.add(item);
          const progress = (newLoadedItems.size / items.length) * 100;
          
          return {
            ...prev,
            loadedItems: newLoadedItems,
            progress,
            hasLoaded: newLoadedItems.size === items.length,
            isLoading: newLoadedItems.size < items.length
          };
        });
      }
    }, delay + (index * staggerDelay));

    timeoutsRef.current.push(timeout);
  }, [items.length, delay, staggerDelay, preloadResource]);

  // Initialize loading
  useEffect(() => {
    if (items.length === 0) {
      setState({
        isLoading: false,
        hasLoaded: true,
        loadedItems: new Set(),
        progress: 100
      });
      return;
    }

    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Reset state
    setState({
      isLoading: true,
      hasLoaded: false,
      loadedItems: new Set(),
      progress: 0
    });

    // Start loading items
    items.forEach((item, index) => {
      loadItem(item, index);
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [items, loadItem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const isItemLoaded = useCallback((item: string) => {
    return state.loadedItems.has(item);
  }, [state.loadedItems]);

  const reset = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    
    setState({
      isLoading: true,
      hasLoaded: false,
      loadedItems: new Set(),
      progress: 0
    });

    items.forEach((item, index) => {
      loadItem(item, index);
    });
  }, [items, loadItem]);

  return {
    ...state,
    isItemLoaded,
    reset,
    totalItems: items.length,
    loadedCount: state.loadedItems.size
  };
};

// Hook for single item progressive loading
export const useProgressiveItemLoading = (
  src: string,
  options: { enablePreload?: boolean } = {}
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    const loadItem = async () => {
      try {
        if (options.enablePreload !== false) {
          if (src.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = src;
            });
          }
        }
        
        if (mountedRef.current) {
          setIsLoading(false);
          setHasError(false);
        }
      } catch {
        if (mountedRef.current) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    };

    loadItem();

    return () => {
      mountedRef.current = false;
    };
  }, [src, options.enablePreload]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { isLoading, hasError };
};