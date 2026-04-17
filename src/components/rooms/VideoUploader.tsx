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

const MAX_DURATION_SECONDS = 180;
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

// Magic number signatures for basic mime sniffing
const VIDEO_SIGNATURES: { mime: string; check: (bytes: Uint8Array) => boolean }[] = [
  // MP4 / M4V / QuickTime: bytes 4-7 contain "ftyp"
  {
    mime: 'video/mp4',
    check: (b) => b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
  },
  // WebM: starts with 0x1A 0x45 0xDF 0xA3 (EBML)
  {
    mime: 'video/webm',
    check: (b) => b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
];

const sniffVideoMime = async (file: File): Promise<boolean> => {
  const slice = file.slice(0, 16);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return VIDEO_SIGNATURES.some((sig) => sig.check(bytes));
};

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      if (!isFinite(duration) || isNaN(duration)) {
        reject(new Error('Invalid duration'));
      } else {
        resolve(duration);
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
    video.src = url;
  });
};

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
      if (!file.type.startsWith('video/') || !ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(isRTL ? 'صيغة الفيديو غير مدعومة (MP4, WebM, MOV فقط)' : 'Unsupported video format (MP4, WebM, MOV only)');
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(isRTL ? 'حجم الفيديو يجب أن يكون أقل من 50 ميجابايت' : 'Video must be smaller than 50MB');
        continue;
      }

      // Basic mime sniffing — verify file actually matches a known video signature
      try {
        const validSignature = await sniffVideoMime(file);
        if (!validSignature) {
          toast.error(isRTL ? 'الملف لا يبدو كملف فيديو صالح' : 'File does not appear to be a valid video');
          continue;
        }
      } catch {
        toast.error(isRTL ? 'تعذر التحقق من الفيديو' : 'Could not verify video file');
        continue;
      }

      // Duration check
      try {
        const duration = await getVideoDuration(file);
        if (duration > MAX_DURATION_SECONDS) {
          toast.error(
            isRTL
              ? `مدة الفيديو يجب أن تكون أقل من ${MAX_DURATION_SECONDS} ثانية (3 دقائق)`
              : `Video must be shorter than ${MAX_DURATION_SECONDS} seconds (3 minutes)`
          );
          continue;
        }
      } catch {
        toast.error(isRTL ? 'تعذر قراءة مدة الفيديو' : 'Could not read video duration');
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
                  {isRTL ? 'إضافة فيديو (حد أقصى 50 ميجا، 3 دقائق)' : 'Add video (max 50MB, 3 min)'}
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
