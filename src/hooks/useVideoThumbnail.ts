import { useEffect, useState } from 'react';

// In-memory cache (survives across component mounts within the same session)
const memoryCache = new Map<string, string>();

// SessionStorage key prefix
const STORAGE_PREFIX = 'vthmb:';

function getCached(url: string): string | null {
  // Check memory first (fastest)
  const mem = memoryCache.get(url);
  if (mem) return mem;
  // Check sessionStorage (survives navigations within the tab)
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + url);
    if (stored) {
      memoryCache.set(url, stored); // promote to memory
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
 * Results are cached in memory + sessionStorage.
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

    // Return cached immediately
    const cached = getCached(videoUrl);
    if (cached) {
      setThumbnail(cached);
      return;
    }

    let cancelled = false;
    const video = document.createElement('video');
    // Omit crossOrigin to avoid CORS issues with storage buckets
    // This prevents tainted canvas errors on getImageData
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const timestamps = [1, 3, 5, 8, 10];
    let idx = 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function isFrameBlack(): boolean {
      if (!ctx) return true;
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
    }

    function saveThumbnail(dataUrl: string) {
      setCache(videoUrl!, dataUrl);
      if (!cancelled) setThumbnail(dataUrl);
    }

    function tryCapture() {
      if (cancelled || !ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (!isFrameBlack()) {
        saveThumbnail(canvas.toDataURL('image/jpeg', 0.8));
        cleanup();
        return;
      }

      idx++;
      if (idx < timestamps.length) {
        video.currentTime = timestamps[idx];
      } else {
        saveThumbnail(canvas.toDataURL('image/jpeg', 0.8));
        cleanup();
      }
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
      cleanup();
    }

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('seeked', tryCapture);
    video.addEventListener('error', onError);
    video.src = videoUrl;

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [videoUrl]);

  return thumbnail;
}
