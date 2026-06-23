import React from 'react';
import Image from 'next/image';
import { FaExpand, FaCompress, FaFileVideo } from 'react-icons/fa';
import type { MediaItem, ErrorState } from './types';
import type { ExtendedHTMLVideoElement, ExtendedDocument } from './types';
import { extractYouTubeVideoId } from './utils';

interface MediaCarouselProps {
  media: MediaItem[];
  title: string;
  currentMediaIndex: number;
  isPlaying: boolean;
  isYouTubePlaying: boolean;
  autoplay: boolean;
  progressBarKey: number;
  isFullscreen: boolean;
  isMediaLoading: boolean;
  isMobile: boolean;
  failedMedia: Set<string>;
  onMediaFailed: (src: string) => void;
  shouldLoadMedia: boolean;
  mediaObjectFit: 'cover' | 'contain';
  videoRef: React.RefObject<HTMLVideoElement | null>;
  mediaContainerRef: React.RefObject<HTMLDivElement | null>;
  onVideoToggle: () => void;
  onVideoEnd: () => void;
  onError: (msg: string, type: ErrorState['type']) => void;
  onSetMediaLoading: (value: boolean) => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onNavigateTo: (index: number) => void;
  onSetAutoplay: (value: boolean) => void;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({
  media, title,
  currentMediaIndex, isPlaying, isYouTubePlaying, autoplay, progressBarKey,
  isFullscreen, isMediaLoading, isMobile, failedMedia, onMediaFailed, shouldLoadMedia, mediaObjectFit,
  videoRef, mediaContainerRef,
  onVideoToggle, onVideoEnd, onError, onSetMediaLoading,
  onNavigateNext, onNavigatePrev, onNavigateTo, onSetAutoplay,
}) => {
  // Touch handling state (internal)
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    onSetAutoplay(false);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance && !isPlaying) {
      if (distance > 0) { onNavigateNext(); } else { onNavigatePrev(); }
    }
    setTouchStart(null);
    setTouchEnd(null);
    onSetAutoplay(true);
  };

  // Fullscreen toggle
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isVideo = currentMedia?.type === 'video';
    const elementToFullscreen = (isVideo && videoRef.current) ? videoRef.current : mediaContainerRef.current;
    if (!elementToFullscreen) return;
    try {
      if (!document.fullscreenElement) {
        if (elementToFullscreen.requestFullscreen) {
          elementToFullscreen.requestFullscreen().catch((err: Error) => {
            console.error(`Error entering fullscreen: ${err.message}`);
          });
        } else if ((elementToFullscreen as ExtendedHTMLVideoElement).webkitRequestFullscreen) {
          (elementToFullscreen as ExtendedHTMLVideoElement).webkitRequestFullscreen?.();
        } else if ((elementToFullscreen as ExtendedHTMLVideoElement).msRequestFullscreen) {
          (elementToFullscreen as ExtendedHTMLVideoElement).msRequestFullscreen?.();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err: Error) => {
            console.error(`Error exiting fullscreen: ${err.message}`);
          });
        } else if ((document as ExtendedDocument).webkitExitFullscreen) {
          (document as ExtendedDocument).webkitExitFullscreen?.();
        } else if ((document as ExtendedDocument).msExitFullscreen) {
          (document as ExtendedDocument).msExitFullscreen?.();
        }
      }
    } catch (err) {
      console.error('Fullscreen API error:', err);
    }
  };

  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const isYouTube = currentMedia?.type === 'youtube';

  // ── Video play overlay ──────────────────────────────────────────────────────
  // Plain render helpers (not nested components): nested component definitions
  // remount on every render and trip react-hooks/static-components.
  const renderVideoPlayOverlay = () => {
    if (!isVideo || isYouTube) return null;
    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div
          className={`${!isPlaying
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'}
            bg-black/50 hover:bg-black/70 p-4 rounded-full
            transition-all duration-300 ease-in-out group absolute top-1/2 left-1/2
            transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
          onClick={onVideoToggle}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="text-white group-hover:scale-110 transition-transform">
            <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
          </svg>
        </div>
      </div>
    );
  };

  // ── Fullscreen button ───────────────────────────────────────────────────────
  const renderFullscreenButton = () => {
    if (!(isVideo || isYouTube)) return null;
    if (isMobile) return null;
    return (
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-3 right-3 z-40 bg-black/60 hover:bg-black/80 rounded-full p-2.5
          text-white transition-all duration-200 focus:outline-hidden pointer-events-auto
          flex items-center justify-center w-10 h-10"
        aria-label="Toggle fullscreen"
        style={{ pointerEvents: 'auto' }}
      >
        {isFullscreen ? <FaCompress className="text-white text-base" /> : <FaExpand className="text-white text-base" />}
      </button>
    );
  };

  // ── Image fullscreen button ─────────────────────────────────────────────────
  const renderImageFullscreenButton = () => {
    if (isVideo || isMobile) return null;
    return (
      <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
        <button
          onClick={toggleFullscreen}
          className="bg-black/60 hover:bg-black/80 rounded-full p-2.5
            text-white transition-all duration-200 focus:outline-hidden
            opacity-0 group-hover/carousel:opacity-100 hover:opacity-100 pointer-events-auto
            flex items-center justify-center w-10 h-10"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enlarge image'}
        >
          {isFullscreen ? <FaCompress className="text-white text-base" /> : <FaExpand className="text-white text-base" />}
        </button>
      </div>
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-blue-400/20 shadow-lg mb-4 group/carousel">
      {/* Media container */}
      <div
        ref={mediaContainerRef}
        className="relative aspect-video w-full bg-linear-to-br from-gray-900/50 to-black/70"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading overlay */}
        {isMediaLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-linear-to-br from-gray-900/90 to-black/85 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-0 w-10 h-10 border-3 border-purple-400/20 border-b-purple-400 rounded-full animate-spin animation-delay-150" />
              </div>
              <div className="text-blue-200 text-sm font-medium animate-pulse">Loading media...</div>
            </div>
          </div>
        )}

        {/* Media content */}
        <div className="relative w-full h-full">
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={currentMedia.src}
                className={`w-full h-full object-${mediaObjectFit} transition-all duration-500 animate-fadeIn cursor-pointer`}
                controls={false}
                onEnded={onVideoEnd}
                onError={() => onMediaFailed(currentMedia.src)}
                onClick={onVideoToggle}
                preload={shouldLoadMedia ? 'metadata' : 'none'}
                key={currentMediaIndex}
              />
              {renderVideoPlayOverlay()}
              {renderFullscreenButton()}
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
                onLoad={(e) => {
                  onSetMediaLoading(false);
                  // Subscribe to the YouTube iframe API so it posts back
                  // playback state events. Without this `listening` handshake,
                  // `enablejsapi=1` alone emits nothing and the carousel keeps
                  // auto-advancing while a video plays.
                  e.currentTarget.contentWindow?.postMessage(
                    JSON.stringify({ event: 'listening', id: currentMediaIndex, channel: 'widget' }),
                    'https://www.youtube.com',
                  );
                }}
                onError={() => onError(`Failed to load YouTube video: ${currentMedia.src}`, 'media')}
                key={currentMediaIndex}
              />
              {renderFullscreenButton()}
            </>
          ) : (
            <>
              {failedMedia.has(currentMedia.src) ? (
                <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-gray-400 text-center text-sm">
                    <div>⚠️</div>
                    <div>Image failed to load</div>
                  </div>
                </div>
              ) : (
                <Image
                  src={currentMedia.src}
                  alt={currentMedia.alt || title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className={`object-${mediaObjectFit} transition-all duration-500 animate-fadeIn`}
                  onLoad={() => onSetMediaLoading(false)}
                  onError={() => onMediaFailed(currentMedia.src)}
                  key={currentMediaIndex}
                />
              )}
              {renderImageFullscreenButton()}
            </>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigatePrev(); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-30
              bg-linear-to-r from-black/60 to-gray-900/60
              backdrop-blur-xs rounded-full p-2.5 sm:p-3
              text-white/80 transition-all duration-300
              md:opacity-0 md:group-hover/carousel:opacity-100
              border border-white/10 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 ${
              (isYouTube && isYouTubePlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            aria-label="Previous image"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onNavigateNext(); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-30
              bg-linear-to-r from-black/60 to-gray-900/60
              backdrop-blur-xs rounded-full p-2.5 sm:p-3
              text-white/80 transition-all duration-300
              md:opacity-0 md:group-hover/carousel:opacity-100
              border border-white/10 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 ${
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

      {/* Dot indicators (desktop only) */}
      {media.length > 1 && (
        <div className="absolute bottom-1 sm:bottom-3 left-0 right-0 hidden sm:flex justify-center items-center gap-0.5 sm:gap-1.5 z-20 px-1 sm:px-4">
          <div className="flex items-center gap-0.5 sm:gap-1.5 bg-black/30 backdrop-blur-xs rounded-full px-1.5 py-0.5 sm:px-3 sm:py-2 border border-white/5 sm:border-white/10">
            {media.map((mediaItem, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); onNavigateTo(index); }}
                className={`relative rounded-full transition-all duration-300 focus:outline-hidden focus:ring-1 focus:ring-blue-400/30 ${
                  media.length > 12 ? 'w-0.5 h-0.5 sm:w-1.5 sm:h-1.5'
                  : media.length > 8 ? 'w-1 h-1 sm:w-2 sm:h-2'
                  : 'w-1 h-1 sm:w-2.5 sm:h-2.5'
                } ${
                  index === currentMediaIndex
                    ? 'bg-linear-to-r from-blue-400 to-purple-400 scale-105 sm:scale-125 shadow-xs sm:shadow-lg shadow-blue-400/20 sm:shadow-blue-400/30'
                    : 'bg-white/30'
                }`}
                aria-label={`Go to media ${index + 1}${mediaItem.alt ? `: ${mediaItem.alt}` : ''}`}
                title={mediaItem.alt || `Media ${index + 1}`}
              >
                {index === currentMediaIndex && (
                  <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-400 to-purple-400 blur-[1px] sm:blur-xs opacity-40 sm:opacity-60 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media counter badge (desktop only) */}
      <div className={`absolute top-1 right-1 sm:top-3 sm:right-3 z-20 transition-all duration-300 hidden sm:block ${
        (isVideo && isPlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        <div className="bg-linear-to-r from-black/50 to-gray-900/50 sm:from-black/60 sm:to-gray-900/60 backdrop-blur-xs
          px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full border border-white/5 sm:border-white/10
          text-white font-medium text-[10px] sm:text-xs shadow-xs sm:shadow-lg">
          <span className="text-blue-200">{currentMediaIndex + 1}</span>
          <span className="text-white/60 mx-0.5">/</span>
          <span className="text-white/80">{media.length}</span>
        </div>
      </div>

      {/* Progress bar (desktop only) */}
      {media.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 group-hover/carousel:opacity-80 transition-opacity duration-300 hidden sm:block">
          <div className="h-1.5 bg-linear-to-r from-black/80 to-gray-900/80 backdrop-blur-xs border-t border-white/5">
            {autoplay && !isPlaying && !isYouTubePlaying && !isFullscreen && (
              <div
                key={progressBarKey}
                className="h-full bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 shadow-lg relative overflow-hidden"
                style={{
                  width: '0%',
                  animation: isYouTube ? 'progressBar 8s linear forwards' : 'progressBar 5s linear forwards',
                  boxShadow: '0 0 12px rgba(96, 165, 250, 0.8), 0 0 24px rgba(147, 51, 234, 0.4)',
                }}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                <div className="absolute inset-0 bg-linear-to-r from-blue-300/20 via-purple-300/20 to-blue-300/20 blur-xs" />
              </div>
            )}
            {(!autoplay || isPlaying || isYouTubePlaying || isFullscreen) && (
              <div className="h-full bg-linear-to-r from-gray-600/60 to-gray-500/60 w-0 transition-all duration-300" />
            )}
          </div>
        </div>
      )}

      {/* Error state for video */}
      {currentMedia && failedMedia.has(currentMedia.src) && isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
          <div className="text-gray-400 text-center text-sm">
            <FaFileVideo className="mx-auto mb-2 text-2xl" />
            <div>Video Preview</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
