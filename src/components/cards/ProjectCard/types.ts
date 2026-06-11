import type { ReactNode } from 'react';

// Extend HTMLVideoElement interface for fullscreen API compatibility
export interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  webkitRequestFullscreen?: () => void;
  msRequestFullscreen?: () => void;
}

// Extend Document interface for fullscreen API compatibility
export interface ExtendedDocument extends Document {
  webkitExitFullscreen?: () => void;
  msExitFullscreen?: () => void;
}

export interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

export interface CodeSnippet {
  code: string;
  language: string;
  title?: string;
  description?: string;
}

export interface DownloadLinkObject {
  url: string;
  filename: string;
  /** @deprecated Auto-detection is always enabled */
  fileSize?: string;
}

export interface FileSizeResponse {
  size: number;
  formattedSize: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'media' | 'fileSize' | 'general';
}

export interface LoadingState {
  media: boolean;
}

export interface ProjectFeature {
  title: string;
  description: string;
  codeSnippet?: CodeSnippet;
  icon?: ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

export interface ProjectCardProps {
  projectId: string;
  media: MediaItem[];
  title: string;
  techStack: string[];
  coverImage?: string;
  description?: string;
  downloadLink?: string | DownloadLinkObject;
  features?: ProjectFeature[];
  codeSnippet?: CodeSnippet;
  liveLink?: string;
  githubLink?: string;
  priority?: 'high' | 'medium' | 'low';
  lazyLoad?: boolean;
}
