'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FaExpand, FaCompress, FaPlay, FaVolumeUp } from 'react-icons/fa';

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
 * Interface for media items that can be displayed in the carousel
 */
interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  isMobile?: boolean;
  className?: string;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  media,
  currentIndex,
  onIndexChange,
  isPlaying,
  onPlayingChange,
  className = '',
}) => {
  const videoRef = useRef<ExtendedHTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const currentMedia = media[currentIndex];

  // Handle video play/pause
  const handleVideoToggle = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        onPlayingChange(false);
      } else {
        videoRef.current.play().catch(error => {
          console.warn('Video play failed:', error);
          setVideoError(true);
        });
        onPlayingChange(true);
      }
    }
  }, [isPlaying, onPlayingChange]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const doc = document as ExtendedDocument;

    if (!isFullscreen) {
      // Enter fullscreen
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(
      !!(document.fullscreenElement || 
         (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement || 
         (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement)
    );
  }, []);

  React.useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : media.length - 1);
  }, [currentIndex, media.length, onIndexChange]);

  const goToNext = useCallback(() => {
    onIndexChange(currentIndex < media.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, media.length, onIndexChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case ' ':
        e.preventDefault();
        if (currentMedia.type === 'video') {
          handleVideoToggle();
        }
        break;
      case 'f':
        e.preventDefault();
        if (currentMedia.type === 'video') {
          handleFullscreenToggle();
        }
        break;
    }
  }, [currentMedia.type, goToPrevious, goToNext, handleVideoToggle, handleFullscreenToggle]);

  const renderMediaContent = () => {
    if (!currentMedia) return null;

    switch (currentMedia.type) {
      case 'image':
        return (
          <Image
            src={currentMedia.src}
            alt={currentMedia.alt || 'Project image'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={currentIndex === 0}
            quality={85}
          />
        );

      case 'video':
        return (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={currentMedia.thumbnail}
              onPlay={() => onPlayingChange(true)}
              onPause={() => onPlayingChange(false)}
              onError={() => setVideoError(true)}
              preload="metadata"
              playsInline
            >
              <source src={currentMedia.src} type="video/webm" />
              <source src={currentMedia.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video controls */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-4">
                <button
                  onClick={handleVideoToggle}
                  className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <FaVolumeUp size={20} /> : <FaPlay size={20} />}
                </button>
                <button
                  onClick={handleFullscreenToggle}
                  className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                </button>
              </div>
            </div>

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                  <p className="mb-2">Failed to load video</p>
                  <button
                    onClick={() => {
                      setVideoError(false);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'youtube':
        const videoId = currentMedia.src.includes('youtube.com') 
          ? new URL(currentMedia.src).searchParams.get('v')
          : currentMedia.src;
        
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={currentMedia.alt || 'YouTube video'}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );

      default:
        return null;
    }
  };

  if (media.length === 0) return null;

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Media carousel"
    >
      {/* Main media display */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-900">
        {renderMediaContent()}
      </div>

      {/* Navigation controls - only show if multiple media items */}
      {media.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Previous media"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Next media"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Media indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Media caption */}
      {currentMedia.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <p className="text-white text-sm">{currentMedia.caption}</p>
        </div>
      )}
    </div>
  );
};