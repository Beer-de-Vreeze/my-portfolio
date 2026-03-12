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

/** Manages loading states for media, fileSize, and modal */
export const useLoadingState = () => {
  const [loading, setLoading] = useState<LoadingState>({
    media: false,
    fileSize: false,
    modal: false,
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

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};
