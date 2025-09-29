'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotification, NotificationType, NotificationPosition } from '@/context/NotificationContext';
import { useA11yPreference } from '@/context/PreferenceContext';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification, position } = useNotification();
  const { reducedMotion, announceChanges } = useA11yPreference();
  const announceRef = useRef<HTMLDivElement>(null);

  // Announce new notifications to screen readers
  useEffect(() => {
    if (announceChanges && notifications.length > 0 && announceRef.current) {
      const latestNotification = notifications[0];
      const announcement = `${latestNotification.type} notification: ${latestNotification.title || ''} ${latestNotification.message}`;
      announceRef.current.textContent = announcement;
    }
  }, [notifications, announceChanges]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      removeNotification(id);
    }
  }, [removeNotification]);

  // Get position classes
  const getPositionClasses = (position: NotificationPosition): string => {
    const baseClasses = 'fixed z-[9999] flex flex-col gap-3 p-4 max-w-md w-full pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-0 right-0`;
      case 'top-left':
        return `${baseClasses} top-0 left-0`;
      case 'top-center':
        return `${baseClasses} top-0 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseClasses} bottom-0 right-0`;
      case 'bottom-left':
        return `${baseClasses} bottom-0 left-0`;
      case 'bottom-center':
        return `${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-0 right-0`;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      
      <div className={getPositionClasses(position)}>
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
              onKeyDown={handleKeyDown}
              reducedMotion={reducedMotion}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

interface NotificationItemProps {
  notification: {
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
  };
  onRemove: (id: string) => void;
  onKeyDown: (event: React.KeyboardEvent, id: string) => void;
  reducedMotion: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  onKeyDown,
  reducedMotion,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  // Auto-progress animation
  useEffect(() => {
    if (!notification.persistent && notification.duration && notification.duration > 0 && progressRef.current) {
      const progressElement = progressRef.current;
      
      if (!reducedMotion) {
        progressElement.style.animation = `notification-progress ${notification.duration}ms linear forwards`;
      }
    }
  }, [notification.duration, notification.persistent, reducedMotion]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" aria-hidden="true" />;
      case 'error':
        return <XCircle className="w-5 h-5" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" aria-hidden="true" />;
      case 'info':
        return <Info className="w-5 h-5" aria-hidden="true" />;
      default:
        return <Info className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const getColorClasses = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800/30 dark:text-gray-200';
    }
  };

  const getIconColorClasses = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleAction = useCallback(() => {
    if (notification.action) {
      notification.action.onClick();
      onRemove(notification.id);
    }
  }, [notification.action, notification.id, onRemove]);

  return (
    <motion.div
      layout={!reducedMotion}
      initial={!reducedMotion ? { 
        opacity: 0, 
        x: 100, 
        scale: 0.9,
        height: 0
      } : { opacity: 1 }}
      animate={!reducedMotion ? { 
        opacity: 1, 
        x: 0, 
        scale: 1,
        height: 'auto'
      } : { opacity: 1 }}
      exit={!reducedMotion ? { 
        opacity: 0, 
        x: 100, 
        scale: 0.9,
        height: 0,
        marginBottom: 0
      } : { opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="pointer-events-auto"
    >
      <div
        className={`relative rounded-lg border backdrop-blur-sm shadow-lg p-4 ${getColorClasses(notification.type)}`}
        role="alert"
        aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
        tabIndex={0}
        onKeyDown={(e) => onKeyDown(e, notification.id)}
      >
        {/* Progress bar for non-persistent notifications */}
        {!notification.persistent && notification.duration && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-current opacity-30"
              style={{ width: '100%' }}
            />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${getIconColorClasses(notification.type)}`}>
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
            )}
            <p className="text-sm leading-relaxed break-words">
              {notification.message}
            </p>
            
            {notification.action && (
              <button
                onClick={handleAction}
                className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent rounded"
              >
                {notification.action.label}
              </button>
            )}
          </div>

          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 text-current/60 hover:text-current transition-colors rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// CSS styles for animations (to be added to globals.css)
export const notificationStyles = `
  @keyframes notification-progress {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .notification-progress {
    animation: notification-progress var(--duration, 5000ms) linear forwards;
  }
`;

export default NotificationContainer;