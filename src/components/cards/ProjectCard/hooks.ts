import { useState, useEffect, useCallback } from 'react';
import type { ErrorState, LoadingState } from './types';

/** Manages error state with typed error categories */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', type: 'general' });

  const handleError = useCallback((message: string, type: ErrorState['type'] = 'general') => {
    setError({ hasError: true, message, type });
    console.error(`ProjectCard Error (${type}):`, message);
  }, []);

  const clearError = useCallback(() => {
    setError({ hasError: false, message: '', type: 'general' });
  }, []);

  return { error, handleError, clearError };
};

/** Manages loading states for media */
export const useLoadingState = () => {
  const [loading, setLoading] = useState<LoadingState>({
    media: false,
  });

  const setLoadingState = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { loading, setLoadingState };
};

/** IntersectionObserver hook with mobile fallback (always visible on narrow screens) */
export const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLDivElement | null>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    // On narrow screens treat the element as always visible. The observer
    // still drives the update (it always fires once on observe), which keeps
    // state changes inside the subscription callback.
    const isMobile = window.innerWidth <= 768;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(isMobile || entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};
