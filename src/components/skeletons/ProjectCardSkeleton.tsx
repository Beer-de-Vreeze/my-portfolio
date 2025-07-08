"use client";

import React from 'react';

interface ProjectCardSkeletonProps {
  className?: string;
  showDetails?: boolean;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  className = '',
  showDetails = true
}) => {
  return (
    <div className={`animate-pulse bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Header skeleton */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
        </div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-gray-600 rounded-full"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded animate-shimmer"></div>
        
        {/* Tech stack */}
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-600 rounded"></div>
          ))}
        </div>

        {/* Description */}
        {showDetails && (
          <div className="space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-4/5"></div>
            <div className="h-4 bg-gray-600 rounded w-3/5"></div>
          </div>
        )}

        {/* Features */}
        {showDetails && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3 mt-6">
          <div className="h-10 bg-gray-600 rounded w-24"></div>
          <div className="h-10 bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Grid skeleton for multiple project cards
export const ProjectGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Media skeleton for images/videos
export const MediaSkeleton: React.FC<{ 
  className?: string; 
  aspectRatio?: 'square' | 'video' | 'wide' 
}> = ({ 
  className = '', 
  aspectRatio = 'video' 
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]'
  };

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-800 ${aspectClasses[aspectRatio]} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-shimmer"></div>
      </div>
      {/* Play button for video skeleton */}
      {aspectRatio === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default ProjectCardSkeleton;