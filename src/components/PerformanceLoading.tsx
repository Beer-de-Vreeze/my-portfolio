import React from 'react';

interface PerformanceLoadingProps {
  className?: string;
  variant?: 'card' | 'skeleton' | 'spinner';
  size?: 'sm' | 'md' | 'lg';
}

export const PerformanceLoading: React.FC<PerformanceLoadingProps> = ({ 
  className = '', 
  variant = 'skeleton',
  size = 'md'
}) => {
  const baseClasses = 'animate-pulse bg-gray-800 rounded-lg';
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-96'
  };

  switch (variant) {
    case 'card':
      return (
        <div className={`${baseClasses} ${sizeClasses[size]} w-full ${className}`}>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      );
    
    case 'spinner':
      return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    
    default:
      return (
        <div className={`${baseClasses} ${sizeClasses[size]} w-full ${className}`}></div>
      );
  }
};
