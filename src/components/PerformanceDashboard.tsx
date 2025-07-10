'use client';

import { useEffect, useState } from 'react';
import { Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls: number | null;
  fid: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
}

interface PerformanceDashboardProps {
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceDashboard({ 
  show = false, 
  position = 'bottom-right' 
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    fid: null,
    fcp: null,
    lcp: null,
    ttfb: null,
  });

  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !show) {
      return;
    }

    const handleMetric = (metric: Metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
      }));
    };

    // Listen for Web Vitals updates
    const handleWebVitals = (event: CustomEvent<Metric>) => {
      handleMetric(event.detail);
    };

    // Add event listener for custom Web Vitals events
    window.addEventListener('webvital', handleWebVitals as EventListener);

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('webvital', handleWebVitals as EventListener);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [show]);

  if (!isVisible) {
    return null;
  }

  const getScoreColor = (value: number | null, metric: string): string => {
    if (value === null) return 'text-gray-400';
    
    switch (metric) {
      case 'cls':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500';
      case 'fid':
        return value <= 100 ? 'text-green-500' : value <= 300 ? 'text-yellow-500' : 'text-red-500';
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
      case 'fid':
      case 'fcp':
      case 'lcp':
      case 'ttfb':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

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
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">FID:</span>
          <span className={getScoreColor(metrics.fid, 'fid')}>
            {formatValue(metrics.fid, 'fid')}
          </span>
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
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
