'use client';

import { useEffect, useState } from 'react';
import { Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
}

interface PerformanceDashboardProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceDashboard({ 
  position = 'bottom-right' 
}: Omit<PerformanceDashboardProps, 'show'>) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    inp: null,
    fcp: null,
    lcp: null,
    ttfb: null,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only work in development environment
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Set initial visibility based on environment
    setIsVisible(true);

    // Import and setup Web Vitals directly
    const setupWebVitals = async () => {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
      
      const handleMetric = (metric: Metric) => {
        console.log('Web Vital received:', metric.name, metric.value);
        setMetrics(prev => ({
          ...prev,
          [metric.name.toLowerCase()]: metric.value,
        }));
      };

      // Setup all Web Vitals listeners with reportAllChanges for CLS and INP
      onCLS(handleMetric, { reportAllChanges: true });
      onINP(handleMetric, { reportAllChanges: true });
      onFCP(handleMetric);
      onLCP(handleMetric);
      onTTFB(handleMetric);

      console.log('Web Vitals listeners setup complete');
    };

    setupWebVitals();

    // Toggle visibility with Numpad 9
    const handleKeyPress = (event: KeyboardEvent) => {
      // Try multiple ways to detect numpad 9
      if (event.code === 'Numpad9' || 
          (event.key === '9' && event.location === 3) || 
          event.key === 'End') {
        console.log('Performance dashboard toggle triggered!');
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const getScoreColor = (value: number | null, metric: string): string => {
    if (value === null) return 'text-gray-400';
    
    switch (metric) {
      case 'cls':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500';
      case 'inp':
        return value <= 200 ? 'text-green-500' : value <= 500 ? 'text-yellow-500' : 'text-red-500';
      case 'fcp':
        return value <= 1800 ? 'text-green-500' : value <= 3000 ? 'text-yellow-500' : 'text-red-500';
      case 'lcp':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500';
      case 'ttfb':
        return value <= 800 ? 'text-green-500' : value <= 1800 ? 'text-yellow-500' : 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatValue = (value: number | null, metric: string): string => {
    if (value === null) return '-';
    
    switch (metric) {
      case 'cls':
        return value.toFixed(3);
      case 'inp':
      case 'fcp':
      case 'lcp':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const positionClasses = {
    'top-left': 'top-20 left-4',
    'top-right': 'top-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-right': 'bottom-20 right-4',
  };

  // Only show in development mode and when visible
  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 text-xs font-mono text-white shadow-lg min-w-[180px]`}
      role="complementary"
      aria-label="Performance Metrics Dashboard"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-200">Web Vitals</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close dashboard"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-300">CLS:</span>
          <span className={getScoreColor(metrics.cls, 'cls')}>
            {formatValue(metrics.cls, 'cls')}
          </span>
          {metrics.cls === null && <span className="text-xs text-gray-500">(scroll/click)</span>}
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">INP:</span>
          <span className={getScoreColor(metrics.inp, 'inp')}>
            {formatValue(metrics.inp, 'inp')}
          </span>
          {metrics.inp === null && <span className="text-xs text-gray-500">(interact)</span>}
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">FCP:</span>
          <span className={getScoreColor(metrics.fcp, 'fcp')}>
            {formatValue(metrics.fcp, 'fcp')}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">LCP:</span>
          <span className={getScoreColor(metrics.lcp, 'lcp')}>
            {formatValue(metrics.lcp, 'lcp')}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">TTFB:</span>
          <span className={getScoreColor(metrics.ttfb, 'ttfb')}>
            {formatValue(metrics.ttfb, 'ttfb')}
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400 text-[10px]">
        Numpad 9 to toggle • Try ↑↑↓↓←→←→BA
      </div>
    </div>
  );
}
