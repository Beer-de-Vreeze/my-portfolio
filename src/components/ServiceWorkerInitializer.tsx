"use client";

import { useEffect } from 'react';
import { useServiceWorker } from '@/lib/serviceWorker';

export const ServiceWorkerInitializer: React.FC = () => {
  // Only register service worker in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  const {
    isUpdateAvailable,
    updateServiceWorker
  } = useServiceWorker({
    onSuccess: () => {
      console.log('Service Worker registered successfully');
    },
    onUpdate: () => {
      console.log('Service Worker update available');
    },
    onOffline: () => {
      console.log('App is offline');
    },
    onOnline: () => {
      console.log('App is back online');
    }
  });

  useEffect(() => {
    // Skip service worker registration in development to avoid conflicts with Turbopack
    if (!isProduction) {
      console.log('Service Worker registration skipped in development mode');
      return;
    }

    // Auto-update service worker when update is available
    if (isUpdateAvailable) {
      // You might want to show a notification to the user here
      updateServiceWorker();
    }
  }, [isUpdateAvailable, updateServiceWorker, isProduction]);

  // This component doesn't render anything visible
  return null;
};
