'use client';

import React from 'react';
import { 
  FaCode, FaRobot, FaPalette, FaGamepad, FaBrain, FaMusic, 
  FaNetworkWired, FaImage, FaPaintBrush, FaDesktop, FaLayerGroup, 
  FaCogs, FaMicrochip, FaComments, FaFont, FaMicrophone, FaTachometerAlt, 
  FaMobile, FaVolumeUp
} from 'react-icons/fa';

interface ProjectFeature {
  title: string;
  description: string;
  icon?: string;
}

interface ProjectFeaturesProps {
  features: ProjectFeature[];
  className?: string;
  layout?: 'grid' | 'list' | 'cards';
  showIcons?: boolean;
}

// Icon mapping for features
const featureIcons: Record<string, React.ComponentType<{className?: string; 'aria-hidden'?: boolean}>> = {
  'code': FaCode,
  'ai': FaRobot,
  'robot': FaRobot,
  'design': FaPalette,
  'game': FaGamepad,
  'brain': FaBrain,
  'music': FaMusic,
  'audio': FaVolumeUp,
  'sound': FaVolumeUp,
  'network': FaNetworkWired,
  'image': FaImage,
  'paint': FaPaintBrush,
  'desktop': FaDesktop,
  'layer': FaLayerGroup,
  'layers': FaLayerGroup,
  'cog': FaCogs,
  'settings': FaCogs,
  'chip': FaMicrochip,
  'performance': FaTachometerAlt,
  'comments': FaComments,
  'dialogue': FaComments,
  'dialog': FaComments,
  'font': FaFont,
  'text': FaFont,
  'microphone': FaMicrophone,
  'mobile': FaMobile,
  'responsive': FaMobile,
};

// Auto-detect icon based on feature title/description
const detectIcon = (feature: ProjectFeature): React.ComponentType<{className?: string; 'aria-hidden'?: boolean}> | null => {
  if (feature.icon && featureIcons[feature.icon.toLowerCase()]) {
    return featureIcons[feature.icon.toLowerCase()];
  }
  
  const searchText = `${feature.title} ${feature.description}`.toLowerCase();
  
  // Pattern matching for automatic icon detection
  const patterns = [
    { keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml'], icon: 'ai' },
    { keywords: ['audio', 'sound', 'music', 'voice'], icon: 'audio' },
    { keywords: ['performance', 'optimization', 'speed', 'fast'], icon: 'performance' },
    { keywords: ['dialogue', 'dialog', 'conversation', 'chat'], icon: 'dialogue' },
    { keywords: ['visual', 'graphics', 'render', 'image'], icon: 'image' },
    { keywords: ['responsive', 'mobile', 'device'], icon: 'responsive' },
    { keywords: ['network', 'multiplayer', 'connection'], icon: 'network' },
    { keywords: ['layer', 'layers', 'system'], icon: 'layers' },
    { keywords: ['code', 'programming', 'algorithm'], icon: 'code' },
    { keywords: ['game', 'gaming', 'play'], icon: 'game' },
    { keywords: ['design', 'ui', 'interface'], icon: 'design' },
    { keywords: ['settings', 'configuration', 'options'], icon: 'settings' },
  ];
  
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => searchText.includes(keyword))) {
      return featureIcons[pattern.icon];
    }
  }
  
  return FaCogs; // Default icon
};

export const ProjectFeatures: React.FC<ProjectFeaturesProps> = ({
  features,
  className = '',
  layout = 'list',
  showIcons = true,
}) => {
  if (features.length === 0) {
    return null;
  }

  const renderFeature = (feature: ProjectFeature, index: number) => {
    const IconComponent = showIcons ? detectIcon(feature) : null;
    
    const featureContent = (
      <>
        {IconComponent && (
          <div className="flex-shrink-0">
            <IconComponent 
              className="w-5 h-5 text-blue-500 dark:text-blue-400"
              aria-hidden={true}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {feature.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      </>
    );

    switch (layout) {
      case 'cards':
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
            role="listitem"
          >
            <div className="flex items-start space-x-3">
              {featureContent}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            role="listitem"
          >
            {featureContent}
          </div>
        );

      case 'list':
      default:
        return (
          <li
            key={index}
            className="flex items-start space-x-3 py-2"
            role="listitem"
          >
            {featureContent}
          </li>
        );
    }
  };

  const getContainerClasses = () => {
    const baseClasses = className;
    
    switch (layout) {
      case 'cards':
        return `${baseClasses} grid gap-4 grid-cols-1 sm:grid-cols-2`;
      case 'grid':
        return `${baseClasses} grid gap-2 grid-cols-1`;
      case 'list':
      default:
        return `${baseClasses} space-y-1`;
    }
  };

  const Container = layout === 'list' ? 'ul' : 'div';

  return (
    <div className="w-full">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        Key Features
      </h3>
      <Container 
        className={getContainerClasses()}
        role="list"
        aria-label="Project features"
      >
        {features.map(renderFeature)}
      </Container>
    </div>
  );
};

export default ProjectFeatures;