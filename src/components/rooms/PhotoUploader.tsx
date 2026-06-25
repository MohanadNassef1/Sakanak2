import React, { useCallback, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useUploadRoomPhoto } from '@/hooks/useCreateRoom';
import { Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';
import { compressImage } from '@/lib/compressImage';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}) => {
  const { t } = useLanguage();
  const uploadMutation = useUploadRoomPhoto();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    const validFiles = filesToUpload.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(t('rooms.form.invalidImage'));
        return false;
      }
      // Allow up to 15MB pre-compression; we'll shrink before upload.
      if (file.size > 15 * 1024 * 1024) {
        toast.error(t('rooms.form.imageTooLarge'));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setProgress({ done: 0, total: validFiles.length });

    let completed = 0;
    const results = await Promise.allSettled(
      validFiles.map(async (file) => {
        const compressed = await compressImage(file);
        const url = await uploadMutation.mutateAsync(compressed);
        completed += 1;
        setProgress({ done: completed, total: validFiles.length });
        return url;
      })
    );

    const newUrls: string[] = [];
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        newUrls.push(res.value);
      } else {
        toast.error(t('rooms.form.uploadError'));
        logError('PhotoUploader.upload', res.reason);
      }
    });

    if (newUrls.length > 0) {
      onPhotosChange([...photos, ...newUrls]);
    }

    setProgress(null);
    e.target.value = '';
  }, [photos, maxPhotos, onPhotosChange, uploadMutation, t]);

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border">
            <img
              src={photo}
              alt={`Room photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => removePhoto(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
            {uploadMutation.isPending || progress ? (
              <>
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                {progress && (
                  <span className="text-xs text-muted-foreground">
                    {progress.done} / {progress.total}
                  </span>
                )}
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('rooms.form.addPhoto')}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {photos.length} / {maxPhotos} {t('rooms.form.photosUploaded')}
      </p>
    </div>
  );
};

export default PhotoUploader;
