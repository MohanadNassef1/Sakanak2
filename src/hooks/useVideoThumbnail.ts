import { useEffect, useState } from 'react';

// In-memory cache (survives across component mounts within the same session)
const memoryCache = new Map<string, string>();

// SessionStorage key prefix
const STORAGE_PREFIX = 'vthmb:';

function getCached(url: string): string | null {
  const mem = memoryCache.get(url);
  if (mem) return mem;
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + url);
    if (stored) {
      memoryCache.set(url, stored);
      return stored;
    }
  } catch { /* quota / security errors */ }
  return null;
}

function setCache(url: string, dataUrl: string) {
  memoryCache.set(url, dataUrl);
  try {
    sessionStorage.setItem(STORAGE_PREFIX + url, dataUrl);
  } catch { /* quota exceeded — memory cache still works */ }
}

/**
 * Loads a video off-screen, seeks to several timestamps, and returns
 * a data-URL of the first frame that is not predominantly black.
 * 
 * Fallback chain:
 * 1. Canvas frame capture at [1,3,5,8,10] seconds (best quality)
 * 2. If canvas fails (CORS/tainted), draw without getImageData check
 * 3. If everything fails, return a sentinel so the banner can use
 *    the video element with #t=2 as a last resort
 */
export function useVideoThumbnail(videoUrl: string | undefined): string | null {
  const [thumbnail, setThumbnail] = useState<string | null>(() =>
    videoUrl ? getCached(videoUrl) : null
  );

  useEffect(() => {
    if (!videoUrl) {
      setThumbnail(null);
      return;
    }

    const cached = getCached(videoUrl);
    if (cached) {
      setThumbnail(cached);
      return;
    }

    let cancelled = false;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const timestamps = [1, 3, 5, 8, 10];
    let idx = 0;
    let canvasCheckFailed = false; // CORS/tainted flag

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function isFrameBlack(): boolean {
      if (!ctx) return true;
      try {
        const cw = canvas.width;
        const ch = canvas.height;
        const x0 = Math.floor(cw * 0.2);
        const y0 = Math.floor(ch * 0.2);
        const sw = Math.floor(cw * 0.6);
        const sh = Math.floor(ch * 0.6);
        const data = ctx.getImageData(x0, y0, sw, sh).data;
        let brightPixels = 0;
        const totalSamples = Math.floor(data.length / 16);
        for (let i = 0; i < data.length; i += 16) {
          const brightness = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          if (brightness > 30) brightPixels++;
        }
        return brightPixels / totalSamples < 0.1;
      } catch {
        // SecurityError: tainted canvas (CORS)
        canvasCheckFailed = true;
        return false; // treat as non-black so we capture this frame
      }
    }

    function saveThumbnail(dataUrl: string) {
      setCache(videoUrl!, dataUrl);
      if (!cancelled) setThumbnail(dataUrl);
    }

    function tryExportCanvas(): string | null {
      try {
        return canvas.toDataURL('image/jpeg', 0.8);
      } catch {
        // toDataURL also fails on tainted canvas
        return null;
      }
    }

    function tryCapture() {
      if (cancelled || !ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (!isFrameBlack()) {
        const dataUrl = tryExportCanvas();
        if (dataUrl && dataUrl.length > 100) {
          saveThumbnail(dataUrl);
          cleanup();
          return;
        }
        // Canvas export failed (CORS) — fall through to fallback
        if (canvasCheckFailed) {
          useFallbackPoster();
          return;
        }
      }

      idx++;
      if (idx < timestamps.length) {
        video.currentTime = timestamps[idx];
      } else {
        // All timestamps tried — save whatever we got
        const dataUrl = tryExportCanvas();
        if (dataUrl && dataUrl.length > 100) {
          saveThumbnail(dataUrl);
        } else {
          useFallbackPoster();
        }
        cleanup();
      }
    }

    /**
     * Fallback: use the video URL with #t=2 as a poster-like source.
     * We create a second video without crossOrigin, seek to 2s,
     * and try once more with a fresh canvas.
     */
    function useFallbackPoster() {
      cleanup();
      if (cancelled) return;

      const fallbackVideo = document.createElement('video');
      fallbackVideo.preload = 'metadata';
      fallbackVideo.muted = true;
      fallbackVideo.playsInline = true;

      const fallbackCanvas = document.createElement('canvas');
      const fallbackCtx = fallbackCanvas.getContext('2d');

      fallbackVideo.addEventListener('seeked', () => {
        if (cancelled || !fallbackCtx) return;
        fallbackCanvas.width = fallbackVideo.videoWidth || 640;
        fallbackCanvas.height = fallbackVideo.videoHeight || 360;
        fallbackCtx.drawImage(fallbackVideo, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
        try {
          const dataUrl = fallbackCanvas.toDataURL('image/jpeg', 0.8);
          if (dataUrl && dataUrl.length > 100) {
            saveThumbnail(dataUrl);
          }
        } catch {
          // Final fallback: signal that we tried but couldn't capture
          // The component will show the video with #t=2 natively
        }
        fallbackVideo.src = '';
        fallbackVideo.load();
      });

      fallbackVideo.addEventListener('loadedmetadata', () => {
        // Try mid-point of the video for best chance of content
        const midPoint = Math.min(fallbackVideo.duration / 2, 5);
        fallbackVideo.currentTime = midPoint > 0 ? midPoint : 2;
      });

      fallbackVideo.addEventListener('error', () => {
        fallbackVideo.src = '';
        fallbackVideo.load();
      });

      fallbackVideo.src = videoUrl;
    }

    function cleanup() {
      video.removeEventListener('seeked', tryCapture);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onError);
      video.src = '';
      video.load();
    }

    function onMeta() {
      video.currentTime = timestamps[0];
    }

    function onError() {
      // Primary video failed — try fallback
      useFallbackPoster();
    }

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('seeked', tryCapture);
    video.addEventListener('error', onError);
    video.src = videoUrl;

    // Safety timeout: if nothing resolved in 10s, try fallback
    const timeout = setTimeout(() => {
      if (!cancelled && !thumbnail) {
        useFallbackPoster();
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanup();
    };
  }, [videoUrl]);

  return thumbnail;
}
