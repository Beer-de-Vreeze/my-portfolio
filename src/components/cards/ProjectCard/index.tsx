import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import hljs from 'highlight.js';
import { useModal } from '@/context/ModalContext';
import { usePerformance } from '@/hooks/usePerformance';

import type { ProjectCardProps } from './types';
import { useErrorHandler, useLoadingState, useIntersectionObserver } from './hooks';
import { useVideoThumbnail } from './useVideoThumbnail';
import { extractYouTubeVideoId, formatFileSize } from './utils';
import { techIcons } from './techIcons';
import MediaCarousel from './MediaCarousel';
import ActionButtons from './ActionButtons';
import FeaturesList from './FeaturesList';
import CodeBlock from './CodeBlock';
import HoverDemo from './HoverDemo';

/**
 * ProjectCard — card + modal for a single project.
 * Heavy logic is broken across hooks + sub-components; this file owns state & effects.
 */
const ProjectCard: React.FC<ProjectCardProps> = ({
  projectId,
  media = [{ type: 'image', src: '/gamepad.svg', alt: 'Project thumbnail' }],
  title,
  techStack,
  coverImage,
  description = 'Project description goes here.',
  downloadLink,
  features = [
    { title: 'Feature One', description: 'Description for feature one' },
    { title: 'Feature Two', description: 'Description for feature two' },
    { title: 'Feature Three', description: 'Description for feature three' },
  ],
  liveLink = '#',
  githubLink: sourceLink = '#',
  codeSnippet,
  priority = 'medium',
  lazyLoad = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsModalOpen: setGlobalModalOpen } = useModal();
  const { preloadResources, preloadResource, shouldReduceMotion, isLowMemory } = usePerformance();

  // ── Shared state hooks ──────────────────────────────────────────────────────
  const { handleError, clearError } = useErrorHandler();

  // Track media failures per-source so one broken item (e.g. a video) never
  // blanks out the other media or the card thumbnail.
  const [failedMedia, setFailedMedia] = useState<Set<string>>(new Set());
  const markMediaFailed = useCallback((src: string) => {
    setFailedMedia((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);
  const { loading, setLoadingState } = useLoadingState();
  const { generatedThumbnails, setGeneratedThumbnails, enhancedThumbnailResolution } = useVideoThumbnail();

  // ── Intersection observer for lazy loading ──────────────────────────────────
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.01, rootMargin: '100px' });

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ── Carousel state ──────────────────────────────────────────────────────────
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [progressBarKey, setProgressBarKey] = useState(0);

  // ── Media & UI state ────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [autoFileSize, setAutoFileSize] = useState<string | null>(null);
  const [collapsedCodeSnippets, setCollapsedCodeSnippets] = useState<{ [key: string]: boolean }>({});
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaObjectFit] = useState<'cover' | 'contain'>('contain');

  // ── Refs ────────────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const preloadedImages = useRef<Set<string>>(new Set());
  const isProgrammaticallyClosing = useRef(false);

  // ── Mobile detection + preloading ──────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      const mobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isVisible && !isLowMemory()) {
        const toPreload = media.filter((i) => i.type === 'image').map((i) => i.src).slice(0, 3);
        if (toPreload.length > 0) preloadResources(toPreload);
        if (coverImage) preloadResource(coverImage, 'high');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isVisible, media, coverImage, isLowMemory, preloadResources, preloadResource]);

  // ── YouTube iframe API message handler ─────────────────────────────────────
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      try {
        let data;
        if (typeof event.data === 'string') {
          if (event.data.startsWith('{')) data = JSON.parse(event.data);
          else return;
        } else {
          data = event.data;
        }
        if (data.event === 'video-progress') {
          setIsYouTubePlaying(true);
          setAutoplay(false);
          setProgressBarKey((p) => p + 1);
        } else if (data.event === 'onStateChange') {
          const s = data.info?.playerState;
          if (s === 1) { setIsYouTubePlaying(true); setAutoplay(false); setProgressBarKey((p) => p + 1); }
          else if (s === 2) { setIsYouTubePlaying(false); setAutoplay(false); }
          else if (s === 0) { setIsYouTubePlaying(false); setAutoplay(true); setProgressBarKey((p) => p + 1); }
          else if (s === 3) { setIsYouTubePlaying(true); setAutoplay(false); }
          else if (s === -1 || s === 5) { setIsYouTubePlaying(false); setAutoplay(true); }
        } else if (data.event === 'onReady') {
          setIsYouTubePlaying(false); setAutoplay(true);
        }
      } catch { /* ignore non-JSON */ }
    };
    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const currentMedia = media[currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';

  const thumbnailImage = useMemo(() => {
    if (coverImage) return coverImage;
    const first = media[0];
    if (!first) return '/gamepad.svg';
    if (first.type === 'youtube') {
      const id = extractYouTubeVideoId(first.src);
      return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : '/gamepad.svg';
    }
    if (first.type === 'video') {
      if (first.thumbnail) return first.thumbnail;
      const cached = generatedThumbnails.get(first.src);
      if (cached) return cached;
      const relatedImg = media.find((i) => i.type === 'image');
      return relatedImg ? relatedImg.src : '/gamepad.svg';
    }
    return first.src;
  }, [coverImage, media, generatedThumbnails]);

  const shouldLoadMedia = useMemo(() => {
    if (isModalOpen) return true;
    if (!lazyLoad) return true;
    if (isMobile) return true;
    if (isLowMemory() && !isVisible) return false;
    return isVisible;
  }, [lazyLoad, isVisible, isModalOpen, isMobile, isLowMemory]);

  // ── Auto-generate thumbnails for videos without one ─────────────────────────
  useEffect(() => {
    if (!shouldLoadMedia) return;
    const missing = media.filter(
      (item) => item.type === 'video' && !item.thumbnail && !generatedThumbnails.has(item.src)
    );
    if (!missing.length) return;

    setLoadingState('media', true);
    const id = setTimeout(async () => {
      const results = await Promise.allSettled(
        missing.map(async (v) => {
          const thumb = await enhancedThumbnailResolution(v.src).catch(() => null);
          return thumb ? { src: v.src, thumb } : null;
        })
      );
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          setGeneratedThumbnails((prev) => new Map(prev).set(r.value!.src, r.value!.thumb));
        }
      });
      clearError();
      setLoadingState('media', false);
    }, 500);

    return () => clearTimeout(id);
  }, [shouldLoadMedia, media, generatedThumbnails, enhancedThumbnailResolution, setLoadingState, handleError, clearError, setGeneratedThumbnails]);

  // ── Image preloading ────────────────────────────────────────────────────────
  const preloadImages = useCallback(() => {
    if (!shouldLoadMedia) return;
    setLoadingState('media', true);
    const urls = media
      .filter((i) => i.type === 'image')
      .map((i) => i.src)
      .filter((src) => !preloadedImages.current.has(src));
    if (!urls.length) { setLoadingState('media', false); return; }

    let loaded = 0;
    let hasErrors = false;
    urls.forEach((src) => {
      const img = document.createElement('img');
      img.onload = () => {
        preloadedImages.current.add(src);
        if (++loaded === urls.length) { setLoadingState('media', false); if (hasErrors) clearError(); }
      };
      img.onerror = () => {
        hasErrors = true;
        handleError(`Failed to preload: ${src}`, 'media');
        if (++loaded === urls.length) setLoadingState('media', false);
      };
      img.src = src;
    });
  }, [media, shouldLoadMedia, setLoadingState, handleError, clearError]);

  // ── Modal open/close ────────────────────────────────────────────────────────
  const initCollapsedState = useCallback(() => {
    const state: { [key: string]: boolean } = {};
    features.forEach((f, i) => { if (f.codeSnippet) state[`feature-${i}`] = true; });
    if (codeSnippet) state['main'] = false;
    setCollapsedCodeSnippets(state);
  }, [features, codeSnippet]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setGlobalModalOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    router.replace(url.pathname + url.search);
    initCollapsedState();
    preloadImages();
  }, [projectId, router, setGlobalModalOpen, initCollapsedState, preloadImages]);

  const closeModal = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
    setIsPlaying(false);
    setIsYouTubePlaying(false);
    setIsClosing(true);
    isProgrammaticallyClosing.current = true;
    setGlobalModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('project');
    router.replace(url.pathname + url.search);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setTimeout(() => { isProgrammaticallyClosing.current = false; }, 100);
    }, 300);
  }, [setGlobalModalOpen, router]);

  // ── Reopen via URL param ────────────────────────────────────────────────────
  useEffect(() => {
    const current = searchParams?.get('project');
    if (current === projectId && !isModalOpen && !isClosing && !isProgrammaticallyClosing.current) {
      const t = setTimeout(() => {
        setIsModalOpen(true);
        setGlobalModalOpen(true);
        preloadImages();
        initCollapsedState();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [searchParams, projectId, isModalOpen, isClosing, setGlobalModalOpen, preloadImages, initCollapsedState]);

  // ── Carousel navigation ─────────────────────────────────────────────────────
  const goToNextMedia = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
    setIsPlaying(false);
    setIsYouTubePlaying(false);
    setCurrentMediaIndex((i) => (i + 1) % media.length);
    setProgressBarKey((p) => p + 1);
  }, [media.length]);

  const goToPreviousMedia = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
    setIsPlaying(false);
    setIsYouTubePlaying(false);
    setCurrentMediaIndex((i) => (i - 1 + media.length) % media.length);
    setProgressBarKey((p) => p + 1);
  }, [media.length]);

  const goToMedia = useCallback((index: number) => {
    if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
    setIsPlaying(false);
    setIsYouTubePlaying(false);
    setCurrentMediaIndex(index);
    setAutoplay(true);
    setProgressBarKey((p) => p + 1);
  }, []);

  const handleVideoToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); setAutoplay(false); }
    else { videoRef.current.pause(); setIsPlaying(false); setAutoplay(true); }
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    setAutoplay(true);
  }, []);

  const toggleCodeSnippet = useCallback((id: string) => {
    setCollapsedCodeSnippets((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleCopyCode = useCallback(async (code: string, buttonId: string) => {
    setPressedButton(buttonId);
    setTimeout(() => setPressedButton(null), 150);
    try { await navigator.clipboard.writeText(code); } catch { /* ignore */ }
  }, []);

  // ── YouTube slide-change state sync ────────────────────────────────────────
  useEffect(() => {
    if (currentMedia?.type !== 'youtube') {
      if (isYouTubePlaying) { setIsYouTubePlaying(false); setAutoplay(true); setProgressBarKey((p) => p + 1); }
    } else {
      setAutoplay(true);
    }
  }, [currentMediaIndex, currentMedia?.type, isYouTubePlaying]);

  // ── Autoplay timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isModalOpen || media.length <= 1 || !autoplay || isPlaying || isMobile) return;
    if (currentMedia?.type === 'youtube') {
      if (isYouTubePlaying) return;
      const t = setTimeout(() => { if (!isYouTubePlaying) goToNextMedia(); }, 8000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(goToNextMedia, 5000);
    return () => clearTimeout(t);
  }, [isModalOpen, media.length, autoplay, isPlaying, isYouTubePlaying, isMobile, currentMediaIndex, goToNextMedia, currentMedia?.type]);

  // ── Fullscreen change listener ──────────────────────────────────────────────
  useEffect(() => {
    const onChange = () => {
      const nowFullscreen = !!document.fullscreenElement;
      const wasFullscreen = isFullscreen;
      setIsFullscreen(nowFullscreen);
      if (wasFullscreen && !nowFullscreen && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause(); setIsPlaying(false); setAutoplay(true);
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('mozfullscreenchange', onChange);
    document.addEventListener('MSFullscreenChange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('mozfullscreenchange', onChange);
      document.removeEventListener('MSFullscreenChange', onChange);
    };
  }, [isFullscreen]);

  // ── Keyboard navigation + body scroll lock ──────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      switch (e.key) {
        case 'Escape': e.preventDefault(); closeModal(); break;
        case 'ArrowLeft': if (media.length > 1) { e.preventDefault(); goToPreviousMedia(); } break;
        case 'ArrowRight': if (media.length > 1) { e.preventDefault(); goToNextMedia(); } break;
        case ' ': if (isVideo && videoRef.current) { e.preventDefault(); handleVideoToggle(); } break;
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', onKey);
      const origOverflow = document.body.style.overflow;
      const origPosition = document.body.style.position;
      const origTop = document.body.style.top;
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = origOverflow;
        document.body.style.position = origPosition;
        document.body.style.top = origTop;
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isModalOpen, media.length, goToPreviousMedia, goToNextMedia, closeModal, isVideo, handleVideoToggle]);

  // ── Restore body styles when closing starts ─────────────────────────────────
  useEffect(() => {
    if (isClosing && !document.body.classList.contains('no-scroll')) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    }
  }, [isClosing]);

  // ── Syntax highlighting ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isModalOpen && (features?.some((f) => f.codeSnippet) || codeSnippet)) {
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 100);
    }
  }, [isModalOpen, features, codeSnippet, currentMediaIndex]);

  // ── File size detection ─────────────────────────────────────────────────────
  const fetchFileSize = useCallback(async (url: string) => {
    try {
      if (url.startsWith('/') || url.startsWith(window.location.origin)) {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
          const len = res.headers.get('content-length');
          if (len) return formatFileSize(parseInt(len, 10));
        }
      }
    } catch { /* ignore */ }
    return '';
  }, []);

  const getDownloadFileSize = useCallback(async () => {
    if (!downloadLink) return;
    const url = typeof downloadLink === 'string' ? downloadLink : downloadLink.url;
    if (!url?.startsWith('/')) return;
    try {
      setLoadingState('fileSize', true);
      const size = await fetchFileSize(url);
      if (size) { setAutoFileSize(size); clearError(); }
    } catch { handleError(`Failed to fetch file size for ${url}`, 'fileSize'); }
    finally { setLoadingState('fileSize', false); }
  }, [downloadLink, fetchFileSize, setLoadingState, handleError, clearError]);

  useEffect(() => { getDownloadFileSize(); }, [getDownloadFileSize]);
  useEffect(() => { if (isModalOpen) getDownloadFileSize(); }, [isModalOpen, getDownloadFileSize]);

  // ── Memos ───────────────────────────────────────────────────────────────────
  const memoizedTechStack = useMemo(() => (
    techStack.slice(0, 4).map((tech, index) => (
      <span
        key={index}
        className="px-2 py-1.5 bg-linear-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-full flex items-center justify-center text-blue-200 text-xs shadow-md hover:border-blue-300/50 transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer group-hover/card:from-blue-400/30 group-hover/card:to-purple-400/30 group-hover/card:text-blue-100"
        onClick={(e) => { e.stopPropagation(); openModal(); void tech; }}
        aria-label={`Technology: ${tech}`}
      >
        {techIcons[tech] || null}
        <span className="ml-1">{tech}</span>
      </span>
    ))
  ), [techStack, openModal]);

  const motionSettings = useMemo(() => {
    const reduce = shouldReduceMotion();
    return {
      shouldReduceMotion: reduce,
      transitionClass: reduce ? 'transition-none' : 'transition-all duration-300',
      hoverScaleClass: reduce ? '' : 'hover:scale-105',
      groupHoverScaleClass: reduce ? '' : 'group-hover/card:scale-105',
    };
  }, [shouldReduceMotion]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Project card ─────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onClick={openModal}
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsClicked(false); }}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } }}
        tabIndex={0}
        role="button"
        aria-label={`Open ${title} project details`}
        className={`relative flex flex-col justify-between p-4 sm:p-6 bg-linear-to-br from-gray-900/60 to-black/80 border border-blue-500/20 rounded-2xl shadow-xl ${motionSettings.transitionClass} ${motionSettings.hoverScaleClass} hover:border-blue-300/40 hover:shadow-blue-500/20 hover:shadow-xl overflow-hidden cursor-pointer w-full max-w-[400px] mx-auto h-56 sm:h-64 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent group/card ${isClicked ? 'scale-95' : ''}`}
      >
        <div className={`absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 ${motionSettings.shouldReduceMotion ? 'transition-none' : 'transition-opacity duration-500'}`} />

        {/* Thumbnail */}
        <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
          {shouldLoadMedia ? (
            failedMedia.has(thumbnailImage) ? (
              <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-center text-sm">⚠️ Image failed to load</div>
              </div>
            ) : (
              <Image
                src={thumbnailImage}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={`object-cover ${motionSettings.transitionClass} ${motionSettings.groupHoverScaleClass}`}
                priority={priority === 'high' || isMobile}
                unoptimized={isMobile}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.dataset.retried && isMobile) {
                    img.dataset.retried = 'true';
                    const sep = thumbnailImage.includes('?') ? '&' : '?';
                    img.src = `${thumbnailImage}${sep}retry=${Date.now()}`;
                  } else {
                    markMediaFailed(thumbnailImage);
                  }
                }}
              />
            )
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-transparent to-purple-900/20" />

        {/* Card text */}
        <div className="relative z-10">
          <h3 className="text-blue-100 font-bold text-xl sm:text-2xl group-hover/card:text-white transition-colors duration-300 mb-3 truncate drop-shadow-xl">
            {title}
          </h3>
          <p className="text-blue-200/70 group-hover/card:text-blue-100 transition-colors duration-300 text-sm line-clamp-2 mb-4 drop-shadow-lg leading-relaxed">
            {description.split('.')[0]}.
          </p>
        </div>

        {/* Tech stack mini-badges */}
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-auto max-w-full overflow-hidden">
          {memoizedTechStack}
        </div>

        {/* Interactive hover demo overlay */}
        <HoverDemo projectId={projectId} isHovered={isHovered} />
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-100 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs transition-all duration-500 ease-out overflow-hidden ${
            isClosing ? 'opacity-0 backdrop-blur-none' : 'opacity-100 animate-fadeIn'
          }`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.5s ease-out forwards' }}
        >
          <div
            className={`relative w-full max-w-7xl bg-linear-to-br from-gray-900/95 to-black/90 backdrop-blur-md rounded-none sm:rounded-2xl shadow-2xl transition-all duration-500 ease-out border-0 sm:border border-blue-500/30 min-h-screen sm:min-h-0 sm:max-h-[95vh] my-0 sm:my-4 ${
              isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0 animate-slideInUp'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: isMobile ? '100vh' : 'calc(100vh - 2rem)',
              overflowY: 'auto',
              animation: isClosing ? 'slideOutDown 0.3s ease-out forwards' : 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="sticky top-6 sm:top-6 left-full transform -translate-x-2 sm:-translate-x-6 z-50 bg-linear-to-r from-gray-900/90 to-black/90 backdrop-blur-xs hover:from-gray-800/90 hover:to-gray-900/90 text-gray-300 hover:text-white rounded-full p-2 sm:p-3 transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent shadow-xl border border-gray-600/30 hover:border-gray-500/50 group flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-200 group-hover:scale-110">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-6 relative z-10">
              {/* ── Left column ─────────────────────────────────────── */}
              <div className="w-full lg:w-1/2 flex flex-col">
                {/* Mobile title */}
                <div className="mb-6 lg:hidden">
                  <div className="bg-linear-to-br from-gray-900/90 to-black/85 rounded-lg p-4 border border-blue-500/20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg leading-tight">{title}</h2>
                  </div>
                </div>

                {/* Carousel */}
                <MediaCarousel
                  media={media}
                  title={title}
                  currentMediaIndex={currentMediaIndex}
                  isPlaying={isPlaying}
                  isYouTubePlaying={isYouTubePlaying}
                  autoplay={autoplay}
                  progressBarKey={progressBarKey}
                  isFullscreen={isFullscreen}
                  isMediaLoading={loading.media}
                  isMobile={isMobile}
                  failedMedia={failedMedia}
                  onMediaFailed={markMediaFailed}
                  shouldLoadMedia={shouldLoadMedia}
                  mediaObjectFit={mediaObjectFit}
                  videoRef={videoRef}
                  mediaContainerRef={mediaContainerRef}
                  onVideoToggle={handleVideoToggle}
                  onVideoEnd={handleVideoEnd}
                  onError={handleError}
                  onSetMediaLoading={(v) => setLoadingState('media', v)}
                  onNavigateNext={goToNextMedia}
                  onNavigatePrev={goToPreviousMedia}
                  onNavigateTo={goToMedia}
                  onSetAutoplay={setAutoplay}
                />

                {/* Action buttons */}
                <ActionButtons
                  downloadLink={downloadLink}
                  liveLink={liveLink}
                  sourceLink={sourceLink}
                  isMobile={isMobile}
                  loading={loading}
                  autoFileSize={autoFileSize}
                />

                {/* Mobile description */}
                <div className="mt-6 mb-4 lg:hidden">
                  <div className="bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20">
                    <h3 className="text-lg font-semibold mb-3 text-white drop-shadow-lg">About</h3>
                    <p className="text-gray-100 leading-relaxed text-base sm:text-[1rem]">{description}</p>
                  </div>
                </div>

                {/* Built with */}
                <div className="mt-6 mb-6">
                  <div className="bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">Built with</h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5 max-w-full">
                    {techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2.5 bg-linear-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-full flex items-center justify-center text-blue-200 text-base whitespace-nowrap shrink-0 min-w-0 cursor-pointer hover:border-blue-300/50 transition-all duration-300 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {techIcons[tech] || null}
                        <span className="truncate ml-1.5">{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right column ─────────────────────────────────────── */}
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0">
                {/* Desktop title + description */}
                <div className="mb-8 hidden lg:block">
                  <div className="bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white drop-shadow-lg leading-tight">{title}</h2>
                    <p className="text-gray-100 leading-relaxed text-base sm:text-[1rem]">{description}</p>
                  </div>
                </div>

                {/* Features list */}
                <FeaturesList
                  features={features}
                  collapsedCodeSnippets={collapsedCodeSnippets}
                  onToggleSnippet={toggleCodeSnippet}
                  pressedButton={pressedButton}
                  onCopyCode={handleCopyCode}
                />

                <hr className="border-t border-blue-500/20 my-8" />

                {/* Main code snippet */}
                {codeSnippet && (
                  <div className="mb-8">
                    <div className="bg-linear-to-br from-gray-900/95 to-black/90 rounded-lg p-4 border border-blue-500/20 mb-4">
                      <h2 className="text-xl font-bold text-white drop-shadow-lg">Code Snippet</h2>
                    </div>
                    <CodeBlock
                      snippetId="main"
                      code={codeSnippet.code}
                      language={codeSnippet.language}
                      title={codeSnippet.title || 'Main Code Example'}
                      collapsed={!!collapsedCodeSnippets['main']}
                      onToggle={toggleCodeSnippet}
                      pressedButton={pressedButton}
                      onCopy={handleCopyCode}
                    />
                  </div>
                )}

                {codeSnippet && <hr className="border-t border-blue-500/20 my-8" />}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

ProjectCard.displayName = 'ProjectCard';

export { isYouTubeUrl } from './utils';
export default memo(ProjectCard);
