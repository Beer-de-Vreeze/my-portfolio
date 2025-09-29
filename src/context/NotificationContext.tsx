'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  position: NotificationPosition;
  setPosition: (position: NotificationPosition) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  defaultPosition?: NotificationPosition;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  defaultPosition = 'top-right',
  maxNotifications = 5
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [position, setPosition] = useState<NotificationPosition>(defaultPosition);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add notification with auto-removal
  const addNotification = useCallback((notificationData: Omit<Notification, 'id'>) => {
    const id = generateId();
    const notification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notificationData,
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      // Limit the number of notifications
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove after duration (unless persistent)
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }

    return id;
  }, [generateId, maxNotifications]);

  // Remove specific notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Handle position changes
  const handleSetPosition = useCallback((newPosition: NotificationPosition) => {
    setPosition(newPosition);
    localStorage.setItem('portfolio-notification-position', newPosition);
  }, []);

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('portfolio-notification-position') as NotificationPosition;
    if (savedPosition && ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(savedPosition)) {
      setPosition(savedPosition);
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    position,
    setPosition: handleSetPosition,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Convenience hooks for specific notification types
export const useNotificationActions = () => {
  const { addNotification } = useNotification();

  const showSuccess = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    return addNotification({ message, type: 'success', ...options });
  }, [addNotification]);

  const showError = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    return addNotification({ message, type: 'error', duration: 8000, ...options });
  }, [addNotification]);

  const showWarning = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    return addNotification({ message, type: 'warning', duration: 6000, ...options });
  }, [addNotification]);

  const showInfo = useCallback((message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    return addNotification({ message, type: 'info', duration: 4000, ...options });
  }, [addNotification]);

  return { showSuccess, showError, showWarning, showInfo };
};