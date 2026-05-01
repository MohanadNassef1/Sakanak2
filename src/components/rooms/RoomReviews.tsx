import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoomReviews, useCanReview, useCreateReview, useDeleteReview } from '@/hooks/useRoomReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AvatarLightbox from '@/components/AvatarLightbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface RoomReviewsProps {
  roomId: string;
}

const StarRating: React.FC<{ rating: number; onRate?: (r: number) => void; size?: 'sm' | 'md' }> = ({ rating, onRate, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onRate?.(i)}
          disabled={!onRate}
          className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star className={`${sz} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
};

const RoomReviews: React.FC<RoomReviewsProps> = ({ roomId }) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: reviews, isLoading } = useRoomReviews(roomId);
  const { data: canReviewData } = useCanReview(roomId);
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (newRating === 0) {
      toast.error(isRTL ? 'يرجى اختيار تقييم' : 'Please select a rating');
      return;
    }
    if (!canReviewData?.viewingId) return;

    try {
      await createReview.mutateAsync({
        roomId,
        viewingRequestId: canReviewData.viewingId,
        rating: newRating,
        comment: newComment.trim() || undefined,
      });
      toast.success(isRTL ? 'تم إضافة التقييم بنجاح' : 'Review submitted successfully');
      setNewRating(0);
      setNewComment('');
      setShowForm(false);
    } catch {
      toast.error(isRTL ? 'فشل إرسال التقييم' : 'Failed to submit review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync({ reviewId, roomId });
      toast.success(isRTL ? 'تم حذف التقييم' : 'Review deleted');
    } catch {
      toast.error(isRTL ? 'فشل حذف التقييم' : 'Failed to delete review');
    }
  };

  const avgRating = reviews && reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          {isRTL ? 'التقييمات' : 'Reviews'}
          {reviews && reviews.length > 0 && (
            <span className="text-base font-normal text-muted-foreground">
              ({avgRating} • {reviews.length} {isRTL ? 'تقييم' : reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </h2>

        {canReviewData?.canReview && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Star className="w-4 h-4 mr-1" />
            {isRTL ? 'أضف تقييم' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && canReviewData?.canReview && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">{isRTL ? 'تقييمك' : 'Your Rating'}</p>
              <StarRating rating={newRating} onRate={setNewRating} />
            </div>
            <Textarea
              placeholder={isRTL ? 'شاركنا تجربتك (اختياري)...' : 'Share your experience (optional)...'}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createReview.isPending || newRating === 0} size="sm">
                {createReview.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {isRTL ? 'إرسال' : 'Submit'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewRating(0); setNewComment(''); }}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AvatarLightbox src={review.reviewer?.avatar_url} alt={review.reviewer?.full_name || ''}>
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={review.reviewer?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {review.reviewer?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </AvatarLightbox>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.reviewer?.full_name}</span>
                      <VerifiedBadge verified={review.reviewer?.verification_status === 'verified'} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      {user?.id === review.reviewer_id && (
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                          title={isRTL ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
        </p>
      )}
    </div>
  );
};

export default RoomReviews;
