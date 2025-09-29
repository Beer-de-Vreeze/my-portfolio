'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'auto';
export type ColorScheme = 'blue' | 'purple' | 'green' | 'red' | 'orange';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'dark' | 'light';
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue');
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') as Theme;
    const savedColorScheme = localStorage.getItem('portfolio-color-scheme') as ColorScheme;
    
    if (savedTheme && ['dark', 'light', 'auto'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    
    if (savedColorScheme && ['blue', 'purple', 'green', 'red', 'orange'].includes(savedColorScheme)) {
      setColorScheme(savedColorScheme);
    }
  }, []);

  // Handle system theme changes when theme is set to 'auto'
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateEffectiveTheme = () => {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      
      updateEffectiveTheme();
      mediaQuery.addEventListener('change', updateEffectiveTheme);
      
      return () => mediaQuery.removeEventListener('change', updateEffectiveTheme);
    } else {
      setEffectiveTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(effectiveTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#000000' : '#ffffff');
    }
  }, [effectiveTheme]);

  // Apply color scheme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const schemes = {
      blue: {
        primary: '59, 130, 246', // blue-500
        primaryDark: '29, 78, 216', // blue-700
        secondary: '139, 92, 246', // violet-500
        accent: '236, 72, 153', // pink-500
      },
      purple: {
        primary: '139, 92, 246', // violet-500
        primaryDark: '109, 40, 217', // violet-700
        secondary: '236, 72, 153', // pink-500
        accent: '59, 130, 246', // blue-500
      },
      green: {
        primary: '34, 197, 94', // green-500
        primaryDark: '21, 128, 61', // green-700
        secondary: '59, 130, 246', // blue-500
        accent: '139, 92, 246', // violet-500
      },
      red: {
        primary: '239, 68, 68', // red-500
        primaryDark: '185, 28, 28', // red-700
        secondary: '251, 146, 60', // orange-400
        accent: '236, 72, 153', // pink-500
      },
      orange: {
        primary: '249, 115, 22', // orange-500
        primaryDark: '194, 65, 12', // orange-700
        secondary: '239, 68, 68', // red-500
        accent: '139, 92, 246', // violet-500
      }
    };

    const scheme = schemes[colorScheme];
    root.style.setProperty('--color-primary', scheme.primary);
    root.style.setProperty('--color-primary-dark', scheme.primaryDark);
    root.style.setProperty('--color-secondary', scheme.secondary);
    root.style.setProperty('--color-accent', scheme.accent);
  }, [colorScheme]);

  const handleSetTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  }, []);

  const handleSetColorScheme = useCallback((newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    localStorage.setItem('portfolio-color-scheme', newScheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    handleSetTheme(newTheme);
  }, [effectiveTheme, handleSetTheme]);

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    colorScheme,
    setTheme: handleSetTheme,
    setColorScheme: handleSetColorScheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};