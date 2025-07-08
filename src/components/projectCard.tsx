import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiReact, SiUnity, SiGithub, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiNodedotjs, SiApple, SiDocker, SiGooglecloud, SiNextdotjs, SiTailwindcss, SiBlender, SiAdobephotoshop, SiMysql, SiPhp, SiPython, SiCplusplus, SiUnrealengine, SiGodotengine, SiTensorflow, SiPytorch, SiAndroidstudio, SiVercel, SiDotnet, SiEslint, SiFramer } from 'react-icons/si';
import { FaExpand, FaCompress, FaDownload, FaFileArchive, FaFileVideo, FaFileImage, FaFilePdf, FaWindows, FaCode, FaVolumeUp, FaRobot, FaPalette, FaGamepad, FaBrain, FaMusic, FaNetworkWired, FaImage, FaPaintBrush, FaDesktop, FaLayerGroup, FaCogs, FaMicrochip, FaComments, FaPlay, FaFont, FaMicrophone, FaGitAlt, FaTachometerAlt, FaMobile } from 'react-icons/fa';
import hljs from 'highlight.js';

// Extend HTMLVideoElement interface for fullscreen API compatibility
interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  webkitRequestFullscreen?: () => void;
  msRequestFullscreen?: () => void;
}

// Extend Document interface for fullscreen API compatibility
interface ExtendedDocument extends Document {
  webkitExitFullscreen?: () => void;
  msExitFullscreen?: () => void;
}

/**
 * Interface for media items that can be displayed in the project card
 * Supports both images and videos with enhanced metadata
 */
interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  src: string;
  alt?: string;
  thumbnail?: string; // Optional thumbnail for videos
  caption?: string;   // Optional caption for accessibility
}

/**
 * Interface for code snippets to be displayed with syntax highlighting
 */
interface CodeSnippet {
  code: string;
  language: string;
  title?: string;
  description?: string; // Optional description for the code snippet
}

/**
 * Interface for structured download link objects
 * Allows providing additional metadata like filename
 * File size is now always automatically detected
 */
interface DownloadLinkObject {
  url: string;
  filename: string;
  // fileSize is no longer used - auto-detection is always enabled
  fileSize?: string; // Kept for backward compatibility but no longer used
}

/**
 * Interface for file size response
 */
interface FileSizeResponse {
  size: number;
  formattedSize: string;
}

/**
 * Interface for error state
 */
interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'media' | 'fileSize' | 'general';
}

/**
 * Interface for loading states
 */
interface LoadingState {
  media: boolean;
  fileSize: boolean;
  modal: boolean;
}

/**
 * Enhanced feature interface with better type safety
 */
interface ProjectFeature {
  title: string;
  description: string;
  codeSnippet?: CodeSnippet;
  icon?: React.ReactNode; // Optional feature icon
  priority?: 'high' | 'medium' | 'low'; // Feature importance
}

/**
 * Main props interface for the ProjectCard component
 */
interface ProjectCardProps {
  projectId: string;                            // Unique identifier for URL routing
  media: MediaItem[];                           // Array of media items (images/videos)
  title: string;                                // Project title
  techStack: string[];                          // Array of technologies used
  coverImage?: string;                          // Optional cover image override
  description?: string;                         // Project description
  downloadLink?: string | DownloadLinkObject;   // Optional download link
  features?: ProjectFeature[];                  // Enhanced features list with better typing
  codeSnippet?: CodeSnippet;                    // Optional main code snippet
  liveLink?: string;                            // Optional demo link
  githubLink?: string;                          // Optional source code link
  onModalStateChange?: (isOpen: boolean) => void; // Callback for modal state changes
  priority?: 'high' | 'medium' | 'low';        // Project priority for performance optimization
  lazyLoad?: boolean;                           // Enable lazy loading for media
}

/**
 * Mapping of technology names to their corresponding React icons
 * Used to display visual indicators for tech stack items
 */
const techIcons: { [key: string]: React.JSX.Element } = {
  "React": <SiReact className="text-blue-500 text-lg mr-2" />,
  "Unity": <SiUnity className="text-white text-lg mr-2" />,
  "GitHub": <SiGithub className="text-gray-800 text-lg mr-2" />,
  "JavaScript": <SiJavascript className="text-yellow-500 text-lg mr-2" />,
  "TypeScript": <SiTypescript className="text-blue-500 text-lg mr-2" />,
  "HTML5": <SiHtml5 className="text-orange-500 text-lg mr-2" />,
  "CSS3": <SiCss3 className="text-blue-500 text-lg mr-2" />,
  "Node.js": <SiNodedotjs className="text-green-500 text-lg mr-2" />,
  "Docker": <SiDocker className="text-blue-500 text-lg mr-2" />,
  "Google Cloud": <SiGooglecloud className="text-blue-500 text-lg mr-2" />,  "Next.js": <SiNextdotjs className="text-white text-lg mr-2" />,
  "Tailwind CSS": <SiTailwindcss className="text-blue-500 text-lg mr-2" />,
  "C#": <SiDotnet className="text-purple-600 text-lg mr-2" />,
  "Blender": <SiBlender className="text-orange-600 text-lg mr-2" />,
  "Photoshop": <SiAdobephotoshop className="text-blue-500 text-lg mr-2" />,
  "MySQL": <SiMysql className="text-blue-500 text-lg mr-2" />,
  "PHP": <SiPhp className="text-purple-500 text-lg mr-2" />,
  "Python": <SiPython className="text-yellow-500 text-lg mr-2" />,
  "C++": <SiCplusplus className="text-blue-500 text-lg mr-2" />,
  "Unreal Engine": <SiUnrealengine className="text-black text-lg mr-2" />,
  "Godot": <SiGodotengine className="text-blue-500 text-lg mr-2" />,
  "TensorFlow": <SiTensorflow className="text-orange-500 text-lg mr-2" />,
  "PyTorch": <SiPytorch className="text-orange-500 text-lg mr-2" />,
  "Pytorch": <SiPytorch className="text-orange-500 text-lg mr-2" />,
  "ML-Agents": <FaRobot className="text-pink-400 text-lg mr-2" />,
  "Android Studio": <SiAndroidstudio className="text-green-500 text-lg mr-2" />,
  "Apple": <SiApple className="text-gray-800 text-lg mr-2" />,
  "Editor Scripting": <FaCode className="text-purple-400 text-lg mr-2" />,  "Audio": <FaVolumeUp className="text-green-400 text-lg mr-2" />,
  // Additional commonly used technologies
  "Windows": <FaWindows className="text-blue-500 text-lg mr-2" />,
  "C": <SiCplusplus className="text-blue-600 text-lg mr-2" />,
  "Java": <SiJavascript className="text-red-500 text-lg mr-2" />,
  "Game Development": <FaRobot className="text-green-500 text-lg mr-2" />,
  "3D Modeling": <SiBlender className="text-orange-500 text-lg mr-2" />,
  "UI/UX": <FaCode className="text-purple-500 text-lg mr-2" />,
  "Web Development": <SiHtml5 className="text-orange-400 text-lg mr-2" />,
  "Mobile Development": <SiAndroidstudio className="text-green-400 text-lg mr-2" />,
  "Machine Learning": <SiTensorflow className="text-orange-400 text-lg mr-2" />,
  "AI": <FaRobot className="text-blue-400 text-lg mr-2" />,
  "Database": <SiMysql className="text-blue-600 text-lg mr-2" />,
  "Cloud": <SiGooglecloud className="text-blue-400 text-lg mr-2" />,  // Missing icons from projects page
  "Audio Processing": <FaMusic className="text-purple-400 text-lg mr-2" />,
  "2D Graphics": <FaPalette className="text-pink-400 text-lg mr-2" />,
  "Game Design": <FaGamepad className="text-orange-400 text-lg mr-2" />,
  "Reinforcement Learning": <FaBrain className="text-green-400 text-lg mr-2" />,
  // Newly added missing icons
  "NavMesh AI": <FaNetworkWired className="text-cyan-400 text-lg mr-2" />,
  "Texture Generation": <FaImage className="text-pink-500 text-lg mr-2" />,
  "Unity ML-Agents": <FaRobot className="text-pink-400 text-lg mr-2" />,
  "ONNX": <FaMicrochip className="text-blue-400 text-lg mr-2" />,
  "CUDA": <FaMicrochip className="text-green-500 text-lg mr-2" />,
  "Real-time Drawing": <FaPaintBrush className="text-purple-500 text-lg mr-2" />,
  "UI Systems": <FaDesktop className="text-blue-400 text-lg mr-2" />,
  "Tilemap": <FaLayerGroup className="text-orange-500 text-lg mr-2" />,  "State Machine": <FaCogs className="text-gray-400 text-lg mr-2" />,
  "Vercel": <SiVercel className="text-white text-lg mr-2" />,
  // Website project specific technologies
  "Next.js 14": <SiNextdotjs className="text-white text-lg mr-2" />,
  "React 18": <SiReact className="text-blue-500 text-lg mr-2" />,
  "Framer Motion": <SiFramer className="text-pink-500 text-lg mr-2" />,
  "ESLint": <SiEslint className="text-purple-500 text-lg mr-2" />,
  "Git": <FaGitAlt className="text-orange-500 text-lg mr-2" />,
  "Responsive Design": <FaMobile className="text-blue-400 text-lg mr-2" />,
  "Performance Optimization": <FaTachometerAlt className="text-green-500 text-lg mr-2" />,
  // ML Agent project specific technologies
  "Neural Networks": <FaBrain className="text-purple-400 text-lg mr-2" />,
  // LP-Cafe specific technologies
  "Custom Dialogue Tool": <FaComments className="text-blue-400 text-lg mr-2" />,
  "Audacity": (
    <svg 
      className="text-red-500 text-lg mr-2 w-4 h-4 inline-block" 
      fill="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.145c-2.487 0-4.755.776-6.428 2.08-1.673 1.303-2.76 3.169-2.76 5.244v.75C1.153 11.06 0 13.268 0 15.856c0 3.312 1.884 6 4.312 6V9.468c0-1.554.805-2.984 2.186-4.06C7.879 4.331 9.829 3.643 12 3.643c2.17 0 4.12.688 5.502 1.764 1.38 1.077 2.186 2.507 2.186 4.06v12.387c2.428 0 4.312-2.687 4.312-6 0-2.587-1.152-4.795-2.813-5.636v-.75c0-2.075-1.086-3.94-2.76-5.244-1.672-1.304-3.94-2.08-6.427-2.08zm0 6.153-1.125 8.683L9.75 9.105l-.562 6.75-.376-.75-.375-4.5-.187 4.5-.563 1.313-.374-4.5-.376 3.562-.562-.937v2.625l-.563-2.11v-4.64a1.432 1.432 0 0 0-.937-.375v11.812c.375 0 .75-.187.937-.562v-3.375l.188.187.563 1.875.187-2.25.563 2.813v-3.562l.374.937.563 2.625v-3.562l.375.374.563 3.188.562-4.313 1.24 4.86.072-2.985.375-1.124.376 4.687 1.124-4.687.375 3.937.938-4.125.938 4.5.187-3.375.562-1.125.188 4.313.938-4.125.562 1.875.188-1.688.374.75v3.375c.188.375.563.562.938.562V10.043c-.375 0-.75.188-.938.375v4.813l-.374 1-.188-3.188-.375 2.437-.375-.75-.188-2.625-.937 3.563-.188-.75L15 9.293l-.562 4.875-.376 1.5-.75-5.062-.75 4.312-.375 1.125z"/>
    </svg>
  ),
  "DOTween": <FaPlay className="text-purple-500 text-lg mr-2" />,
  "Text Animator": <FaFont className="text-green-500 text-lg mr-2" />,
  "Voice Acting": <FaMicrophone className="text-pink-500 text-lg mr-2" />
};

/**
 * Custom hook for managing error states
 */
const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({ hasError: false, message: '', type: 'general' });
  
  const handleError = useCallback((message: string, type: ErrorState['type'] = 'general') => {
    setError({ hasError: true, message, type });
    console.error(`ProjectCard Error (${type}):`, message);
  }, []);
  
  const clearError = useCallback(() => {
    setError({ hasError: false, message: '', type: 'general' });
  }, []);
  
  return { error, handleError, clearError };
};

/**
 * Custom hook for managing loading states
 */
const useLoadingState = () => {
  const [loading, setLoading] = useState<LoadingState>({
    media: false,
    fileSize: false,
    modal: false
  });
  
  const setLoadingState = useCallback((key: keyof LoadingState, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);
  
  return { loading, setLoadingState };
};



/**
 * Enhanced intersection observer hook for lazy loading with mobile optimization
 */
const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLDivElement | null>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!elementRef.current) return;

    // Fallback for mobile devices - always visible if window width <= 768px
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};

/**
 * Check if URL is a valid YouTube URL
 * @param url - URL to validate
 * @returns Boolean indicating if URL is a valid YouTube URL
 */
export const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/.test(url);
};

/**
 * ProjectCard Component
 * 
 * A card component that displays project information with an expandable modal view.
 * Features include:
 * - Responsive layout for both card and modal
 * - Image/video carousel with touch gesture support
 * - Video playback controls including fullscreen support
 * - Code snippet display with syntax highlighting
 * - Download button with file type detection
 * - Automatic file size detection for download links (always enabled)
 * - Tech stack visualization
 * - Enhanced error handling and loading states
 * - Performance optimizations with lazy loading
 * - Improved accessibility features
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ 
  projectId,
  media = [{ type: 'image', src: "/gamepad.svg", alt: "Project thumbnail" }], 
  title, 
  techStack,
  coverImage,
  description = "Project description goes here. This is a brief overview of the project and its main features.",
  downloadLink,
  features = [
    { title: "Feature One", description: "Description for feature one" },
    { title: "Feature Two", description: "Description for feature two" },
    { title: "Feature Three", description: "Description for feature three" }
  ],
  liveLink = "#",
  githubLink: sourceLink = "#",
  codeSnippet, 
  onModalStateChange,
  priority = 'medium',
  lazyLoad = true
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Custom hooks for enhanced state management
  const { error, handleError, clearError } = useErrorHandler();
  const { loading, setLoadingState } = useLoadingState();
  
  // Intersection observer for lazy loading with mobile optimization
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { 
    threshold: 0.01, // Lower threshold for better mobile performance
    rootMargin: '100px' // Larger root margin for mobile devices
  });
  
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Media carousel state
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  
  // Mobile device detection
  const [isMobile, setIsMobile] = useState(false);
  
  // File size state
  const [autoFileSize, setAutoFileSize] = useState<string | null>(null);
  
  // Code snippet collapse state - starts closed for all snippets
  const [collapsedCodeSnippets, setCollapsedCodeSnippets] = useState<{ [key: string]: boolean }>({});
  
  // Copy button states
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  
  // Video and fullscreen references/state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State to control object-fit for media
  const [mediaObjectFit] = useState<'cover' | 'contain'>('contain');
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  
  // Image preloading state and refs
  const preloadedImages = useRef<Set<string>>(new Set());
  
  // Video thumbnail generation state
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Map<string, string>>(new Map());
  
  // Progress bar animation reset key - increments when navigation occurs
  const [progressBarKey, setProgressBarKey] = useState(0);
  
  // Ref to track if we're programmatically closing the modal
  const isProgrammaticallyClosing = useRef(false);

  /**
   * Extract YouTube video ID from various YouTube URL formats
   * @param url - YouTube URL in various formats
   * @returns Video ID string or null if not found
   */
  const extractYouTubeVideoId = useCallback((url: string): string | null => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }, []);

  // Mobile device detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Effect for handling YouTube iframe API messages
   * Listens for play/pause events from YouTube videos
   */
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      // Only listen to messages from YouTube
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        // YouTube sends both string and object data
        let data;
        if (typeof event.data === 'string') {
          // Try to parse as JSON first
          if (event.data.startsWith('{')) {
            data = JSON.parse(event.data);
          } else {
            // Handle non-JSON string messages (some YouTube messages are just strings)
            return;
          }
        } else {
          data = event.data;
        }
        
        // YouTube iframe API message formats
        if (data.event === 'video-progress') {
          // This event is sent periodically during playback
          setIsYouTubePlaying(true);
          setAutoplay(false);
          setProgressBarKey(prev => prev + 1); // Reset progress bar when YouTube starts playing
        } else if (data.event === 'onStateChange') {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          const playerState = data.info?.playerState;
          
          if (playerState === 1) {
            // Video is playing
            setIsYouTubePlaying(true);
            setAutoplay(false); // Disable autoplay when YouTube video starts playing
            setProgressBarKey(prev => prev + 1); // Reset progress bar animation
          } else if (playerState === 2) {
            // Video is paused - keep autoplay disabled to give user control
            setIsYouTubePlaying(false);
            setAutoplay(false);
          } else if (playerState === 0) {
            // Video ended - re-enable autoplay to continue carousel
            setIsYouTubePlaying(false);
            setAutoplay(true);
            setProgressBarKey(prev => prev + 1); // Reset progress bar for next slide
          } else if (playerState === 3) {
            // Video is buffering - treat as playing to prevent autoplay
            setIsYouTubePlaying(true);
            setAutoplay(false);
          } else if (playerState === -1 || playerState === 5) {
            // Video unstarted or cued - enable autoplay for potential auto-advance
            setIsYouTubePlaying(false);
            setAutoplay(true);
          }
        } else if (data.event === 'onReady') {
          // Player is ready - ensure autoplay is enabled for potential auto-advance
          setIsYouTubePlaying(false);
          setAutoplay(true);
        }
      } catch {
        // Ignore parsing errors from non-JSON messages
      }
    };

    // Add the message listener
    window.addEventListener('message', handleYouTubeMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, []);

  /**
   * Generate thumbnail from video file using Canvas API
   * @param videoSrc - Source URL of the video
   * @param timeInSeconds - Time position to capture (default: 1 second)
   * @returns Promise<string> - Data URL of the generated thumbnail
   */
  /**
   * Utility function to detect iOS/Safari
   */
  const isIOSorSafari = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    
    return isIOS || isSafari;
  }, []);

  /**
   * Enhanced video thumbnail generation with iOS/Safari support
   */
  const generateVideoThumbnail = useCallback(async (
    videoSrc: string, 
    timeInSeconds: number = 1
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if we already have a generated thumbnail
      const existingThumbnail = generatedThumbnails.get(videoSrc);
      if (existingThumbnail) {
        resolve(existingThumbnail);
        return;
      }

      // Special handling for iOS/Safari
      const isIOSSafari = isIOSorSafari();
      
      // For iOS/Safari, check if video format is supported
      if (isIOSSafari && videoSrc.includes('.webm')) {
        console.warn('WebM format may not be supported on iOS/Safari, skipping thumbnail generation');
        reject(new Error('WebM format not supported on iOS/Safari'));
        return;
      }

      // Create video element for thumbnail generation
      const video = document.createElement('video');
      
      // iOS-specific attributes
      if (isIOSSafari) {
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'false'); // Disable autoplay on iOS
        video.preload = 'metadata'; // Only load metadata initially
      } else {
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Timeout to prevent hanging
      const timeout = setTimeout(() => {
        video.remove();
        reject(new Error('Video thumbnail generation timeout'));
      }, 10000); // 10 second timeout

      video.onloadedmetadata = () => {
        // Set canvas dimensions to maintain aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        const thumbnailWidth = 320; // Standard thumbnail width
        const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);
        
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        
        // Seek to the specified time (or 1 second by default)
        const seekTime = Math.min(timeInSeconds, video.duration - 0.1);
        
        if (isIOSSafari) {
          // On iOS, we may need to trigger play first, then pause and seek
          video.play()
            .then(() => {
              video.pause();
              video.currentTime = seekTime;
            })
            .catch(() => {
              // If play fails, try direct seeking
              video.currentTime = seekTime;
            });
        } else {
          video.currentTime = seekTime;
        }
      };

      video.onseeked = () => {
        try {
          clearTimeout(timeout);
          
          // Additional check for iOS Canvas security
          if (isIOSSafari) {
            // Try to draw a test pixel first
            try {
              ctx.drawImage(video, 0, 0, 1, 1);
              ctx.getImageData(0, 0, 1, 1);
            } catch (securityError) {
              console.warn('Canvas security error on iOS/Safari:', securityError);
              video.remove();
              reject(new Error('Canvas security restriction on iOS/Safari'));
              return;
            }
          }
          
          // Draw the video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL (JPEG for smaller file size and better iOS support)
          let thumbnailDataUrl: string;
          try {
            thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          } catch (canvasError) {
            console.warn('Canvas toDataURL error:', canvasError);
            // Fallback to PNG if JPEG fails
            thumbnailDataUrl = canvas.toDataURL('image/png');
          }
          
          // Cache the generated thumbnail
          setGeneratedThumbnails(prev => new Map(prev).set(videoSrc, thumbnailDataUrl));
          
          // Clean up
          video.remove();
          
          resolve(thumbnailDataUrl);
        } catch (error) {
          clearTimeout(timeout);
          console.error('Error generating video thumbnail:', error);
          video.remove();
          reject(error);
        }
      };

      video.onerror = (error) => {
        clearTimeout(timeout);
        console.error('Video loading error:', error);
        video.remove();
        reject(new Error(`Failed to load video: ${videoSrc}`));
      };

      video.onloadstart = () => {
        console.log(`Starting to load video for thumbnail: ${videoSrc}`);
      };

      // Enhanced error handling for unsupported formats
      video.oncanplay = () => {
        console.log(`Video can play: ${videoSrc}`);
      };

      video.oncanplaythrough = () => {
        console.log(`Video can play through: ${videoSrc}`);
      };

      // Start loading the video
      video.src = videoSrc;
      video.load();
    });
  }, [generatedThumbnails, isIOSorSafari]);

  /**
   * Get alternative video source for iOS/Safari (e.g., MP4 instead of WebM)
   */
  const getCompatibleVideoSource = useCallback((videoSrc: string): string => {
    // If we're on iOS/Safari and the video is WebM, try to find an MP4 alternative
    if (isIOSorSafari() && videoSrc.includes('.webm')) {
      // Try to find an MP4 version by replacing .webm with .mp4
      const mp4Source = videoSrc.replace('.webm', '.mp4');
      
      // In a real implementation, you might want to check if the MP4 file exists
      // For now, we'll return the original source and let the error handling take over
      console.log(`iOS/Safari detected with WebM video. MP4 alternative would be: ${mp4Source}`);
      
      // You could implement a file existence check here if needed
      // For now, return original source and let fallback handling work
    }
    
    return videoSrc;
  }, [isIOSorSafari]);

  /**
   * Enhanced video format detection
   */
  const isVideoFormatSupported = useCallback((videoSrc: string): boolean => {
    if (typeof window === 'undefined') return true;
    
    const video = document.createElement('video');
    const extension = videoSrc.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'mp4':
        return video.canPlayType('video/mp4') !== '';
      case 'webm':
        return video.canPlayType('video/webm') !== '';
      case 'mov':
        return video.canPlayType('video/quicktime') !== '';
      case 'avi':
        return video.canPlayType('video/x-msvideo') !== '';
      default:
        return true; // Assume supported if unknown
    }
  }, []);

  /**
   * Fallback thumbnail generation for iOS/Safari using video poster attribute
   */
  const generateFallbackThumbnail = useCallback(async (videoSrc: string): Promise<string | null> => {
    try {
      // For iOS/Safari, try to extract a frame using a different approach
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          video.remove();
          resolve(null);
        }, 5000);
        
        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          
          // Try to create a poster/thumbnail from the first frame
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement('canvas');
            const aspectRatio = video.videoWidth / video.videoHeight;
            canvas.width = 320;
            canvas.height = Math.round(320 / aspectRatio);
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              try {
                // For iOS, we'll try to draw at time 0
                video.currentTime = 0;
                
                const drawFrame = () => {
                  try {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    video.remove();
                    resolve(dataUrl);
                  } catch (error) {
                    console.warn('Fallback thumbnail generation failed:', error);
                    video.remove();
                    resolve(null);
                  }
                };
                
                if (video.readyState >= 2) {
                  drawFrame();
                } else {
                  video.onseeked = drawFrame;
                  video.oncanplay = drawFrame;
                }
              } catch (error) {
                console.warn('Canvas fallback failed:', error);
                video.remove();
                resolve(null);
              }
            } else {
              video.remove();
              resolve(null);
            }
          } else {
            video.remove();
            resolve(null);
          }
        };
        
        video.onerror = () => {
          clearTimeout(timeout);
          video.remove();
          resolve(null);
        };
        
        video.load();
      });
    } catch (error) {
      console.warn('Fallback thumbnail generation error:', error);
      return null;
    }
  }, []);

  /**
   * Enhanced thumbnail resolution with iOS/Safari fallbacks
   */
  const enhancedThumbnailResolution = useCallback(async (videoSrc: string): Promise<string | null> => {
    // Check if the video format is supported on this platform
    if (!isVideoFormatSupported(videoSrc)) {
      console.warn(`Video format not supported on this platform: ${videoSrc}`);
      return null;
    }
    
    // Get compatible video source for iOS/Safari
    const compatibleVideoSrc = getCompatibleVideoSource(videoSrc);
    
    // First, try to generate a high-quality thumbnail
    try {
      const highQualityThumbnail = await generateVideoThumbnail(compatibleVideoSrc, 2);
      if (highQualityThumbnail) return highQualityThumbnail;
    } catch (error) {
      console.warn('High-quality thumbnail generation failed, falling back:', error);
    }
    
    // If high-quality generation fails, fall back to low-quality
    try {
      const lowQualityThumbnail = await generateVideoThumbnail(compatibleVideoSrc, 1);
      if (lowQualityThumbnail) return lowQualityThumbnail;
    } catch (error) {
      console.warn('Low-quality thumbnail generation failed:', error);
    }
    
    // As a last resort, use the fallback method for iOS/Safari
    return await generateFallbackThumbnail(compatibleVideoSrc);
  }, [generateVideoThumbnail, generateFallbackThumbnail, getCompatibleVideoSource, isVideoFormatSupported]);

  /**
   * Memoized values for performance with enhanced video thumbnail support
   */
  const thumbnailImage = useMemo(() => {
    if (coverImage) return coverImage;
    
    const firstMedia = media[0];
    if (!firstMedia) return "/gamepad.svg";
    
    // For YouTube videos, use the standard YouTube thumbnail URL
    if (firstMedia.type === 'youtube') {
      const videoId = extractYouTubeVideoId(firstMedia.src);
      if (videoId) {
        // Use maxresdefault.jpg if available, fallback to hqdefault.jpg
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return "/gamepad.svg";
    }
    
    // For videos, check multiple sources for thumbnails
    if (firstMedia.type === 'video') {
      // First, check if thumbnail is explicitly provided
      if (firstMedia.thumbnail) {
        return firstMedia.thumbnail;
      }
      
      // Check if we have a generated thumbnail cached
      const generatedThumbnail = generatedThumbnails.get(firstMedia.src);
      if (generatedThumbnail) {
        return generatedThumbnail;
      }
      
      // Try to find a related image file as thumbnail
      const relatedImage = media.find(item => item.type === 'image');
      if (relatedImage) {
        return relatedImage.src;
      }
      
      // For videos without thumbnails, we'll generate one when the component loads
      // For now, return gamepad icon as placeholder
      return "/gamepad.svg";
    }
    
    // For images, use the image source directly
    return firstMedia.src;
  }, [coverImage, media, generatedThumbnails, extractYouTubeVideoId]);

  const shouldLoadMedia = useMemo(() => {
    // Always load media on mobile devices or when modal is open
    return !lazyLoad || isVisible || isModalOpen || isMobile;
  }, [lazyLoad, isVisible, isModalOpen, isMobile]);

  /**
   * Effect to automatically generate thumbnails for videos without thumbnails
   * This runs when the component becomes visible and improves user experience
   */
  useEffect(() => {
    if (!shouldLoadMedia) return;

    const generateMissingThumbnails = async () => {
      const videosNeedingThumbnails = media.filter(item => 
        item.type === 'video' && 
        !item.thumbnail && 
        !generatedThumbnails.has(item.src)
      );

      if (videosNeedingThumbnails.length === 0) return;

      setLoadingState('media', true);
      
      try {
        // Generate thumbnails for all videos that need them using enhanced resolution
        const thumbnailPromises = videosNeedingThumbnails.map(async (videoItem) => {
          try {
            const thumbnail = await enhancedThumbnailResolution(videoItem.src);
            return thumbnail ? { src: videoItem.src, thumbnail } : null;
          } catch (error) {
            console.warn(`Failed to generate thumbnail for ${videoItem.src}:`, error);
            return null;
          }
        });

        const results = await Promise.allSettled(thumbnailPromises);
        
        // Update state with successful thumbnail generations
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            setGeneratedThumbnails(prev => 
              new Map(prev).set(result.value!.src, result.value!.thumbnail)
            );
          }
        });

        clearError(); // Clear any previous thumbnail generation errors
      } catch (error) {
        console.error('Error in batch thumbnail generation:', error);
        handleError('Failed to generate video thumbnails', 'media');
      } finally {
        setLoadingState('media', false);
      }
    };

    // Delay thumbnail generation slightly to avoid blocking initial render
    const timeoutId = setTimeout(generateMissingThumbnails, 500);
    
    return () => clearTimeout(timeoutId);
  }, [shouldLoadMedia, media, generatedThumbnails, enhancedThumbnailResolution, setLoadingState, handleError, clearError]);

  /**
   * Preload all images in the media array for smoother carousel experience
   * Enhanced with error handling and loading states
   */
  const preloadImages = useCallback(() => {
    if (!shouldLoadMedia) return;
    
    setLoadingState('media', true);
    
    const imageUrls = media
      .filter(item => item.type === 'image')
      .map(item => item.src)
      .filter(src => !preloadedImages.current.has(src));

    if (imageUrls.length === 0) {
      setLoadingState('media', false);
      return;
    }

    let loadedCount = 0;
    let hasErrors = false;

    imageUrls.forEach(src => {
      const img = document.createElement('img');
      
      img.onload = () => {
        preloadedImages.current.add(src);
        loadedCount++;
        
        if (loadedCount === imageUrls.length) {
          setLoadingState('media', false);
          if (hasErrors) {
            clearError(); // Clear any previous errors if some images loaded
          }
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        hasErrors = true;
        handleError(`Failed to preload image: ${src}`, 'media');
        
        if (loadedCount === imageUrls.length) {
          setLoadingState('media', false);
        }
      };
      
      img.src = src;
    });
  }, [media, shouldLoadMedia, setLoadingState, handleError, clearError]);

  /**
   * Opens the modal and updates the URL with the project ID
   * Also initializes all code snippets to be collapsed
   */
  const openModal = useCallback(() => {
    setIsModalOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    router.replace(url.pathname + url.search);
    onModalStateChange?.(true);
      // Initialize feature code snippets as collapsed, main snippet as open
    const initialCollapsedState: { [key: string]: boolean } = {};
    features.forEach((feature, index) => {
      if (feature.codeSnippet) {
        initialCollapsedState[`feature-${index}`] = true;
      }
    });
    if (codeSnippet) {
      initialCollapsedState['main'] = false; // Main snippet starts open
    }
    setCollapsedCodeSnippets(initialCollapsedState);    // Preload images for smoother carousel experience
    preloadImages();
  }, [projectId, router, onModalStateChange, features, codeSnippet, preloadImages]);

  /**
   * Handles closing the modal with animation and removes project from URL
   * Pauses any playing video and calls the onModalStateChange callback
   */
  const closeModal = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsYouTubePlaying(false); // Reset YouTube playing state when closing modal
    setIsClosing(true);
    
    // Set flag to indicate we're programmatically closing
    isProgrammaticallyClosing.current = true;
    
    // Call onModalStateChange immediately to show navbar/footer
    onModalStateChange?.(false);
    
    // Immediately remove the URL parameter to prevent reopening
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    router.replace(url.pathname + url.search);
    
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      
      // Reset the flag after closing is complete
      setTimeout(() => {
        isProgrammaticallyClosing.current = false;
      }, 100);
    }, 300);
  }, [onModalStateChange, router]);

  /**
   * Effect to check URL parameters on component mount and handle direct links
   * Added flag to track if we're currently in a close operation
   */  
  useEffect(() => {
    const currentProject = searchParams?.get('project');
    
    // Only open modal if:
    // 1. URL parameter matches this project
    // 2. Modal is not already open
    // 3. We're not in the middle of closing
    // 4. We're not programmatically closing
    if (currentProject === projectId && !isModalOpen && !isClosing && !isProgrammaticallyClosing.current) {
      // Small delay to ensure any previous close operations have completed
      const timeoutId = setTimeout(() => {
        setIsModalOpen(true);
        onModalStateChange?.(true);
        
        // Preload images for smoother carousel experience
        preloadImages();
        
        // Initialize feature code snippets as collapsed, main snippet as open when opening via URL
        const initialCollapsedState: { [key: string]: boolean } = {};
        features.forEach((feature, index) => {
          if (feature.codeSnippet) {
            initialCollapsedState[`feature-${index}`] = true;
          }
        });
        if (codeSnippet) {
          initialCollapsedState['main'] = false; // Main snippet starts open
        }
        setCollapsedCodeSnippets(initialCollapsedState);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchParams, projectId, isModalOpen, isClosing, onModalStateChange, features, codeSnippet, preloadImages]);
  
  /**
   * Handler for tech stack icon clicks
   */
  const handleTechIconClick = (e: React.MouseEvent, tech: string) => {
    e.stopPropagation();
    console.log(`${tech} icon clicked`);
    openModal();
  };

  /**
   * Toggle code snippet collapse state
   */
  const toggleCodeSnippet = (snippetId: string) => {
    setCollapsedCodeSnippets(prev => ({
      ...prev,
      [snippetId]: !prev[snippetId]
    }));
  };
  /**
   * Navigate to next media item in the carousel
   * Pauses any playing video before changing slide
   */
  const goToNextMedia = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsYouTubePlaying(false); // Reset YouTube playing state when changing slides
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
    setProgressBarKey(prev => prev + 1); // Reset progress bar animation
  }, [media.length]);

  /**
   * Navigate to previous media item in the carousel
   * Pauses any playing video before changing slide
   */
  const goToPreviousMedia = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsYouTubePlaying(false); // Reset YouTube playing state when changing slides
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
    setProgressBarKey(prev => prev + 1); // Reset progress bar animation
  }, [media.length]);

  /**
   * Toggles video playback state
   * Updates autoplay setting based on video state
   */
  const handleVideoToggle = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setAutoplay(false); // Disable autoplay when video starts playing
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setAutoplay(true); // Re-enable autoplay when video is paused
      }
    }
  }, []);
  
  /**
   * Handler for video end event
   * Resets playing state and enables autoplay
   */
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setAutoplay(true); // Re-enable autoplay when video ends
  };
  
  /**
   * Toggle fullscreen mode with cross-browser compatibility
   * Handles both entering and exiting fullscreen mode for videos and images
   */
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Determine the element to make fullscreen - video element for videos, media container for images
    // For YouTube videos, we'll use the container to go fullscreen (iframe limitations)
    const elementToFullscreen = (isVideo && videoRef.current) ? videoRef.current : mediaContainerRef.current;
    if (!elementToFullscreen) return;
    
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (elementToFullscreen.requestFullscreen) {
          elementToFullscreen.requestFullscreen().then(() => {
            setIsFullscreen(true);
          }).catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if ((elementToFullscreen as ExtendedHTMLVideoElement).webkitRequestFullscreen) { // Safari
          (elementToFullscreen as ExtendedHTMLVideoElement).webkitRequestFullscreen?.();
          setIsFullscreen(true);
        } else if ((elementToFullscreen as ExtendedHTMLVideoElement).msRequestFullscreen) { // IE11
          (elementToFullscreen as ExtendedHTMLVideoElement).msRequestFullscreen?.();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            setIsFullscreen(false);
          }).catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
        } else if ((document as ExtendedDocument).webkitExitFullscreen) { // Safari
          (document as ExtendedDocument).webkitExitFullscreen?.();
          setIsFullscreen(false);
        } else if ((document as ExtendedDocument).msExitFullscreen) { // IE11
          (document as ExtendedDocument).msExitFullscreen?.();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen API error:', err);
    }
  };
  
  /**
   * Effect for monitoring fullscreen state changes
   * Handles browser-initiated fullscreen exits
   */
  useEffect(() => {
    const onFullscreenChange = () => {
      const wasFullscreen = isFullscreen;
      const isNowFullscreen = !!document.fullscreenElement;
      
      setIsFullscreen(isNowFullscreen);
      
      // If exiting fullscreen and the video was playing, pause it
      if (wasFullscreen && !isNowFullscreen && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        setAutoplay(true); // Re-enable autoplay when exiting fullscreen
      }
    };
    
    // Add event listeners for all browser variants of fullscreen change
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, [isFullscreen]);

  /**
   * Renders video controls overlay for play/pause and fullscreen
   * Only shown for video media types
   */
  const renderVideoControls = () => {
    // Only show native video controls for local videos, not for YouTube videos
    if (!isVideo || isYouTube) return null;

    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Play/Pause Overlay with fade effect - only enable pointer events when visible */}
        <div 
          className={`${!isPlaying 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-90 pointer-events-none'} 
            bg-black/50 hover:bg-black/70 p-4 rounded-full 
            transition-all duration-300 ease-in-out group absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
          onClick={handleVideoToggle}
        >
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white group-hover:scale-110 transition-transform"
          >
            <path 
              d="M8 5V19L19 12L8 5Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      </div>
    );
  };

  /**
   * Renders fullscreen button for videos
   * Positioned outside the main controls overlay to avoid pointer event conflicts
   * Hidden on mobile devices for all videos - let YouTube handle its own interface on mobile
   */
  const renderVideoFullscreenButton = () => {
    // Show fullscreen button for both local videos and YouTube videos on desktop only
    // Hide fullscreen button on mobile for all videos (let YouTube handle its own interface)
    if (!(isVideo || isYouTube)) return null;
    if (isMobile) return null; // Hide fullscreen button on mobile for all videos

    return (
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-3 right-3 z-40 bg-black/60 hover:bg-black/80 rounded-full p-2.5
          text-white transition-all duration-200 focus:outline-none pointer-events-auto
          flex items-center justify-center w-10 h-10"
        aria-label="Toggle fullscreen"
        style={{ pointerEvents: 'auto' }}
      >
        {isFullscreen ? (
          <FaCompress className="text-white text-base" />
        ) : (
          <FaExpand className="text-white text-base" />
        )}
      </button>
    );
  };

  /**
   * Renders fullscreen button for images
   * Shows enlarge button overlay for image media types
   * Hidden on all mobile devices (removed functionality)
   */
  const renderImageControls = () => {
    if (isVideo || isMobile) return null;

    return (
      <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
        {/* Fullscreen button for images */}
        <button
          onClick={toggleFullscreen}
          className="bg-black/60 hover:bg-black/80 rounded-full p-2.5
            text-white transition-all duration-200 focus:outline-none opacity-0 group-hover/carousel:opacity-100 hover:opacity-100 pointer-events-auto
            flex items-center justify-center w-10 h-10"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enlarge image"}
        >
          {isFullscreen ? (
            <FaCompress className="text-white text-base" />
          ) : (
            <FaExpand className="text-white text-base" />
          )}
        </button>
      </div>
    );
  };

  /**
   * Navigate to a specific media index
   * Used by the media indicator dots
   */
  const goToMedia = (index: number) => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsYouTubePlaying(false); // Reset YouTube playing state when changing slides
    setCurrentMediaIndex(index);
    // Reset autoplay timer when manually changing slides
    setAutoplay(true);
    setProgressBarKey(prev => prev + 1); // Reset progress bar animation
  };

  // Get current media item and determine if it's a video
  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const isYouTube = currentMedia?.type === 'youtube';

  // Touch gesture handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance threshold in pixels
  const minSwipeDistance = 50;
  
  /**
   * Handler for touch start event
   * Captures initial touch position and disables autoplay
   */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setAutoplay(false); // Temporarily disable autoplay during touch interaction
  };
  
  /**
   * Handler for touch move event
   * Tracks finger position during swipe
   */
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  /**
   * Handler for touch end event
   * Calculates swipe direction and changes media if threshold is met
   */
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    if (isSwipe && !isPlaying) {
      if (distance > 0) {
        goToNextMedia(); // Swipe left, go to next
      } else {
        goToPreviousMedia(); // Swipe right, go to previous
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setAutoplay(true); // Re-enable autoplay after interaction
  };

  /**
   * Effect to handle YouTube state changes when switching between media items
   * Ensures YouTube playing state is reset when switching away from YouTube videos
   */
  useEffect(() => {
    // If we're not on a YouTube video anymore and YouTube was playing, reset state
    if (currentMedia?.type !== 'youtube') {
      if (isYouTubePlaying) {
        setIsYouTubePlaying(false);
        setAutoplay(true);
        setProgressBarKey(prev => prev + 1); // Reset progress bar when leaving YouTube
      }
    } else {
      // If we switch to a YouTube video, ensure autoplay is enabled initially
      setAutoplay(true);
    }
  }, [currentMediaIndex, currentMedia?.type, isYouTubePlaying]);

  /**
   * Autoplay effect for carousel
   * Automatically advances to the next media item when conditions are met
   * Enhanced with YouTube-specific handling
   */
  useEffect(() => {
    // Don't autoplay if:
    // - Modal is not open
    // - Only one media item
    // - Autoplay is disabled
    // - A regular video is currently playing
    // - User is on mobile (to save battery and data)
    if (!isModalOpen || media.length <= 1 || !autoplay || isPlaying || isMobile) {
      return;
    }

    // For YouTube videos, we need special handling
    if (currentMedia?.type === 'youtube') {
      // If YouTube is playing, don't advance
      if (isYouTubePlaying) {
        return;
      }
      
      // For YouTube videos, give more time for user interaction before auto-advancing
      const youtubeTimer = setTimeout(() => {
        // Only advance if YouTube is still not playing after the timeout
        if (!isYouTubePlaying) {
          goToNextMedia();
        }
      }, 8000); // 8 seconds for YouTube videos to give users time to interact

      return () => {
        clearTimeout(youtubeTimer);
      };
    }

    // For regular images and non-YouTube content
    const autoplayTimer = setTimeout(() => {
      goToNextMedia();
    }, 5000); // 5 seconds between slides

    // Cleanup timer on unmount or when dependencies change
    return () => {
      clearTimeout(autoplayTimer);
    };
  }, [isModalOpen, media.length, autoplay, isPlaying, isYouTubePlaying, isMobile, currentMediaIndex, goToNextMedia, currentMedia?.type]);

  /**
   * Effect for handling keyboard navigation and body scroll locking
   * when the modal is open - enhanced with carousel navigation
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          if (media.length > 1) {
            event.preventDefault();
            goToPreviousMedia();
          }
          break;
        case 'ArrowRight':
          if (media.length > 1) {
            event.preventDefault();
            goToNextMedia();
          }
          break;
        case ' ': // Spacebar
          if (isVideo && videoRef.current) {
            event.preventDefault();
            handleVideoToggle();
          }
          break;
      }
    };
    
    if (isModalOpen && !isClosing) {
      // Store the current overflow to restore later
      const originalOverflow = document.body.style.overflow;
      
      // Only prevent background scrolling if not controlled by page-level no-scroll class
      if (!document.body.classList.contains('no-scroll')) {
        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
      
      document.addEventListener('keydown', handleKeyDown);
      onModalStateChange?.(true);
      
      return () => {
        // Only restore the original state if we modified it
        if (!document.body.classList.contains('no-scroll')) {
          // Restore the original state
          document.body.style.overflow = originalOverflow || '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          
          // Don't restore scroll position - let user stay where they are
        }
        
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, isClosing, onModalStateChange, closeModal, media.length, goToPreviousMedia, goToNextMedia, isVideo, handleVideoToggle]);

  /**
   * Effect to restore body styles when modal starts closing
   * This ensures navbar/footer become visible immediately when closing starts
   */
  useEffect(() => {
    if (isClosing) {
      // Only restore body styles if we're responsible for them (not controlled by page-level no-scroll)
      if (!document.body.classList.contains('no-scroll')) {
        // Restore body styles immediately when closing animation starts
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    }
  }, [isClosing]);

  /**
   * Effect for applying syntax highlighting to code snippets
   * Uses highlight.js to enhance code display
   */
  useEffect(() => {
    if (isModalOpen && ((features && features.some(feature => feature.codeSnippet)) || codeSnippet)) {
      // Use setTimeout to ensure the DOM has updated before highlighting
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 100);
    }
  }, [isModalOpen, features, codeSnippet, currentMediaIndex]);

  /**
   * Helper function to determine file type information from URL
   * Used to display appropriate icons and labels for download buttons
   */
  const getFileTypeInfo = (downloadLink: string | DownloadLinkObject | undefined) => {
    if (!downloadLink) return { type: 'unknown', icon: null, label: 'Download' };
    
    // Extract the URL from the download link (either string or object)
    const url = typeof downloadLink === 'string' ? downloadLink : downloadLink.url;
    
    if (!url) return { type: 'unknown', icon: null, label: 'Download' };
    
    const extension = url.split('.').pop()?.toLowerCase();
    
    // Return appropriate icon and label based on file extension
    switch (extension) {
      case 'zip':
        return { 
          type: 'zip', 
          icon: <FaFileArchive className="text-white mr-1" size={16} />,
          label: 'Download ZIP'
        };
      case 'rar':
        return { 
          type: 'rar', 
          icon: <FaFileArchive className="text-white mr-1" size={16} />,
          label: 'Download RAR'
        };
      case '7z':
        return { 
          type: '7z', 
          icon: <FaFileArchive className="text-white mr-1" size={16} />,
          label: 'Download 7Z'
        };
      case 'tar':
      case 'gz':
      case 'tar.gz':
        return { 
          type: 'archive', 
          icon: <FaFileArchive className="text-white mr-1" size={16} />,
          label: 'Download Archive'
        };
      case 'exe':
      case 'msi':
        return { 
          type: 'exe', 
          icon: <FaWindows className="text-white mr-1" size={16} />,
          label: 'Download Application'
        };
      case 'dmg':
      case 'pkg':
        return { 
          type: 'mac', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download for Mac'
        };
      case 'deb':
      case 'rpm':
      case 'appimage':
        return { 
          type: 'linux', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download for Linux'
        };
      case 'apk':
        return { 
          type: 'android', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download APK'
        };
      case 'ipa':
        return { 
          type: 'ios', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download for iOS'
        };
      case 'pdf':
        return { 
          type: 'pdf', 
          icon: <FaFilePdf className="text-white mr-1" size={16} />,
          label: 'Download PDF'
        };
      case 'doc':
      case 'docx':
        return { 
          type: 'document', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download Document'
        };
      case 'txt':
      case 'md':
      case 'readme':
        return { 
          type: 'text', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download Text'
        };
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return { 
          type: 'video', 
          icon: <FaFileVideo className="text-white mr-1" size={16} />,
          label: 'Download Video'
        };
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return { 
          type: 'audio', 
          icon: <FaVolumeUp className="text-white mr-1" size={16} />,
          label: 'Download Audio'
        };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
      case 'bmp':
        return { 
          type: 'image', 
          icon: <FaFileImage className="text-white mr-1" size={16} />,
          label: 'Download Image'
        };
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'cpp':
      case 'c':
      case 'cs':
      case 'java':
      case 'php':
      case 'rb':
      case 'go':
      case 'rs':
        return { 
          type: 'code', 
          icon: <FaCode className="text-white mr-1" size={16} />,
          label: 'Download Source Code'
        };
      // ...existing case statements...
      default:
        return { 
          type: 'file', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download'
        };
    }
  };
  /**
   * Function to format bytes into human-readable file size
   * @param bytes - The size in bytes
   * @returns Formatted string like "1.23 MB"
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * Function to fetch the file size from a URL
   * @param url - The URL of the file
   * @returns Promise with file size information
   */
  const fetchFileSize = useCallback(async (url: string): Promise<FileSizeResponse> => {
    try {
      // Only attempt to fetch size for files on the same origin
      if (url.startsWith('/') || url.startsWith(window.location.origin)) {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          const size = contentLength ? parseInt(contentLength, 10) : 0;
          return { 
            size, 
            formattedSize: formatFileSize(size) 
          };
        }
      }
      
      // For external URLs or if there was an error, return zero size
      return { size: 0, formattedSize: '' };
    } catch (error) {
      console.error('Error fetching file size:', error);
      return { size: 0, formattedSize: '' };
    }
  }, [formatFileSize]);  /**
   * Helper function to get file size for a download link
   * Enhanced with loading states and error handling
   */  
  const getDownloadFileSize = useCallback(async () => {
    if (!downloadLink) return;
    
    const url = typeof downloadLink === 'string' ? downloadLink : downloadLink.url;
    
    // Don't fetch if the link is external or invalid
    if (!url || !url.startsWith('/')) return;
    
    try {
      setLoadingState('fileSize', true);
      const { formattedSize } = await fetchFileSize(url);
      if (formattedSize) {
        setAutoFileSize(formattedSize);
        clearError(); // Clear any previous errors
      }
    } catch (err) {
      console.error('File size fetch error:', err);
      handleError(`Failed to fetch file size for ${url}`, 'fileSize');
    } finally {
      setLoadingState('fileSize', false);
    }
  }, [downloadLink, fetchFileSize, setLoadingState, handleError, clearError]);

  /**
   * Effect to fetch file size when the component mounts
   * This ensures the file size is available on page load
   */
  useEffect(() => {
    getDownloadFileSize();
  }, [getDownloadFileSize]);
  
  /**
   * Effect to fetch file size when modal is opened
   * This ensures the file size is updated if it wasn't loaded initially
   */
  useEffect(() => {
    if (isModalOpen) {
      getDownloadFileSize();
    }
  }, [isModalOpen, getDownloadFileSize]);

  /**
   * Helper function to get download URL and label information
   * Handles both string and object download link formats
   */
  const getDownloadInfo = () => {
    if (!downloadLink) return { url: '', label: 'Download' };
      if (typeof downloadLink === 'string') {
      return { 
        url: downloadLink, 
        label: downloadFileInfo.label,
        fileSize: autoFileSize // Always use auto-detected file size
      };
    } else {
      // Make sure filename is prefixed with "Download" if not already
      let displayLabel = downloadLink.filename || downloadFileInfo.label;
      
      // Only add "Download" prefix if it doesn't already start with it
      if (!displayLabel.toLowerCase().startsWith('download')) {
        displayLabel = `${downloadFileInfo.label}: ${displayLabel}`;
      }
        return { 
        url: downloadLink.url, 
        label: displayLabel,
        fileSize: autoFileSize
      };
    }  };

  /**
   * Handle copying code to clipboard with notification and press effect
   */
  const handleCopyCode = async (code: string, buttonId: string) => {
    try {
      // Add press effect
      setPressedButton(buttonId);
      setTimeout(() => setPressedButton(null), 150);
        // Copy to clipboard
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Get file type information and download details for the UI
  const downloadFileInfo = getFileTypeInfo(downloadLink);
  const downloadInfo = getDownloadInfo();

  /**
   * Helper function to determine link type and get appropriate styling
   * Returns link text, colors, and icon based on the URL
   */
  const getLinkTypeInfo = (url: string) => {
    if (!url || url === "#") {
      return {
        text: 'Live Link',
        gradientFrom: 'from-blue-600',
        gradientTo: 'to-purple-600',
        hoverFrom: 'hover:from-blue-700',
        hoverTo: 'hover:to-purple-700',
        borderColor: 'border-blue-500/20',
        hoverBorderColor: 'hover:border-blue-400/40',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      };
    }
    
    // Check if it's an itch.io link
    if (url.includes('itch.io')) {
      return {
        text: 'Itch.io',
        gradientFrom: 'from-red-600',
        gradientTo: 'to-pink-600',
        hoverFrom: 'hover:from-red-700',
        hoverTo: 'hover:to-pink-700',
        borderColor: 'border-red-500/20',
        hoverBorderColor: 'hover:border-red-400/40',
        icon: (
          <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M118 95c-16 10-49 47-49 56v16c0 21 19 38 36 38 21 0 38-17 38-37 0 20 17 37 38 37 20 0 36-17 36-37 0 20 18 37 39 37s39-17 39-37c0 20 16 37 36 37 21 0 38-17 38-37 0 20 17 37 38 37 17 0 36-17 36-38v-16c0-9-33-46-49-56a3511 3511 0 00-276 0zm99 101l-7 9a43 43 0 01-68-9l-7 9c-8 8-19 13-31 13l-4-1-2 46v18c0 36-4 118 16 138 30 7 86 10 142 10s112-3 142-10c20-20 16-102 16-138v-18l-2-46-4 1c-12 0-23-5-31-13l-7-9-7 9a43 43 0 01-68-9 43 43 0 01-38 22h-1-1a43 43 0 01-38-22zm-31 40c12 0 23 0 37 15l33-2 33 2c14-15 25-15 37-15 6 0 29 0 45 46l18 63c13 46-4 47-26 47-31-1-49-24-49-47a371 371 0 01-117 0c1 23-17 46-48 47-22 0-39-1-26-47l18-63c16-46 39-46 45-46zm70 36s-33 31-39 42l22-1v19h34v-19l22 1c-6-11-39-42-39-42z"/>
          </svg>
        )
      };
    }
    
    // Check for other common gaming platforms
    if (url.includes('steam')) {
      return {
        text: 'Steam',
        gradientFrom: 'from-blue-700',
        gradientTo: 'to-blue-900',
        hoverFrom: 'hover:from-blue-800',
        hoverTo: 'hover:to-blue-950',
        borderColor: 'border-blue-600/20',
        hoverBorderColor: 'hover:border-blue-500/40',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2.5c-5.238 0-9.5 4.262-9.5 9.5 0 1.708.45 3.31 1.238 4.698L12 21.5l8.262-4.802A9.456 9.456 0 0 0 21.5 12c0-5.238-4.262-9.5-9.5-9.5zm-3.5 12c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm7-5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
          </svg>
        )
      };
    }
    
    if (url.includes('github.io') || url.includes('netlify') || url.includes('vercel')) {
      return {
        text: 'Demo',
        gradientFrom: 'from-green-600',
        gradientTo: 'to-emerald-600',
        hoverFrom: 'hover:from-green-700',
        hoverTo: 'hover:to-emerald-700',
        borderColor: 'border-green-500/20',
        hoverBorderColor: 'hover:border-green-400/40',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      };
    }
    
    // Default styling for general links
    return {
      text: 'Live Link',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-purple-600',
      hoverFrom: 'hover:from-blue-700',
      hoverTo: 'hover:to-purple-700',
      borderColor: 'border-blue-500/20',
      hoverBorderColor: 'hover:border-blue-400/40',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    };
  };

  return (
    <>      
      {/* Project Card with modern gradient design matching the new design system */}
      <div 
        ref={cardRef}
        onClick={openModal}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Open ${title} project details`}
        className={`relative flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-br from-gray-900/60 to-black/80 border border-blue-500/20 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300/40 hover:shadow-blue-500/20 hover:shadow-xl overflow-hidden cursor-pointer w-full max-w-[400px] mx-auto h-56 sm:h-64 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent group/card ${isClicked ? 'scale-95' : ''}`}
      >        {/* Enhanced background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
        {/* Background thumbnail image with enhanced overlay effects */}
        <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
          {shouldLoadMedia ? (
            error.hasError && error.type === 'media' ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-center text-sm">
                  {media[0]?.type === 'video' ? (
                    <>
                      <FaFileVideo className="mx-auto mb-2 text-2xl" />
                      <div>Video Preview</div>
                    </>
                  ) : (
                    <>
                      <div>⚠️</div>
                      <div>Image failed to load</div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Image 
                src={thumbnailImage} 
                alt={title} 
                fill 
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover transition-all duration-300 group-hover/card:scale-105" 
                priority={priority === 'high' || isMobile}
                unoptimized={isMobile} // Disable optimization on mobile to avoid loading issues
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  // On mobile, try to reload the image once before showing error
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.retried && isMobile) {
                    img.dataset.retried = 'true';
                    // Force reload by adding timestamp
                    const originalSrc = thumbnailImage;
                    const separator = originalSrc.includes('?') ? '&' : '?';
                    img.src = `${originalSrc}${separator}retry=${Date.now()}`;
                  } else {
                    handleError('Failed to load thumbnail image', 'media');
                  }
                }}
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
        </div>

        {/* Enhanced gradient overlays for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>

        {/* Card content - title and description with modern styling */}
        <div className="relative z-10">
          <h3 className="text-blue-100 fontbold text-xl sm:text-2xl group-hover/card:text-white transition-colors duration-300 mb-3 truncate drop-shadow-xl">
            {title}
          </h3>
          <p className="text-blue-200/70 group-hover/card:text-blue-100 transition-colors duration-300 text-sm line-clamp-2 mb-4 drop-shadow-lg leading-relaxed">{description.split('.')[0]}.</p>
        </div>
        
        {/* Tech stack tags - modern glass morphism design */}
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-auto max-w-full overflow-hidden">
          {techStack.slice(0, 4).map((tech, index) => (
            <span 
              key={index} 
              className="px-2 py-1.5 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-full flex items-center justify-center text-blue-200 text-xs shadow-md hover:border-blue-300/50 transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer group-hover/card:from-blue-400/30 group-hover/card:to-purple-400/30 group-hover/card:text-blue-100"
              onClick={(e) => {
                e.stopPropagation();
                handleTechIconClick(e, tech);
              }}
              aria-label={`Technology: ${tech}`}
            >
              {techIcons[tech] || null} 
              <span className="ml-1">{tech}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Modal with backdrop blur and enhanced animations */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm transition-all duration-500 ease-out ${
            isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100 animate-fadeIn'
          }`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.5s ease-out forwards'
          }}
        >
          {/* Enhanced Modal Container with modern design and responsive sizing */}
          <div 
            className={`relative w-full max-w-7xl bg-gradient-to-br from-gray-900/95 to-black/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-y-auto transition-all duration-500 ease-out border border-blue-500/30 max-h-[95vh] sm:max-h-[95vh] ${
              isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-slideInUp'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: 'calc(100vh - 1rem)',
              animation: isClosing 
                ? 'slideOutDown 0.3s ease-out forwards' 
                : 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Enhanced Close button with modern styling matching the design system - positioned sticky inside container */}
            <button
              onClick={closeModal}
              className="sticky top-6 sm:top-2 left-full transform -translate-x-6 z-50 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-900/90 text-gray-300 hover:text-white rounded-full p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-xl border border-gray-600/30 hover:border-gray-500/50 group"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-200 group-hover:scale-110">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            </button>
            
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-6 relative z-10">              {/* Left Column - Media carousel and action buttons */}
              <div className="w-full lg:w-1/2 flex flex-col">
                {/* Mobile: Title above carousel */}
                <div className="mb-6 lg:hidden">
                  <div className="bg-gradient-to-br from-gray-900/90 to-black/85 rounded-lg p-4 border border-blue-500/20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg leading-tight">
                      {title}
                    </h2>
                  </div>
                </div>

                {/* Enhanced Media Slideshow Container with modern carousel design */}
                <div className="relative w-full rounded-xl overflow-hidden border border-blue-400/20 shadow-lg mb-4 group/carousel">
                  {/* Media Content with touch gesture support and enhanced loading states */}
                  <div 
                    ref={mediaContainerRef}
                    className="relative aspect-video w-full bg-gradient-to-br from-gray-900/50 to-black/70"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Enhanced loading overlay with pulsing animation */}
                    {loading.media && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/85 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 border-3 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-10 h-10 border-3 border-purple-400/20 border-b-purple-400 rounded-full animate-spin animation-delay-150"></div>
                          </div>
                          <div className="text-blue-200 text-sm font-medium animate-pulse">Loading media...</div>
                        </div>
                      </div>
                    )}

                    {/* Media content with enhanced transitions and animations */}
                    <div className="relative w-full h-full">
                      {isVideo ? (
                        <>
                          <video 
                            ref={videoRef}
                            src={currentMedia.src} 
                            className={`w-full h-full object-${mediaObjectFit} transition-all duration-500 animate-fadeIn cursor-pointer`} 
                            controls={false}
                            onEnded={handleVideoEnd}
                            onError={() => handleError(`Failed to load video: ${currentMedia.src}`, 'media')}
                            onClick={handleVideoToggle}
                            preload={shouldLoadMedia ? 'metadata' : 'none'}
                            key={currentMediaIndex} // Force re-render when media changes
                          />
                          {renderVideoControls()}
                          {renderVideoFullscreenButton()}
                        </>
                      ) : isYouTube ? (
                        <>
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentMedia.src)}?rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&modestbranding=1&showinfo=0&controls=1&autoplay=0&fs=1&iv_load_policy=3&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}&wmode=transparent`}
                            className="w-full h-full transition-all duration-500 animate-fadeIn"
                            title={currentMedia.alt || title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => {
                              setLoadingState('media', false);
                              // Reset YouTube playing state when a new video loads
                              setIsYouTubePlaying(false);
                              setAutoplay(true);
                              setProgressBarKey(prev => prev + 1); // Reset progress bar when YouTube iframe loads
                            }}
                            onError={() => handleError(`Failed to load YouTube video: ${currentMedia.src}`, 'media')}
                            key={currentMediaIndex} // Force re-render when media changes
                          ></iframe>
                          {renderVideoFullscreenButton()}
                        </>
                      ) : (
                        <>
                          <Image 
                            src={currentMedia.src} 
                            alt={currentMedia.alt || title} 
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 800px"
                            className={`object-${mediaObjectFit} transition-all duration-500 animate-fadeIn`}
                            onLoad={() => setLoadingState('media', false)}
                            onError={() => handleError(`Failed to load image: ${currentMedia.src}`, 'media')}
                            key={currentMediaIndex} // Force re-render when media changes
                          />
                          {renderImageControls()}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Navigation Arrows - only show when multiple media items */}
                  {media.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToPreviousMedia();
                        }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 z-30 
                          bg-gradient-to-r from-black/60 to-gray-900/60
                          backdrop-blur-sm rounded-full p-2.5 sm:p-3
                          text-white/80 transition-all duration-300
                          md:opacity-0 md:group-hover/carousel:opacity-100
                          border border-white/10
                          focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                          (isYouTube && isYouTubePlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                        aria-label="Previous image"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToNextMedia();
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 z-30 
                          bg-gradient-to-r from-black/60 to-gray-900/60
                          backdrop-blur-sm rounded-full p-2.5 sm:p-3
                          text-white/80 transition-all duration-300
                          md:opacity-0 md:group-hover/carousel:opacity-100
                          border border-white/10
                          focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                          (isYouTube && isYouTubePlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                        aria-label="Next image"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Indicators for desktop only - hidden on mobile */}
                  {media.length > 1 && (
                    <div className="absolute bottom-1 sm:bottom-3 left-0 right-0 hidden sm:flex justify-center items-center gap-0.5 sm:gap-1.5 z-20 px-1 sm:px-4">
                      <div className="flex items-center gap-0.5 sm:gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-1.5 py-0.5 sm:px-3 sm:py-2 border border-white/5 sm:border-white/10">
                        {media.map((mediaItem, index) => (
                          <button
                            key={index}
                            onClick={(e) => { 
                              e.stopPropagation();
                              goToMedia(index);
                            }}
                            className={`relative rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-blue-400/30 group ${
                              media.length > 12 
                                ? 'w-0.5 h-0.5 sm:w-1.5 sm:h-1.5' 
                                : media.length > 8 
                                  ? 'w-1 h-1 sm:w-2 sm:h-2' 
                                  : 'w-1 h-1 sm:w-2.5 sm:h-2.5'
                            } ${
                              index === currentMediaIndex 
                                ? 'bg-gradient-to-r from-blue-400 to-purple-400 scale-105 sm:scale-125 shadow-sm sm:shadow-lg shadow-blue-400/20 sm:shadow-blue-400/30' 
                                : 'bg-white/30'
                            }`}
                            aria-label={`Go to media ${index + 1}${mediaItem.alt ? `: ${mediaItem.alt}` : ''}`}
                            title={mediaItem.alt || `Media ${index + 1}`}
                          >
                            {/* Active indicator glow effect - reduced on mobile */}
                            {index === currentMediaIndex && (
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-[1px] sm:blur-sm opacity-40 sm:opacity-60 animate-pulse"></div>
                            )}
                            

                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media counter for desktop only - hidden on mobile */}
                  <div className={`absolute top-1 right-1 sm:top-3 sm:right-3 z-20 transition-all duration-300 hidden sm:block ${
                    (isVideo && isPlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}>
                    <div className="bg-gradient-to-r from-black/50 to-gray-900/50 sm:from-black/60 sm:to-gray-900/60 backdrop-blur-sm 
                      px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full border border-white/5 sm:border-white/10 
                      text-white font-medium text-[10px] sm:text-xs
                      shadow-sm sm:shadow-lg">
                      <span className="text-blue-200">{currentMediaIndex + 1}</span>
                      <span className="text-white/60 mx-0.5">/</span>
                      <span className="text-white/80">{media.length}</span>
                    </div>
                  </div>

                  {/* Enhanced Progress bar for autoplay with improved visibility - Hidden on mobile */}
                  {media.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 group-hover/carousel:opacity-80 transition-opacity duration-300 hidden sm:block">
                      {/* Background track with improved visibility */}
                      <div className="h-1.5 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-sm border-t border-white/5">
                        {/* Progress indicator - only animates when autoplay is active */}
                        {autoplay && !isPlaying && !isYouTubePlaying && !isFullscreen && (
                          <div 
                            key={progressBarKey} // Key to force remount and restart animation on navigation
                            className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 shadow-lg relative overflow-hidden transition-all duration-300 group-hover/carousel:animation-play-state-paused"
                            style={{
                              width: '0%',
                              animation: isYouTube ? 'progressBar 8s linear forwards' : 'progressBar 5s linear forwards',
                              boxShadow: '0 0 12px rgba(96, 165, 250, 0.8), 0 0 24px rgba(147, 51, 234, 0.4)'
                            }}
                          >
                            {/* Enhanced shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 via-purple-300/20 to-blue-300/20 blur-sm"></div>
                          </div>
                        )}
                        {/* Static progress indicator when autoplay is paused */}
                        {(!autoplay || isPlaying || isYouTubePlaying || isFullscreen) && (
                          <div className="h-full bg-gradient-to-r from-gray-600/60 to-gray-500/60 w-0 transition-all duration-300"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action buttons with enhanced styling */}
                {(downloadLink || (liveLink && liveLink !== "#") || (sourceLink && sourceLink !== "#")) && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Download button with enhanced styling */}
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
                    
                    {/* Live Link button with enhanced styling */}
                    {liveLink && liveLink !== "#" && (() => {
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
                    
                    {/* Source Code button with enhanced styling */}
                    {sourceLink && sourceLink !== "#" && (
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
                          <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )}                  </div>
                )}                {/* Mobile: Description below carousel and buttons */}
                <div className="mt-6 mb-4 lg:hidden">
                  <div className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 text-white drop-shadow-lg">
                      About
                    </h3>
                    <p className="text-gray-100 leading-relaxed text-base sm:text-[1rem]">
                      {description}
                    </p>
                  </div>
                </div>
                
                {/* Tech Stack section with modern styling */}
                <div className="mt-6 mb-6">
                  <div className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">
                      Built with
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5 max-w-full">
                    {techStack.map((tech, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-full flex items-center justify-center text-blue-200 text-base whitespace-nowrap flex-shrink-0 min-w-0 cursor-pointer hover:border-blue-300/50 transition-all duration-300 shadow-md"
                        onClick={(e) => handleTechIconClick(e, tech)}
                      >
                        {techIcons[tech] || null} 
                        <span className="truncate ml-1.5">{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>                {/* Right Column - Project details and features */}
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
                {/* Title and Description - hidden on mobile since it's shown above carousel */}
                <div className="mb-8 hidden lg:block">
                  <div className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white drop-shadow-lg leading-tight">
                      {title}
                    </h2>
                    <p className="text-gray-100 leading-relaxed text-base sm:text-[1rem]">
                      {description}
                    </p>
                  </div>
                </div>
                
                {/* Features section with code snippets support */}
                <div className="mb-8">
                  <div className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">
                      Features
                    </h2>
                  </div>
                  <ul className="grid grid-cols-1 gap-6">
                    {features.map((feature, index) => (
                      <li key={index} className="flex flex-col gap-3 bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20">
                        <span className="text-blue-200 font-semibold text-sm sm:text-base drop-shadow-lg">
                          {feature.title}
                        </span>
                        <span className="text-gray-100 text-sm sm:text-base leading-relaxed">
                          {feature.description}
                        </span>                          {/* Feature-specific code snippet with modern styling */}
                        {feature.codeSnippet && (
                          <div className="mt-6 w-full">
                            {/* Enhanced collapsible header */}
                            <button
                              onClick={() => toggleCodeSnippet(`feature-${index}`)}
                              className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-400/20 hover:border-blue-300/40 transition-all duration-300 text-left rounded-xl shadow-lg"
                            >
                              <span className="text-sm text-blue-200 font-medium group-hover:text-blue-100 transition-colors">
                                {feature.codeSnippet.title || 'Code Example'}
                              </span>
                              <svg 
                                className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-all duration-300 ${
                                  collapsedCodeSnippets[`feature-${index}`] ? 'rotate-0' : 'rotate-180'
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>                            {/* Enhanced collapsible content */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              collapsedCodeSnippets[`feature-${index}`] ? 'max-h-0' : 'max-h-[72rem]'
                            }`}>
                              <div className="relative overflow-hidden border border-blue-400/20 rounded-xl mt-2 shadow-lg">
                                <div className="max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-800/50">
                                  <pre className="w-full overflow-x-auto p-5 text-sm sm:text-[14px] leading-relaxed bg-gradient-to-br from-gray-900/80 to-black/90">
                                    <code className={`language-${feature.codeSnippet.language || 'javascript'} font-mono text-gray-100`}>
                                      {feature.codeSnippet.code}
                                    </code>
                                  </pre>
                                </div>
                                {/* Enhanced copy button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(feature.codeSnippet!.code, `feature-${index}`);
                                  }}
                                  className={`absolute top-3 right-3 p-2.5 rounded-lg text-xs transition-all duration-200 shadow-lg ${
                                    pressedButton === `feature-${index}` 
                                      ? 'scale-90 bg-blue-500 text-white' 
                                      : 'bg-gray-800/70 text-gray-200 hover:bg-blue-600/80 hover:text-white border border-blue-500/20'
                                  }`}
                                  aria-label="Copy code"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <hr className="border-t border-blue-500/20 my-8" />
                
                {/* Main code snippet section with modern styling */}
                {codeSnippet && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
                      <h2 className="text-xl font-bold text-white drop-shadow-lg">
                        Code Snippet
                      </h2>
                    </div>
                    
                    {/* Enhanced collapsible header */}
                    <button
                      onClick={() => toggleCodeSnippet('main')}
                      className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 hover:from-blue-900/30 hover:to-purple-900/30 border border-blue-400/20 hover:border-blue-300/40 transition-all duration-300 text-left rounded-xl shadow-lg"
                    >
                      <span className="text-sm text-blue-200 font-medium group-hover:text-blue-100 transition-colors">
                        {codeSnippet?.title || 'Main Code Example'}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-all duration-300 ${
                          collapsedCodeSnippets['main'] ? 'rotate-0' : 'rotate-180'
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>                    {/* Enhanced collapsible content */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      collapsedCodeSnippets['main'] ? 'max-h-0' : 'max-h-[72rem]'
                    }`}>
                      <div className="relative overflow-hidden border border-blue-400/20 rounded-xl mt-2 shadow-lg">
                        <div className="max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-800/50">
                          <pre className="w-full overflow-x-auto p-5 text-sm sm:text-[14px] leading-relaxed bg-gradient-to-br from-gray-900/80 to-black/90">
                            <code className={`language-${codeSnippet?.language || 'javascript'} font-mono text-gray-100`}>
                              {codeSnippet?.code}
                            </code>
                          </pre>
                        </div>
                        {/* Enhanced copy button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(codeSnippet.code, 'main-code');
                          }}
                          className={`absolute top-3 right-3 p-2.5 rounded-lg text-xs transition-all duration-200 shadow-lg ${
                            pressedButton === 'main-code' 
                              ? 'scale-90 bg-blue-500 text-white' 
                              : 'bg-gray-800/70 text-gray-200 hover:bg-blue-600/80 hover:text-white border border-blue-500/20'
                          }`}
                          aria-label="Copy code"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Visual separator after code snippet */}
                {codeSnippet && <hr className="border-t border-blue-500/20 my-8" />}
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  );
};

// Add display name for better debugging
ProjectCard.displayName = 'ProjectCard';

// Export the component with memo for performance optimization
export default memo(ProjectCard);