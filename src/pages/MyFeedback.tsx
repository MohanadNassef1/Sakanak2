import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageCircle, Plus, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  rating: number | null;
  created_at: string;
  is_read: boolean;
}

const MyFeedback: React.FC = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const isArabic = language === 'ar';
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('id, name, email, subject, message, rating, created_at, is_read')
        .eq('email', user.email)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Failed to load feedback:', error);
      } else {
        setItems((data ?? []) as FeedbackRow[]);
      }
      setLoading(false);
    };
    load();
  }, [user?.email]);

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const renderRating = (rating: number | null) => {
    if (rating == null) return null;
    const colorClass =
      rating >= 8
        ? 'text-green-600 dark:text-green-400 bg-green-500/15'
        : rating >= 5
        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15'
        : 'text-red-600 dark:text-red-400 bg-red-500/15';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}
      >
        <Star className="w-3.5 h-3.5 fill-current" />
        {rating}/10
      </span>
    );
  };

  return (
    <MainLayout>
      <SEOHead
        title={isArabic ? 'ملاحظاتي - سكنك' : 'My Feedback - Sakanak'}
        description={isArabic ? 'سجل الملاحظات التي أرسلتها لفريق سكنك' : 'Your past feedback submissions to the Sakanak team'}
        canonicalPath="/my-feedback"
      />
      <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isArabic ? 'ملاحظاتي' : 'My Feedback'}
              </h1>
              <p className="text-muted-foreground">
                {isArabic
                  ? 'كل الملاحظات التي أرسلتها لفريق سكنك. الفريق فقط يرى محتواها.'
                  : 'All feedback you have submitted. Only the Sakanak team can see its contents.'}
              </p>
            </div>
            <Button asChild>
              <Link to="/contact?type=feedback">
                <Plus className="w-4 h-4 mr-1.5" />
                {isArabic ? 'إرسال ملاحظة جديدة' : 'New feedback'}
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="font-semibold mb-2">
                  {isArabic ? 'لم ترسل أي ملاحظات بعد' : 'No feedback yet'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {isArabic
                    ? 'شاركنا رأيك في النسخة التجريبية لنطوّر التجربة.'
                    : 'Share your thoughts on the beta to help us improve.'}
                </p>
                <Button asChild>
                  <Link to="/contact?type=feedback">
                    {isArabic ? 'إرسال ملاحظة' : 'Send feedback'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const safeMessage = DOMPurify.sanitize(item.message, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
                const safeSubject = DOMPurify.sanitize(item.subject, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
                const isFeedback = item.subject.toLowerCase().includes('feedback');
                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                            <span className="truncate">{safeSubject}</span>
                            {isFeedback && (
                              <Badge variant="secondary" className="text-xs">
                                {isArabic ? 'ملاحظات Beta' : 'Beta Feedback'}
                              </Badge>
                            )}
                            {item.is_read && (
                              <Badge variant="outline" className="text-xs">
                                {isArabic ? 'تم القراءة' : 'Read by team'}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs">
                            <Clock className="w-3 h-3" />
                            {format(new Date(item.created_at), 'PPP, HH:mm')}
                          </CardDescription>
                        </div>
                        {renderStars(item.rating)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/40 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                          {safeMessage}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyFeedback;
