import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AvatarLightboxProps {
  src?: string | null;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  /** Stop propagation so parent click handlers (e.g. card navigation) don't fire */
  stopPropagation?: boolean;
}

/**
 * Wraps an avatar/image element. Clicking it opens a fullscreen preview
 * showing the image at a much larger size. If no src is provided, it
 * just renders the children without click behavior.
 */
const AvatarLightbox: React.FC<AvatarLightboxProps> = ({
  src,
  alt,
  children,
  className,
  stopPropagation = true,
}) => {
  const [open, setOpen] = useState(false);

  if (!src) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          'p-0 m-0 bg-transparent border-0 cursor-zoom-in rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        aria-label={alt ? `View ${alt}'s photo` : 'View photo'}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-3xl p-2 sm:p-4 bg-background/95 border-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-center w-full">
            <img
              src={src}
              alt={alt || 'Profile photo'}
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarLightbox;
