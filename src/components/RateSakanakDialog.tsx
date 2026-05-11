import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RateSakanakDialogProps {
  trigger: React.ReactNode;
}

const RateSakanakDialog: React.FC<RateSakanakDialogProps> = ({ trigger }) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setRating(null);
    setHover(null);
    setReason('');
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.error(isRTL ? 'الرجاء اختيار تقييم من 1 إلى 5' : 'Please select a rating from 1 to 5');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('site_ratings').insert({
      rating,
      reason: reason.trim() || null,
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      user_name: profile?.full_name ?? null,
    });
    setSubmitting(false);

    if (error) {
      toast.error(isRTL ? 'تعذر إرسال التقييم' : 'Could not submit your rating');
      return;
    }

    setSubmitted(true);
    toast.success(isRTL ? 'شكراً لتقييمك! 💚' : 'Thanks for rating us! 💚');
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const display = hover ?? rating ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <Heart className="w-14 h-14 mx-auto text-primary fill-primary" />
            <h3 className="text-xl font-bold">
              {isRTL ? 'شكراً لك!' : 'Thank you!'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? 'تقييمك يساعدنا نطور سكنك ليكون أفضل لكل المستخدمين.'
                : 'Your feedback helps us make Sakanak better for everyone.'}
            </p>
            <Button onClick={() => setOpen(false)} className="mt-4">
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'قيّم سكنك' : 'Rate Sakanak'}
              </DialogTitle>
              <DialogDescription className={isRTL ? 'text-right' : ''}>
                {isRTL
                  ? 'كيف تقيّم تجربتك مع سكنك من 1 إلى 5؟'
                  : 'How would you rate your experience with Sakanak from 1 to 5?'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Stars 1-10 */}
              <div className="flex items-center justify-center gap-1 flex-wrap" dir="ltr">
                {stars.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} of 5`}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    <Star
                      className={cn(
                        'w-9 h-9 transition-colors',
                        n <= display
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/40'
                      )}
                    />
                  </button>
                ))}
              </div>

              <p className="text-center text-sm font-medium">
                {display > 0 ? (
                  <span className="text-primary">
                    {display} / 10
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {isRTL ? 'اختر تقييم' : 'Pick a score'}
                  </span>
                )}
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? 'سبب تقييمك (اختياري)' : 'Reason (optional)'}
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    isRTL
                      ? 'شاركنا رأيك أو اقتراحاتك...'
                      : 'Share what we did well, or what we can improve...'
                  }
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-end">
                  {reason.length}/1000
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !rating}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  isRTL ? 'إرسال التقييم' : 'Submit rating'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RateSakanakDialog;
