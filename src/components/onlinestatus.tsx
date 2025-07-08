"use client";

import React, { useState, useEffect } from 'react';
import { isOffline } from '@/lib/serviceWorker';

interface OnlineStatusProps {
  className?: string;
  showText?: boolean;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const offline = isOffline();
      setIsOfflineMode(offline);
      
      // Show notification when status changes
      if (offline !== isOfflineMode) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOfflineMode(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineMode]);

  return (
    <>
      {/* Status indicator */}
      <div className={`flex items-center space-x-2 ${className}`}>
        <div 
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isOfflineMode ? 'bg-red-500' : 'bg-green-500'
          }`}
          title={isOfflineMode ? 'Offline' : 'Online'}
        />
        {showText && (
          <span className={`text-sm font-medium ${
            isOfflineMode ? 'text-red-400' : 'text-green-400'
          }`}>
            {isOfflineMode ? 'Offline' : 'Online'}
          </span>
        )}
      </div>

      {/* Notification banner */}
      {showNotification && (
        <div className={`
          fixed top-0 left-0 right-0 z-50 p-3 text-center text-white font-medium
          transition-transform duration-300 ease-in-out
          ${isOfflineMode 
            ? 'bg-red-600 transform translate-y-0' 
            : 'bg-green-600 transform translate-y-0'
          }
        `}>
          {isOfflineMode 
            ? '📱 You\'re offline. Some features may be limited.' 
            : '🌐 You\'re back online!'
          }
        </div>
      )}
    </>
  );
};

// Hook for using online status in components
export const useOnlineStatus = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOfflineMode(isOffline());
    };

    updateStatus();

    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline: isOfflineMode, isOnline: !isOfflineMode };
};

export default OnlineStatus;
