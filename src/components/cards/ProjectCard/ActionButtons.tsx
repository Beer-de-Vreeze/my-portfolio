import React from 'react';
import type { DownloadLinkObject, LoadingState } from './types';
import { getFileTypeInfo, getLinkTypeInfo } from './utils';

interface ActionButtonsProps {
  downloadLink?: string | DownloadLinkObject;
  liveLink?: string;
  sourceLink?: string;
  isMobile: boolean;
  loading: LoadingState;
  autoFileSize: string | null;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  downloadLink,
  liveLink,
  sourceLink,
  isMobile,
  loading,
  autoFileSize,
}) => {
  if (!downloadLink && (!liveLink || liveLink === '#') && (!sourceLink || sourceLink === '#')) {
    return null;
  }

  const downloadFileInfo = getFileTypeInfo(downloadLink);

  const getDownloadInfo = () => {
    if (!downloadLink) return { url: '', label: 'Download', fileSize: null };
    if (typeof downloadLink === 'string') {
      return { url: downloadLink, label: downloadFileInfo.label, fileSize: autoFileSize };
    }
    let displayLabel = downloadLink.filename || downloadFileInfo.label;
    if (!displayLabel.toLowerCase().startsWith('download')) {
      displayLabel = `${downloadFileInfo.label}: ${displayLabel}`;
    }
    return { url: downloadLink.url, label: displayLabel, fileSize: autoFileSize };
  };

  const downloadInfo = getDownloadInfo();

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Download button */}
      {downloadLink && (
        <a
          href={downloadInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="w-full sm:flex-1 text-center py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600
            hover:from-green-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium
            transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
            border border-green-500/20 hover:border-green-400/40"
        >
          {downloadFileInfo.icon}
          <span>
            {downloadInfo.label}
            {!isMobile && (loading.fileSize ? (
              <span className="text-xs opacity-75 ml-1">(Loading...)</span>
            ) : downloadInfo.fileSize ? (
              <span className="text-xs opacity-75 ml-1">({downloadInfo.fileSize})</span>
            ) : null)}
          </span>
        </a>
      )}

      {/* Live link button */}
      {liveLink && liveLink !== '#' && (() => {
        const linkInfo = getLinkTypeInfo(liveLink);
        return (
          <a
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full sm:flex-1 text-center py-3 px-4 bg-gradient-to-r ${linkInfo.gradientFrom} ${linkInfo.gradientTo}
              ${linkInfo.hoverFrom} ${linkInfo.hoverTo} text-white rounded-xl text-sm font-medium
              transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
              border ${linkInfo.borderColor} ${linkInfo.hoverBorderColor}`}
          >
            {linkInfo.icon}
            {linkInfo.text}
          </a>
        );
      })()}

      {/* Source code button */}
      {sourceLink && sourceLink !== '#' && (
        <a
          href={sourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 text-center py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900
            hover:from-gray-700 hover:to-gray-800 text-white rounded-xl text-sm font-medium
            transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
            border border-gray-600/20 hover:border-gray-500/40"
        >
          Source Code
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </div>
  );
};

export default ActionButtons;
