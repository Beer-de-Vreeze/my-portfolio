import { useState, useCallback } from 'react';

/** Detects iOS or Safari browser */
export const isIOSorSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || /^((?!chrome|android).)*safari/i.test(ua);
};

/** Checks if the browser can play a given video format */
export const isVideoFormatSupported = (videoSrc: string): boolean => {
  if (typeof window === 'undefined') return true;
  const video = document.createElement('video');
  const ext = videoSrc.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return video.canPlayType('video/mp4') !== '';
    case 'webm': return video.canPlayType('video/webm') !== '';
    case 'mov': return video.canPlayType('video/quicktime') !== '';
    case 'avi': return video.canPlayType('video/x-msvideo') !== '';
    default: return true;
  }
};

/** Returns a compatible video source (attempts MP4 fallback for WebM on iOS/Safari) */
export const getCompatibleVideoSource = (videoSrc: string): string => {
  if (isIOSorSafari() && videoSrc.includes('.webm')) {
    const mp4 = videoSrc.replace('.webm', '.mp4');
    console.log(`iOS/Safari detected with WebM video. MP4 alternative would be: ${mp4}`);
  }
  return videoSrc;
};

/**
 * Hook that provides video thumbnail generation with caching,
 * iOS/Safari fallbacks, and format validation.
 */
export const useVideoThumbnail = () => {
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Map<string, string>>(new Map());

  const generateVideoThumbnail = useCallback(async (
    videoSrc: string,
    timeInSeconds = 1,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const existing = generatedThumbnails.get(videoSrc);
      if (existing) { resolve(existing); return; }

      const iosSafari = isIOSorSafari();
      if (iosSafari && videoSrc.includes('.webm')) {
        reject(new Error('WebM format not supported on iOS/Safari'));
        return;
      }

      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) { reject(new Error('Canvas context not available')); return; }

      if (iosSafari) {
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.setAttribute('autoplay', 'false');
        video.preload = 'metadata';
      } else {
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
      }

      const timeout = setTimeout(() => {
        video.remove();
        reject(new Error('Video thumbnail generation timeout'));
      }, 10000);

      video.onloadedmetadata = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        const w = 320;
        canvas.width = w;
        canvas.height = Math.round(w / aspectRatio);
        const seekTime = Math.min(timeInSeconds, video.duration - 0.1);

        if (iosSafari) {
          video.play()
            .then(() => { video.pause(); video.currentTime = seekTime; })
            .catch(() => { video.currentTime = seekTime; });
        } else {
          video.currentTime = seekTime;
        }
      };

      video.onseeked = () => {
        try {
          clearTimeout(timeout);
          if (iosSafari) {
            try {
              ctx.drawImage(video, 0, 0, 1, 1);
              ctx.getImageData(0, 0, 1, 1);
            } catch {
              video.remove();
              reject(new Error('Canvas security restriction on iOS/Safari'));
              return;
            }
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          let dataUrl: string;
          try {
            dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          } catch {
            dataUrl = canvas.toDataURL('image/png');
          }
          setGeneratedThumbnails((prev) => new Map(prev).set(videoSrc, dataUrl));
          video.remove();
          resolve(dataUrl);
        } catch (err) {
          clearTimeout(timeout);
          video.remove();
          reject(err);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        video.remove();
        reject(new Error(`Failed to load video: ${videoSrc}`));
      };

      video.src = videoSrc;
      video.load();
    });
  }, [generatedThumbnails]);

  const generateFallbackThumbnail = useCallback(async (videoSrc: string): Promise<string | null> => {
    try {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      return new Promise((resolve) => {
        const timeout = setTimeout(() => { video.remove(); resolve(null); }, 5000);

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = Math.round(320 / (video.videoWidth / video.videoHeight));
            const ctx = canvas.getContext('2d');
            if (ctx) {
              video.currentTime = 0;
              const draw = () => {
                try {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL('image/jpeg', 0.7));
                  video.remove();
                } catch {
                  video.remove();
                  resolve(null);
                }
              };
              if (video.readyState >= 2) draw();
              else { video.onseeked = draw; video.oncanplay = draw; }
            } else { video.remove(); resolve(null); }
          } else { video.remove(); resolve(null); }
        };

        video.onerror = () => { clearTimeout(timeout); video.remove(); resolve(null); };
        video.load();
      });
    } catch {
      return null;
    }
  }, []);

  const enhancedThumbnailResolution = useCallback(async (videoSrc: string): Promise<string | null> => {
    if (!isVideoFormatSupported(videoSrc)) return null;
    const src = getCompatibleVideoSource(videoSrc);

    try {
      const hq = await generateVideoThumbnail(src, 2);
      if (hq) return hq;
    } catch { /* fall through */ }

    try {
      const lq = await generateVideoThumbnail(src, 1);
      if (lq) return lq;
    } catch { /* fall through */ }

    return generateFallbackThumbnail(src);
  }, [generateVideoThumbnail, generateFallbackThumbnail]);

  return { generatedThumbnails, setGeneratedThumbnails, enhancedThumbnailResolution };
};
