// Lightweight client-side image compression to dramatically speed up uploads.
// Resizes oversized images and re-encodes as JPEG. Falls back to the original
// file if anything goes wrong (e.g. unsupported format like HEIC on some browsers).

export interface CompressOptions {
  maxDimension?: number; // longest edge in px
  quality?: number; // 0..1 for JPEG
  maxBytes?: number; // skip compression if already smaller
}

export async function compressImage(
  file: File,
  { maxDimension = 1920, quality = 0.8, maxBytes = 400 * 1024 }: CompressOptions = {}
): Promise<File> {
  // Don't touch tiny images or non-images.
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= maxBytes) return file;
  // GIFs would lose animation; skip.
  if (file.type === 'image/gif') return file;

  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = scaleDown(bitmap.width, bitmap.height, maxDimension);

    const canvas =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(width, height)
        : Object.assign(document.createElement('canvas'), { width, height });

    const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) return file;
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
    if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img>
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // Revoked after draw would be safer, but this is fine — the image is decoded.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function scaleDown(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w >= h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  type: string,
  quality: number
): Promise<Blob | null> {
  if ('convertToBlob' in canvas) {
    return (canvas as OffscreenCanvas).convertToBlob({ type, quality });
  }
  return new Promise((resolve) =>
    (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), type, quality)
  );
}
