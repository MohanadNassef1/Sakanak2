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
        onPointerDown={(e) => {
          if (stopPropagation) e.stopPropagation();
        }}
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={cn(
          'p-0 m-0 bg-transparent border-0 cursor-zoom-in rounded-full inline-block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        aria-label={alt ? `View ${alt}'s photo` : 'View photo'}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md p-4 sm:p-6 bg-background/95 border-none flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-muted"
            style={{
              width: 'min(80vw, 70vh, 480px)',
              height: 'min(80vw, 70vh, 480px)',
            }}
          >
            <img
              src={src}
              alt={alt || 'Profile photo'}
              className="w-full h-full object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarLightbox;
