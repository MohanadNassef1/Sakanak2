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
      const w = Math.min(canvas.width, 64); // sample a small area for speed
      const h = Math.min(canvas.height, 64);
      const data = ctx.getImageData(0, 0, w, h).data;
      let total = 0;
      // Average brightness across sampled pixels
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
        total += data[i] + data[i + 1] + data[i + 2]; // R+G+B
      }
      const samples = Math.floor(data.length / 16);
      const avgBrightness = total / (samples * 3); // per channel
      return avgBrightness < 15; // threshold: nearly black
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
