import { useEffect, useState } from 'react';

/**
 * Loads a video off-screen, seeks to several timestamps, and returns
 * a data-URL of the first frame that is not predominantly black.
 */
export function useVideoThumbnail(videoUrl: string | undefined): string | null {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) return;

    let cancelled = false;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const timestamps = [1, 3, 5, 8, 10]; // seconds to try
    let idx = 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function isFrameBlack(): boolean {
      if (!ctx) return true;
      const cw = canvas.width;
      const ch = canvas.height;
      // Sample only the center 60% to ignore letterboxing / pillarboxing
      const x0 = Math.floor(cw * 0.2);
      const y0 = Math.floor(ch * 0.2);
      const sw = Math.floor(cw * 0.6);
      const sh = Math.floor(ch * 0.6);
      const data = ctx.getImageData(x0, y0, sw, sh).data;
      let brightPixels = 0;
      const totalSamples = Math.floor(data.length / 16); // every 4th pixel (stride 16 bytes)
      for (let i = 0; i < data.length; i += 16) {
        const brightness = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; // perceived luminance
        if (brightness > 30) brightPixels++;
      }
      // Consider "black" only if <10% of center pixels are above threshold
      return brightPixels / totalSamples < 0.1;
    }

    function tryCapture() {
      if (cancelled || !ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (!isFrameBlack()) {
        setThumbnail(canvas.toDataURL('image/jpeg', 0.8));
        cleanup();
        return;
      }

      idx++;
      if (idx < timestamps.length) {
        video.currentTime = timestamps[idx];
      } else {
        // All timestamps were black — use last frame anyway
        setThumbnail(canvas.toDataURL('image/jpeg', 0.8));
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
