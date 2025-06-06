import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import { SiReact, SiUnity, SiGithub, SiJavascript, SiTypescript, SiHtml5, SiCss3, SiNodedotjs, SiApple, SiDocker, SiGooglecloud, SiNextdotjs, SiTailwindcss, SiDotnet, SiBlender, SiAdobephotoshop, SiMysql, SiPhp, SiPython, SiCplusplus, SiUnrealengine, SiGodotengine, SiTensorflow, SiPytorch, SiAndroidstudio, SiVisualstudiocode, SiAudacity } from 'react-icons/si';
import {FaExpand, FaCompress, FaDownload, FaFileArchive, FaFileVideo, FaFileImage, FaFilePdf, FaWindows, FaCode, FaVolumeUp } from 'react-icons/fa';
import hljs from 'highlight.js';

/**
 * Interface for media items that can be displayed in the project card
 * Supports both images and videos
 */
interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

/**
 * Interface for code snippets to be displayed with syntax highlighting
 */
interface CodeSnippet {
  code: string;
  language: string;
  title?: string;
}

/**
 * Interface for structured download link objects
 * Allows providing additional metadata like filename and file size
 */
interface DownloadLinkObject {
  url: string;
  filename: string;
  fileSize?: string;
}

/**
 * Main props interface for the ProjectCard component
 */
interface ProjectCardProps {
  media: MediaItem[];                           // Array of media items (images/videos)
  title: string;                                // Project title
  techStack: string[];                          // Array of technologies used
  coverImage?: string;                          // Optional cover image override
  description?: string;                         // Project description
  downloadLink?: string | DownloadLinkObject;   // Optional download link
  features?: {                                  // Optional features list
    title: string; 
    description: string;
    codeSnippet?: CodeSnippet;                  // Optional code snippet per feature
  }[];
  codeSnippet?: CodeSnippet;                    // Optional main code snippet
  liveLink?: string;                            // Optional demo link
  githubLink?: string;                          // Optional source code link
  onModalStateChange?: (isOpen: boolean) => void; // Callback for modal state changes
}

/**
 * Mapping of technology names to their corresponding React icons
 * Used to display visual indicators for tech stack items
 */
const techIcons: { [key: string]: JSX.Element } = {
  "React": <SiReact className="text-blue-500 text-lg mr-2" />,
  "Unity": <SiUnity className="text-white text-lg mr-2" />,
  "GitHub": <SiGithub className="text-gray-800 text-lg mr-2" />,
  "JavaScript": <SiJavascript className="text-yellow-500 text-lg mr-2" />,
  "TypeScript": <SiTypescript className="text-blue-500 text-lg mr-2" />,
  "HTML5": <SiHtml5 className="text-orange-500 text-lg mr-2" />,
  "CSS3": <SiCss3 className="text-blue-500 text-lg mr-2" />,
  "Node.js": <SiNodedotjs className="text-green-500 text-lg mr-2" />,
  "Docker": <SiDocker className="text-blue-500 text-lg mr-2" />,
  "Google Cloud": <SiGooglecloud className="text-blue-500 text-lg mr-2" />,
  "Next.js": <SiNextdotjs className="text-white text-lg mr-2" />,
  "Tailwind CSS": <SiTailwindcss className="text-blue-500 text-lg mr-2" />,
  "C#": <SiDotnet className="text-purple-500 text-lg mr-2" />,
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
  "Android Studio": <SiAndroidstudio className="text-green-500 text-lg mr-2" />,
  "Apple": <SiApple className="text-gray-800 text-lg mr-2" />,
  "Editor Scripting": <FaCode className="text-purple-400 text-lg mr-2" />,
  "Audio": <FaVolumeUp className="text-green-400 text-lg mr-2" />,
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
 * - Tech stack visualization
 */
const ProjectCard: React.FC<ProjectCardProps> = ({ 
  media = [{ type: 'image', src: "/path/to/wip-image-library/placeholder.jpg", alt: "Project thumbnail" }], 
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
  onModalStateChange
}) => {
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // Media carousel state
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  
  // Video and fullscreen references/state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Determine the thumbnail image with fallback options:
   * 1. Use coverImage if provided
   * 2. Otherwise use first media item's src if available
   * 3. Fall back to placeholder image if neither exists
   */
  const thumbnailImage = coverImage || media[0]?.src || "/path/to/wip-image-library/placeholder.jpg";

  /**
   * Handles closing the modal with animation
   * Pauses any playing video and calls the onModalStateChange callback
   */
  const closeModal = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      onModalStateChange?.(false);
    }, 300);
  };
  
  /**
   * Effect for handling ESC key press and body scroll locking
   * when the modal is open
   */
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      document.addEventListener('keydown', handleEscKey);
      onModalStateChange?.(true);
    }
    
    return () => {
      document.body.style.overflow = 'unset'; // Restore scrolling
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen, onModalStateChange]);

  /**
   * Handler for tech stack icon clicks
   */
  const handleTechIconClick = (tech: string) => {
    console.log(`${tech} icon clicked`);
  };

  /**
   * Navigate to next media item in the carousel
   * Pauses any playing video before changing slide
   */
  const goToNextMedia = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  /**
   * Navigate to previous media item in the carousel
   * Pauses any playing video before changing slide
   */
  const goToPreviousMedia = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  /**
   * Toggles video playback state
   * Updates autoplay setting based on video state
   */
  const handleVideoToggle = () => {
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
  };
  
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
   * Handles both entering and exiting fullscreen mode
   */
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen().then(() => {
            setIsFullscreen(true);
          }).catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if ((videoRef.current as any).webkitRequestFullscreen) { // Safari
          (videoRef.current as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((videoRef.current as any).msRequestFullscreen) { // IE11
          (videoRef.current as any).msRequestFullscreen();
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
        } else if ((document as any).webkitExitFullscreen) { // Safari
          (document as any).webkitExitFullscreen();
          setIsFullscreen(false);
        } else if ((document as any).msExitFullscreen) { // IE11
          (document as any).msExitFullscreen();
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
    if (!isVideo) return null;

    return (
      <div 
        className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        onClick={handleVideoToggle}
      >
        {/* Play/Pause Overlay with fade effect */}
        <div 
          className={`${!isPlaying 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-90 pointer-events-none'} 
            bg-black/50 hover:bg-black/70 p-4 rounded-full 
            transition-all duration-300 ease-in-out group`}
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
        
        {/* Fullscreen button - always visible */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 rounded-full p-2.5
            text-white transition-all duration-200 focus:outline-none opacity-100"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? (
            <FaCompress className="text-white text-lg" />
          ) : (
            <FaExpand className="text-white text-lg" />
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
    setCurrentMediaIndex(index);
    // Reset autoplay timer when manually changing slides
    setAutoplay(true);
  };

  // Get current media item and determine if it's a video
  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';

  // Touch gesture handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance threshold in pixels
  const minSwipeDistance = 50;
  
  /**
   * Handler for touch start event
   * Captures initial touch position and disables autoplay
   */
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setAutoplay(false); // Temporarily disable autoplay during touch interaction
  };
  
  /**
   * Handler for touch move event
   * Tracks finger position during swipe
   */
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
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
   * Effect for handling autoplay carousel functionality
   * Changes slides automatically when conditions are met
   */
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // Only autoplay when modal is open, autoplay is enabled, video is not playing,
    // not in fullscreen, and there are multiple media items
    if (isModalOpen && autoplay && !isPlaying && !isFullscreen && media.length > 1) {
      intervalId = setInterval(() => {
        goToNextMedia();
      }, 5000); // Change slide every 5 seconds
    }
    
    // Cleanup function to clear the interval when dependencies change
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isModalOpen, autoplay, isPlaying, isFullscreen, currentMediaIndex, media.length]);

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
      case 'exe':
        return { 
          type: 'exe', 
          icon: <FaWindows className="text-white mr-1" size={16} />,
          label: 'Download EXE'
        };
      case 'pdf':
        return { 
          type: 'pdf', 
          icon: <FaFilePdf className="text-white mr-1" size={16} />,
          label: 'Download PDF'
        };
      case 'mp4':
      case 'mov':
      case 'avi':
        return { 
          type: 'video', 
          icon: <FaFileVideo className="text-white mr-1" size={16} />,
          label: 'Download Video'
        };
      case 'jpg':
      case 'png':
      case 'gif':
      case 'webp':
        return { 
          type: 'image', 
          icon: <FaFileImage className="text-white mr-1" size={16} />,
          label: 'Download Image'
        };
      default:
        return { 
          type: 'file', 
          icon: <FaDownload className="text-white mr-1" size={16} />,
          label: 'Download'
        };
    }
  };

  /**
   * Helper function to get download URL and label information
   * Handles both string and object download link formats
   */
  const getDownloadInfo = () => {
    if (!downloadLink) return { url: '', label: 'Download' };
    
    if (typeof downloadLink === 'string') {
      return { url: downloadLink, label: downloadFileInfo.label };
    } else {
      // Make sure filename is prefixed with "Download" if not already
      let displayLabel = downloadLink.filename || downloadFileInfo.label;
      
      // Only add "Download" prefix if it doesn't already start with it
      if (!displayLabel.toLowerCase().startsWith('download')) {
        displayLabel = `Download ${displayLabel}`;
      }
      
      return { 
        url: downloadLink.url, 
        label: displayLabel,
        fileSize: downloadLink.fileSize
      };
    }
  };

  // Get file type information and download details for the UI
  const downloadFileInfo = getFileTypeInfo(downloadLink);
  const downloadInfo = getDownloadInfo();

  return (
    <>
      {/* Project Card with mobile-responsive design */}
      <div 
        onClick={() => setIsModalOpen(true)}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        className={`relative z-10 flex flex-col justify-between p-4 sm:p-5 bg-[#111111] border border-[#2a2a2a] rounded-lg transition-all duration-300 hover:border-[#4a4a4a] hover:translate-y-[-4px] overflow-hidden cursor-pointer w-full max-w-[500px] mx-auto h-48 sm:h-56 ${isClicked ? 'scale-95' : ''}`}
      >
        {/* Background thumbnail image with blur effect */}
        <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20">
          <Image 
            src={thumbnailImage} 
            alt={title} 
            fill 
            sizes="(max-width: 768px) 100vw, 400px"
            className="blur-[2px] object-cover" 
          />
        </div>
        
        {/* Card content - title and description */}
        <div className="relative z-10">
          <h3 className="text-white text-xl sm:text-2xl font-medium mb-2 truncate">
            {title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{description.split('.')[0]}.</p>
        </div>
        
        {/* Tech stack tags - limited to first 4 with counter for remaining */}
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-auto">
          {techStack.slice(0, 4).map((tech, index) => (
            <span 
              key={index} 
              className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-xs"
              onClick={() => handleTechIconClick(tech)}
            >
              {techIcons[tech] || null} {tech}
            </span>
          ))}
          {techStack.length > 4 && (
            <span className="px-4 py-2 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-xs">
              +{techStack.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Modal with animation - shown when card is clicked */}
      {(isModalOpen || isClosing) && (
        <div 
          className={`fixed inset-0 z-[1050] flex items-center justify-center bg-black/95 backdrop-blur-sm 
            ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'} 
            transition-opacity duration-300 ease-in-out py-2 sm:py-4`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Close button - fixed position for better UX */}
          <button 
            onClick={closeModal}
            className="fixed top-4 right-4 z-[1060] bg-black/70 hover:bg-black/90 
              rounded-full p-3 w-10 h-10 flex items-center justify-center
              text-gray-300 hover:text-white transition-all duration-200
              shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Modal Content - Responsive layout with scrolling */}
          <div 
            className={`w-full max-w-7xl ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'} 
              transition-transform duration-300 ease-in-out py-6 overflow-y-auto 
              max-h-[90vh] my-auto`}
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 px-4 sm:px-10">
              {/* Left Column - Media carousel and action buttons */}
              <div className="lg:w-2/5 flex flex-col">
                {/* Media Slideshow Container */}
                <div className="relative w-full rounded-xl overflow-hidden border border-[#333333] mb-4">
                  {/* Media Content with touch gesture support */}
                  <div 
                    className="relative aspect-video w-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {isVideo ? (
                      <>
                        <video 
                          ref={videoRef}
                          src={currentMedia.src} 
                          className="w-full h-full object-cover" 
                          controls={false}
                          onEnded={handleVideoEnd}
                        />
                        {renderVideoControls()}
                      </>
                    ) : (
                      <Image 
                        src={currentMedia.src} 
                        alt={currentMedia.alt || title} 
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 800px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Indicators for multiple media items */}
                  {media.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center flex-wrap gap-1 z-20 px-2 max-w-full overflow-hidden">
                      {media.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { 
                            e.stopPropagation();
                            goToMedia(index);
                          }}
                          className={`rounded-full transition-all ${
                            media.length > 8 
                              ? 'w-0.5 h-0.5 gap-0.5' 
                              : media.length > 5 
                                ? 'w-0.5 h-0.5' 
                                : 'w-1 h-1'
                          } ${
                            index === currentMediaIndex 
                              ? 'bg-white scale-125' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to media ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Media counter indicator */}
                  <div className={`absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium z-20
                    ${(isVideo && isPlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    transition-opacity duration-300 ease-in-out`}>
                    {currentMediaIndex + 1}/{media.length}
                  </div>
                </div>
                
                {/* Action buttons - Conditionally rendered based on available links */}
                {(downloadLink || (liveLink && liveLink !== "#") || (sourceLink && sourceLink !== "#")) && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Download button with file type indicator */}
                    {downloadLink && (
                      <a 
                        href={downloadInfo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download
                        className="w-full sm:flex-1 text-center py-3 bg-gradient-to-r from-green-600 to-teal-600 
                          hover:from-green-700 hover:to-teal-700 text-white rounded-md text-sm font-medium 
                          transition-all flex items-center justify-center gap-2"
                      >
                        {downloadFileInfo.icon}
                        <span>
                          {downloadInfo.label}
                          {downloadInfo.fileSize && (
                            <span className="text-xs opacity-75 ml-1">({downloadInfo.fileSize})</span>
                          )}
                        </span>
                      </a>
                    )}
                    
                    {/* Live Demo button - only if valid link provided */}
                    {liveLink && liveLink !== "#" && (
                      <a 
                        href={liveLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 
                          hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-sm font-medium 
                          transition-all flex items-center justify-center gap-2"
                      >
                        Live Demo
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 5L21 12L15 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )}
                    
                    {/* Source Code button - only if valid link provided */}
                    {sourceLink && sourceLink !== "#" && (
                      <a 
                        href={sourceLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 text-center py-3 bg-[#1a1a1a] border border-[#333333] 
                          hover:border-[#555555] text-white rounded-md text-sm font-medium 
                          transition-colors flex items-center justify-center gap-2"
                      >
                        Source Code
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
                
                {/* Tech Stack section - moved from right column */}
                <div className="mt-8 mb-4">
                  <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent">
                    Built with
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                      <span 
                        key={index} 
                        className="px-5 py-3 bg-black border border-[#27272a] rounded-full flex items-center justify-center text-gray-300 text-sm"
                        onClick={() => handleTechIconClick(tech)}
                      >
                        {techIcons[tech] || null} {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Project details and features */}
              <div className="lg:w-3/5 mt-4 lg:mt-0">
                {/* Title and Description */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent leading-tight">
                    {title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-base sm:text-[1rem]">
                    {description}
                  </p>
                </div>
                
                {/* Features section with code snippets support */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                    bg-clip-text text-transparent">
                    Features
                  </h2>
                  <ul className="grid grid-cols-1 gap-6">
                    {features.map((feature, index) => (
                      <li key={index} className="flex flex-col gap-3">
                        <span className="text-purple-500 font-semibold text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 
                          bg-clip-text text-transparent">
                          {feature.title}
                        </span>
                        <span className="text-gray-300 text-sm sm:text-base leading-relaxed">
                          {feature.description}
                        </span>
                        
                        {/* Feature-specific code snippet if available */}
                        {feature.codeSnippet && (
                          <div className="mt-3 w-full">
                            {feature.codeSnippet.title && (
                              <div className="text-sm text-gray-300 mb-2 px-1 font-medium">
                                {feature.codeSnippet.title}
                              </div>
                            )}
                            <div className="relative rounded-md overflow-hidden">
                              <pre className="w-full overflow-x-auto p-5 text-sm sm:text-[14px] leading-relaxed bg-[#1e1e1e] rounded-md border border-[#333] scrollbar-thin scrollbar-thumb-gray-600">
                                <code className={`language-${feature.codeSnippet.language || 'javascript'} font-mono`}>
                                  {feature.codeSnippet.code}
                                </code>
                              </pre>
                              {/* Copy button for code snippet */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(feature.codeSnippet!.code);
                                }}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 p-2 rounded-md text-gray-200 text-xs hover:text-white transition-colors"
                                aria-label="Copy code"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <hr className="border-t border-[#2a2a2a] my-6" />
                
                {/* Main code snippet section if available */}
                {codeSnippet && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 
                      bg-clip-text text-transparent">
                      Code Snippet
                    </h2>
                    <div className="relative rounded-md overflow-hidden">
                      {codeSnippet.title && (
                        <div className="text-sm text-gray-300 mb-2 px-1 font-medium">
                          {codeSnippet.title}
                        </div>
                      )}
                      <pre className="w-full overflow-x-auto p-5 text-sm sm:text-[14px] leading-relaxed bg-[#1e1e1e] rounded-md border border-[#333] scrollbar-thin scrollbar-thumb-gray-600">
                        <code className={`language-${codeSnippet.language || 'javascript'} font-mono`}>
                          {codeSnippet.code}
                        </code>
                      </pre>
                      {/* Copy button for main code snippet */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(codeSnippet.code);
                        }}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 p-2 rounded-md text-gray-200 text-xs hover:text-white transition-colors"
                        aria-label="Copy code"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Visual separator after code snippet */}
                {codeSnippet && <hr className="border-t border-[#2a2a2a] my-6" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard;