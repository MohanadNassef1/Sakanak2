import React, { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useUploadRoomPhoto } from '@/hooks/useCreateRoom';
import { Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

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

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('rooms.form.invalidImage'));
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('rooms.form.imageTooLarge'));
        continue;
      }

      try {
        const url = await uploadMutation.mutateAsync(file);
        onPhotosChange([...photos, url]);
      } catch (error) {
        toast.error(t('rooms.form.uploadError'));
        logError('PhotoUploader.upload', error);
      }
    }

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
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
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
