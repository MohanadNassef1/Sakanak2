import React, { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Video, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

interface VideoUploaderProps {
  videos: string[];
  onVideosChange: (videos: string[]) => void;
  maxVideos?: number;
}

const useUploadRoomVideo = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('room-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('room-videos')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });
};

const VideoUploader: React.FC<VideoUploaderProps> = ({
  videos,
  onVideosChange,
  maxVideos = 2,
}) => {
  const { isRTL } = useLanguage();
  const uploadMutation = useUploadRoomVideo();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxVideos - videos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('video/')) {
        toast.error(isRTL ? 'يجب أن يكون الملف فيديو' : 'File must be a video');
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(isRTL ? 'حجم الفيديو يجب أن يكون أقل من 50 ميجابايت' : 'Video must be smaller than 50MB');
        continue;
      }

      try {
        const url = await uploadMutation.mutateAsync(file);
        onVideosChange([...videos, url]);
        toast.success(isRTL ? 'تم رفع الفيديو' : 'Video uploaded');
      } catch (error) {
        toast.error(isRTL ? 'فشل رفع الفيديو' : 'Failed to upload video');
        logError('VideoUploader.upload', error);
      }
    }

    e.target.value = '';
  }, [videos, maxVideos, onVideosChange, uploadMutation, isRTL]);

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black">
            <video
              src={video}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={() => removeVideo(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {videos.length < maxVideos && (
          <label className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/50 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
            {uploadMutation.isPending ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Video className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center px-2">
                  {isRTL ? 'إضافة فيديو (حد أقصى 50 ميجا)' : 'Add video (max 50MB)'}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {videos.length} / {maxVideos} {isRTL ? 'فيديو' : 'videos'}
      </p>
    </div>
  );
};

export default VideoUploader;
