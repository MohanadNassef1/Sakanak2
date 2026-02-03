import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl: string | null;
  userName: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  userId,
  currentAvatarUrl,
  userName,
  onUploadComplete,
  onRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('room-photos').remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('room-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('room-photos')
        .getPublicUrl(fileName);

      onUploadComplete(data.publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentAvatarUrl || !onRemove) return;

    setIsUploading(true);
    try {
      const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('room-photos').remove([oldPath]);
      onRemove();
      toast.success('Photo removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24 md:w-32 md:h-32">
          <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
          <AvatarFallback className="text-3xl md:text-4xl bg-primary/20 text-primary">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full shadow-lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>

        {/* Remove Button */}
        {currentAvatarUrl && onRemove && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-0 right-0 rounded-full shadow-lg w-6 h-6"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-sm text-muted-foreground text-center">
        Click the camera icon to upload a photo (optional)
      </p>
    </div>
  );
};

export default AvatarUploader;
