"use client";

import { useEffect } from 'react';

export const ServiceWorkerInitializer: React.FC = () => {
  useEffect(() => {
    // The new PWA package handles service worker registration automatically
    // We just need to handle update notifications
    
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker registered successfully');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker available! Refresh to update.');
                // You could show a toast notification here
              }
            });
          }
        });
      }).catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  // This component doesn't render anything visible
  return null;
};
