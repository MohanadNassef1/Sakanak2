import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  attachmentUrl: string;
  className?: string;
  alt?: string;
}

// Extract a storage path from either a stored path or a legacy public URL.
function extractPath(value: string): string {
  if (!value) return value;
  const marker = '/support-attachments/';
  const idx = value.indexOf(marker);
  if (idx >= 0) return value.slice(idx + marker.length);
  return value;
}

export function SupportAttachmentImage({ attachmentUrl, className, alt = 'attachment' }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = extractPath(attachmentUrl);
    supabase.storage
      .from('support-attachments')
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) setSignedUrl(data.signedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [attachmentUrl]);

  if (!signedUrl) {
    return <div className={className} style={{ minHeight: 80 }} />;
  }

  return (
    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
      <img src={signedUrl} alt={alt} className={className} />
    </a>
  );
}
