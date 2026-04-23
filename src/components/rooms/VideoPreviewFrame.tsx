import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoPreviewFrameProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Renders the best non-black frame from a video onto a canvas.
 * Seeks through multiple timestamps and picks the brightest frame.
 */
const VideoPreviewFrame: React.FC<VideoPreviewFrameProps> = ({ src, alt, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let cancelled = false;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const timestamps = [1, 2, 4, 6, 8];
    let idx = 0;
    let bestBrightness = 0;

    function measureBrightness(): number {
      if (!ctx) return 0;
      try {
        const w = canvas!.width;
        const h = canvas!.height;
        const data = ctx.getImageData(
          Math.floor(w * 0.2), Math.floor(h * 0.2),
          Math.floor(w * 0.6), Math.floor(h * 0.6)
        ).data;
        let total = 0;
        const samples = Math.floor(data.length / 16);
        for (let i = 0; i < data.length; i += 16) {
          total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        }
        return samples > 0 ? total / samples : 0;
      } catch {
        return -1; // CORS — can't measure, just use this frame
      }
    }

    function drawFrame() {
      if (cancelled || !ctx || !canvas) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    function onSeeked() {
      if (cancelled) return;
      drawFrame();

      const brightness = measureBrightness();

      if (brightness === -1) {
        // CORS — can't getImageData, accept this frame
        if (!cancelled) setReady(true);
        cleanup();
        return;
      }

      if (brightness > bestBrightness) {
        bestBrightness = brightness;
      }

      idx++;
      if (idx < timestamps.length && bestBrightness < 40) {
        // Keep looking for a brighter frame
        video.currentTime = Math.min(timestamps[idx], video.duration - 0.5);
      } else {
        // Redraw best frame if we moved past it
        if (bestBrightness >= 40 || idx >= timestamps.length) {
          if (!cancelled) setReady(true);
        }
        cleanup();
      }
    }

    function onMeta() {
      const t = Math.min(timestamps[0], video.duration - 0.5);
      video.currentTime = t > 0 ? t : 0;
    }

    function onError() {
      // Try without crossOrigin
      cleanup();
      if (cancelled) return;

      const fallback = document.createElement('video');
      fallback.preload = 'metadata';
      fallback.muted = true;
      fallback.playsInline = true;

      fallback.addEventListener('seeked', () => {
        if (cancelled || !ctx || !canvas) return;
        canvas.width = fallback.videoWidth || 640;
        canvas.height = fallback.videoHeight || 360;
        ctx.drawImage(fallback, 0, 0, canvas.width, canvas.height);
        setReady(true);
        fallback.src = '';
        fallback.load();
      }, { once: true });

      fallback.addEventListener('loadedmetadata', () => {
        const mid = Math.min(fallback.duration / 2, 3);
        fallback.currentTime = mid > 0 ? mid : 0;
      }, { once: true });

      fallback.addEventListener('error', () => {
        fallback.src = '';
        fallback.load();
      }, { once: true });

      fallback.src = src;
    }

    function cleanup() {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onError);
      video.src = '';
      video.load();
    }

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.src = src;

    const timeout = setTimeout(() => {
      if (!cancelled && !ready) {
        // Force show whatever we have
        setReady(true);
        cleanup();
      }
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanup();
    };
  }, [src]);

  return (
    <div className="relative w-full h-full">
      {!ready && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-muted-foreground/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn('w-full h-full object-cover', ready ? 'opacity-100' : 'opacity-0', className)}
        style={{ transition: 'opacity 0.3s ease-in' }}
        aria-label={alt}
      />
    </div>
  );
};

export default VideoPreviewFrame;
