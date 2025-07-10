'use client';

import React, { useState, useEffect } from 'react';

// Lightweight wrapper that only loads DevConsole on desktop
const DevConsoleWrapper: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [DevConsole, setDevConsole] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Check if we're on desktop (width > 1024px)
    const checkDevice = () => {
      const isDesktopDevice = window.innerWidth > 1024;
      setIsDesktop(isDesktopDevice);
      
      // Only load DevConsole on desktop
      if (isDesktopDevice && !DevConsole) {
        // Dynamic import to reduce bundle size on mobile
        import('./DevConsole').then((module) => {
          setDevConsole(() => module.default);
        }).catch((error) => {
          console.warn('Failed to load DevConsole:', error);
        });
      }
    };

    // Check initially
    checkDevice();

    // Listen for resize events (throttled)
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [DevConsole]);

  // Only render DevConsole on desktop
  if (!isDesktop || !DevConsole) {
    return null;
  }

  return <DevConsole />;
};

export default DevConsoleWrapper;
