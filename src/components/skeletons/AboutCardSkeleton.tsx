"use client";

import React from 'react';

interface AboutCardSkeletonProps {
  className?: string;
  variant?: 'profile' | 'education' | 'skills' | 'contact';
}

export const AboutCardSkeleton: React.FC<AboutCardSkeletonProps> = ({
  className = '',
  variant = 'profile'
}) => {
  const renderProfileSkeleton = () => (
    <div className="space-y-6">
      {/* Profile image */}
      <div className="flex justify-center">
        <div className="w-32 h-32 bg-gray-600 rounded-full animate-pulse"></div>
      </div>
      
      {/* Name */}
      <div className="text-center space-y-2">
        <div className="h-8 bg-gray-600 rounded w-48 mx-auto"></div>
        <div className="h-5 bg-gray-700 rounded w-32 mx-auto"></div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-700 rounded" style={{ width: `${85 + (i % 3) * 5}%` }}></div>
        ))}
      </div>

      {/* Social links */}
      <div className="flex justify-center space-x-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-600 rounded-full"></div>
        ))}
      </div>
    </div>
  );

  const renderEducationSkeleton = () => (
    <div className="space-y-4">
      {/* Title */}
      <div className="h-6 bg-gray-600 rounded w-40"></div>
      
      {/* Education items */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2 p-4 bg-gray-800 rounded-lg">
          <div className="h-5 bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );

  const renderSkillsSkeleton = () => (
    <div className="space-y-4">
      {/* Title */}
      <div className="h-6 bg-gray-600 rounded w-32"></div>
      
      {/* Skill categories */}
      {[...Array(3)].map((_, categoryIndex) => (
        <div key={categoryIndex} className="space-y-3">
          <div className="h-5 bg-gray-600 rounded w-40"></div>
          
          {/* Skill items grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderContactSkeleton = () => (
    <div className="space-y-6">
      {/* Title */}
      <div className="h-6 bg-gray-600 rounded w-32"></div>
      
      {/* Contact form */}
      <div className="space-y-4">
        {/* Name field */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
        </div>
        
        {/* Email field */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-12"></div>
          <div className="h-10 bg-gray-800 rounded"></div>
        </div>
        
        {/* Message field */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-32 bg-gray-800 rounded"></div>
        </div>
        
        {/* Submit button */}
        <div className="h-12 bg-gray-600 rounded w-32"></div>
      </div>

      {/* Contact info */}
      <div className="space-y-3 pt-6 border-t border-gray-700">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-700 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeletonContent = () => {
    switch (variant) {
      case 'profile':
        return renderProfileSkeleton();
      case 'education':
        return renderEducationSkeleton();
      case 'skills':
        return renderSkillsSkeleton();
      case 'contact':
        return renderContactSkeleton();
      default:
        return renderProfileSkeleton();
    }
  };

  return (
    <div className={`animate-pulse bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="relative overflow-hidden">
        {renderSkeletonContent()}
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 animate-shimmer pointer-events-none"></div>
      </div>
    </div>
  );
};

// Grid skeleton for multiple about cards
export const AboutGridSkeleton: React.FC<{ 
  variants?: Array<'profile' | 'education' | 'skills' | 'contact'>;
}> = ({ 
  variants = ['profile', 'education', 'skills', 'contact'] 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {variants.map((variant, i) => (
        <AboutCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
};

export default AboutCardSkeleton;