"use client";

// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private config: ServiceWorkerConfig = {};

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
    this.setupOnlineOfflineListeners();
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    // Skip service worker registration in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Service Worker registration skipped in development mode');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              this.config.onUpdate?.(registration);
            }
          });
        }
      });

      // Handle successful registration
      if (registration.active) {
        this.config.onSuccess?.(registration);
      }

      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if (this.registration) {
      try {
        const result = await this.registration.unregister();
        this.registration = null;
        console.log('Service Worker unregistered:', result);
        return result;
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
        return false;
      }
    }
    return false;
  }

  async update(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Service Worker update triggered');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  }

  // Check if the app is running offline
  isAppOffline(): boolean {
    return !this.isOnline;
  }

  // Force cache refresh
  async refreshCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        console.log('All caches cleared');
        
        // Re-register service worker to rebuild cache
        await this.register();
      } catch (error) {
        console.error('Cache refresh failed:', error);
      }
    }
  }

  // Get cache usage information
  async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    if (!('caches' in window)) return [];

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return { name, size: keys.length };
        })
      );
      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return [];
    }
  }

  private setupOnlineOfflineListeners(): void {
    if (typeof window === 'undefined') return;

    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.config.onOnline?.();
      console.log('App is back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.config.onOffline?.();
      console.log('App is offline');
    });
  }

  // Send message to service worker
  async sendMessage(message: unknown): Promise<unknown> {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service Worker not active');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      this.registration!.active!.postMessage(message, [messageChannel.port2]);
    });
  }
}

// Default service worker instance
let serviceWorkerManager: ServiceWorkerManager | null = null;

// Initialize service worker
export const initServiceWorker = (config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> => {
  if (!serviceWorkerManager) {
    serviceWorkerManager = new ServiceWorkerManager(config);
  }
  
  return serviceWorkerManager.register();
};

// Get service worker manager instance
export const getServiceWorkerManager = (): ServiceWorkerManager | null => {
  return serviceWorkerManager;
};

// Check if app is offline
export const isOffline = (): boolean => {
  return serviceWorkerManager?.isAppOffline() ?? !navigator.onLine;
};

// Utility hook for service worker management
export const useServiceWorker = (config: ServiceWorkerConfig = {}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Skip in development to avoid conflicts with Turbopack HMR
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const swConfig: ServiceWorkerConfig = {
      ...config,
      onSuccess: (registration) => {
        setIsRegistered(true);
        config.onSuccess?.(registration);
      },
      onUpdate: (registration) => {
        setIsUpdateAvailable(true);
        config.onUpdate?.(registration);
      },
      onOffline: () => {
        setIsOfflineMode(true);
        config.onOffline?.();
      },
      onOnline: () => {
        setIsOfflineMode(false);
        config.onOnline?.();
      }
    };

    initServiceWorker(swConfig);

    // Initial offline state
    setIsOfflineMode(!navigator.onLine);
  }, [config]);

  const updateServiceWorker = useCallback(async () => {
    const manager = getServiceWorkerManager();
    if (manager) {
      await manager.update();
      setIsUpdateAvailable(false);
    }
  }, []);

  const refreshCache = useCallback(async () => {
    const manager = getServiceWorkerManager();
    if (manager) {
      await manager.refreshCache();
    }
  }, []);

  return {
    isRegistered,
    isUpdateAvailable,
    isOfflineMode,
    updateServiceWorker,
    refreshCache,
    manager: serviceWorkerManager
  };
};

// React import for the hook
import { useState, useEffect, useCallback } from 'react';

export default ServiceWorkerManager;