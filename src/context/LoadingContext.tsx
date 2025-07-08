"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingType: 'page' | 'content' | 'media' | 'skeleton' | null;
  message?: string;
  progress?: number;
}

interface LoadingContextType {
  loading: LoadingState;
  setLoading: (loading: Partial<LoadingState>) => void;
  startLoading: (type: LoadingState['loadingType'], message?: string) => void;
  stopLoading: () => void;
  updateProgress: (progress: number) => void;
  isPageLoading: boolean;
  isContentLoading: boolean;
  isMediaLoading: boolean;
  isSkeletonLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingType: null,
    message: undefined,
    progress: undefined
  });

  const setLoading = useCallback((newLoading: Partial<LoadingState>) => {
    setLoadingState(prev => ({
      ...prev,
      ...newLoading
    }));
  }, []);

  const startLoading = useCallback((
    type: LoadingState['loadingType'], 
    message?: string
  ) => {
    setLoadingState({
      isLoading: true,
      loadingType: type,
      message,
      progress: 0
    });
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      loadingType: null,
      message: undefined,
      progress: undefined
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }));
  }, []);

  const isPageLoading = loading.isLoading && loading.loadingType === 'page';
  const isContentLoading = loading.isLoading && loading.loadingType === 'content';
  const isMediaLoading = loading.isLoading && loading.loadingType === 'media';
  const isSkeletonLoading = loading.isLoading && loading.loadingType === 'skeleton';

  const value: LoadingContextType = {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    updateProgress,
    isPageLoading,
    isContentLoading,
    isMediaLoading,
    isSkeletonLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Hook for component-specific loading states
export const useComponentLoading = (componentName?: string) => {
  const { loading, setLoading, startLoading, stopLoading } = useLoading();
  
  const startComponentLoading = useCallback((message?: string) => {
    startLoading('content', message || `Loading ${componentName || 'component'}...`);
  }, [startLoading, componentName]);

  const isComponentLoading = loading.isLoading && loading.loadingType === 'content';

  return {
    isLoading: isComponentLoading,
    startLoading: startComponentLoading,
    stopLoading,
    setLoading,
    message: loading.message,
    progress: loading.progress
  };
};

// Hook for media loading states
export const useMediaLoading = () => {
  const { loading, startLoading, stopLoading, updateProgress } = useLoading();
  
  const startMediaLoading = useCallback((message = 'Loading media...') => {
    startLoading('media', message);
  }, [startLoading]);

  const isMediaLoading = loading.isLoading && loading.loadingType === 'media';

  return {
    isLoading: isMediaLoading,
    startLoading: startMediaLoading,
    stopLoading,
    updateProgress,
    progress: loading.progress || 0
  };
};

export default LoadingContext;