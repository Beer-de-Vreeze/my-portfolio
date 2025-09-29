'use client';

import React, { useMemo } from 'react';
import { 
  SiReact, SiUnity, SiGithub, SiJavascript, SiTypescript, SiHtml5, SiCss3, 
  SiNodedotjs, SiApple, SiDocker, SiGooglecloud, SiNextdotjs, SiTailwindcss, 
  SiBlender, SiAdobephotoshop, SiMysql, SiPhp, SiPython, SiCplusplus, 
  SiUnrealengine, SiGodotengine, SiTensorflow, SiPytorch, SiAndroidstudio, 
  SiVercel, SiDotnet, SiEslint, SiFramer 
} from 'react-icons/si';

interface TechStackProps {
  technologies: string[];
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  variant?: 'icons' | 'badges' | 'minimal';
}

// Icon mapping for technologies
const techIcons: Record<string, { icon: React.ComponentType<{className?: string; style?: React.CSSProperties; 'aria-label'?: string; 'aria-hidden'?: boolean}>; color: string; label: string }> = {
  // Frontend
  'React': { icon: SiReact, color: '#61DAFB', label: 'React' },
  'Next.js': { icon: SiNextdotjs, color: '#000000', label: 'Next.js' },
  'TypeScript': { icon: SiTypescript, color: '#3178C6', label: 'TypeScript' },
  'JavaScript': { icon: SiJavascript, color: '#F7DF1E', label: 'JavaScript' },
  'HTML5': { icon: SiHtml5, color: '#E34F26', label: 'HTML5' },
  'CSS3': { icon: SiCss3, color: '#1572B6', label: 'CSS3' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#38B2AC', label: 'Tailwind CSS' },
  'Framer Motion': { icon: SiFramer, color: '#0055FF', label: 'Framer Motion' },
  
  // Game Development
  'Unity': { icon: SiUnity, color: '#000000', label: 'Unity' },
  'Unreal Engine': { icon: SiUnrealengine, color: '#0E1128', label: 'Unreal Engine' },
  'Godot': { icon: SiGodotengine, color: '#478CBF', label: 'Godot' },
  
  // Programming Languages
  'C#': { icon: SiDotnet, color: '#239120', label: 'C#' },
  'C++': { icon: SiCplusplus, color: '#00599C', label: 'C++' },
  'Python': { icon: SiPython, color: '#3776AB', label: 'Python' },
  'PHP': { icon: SiPhp, color: '#777BB4', label: 'PHP' },
  
  // Backend & Database
  'Node.js': { icon: SiNodedotjs, color: '#339933', label: 'Node.js' },
  'MySQL': { icon: SiMysql, color: '#4479A1', label: 'MySQL' },
  
  // AI/ML
  'TensorFlow': { icon: SiTensorflow, color: '#FF6F00', label: 'TensorFlow' },
  'PyTorch': { icon: SiPytorch, color: '#EE4C2C', label: 'PyTorch' },
  
  // Tools & Platforms
  'Git': { icon: SiGithub, color: '#181717', label: 'Git' },
  'Docker': { icon: SiDocker, color: '#2496ED', label: 'Docker' },
  'Vercel': { icon: SiVercel, color: '#000000', label: 'Vercel' },
  'Google Cloud': { icon: SiGooglecloud, color: '#4285F4', label: 'Google Cloud' },
  'Android Studio': { icon: SiAndroidstudio, color: '#3DDC84', label: 'Android Studio' },
  'ESLint': { icon: SiEslint, color: '#4B32C3', label: 'ESLint' },
  
  // Design & Media
  'Blender': { icon: SiBlender, color: '#F5792A', label: 'Blender' },
  'Photoshop': { icon: SiAdobephotoshop, color: '#31A8FF', label: 'Adobe Photoshop' },
  'macOS': { icon: SiApple, color: '#000000', label: 'macOS' },
};

export const TechStack: React.FC<TechStackProps> = ({
  technologies,
  className = '',
  size = 'medium',
  variant = 'icons'
}) => {
  // Filter technologies that have icons
  const availableTechs = useMemo(() => {
    return technologies
      .map(tech => ({ tech, data: techIcons[tech] }))
      .filter(item => item.data);
  }, [technologies]);

  // Size configurations
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-3', 
    large: 'gap-4'
  };

  if (availableTechs.length === 0) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        No recognized technologies
      </div>
    );
  }

  const renderIcon = (tech: string, data: typeof techIcons[string]) => {
    const IconComponent = data.icon;
    
    return (
      <div
        key={tech}
        className="group relative flex items-center justify-center"
        title={data.label}
      >
        <IconComponent
          className={`${sizeClasses[size]} transition-all duration-200 hover:scale-110 group-hover:drop-shadow-lg`}
          style={{ color: data.color }}
          aria-label={data.label}
        />
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {data.label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  const renderBadge = (tech: string, data: typeof techIcons[string], index: number) => {
    const IconComponent = data.icon;
    
    return (
      <div
        key={tech}
        className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
        title={data.label}
      >
        <IconComponent
          className={sizeClasses[size]}
          style={{ color: data.color }}
          aria-hidden={true}
        />
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
          {data.label}
        </span>
      </div>
    );
  };

  const renderMinimal = (tech: string, data: typeof techIcons[string], index: number) => {
    return (
      <span
        key={tech}
        className={`inline-block text-gray-600 dark:text-gray-400 ${textSizeClasses[size]} font-medium`}
        title={data.label}
      >
        {data.label}
        {index < availableTechs.length - 1 && ', '}
      </span>
    );
  };

  const renderTech = (tech: string, data: typeof techIcons[string], index: number) => {
    switch (variant) {
      case 'badges':
        return renderBadge(tech, data, index);
      case 'minimal':
        return renderMinimal(tech, data, index);
      case 'icons':
      default:
        return renderIcon(tech, data);
    }
  };

  return (
    <div className={className} role="list" aria-label="Technologies used">
      <div className={`flex ${variant === 'minimal' ? 'flex-wrap' : `flex-wrap ${gapClasses[size]}`} items-center`}>
        {availableTechs.map(({ tech, data }, index) => (
          <div key={tech} role="listitem">
            {variant === 'icons' ? renderIcon(tech, data) : renderTech(tech, data, index)}
          </div>
        ))}
      </div>
      
      {/* Show unknown technologies */}
      {technologies.length > availableTechs.length && (
        <div className={`mt-2 text-gray-500 ${textSizeClasses[size]}`}>
          {technologies
            .filter(tech => !techIcons[tech])
            .join(', ')}
        </div>
      )}
    </div>
  );
};

export default TechStack;