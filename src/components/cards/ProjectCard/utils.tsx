import React from 'react';
import {
  FaFileArchive, FaFileVideo, FaFileImage, FaFilePdf,
  FaWindows, FaCode, FaVolumeUp, FaDownload,
} from 'react-icons/fa';
import type { DownloadLinkObject } from './types';

/** Returns true if the URL is a valid YouTube URL */
export const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/.test(url);
};

/** Extracts the YouTube video ID from various URL formats */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

/** Formats raw bytes into a human-readable string */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/** Returns icon and label for a given download link based on file extension */
export const getFileTypeInfo = (downloadLink: string | DownloadLinkObject | undefined) => {
  if (!downloadLink) return { type: 'unknown', icon: null, label: 'Download' };
  const url = typeof downloadLink === 'string' ? downloadLink : downloadLink.url;
  if (!url) return { type: 'unknown', icon: null, label: 'Download' };
  const extension = url.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'zip':
      return { type: 'zip', icon: <FaFileArchive className="text-white mr-1" size={16} />, label: 'Download ZIP' };
    case 'rar':
      return { type: 'rar', icon: <FaFileArchive className="text-white mr-1" size={16} />, label: 'Download RAR' };
    case '7z':
      return { type: '7z', icon: <FaFileArchive className="text-white mr-1" size={16} />, label: 'Download 7Z' };
    case 'tar': case 'gz':
      return { type: 'archive', icon: <FaFileArchive className="text-white mr-1" size={16} />, label: 'Download Archive' };
    case 'exe': case 'msi':
      return { type: 'exe', icon: <FaWindows className="text-white mr-1" size={16} />, label: 'Download Application' };
    case 'dmg': case 'pkg':
      return { type: 'mac', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download for Mac' };
    case 'deb': case 'rpm': case 'appimage':
      return { type: 'linux', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download for Linux' };
    case 'apk':
      return { type: 'android', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download APK' };
    case 'ipa':
      return { type: 'ios', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download for iOS' };
    case 'pdf':
      return { type: 'pdf', icon: <FaFilePdf className="text-white mr-1" size={16} />, label: 'Download PDF' };
    case 'doc': case 'docx':
      return { type: 'document', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download Document' };
    case 'txt': case 'md': case 'readme':
      return { type: 'text', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download Text' };
    case 'mp4': case 'mov': case 'avi': case 'mkv': case 'webm':
      return { type: 'video', icon: <FaFileVideo className="text-white mr-1" size={16} />, label: 'Download Video' };
    case 'mp3': case 'wav': case 'ogg': case 'flac':
      return { type: 'audio', icon: <FaVolumeUp className="text-white mr-1" size={16} />, label: 'Download Audio' };
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': case 'svg': case 'bmp':
      return { type: 'image', icon: <FaFileImage className="text-white mr-1" size={16} />, label: 'Download Image' };
    case 'js': case 'ts': case 'jsx': case 'tsx': case 'py': case 'cpp': case 'c':
    case 'cs': case 'java': case 'php': case 'rb': case 'go': case 'rs':
      return { type: 'code', icon: <FaCode className="text-white mr-1" size={16} />, label: 'Download Source Code' };
    default:
      return { type: 'file', icon: <FaDownload className="text-white mr-1" size={16} />, label: 'Download' };
  }
};

/** Returns styling info for the live-link button based on the URL */
export const getLinkTypeInfo = (url: string) => {
  const defaultArrow = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (!url || url === '#') {
    return {
      text: 'Live Link', gradientFrom: 'from-blue-600', gradientTo: 'to-purple-600',
      hoverFrom: 'hover:from-blue-700', hoverTo: 'hover:to-purple-700',
      borderColor: 'border-blue-500/20', hoverBorderColor: 'hover:border-blue-400/40',
      icon: defaultArrow,
    };
  }

  if (url.includes('itch.io')) {
    return {
      text: 'Itch.io', gradientFrom: 'from-red-600', gradientTo: 'to-pink-600',
      hoverFrom: 'hover:from-red-700', hoverTo: 'hover:to-pink-700',
      borderColor: 'border-red-500/20', hoverBorderColor: 'hover:border-red-400/40',
      icon: (
        <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z" />
        </svg>
      ),
    };
  }

  if (url.includes('steam')) {
    return {
      text: 'Steam', gradientFrom: 'from-blue-700', gradientTo: 'to-blue-900',
      hoverFrom: 'hover:from-blue-800', hoverTo: 'hover:to-blue-950',
      borderColor: 'border-blue-600/20', hoverBorderColor: 'hover:border-blue-500/40',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.5c-5.238 0-9.5 4.262-9.5 9.5 0 1.708.45 3.31 1.238 4.698L12 21.5l8.262-4.802A9.456 9.456 0 0 0 21.5 12c0-5.238-4.262-9.5-9.5-9.5zm-3.5 12c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm7-5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
        </svg>
      ),
    };
  }

  if (url.includes('github.io') || url.includes('netlify') || url.includes('vercel')) {
    return {
      text: 'Demo', gradientFrom: 'from-green-600', gradientTo: 'to-emerald-600',
      hoverFrom: 'hover:from-green-700', hoverTo: 'hover:to-emerald-700',
      borderColor: 'border-green-500/20', hoverBorderColor: 'hover:border-green-400/40',
      icon: defaultArrow,
    };
  }

  return {
    text: 'Live Link', gradientFrom: 'from-blue-600', gradientTo: 'to-purple-600',
    hoverFrom: 'hover:from-blue-700', hoverTo: 'hover:to-purple-700',
    borderColor: 'border-blue-500/20', hoverBorderColor: 'hover:border-blue-400/40',
    icon: defaultArrow,
  };
};
