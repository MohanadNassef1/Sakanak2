import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type Variant = 'icon' | 'outline' | 'solid';
type Size = 'sm' | 'md' | 'lg';

interface VerifiedBadgeProps {
  /** When false, renders nothing. Lets callers inline `<VerifiedBadge verified={x} />`. */
  verified?: boolean;
  /** Visual style. Default `icon` (bare green CheckCircle, no pill). */
  variant?: Variant;
  /** Size. Default `sm`. */
  size?: Size;
  /**
   * Optional text shown next to the icon (auto-localized fallback to "Verified" / "موثق").
   * Pass an explicit string to override (e.g. "Verified Landlord").
   */
  label?: string | null;
  /** When true and variant !== 'icon', forces no label even if a default would be shown. */
  iconOnly?: boolean;
  className?: string;
  'aria-label'?: string;
}

const ICON_SIZE: Record<Size, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const PILL_ICON_SIZE: Record<Size, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

/**
 * Single source of truth for the platform's "verified user" indicator.
 * Always renders a green CheckCircle. Use everywhere a user/host/asker
 * needs a verified marker so future tweaks happen in one place.
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  verified = true,
  variant = 'icon',
  size = 'sm',
  label,
  iconOnly = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const { isRTL } = useLanguage();
  if (!verified) return null;

  const defaultLabel = isRTL ? 'موثق' : 'Verified';
  const accessibleLabel = ariaLabel ?? defaultLabel;

  if (variant === 'icon') {
    return (
      <CheckCircle
        className={cn(ICON_SIZE[size], 'text-green-500 shrink-0', className)}
        aria-label={accessibleLabel}
      />
    );
  }

  const text = iconOnly ? null : (label ?? defaultLabel);

  if (variant === 'outline') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs border-green-500/50 text-green-600 flex items-center gap-1',
          className,
        )}
        aria-label={accessibleLabel}
      >
        <CheckCircle className={PILL_ICON_SIZE[size]} />
        {text}
      </Badge>
    );
  }

  // solid
  return (
    <Badge
      className={cn(
        'bg-green-600 hover:bg-green-700 text-white flex items-center gap-1',
        className,
      )}
      aria-label={accessibleLabel}
    >
      <CheckCircle className={PILL_ICON_SIZE[size]} />
      {text}
    </Badge>
  );
};

export default VerifiedBadge;
