'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// Accessibility preferences
interface A11yPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  announceChanges: boolean;
}

// Performance preferences
interface PerformancePreferences {
  enableAnimations: boolean;
  particleCount: 'minimal' | 'reduced' | 'normal' | 'maximum';
  imageOptimization: 'aggressive' | 'balanced' | 'quality';
  prefersDataSaver: boolean;
}

// UI preferences
interface UIPreferences {
  compactMode: boolean;
  showTooltips: boolean;
  autoPlayMedia: boolean;
  stickyNavigation: boolean;
}

// Developer preferences
interface DevPreferences {
  showPerformanceDashboard: boolean;
  showDevConsole: boolean;
  enableDebugMode: boolean;
}

interface AllPreferences {
  accessibility: A11yPreferences;
  performance: PerformancePreferences;
  ui: UIPreferences;
  developer: DevPreferences;
}

interface PreferenceContextType extends AllPreferences {
  updatePreference: <K extends keyof AllPreferences>(
    category: K,
    key: keyof AllPreferences[K],
    value: AllPreferences[K][keyof AllPreferences[K]]
  ) => void;
  resetPreferences: () => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: AllPreferences = {
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    announceChanges: true,
  },
  performance: {
    enableAnimations: true,
    particleCount: 'normal',
    imageOptimization: 'balanced',
    prefersDataSaver: false,
  },
  ui: {
    compactMode: false,
    showTooltips: true,
    autoPlayMedia: false,
    stickyNavigation: true,
  },
  developer: {
    showPerformanceDashboard: false,
    showDevConsole: false,
    enableDebugMode: false,
  },
};

interface PreferenceProviderProps {
  children: ReactNode;
}

export const PreferenceProvider: React.FC<PreferenceProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AllPreferences>(defaultPreferences);

  // Update preference function
  const updatePreference = useCallback(<K extends keyof AllPreferences>(
    category: K,
    key: keyof AllPreferences[K],
    value: AllPreferences[K][keyof AllPreferences[K]]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all properties exist
        setPreferences({
          accessibility: { ...defaultPreferences.accessibility, ...parsed.accessibility },
          performance: { ...defaultPreferences.performance, ...parsed.performance },
          ui: { ...defaultPreferences.ui, ...parsed.ui },
          developer: { ...defaultPreferences.developer, ...parsed.developer },
        });
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
  }, []);

  // Apply system preferences on mount
  useEffect(() => {
    // Check for system reduced motion preference
    const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQueryReducedMotion.matches) {
      updatePreference('accessibility', 'reducedMotion', true);
    }

    // Check for system high contrast preference
    const mediaQueryHighContrast = window.matchMedia('(prefers-contrast: high)');
    if (mediaQueryHighContrast.matches) {
      updatePreference('accessibility', 'highContrast', true);
    }

    // Check for data saver preference
    if ('connection' in navigator && (navigator as { connection?: { saveData?: boolean } }).connection?.saveData) {
      updatePreference('performance', 'prefersDataSaver', true);
      updatePreference('performance', 'particleCount', 'minimal');
      updatePreference('performance', 'imageOptimization', 'aggressive');
    }

    // Listen for changes
    const handleReducedMotionChange = () => {
      updatePreference('accessibility', 'reducedMotion', mediaQueryReducedMotion.matches);
    };
    
    const handleHighContrastChange = () => {
      updatePreference('accessibility', 'highContrast', mediaQueryHighContrast.matches);
    };

    mediaQueryReducedMotion.addEventListener('change', handleReducedMotionChange);
    mediaQueryHighContrast.addEventListener('change', handleHighContrastChange);

    return () => {
      mediaQueryReducedMotion.removeEventListener('change', handleReducedMotionChange);
      mediaQueryHighContrast.removeEventListener('change', handleHighContrastChange);
    };
  }, [updatePreference]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }, [preferences]);

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Reduced motion
    if (preferences.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    root.classList.toggle('high-contrast', preferences.accessibility.highContrast);
    
    // Large text
    root.classList.toggle('large-text', preferences.accessibility.largeText);
    
    // Focus visible
    root.classList.toggle('focus-visible', preferences.accessibility.focusVisible);
    
    // Compact mode
    root.classList.toggle('compact-mode', preferences.ui.compactMode);
  }, [preferences.accessibility, preferences.ui.compactMode]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('portfolio-preferences');
  }, []);

  // Export preferences as JSON string
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Import preferences from JSON string
  const importPreferences = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      
      // Validate structure
      if (typeof parsed !== 'object' || !parsed.accessibility || !parsed.performance || !parsed.ui || !parsed.developer) {
        throw new Error('Invalid preference structure');
      }
      
      setPreferences({
        accessibility: { ...defaultPreferences.accessibility, ...parsed.accessibility },
        performance: { ...defaultPreferences.performance, ...parsed.performance },
        ui: { ...defaultPreferences.ui, ...parsed.ui },
        developer: { ...defaultPreferences.developer, ...parsed.developer },
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }, []);

  const value: PreferenceContextType = {
    ...preferences,
    updatePreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };

  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreference = (): PreferenceContextType => {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error('usePreference must be used within a PreferenceProvider');
  }
  return context;
};

// Convenience hooks for specific preference categories
export const useA11yPreference = () => {
  const { accessibility, updatePreference } = usePreference();
  const updateA11y = useCallback((key: keyof A11yPreferences, value: A11yPreferences[keyof A11yPreferences]) => {
    updatePreference('accessibility', key, value);
  }, [updatePreference]);
  
  return { ...accessibility, updateA11y };
};

export const usePerformancePreference = () => {
  const { performance, updatePreference } = usePreference();
  const updatePerformance = useCallback((key: keyof PerformancePreferences, value: PerformancePreferences[keyof PerformancePreferences]) => {
    updatePreference('performance', key, value);
  }, [updatePreference]);
  
  return { ...performance, updatePerformance };
};

export const useUIPreference = () => {
  const { ui, updatePreference } = usePreference();
  const updateUI = useCallback((key: keyof UIPreferences, value: UIPreferences[keyof UIPreferences]) => {
    updatePreference('ui', key, value);
  }, [updatePreference]);
  
  return { ...ui, updateUI };
};