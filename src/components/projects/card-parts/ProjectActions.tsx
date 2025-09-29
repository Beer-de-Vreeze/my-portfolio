'use client';

import React, { useState, useEffect } from 'react';
import { FaDownload, FaExternalLinkAlt, FaGithub, FaWindows, FaApple, FaLinux, FaFileArchive, FaGlobe } from 'react-icons/fa';

interface DownloadLinkObject {
  label?: string;
  filename?: string;
  platform?: 'windows' | 'mac' | 'linux' | 'web' | 'universal';
}

interface ProjectActionsProps {
  downloadLink?: string | DownloadLinkObject;
  liveLink?: string;
  githubLink?: string;
  additionalLinks?: Array<{
    url: string;
    label: string;
    icon?: React.ComponentType<{className?: string}>;
    type?: 'external' | 'download';
  }>;
  className?: string;
}

const PlatformIcon: Record<string, React.ComponentType<{className?: string}>> = {
  windows: FaWindows,
  mac: FaApple,
  linux: FaLinux,
  web: FaGlobe,
  universal: FaFileArchive,
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const ProjectActions: React.FC<ProjectActionsProps> = ({
  downloadLink,
  liveLink,
  githubLink,
  additionalLinks = [],
  className = '',
}) => {
  const [downloadSize, setDownloadSize] = useState<number | null>(null);
  const [isLoadingSize, setIsLoadingSize] = useState(false);

  const downloadUrl = typeof downloadLink === 'string' ? downloadLink : downloadLink?.filename;
  const downloadData = typeof downloadLink === 'object' ? downloadLink : {};

  // Fetch file size for download link
  useEffect(() => {
    if (downloadUrl && !downloadSize) {
      setIsLoadingSize(true);
      
      fetch(downloadUrl, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('Content-Length');
          if (size) {
            setDownloadSize(parseInt(size, 10));
          }
        })
        .catch(() => {
          // Silently fail - size will not be shown
        })
        .finally(() => {
          setIsLoadingSize(false);
        });
    }
  }, [downloadUrl, downloadSize]);

  const renderButton = (
    url: string,
    label: string,
    icon: React.ComponentType<{className?: string}>,
    variant: 'primary' | 'secondary' | 'github' = 'primary',
    type: 'link' | 'download' = 'link',
    additionalInfo?: string
  ) => {
    const IconComponent = icon;
    
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";
    
    const variantClasses = {
      primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600 focus:ring-blue-400 shadow-lg hover:shadow-xl",
      secondary: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 focus:ring-emerald-400 shadow-lg hover:shadow-xl",
      github: "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-gray-400 shadow-lg hover:shadow-xl"
    };

    const ButtonElement = type === 'download' ? 'a' : 'a';
    const buttonProps = type === 'download' 
      ? { download: true, href: url }
      : { href: url, target: '_blank', rel: 'noopener noreferrer' };

    return (
      <ButtonElement
        {...buttonProps}
        className={`${baseClasses} ${variantClasses[variant]} group`}
        aria-label={`${label}${additionalInfo ? ` (${additionalInfo})` : ''}${type === 'link' ? ' - opens in new tab' : ' - download file'}`}
      >
        <IconComponent className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="flex flex-col items-start">
          <span className="text-sm font-medium">{label}</span>
          {additionalInfo && (
            <span className="text-xs opacity-75">{additionalInfo}</span>
          )}
        </span>
      </ButtonElement>
    );
  };

  const hasAnyLinks = downloadLink || liveLink || githubLink || additionalLinks.length > 0;

  if (!hasAnyLinks) {
    return null;
  }

  const getPlatformIcon = (platform?: string): React.ComponentType<{className?: string}> => {
    if (platform && PlatformIcon[platform]) {
      return PlatformIcon[platform];
    }
    return FaDownload;
  };

  const getAdditionalInfo = (): string => {
    const parts: string[] = [];
    
    if (downloadData.platform) {
      const platformLabels = {
        windows: 'Windows',
        mac: 'macOS', 
        linux: 'Linux',
        web: 'Web App',
        universal: 'All Platforms'
      };
      parts.push(platformLabels[downloadData.platform] || downloadData.platform);
    }
    
    if (downloadSize) {
      parts.push(formatFileSize(downloadSize));
    } else if (isLoadingSize) {
      parts.push('...');
    }
    
    return parts.join(' • ');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">
        Actions
      </h4>
      
      <div className="flex flex-wrap gap-3">
        {/* Download Link */}
        {downloadUrl && (
          renderButton(
            downloadUrl,
            downloadData.label || 'Download',
            getPlatformIcon(downloadData.platform),
            'primary',
            'download',
            getAdditionalInfo()
          )
        )}

        {/* Live Demo Link */}
        {liveLink && (
          renderButton(
            liveLink,
            'Live Demo',
            FaExternalLinkAlt,
            'secondary',
            'link'
          )
        )}

        {/* GitHub Link */}
        {githubLink && (
          renderButton(
            githubLink,
            'View Source',
            FaGithub,
            'github',
            'link'
          )
        )}

        {/* Additional Links */}
        {additionalLinks.map((link, index) => {
          const IconComponent = link.icon || FaExternalLinkAlt;
          return (
            <div key={`link-${index}`}>
              {renderButton(
                link.url,
                link.label,
                IconComponent,
                'secondary',
                link.type === 'download' ? 'download' : 'link'
              )}
            </div>
          );
        })}
      </div>

      {/* Platform compatibility info */}
      {downloadData.platform === 'universal' && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Compatible with Windows, macOS, and Linux
        </div>
      )}
    </div>
  );
};

export default ProjectActions;