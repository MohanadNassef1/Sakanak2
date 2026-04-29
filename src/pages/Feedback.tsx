import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Sparkles, History, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Feedback: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Pre-fill name & email for logged-in users
  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? '');
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.full_name) setName(data.full_name);
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(isArabic ? 'من فضلك اختر تقييم من 1 إلى 10' : 'Please pick a rating from 1 to 10');
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error(isArabic ? 'الاسم والبريد الإلكتروني مطلوبان' : 'Name and email are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: name.trim(),
          email: email.trim(),
          subject: `Beta Feedback — ${rating}/10`,
          message: reason.trim() || (isArabic ? '(لم يكتب المستخدم سببًا)' : '(No reason provided)'),
          rating,
        },
      });

      if (error) throw error;

      toast.success(
        isArabic
          ? '🙌 شكرًا! وصلتنا ملاحظاتك وسنقرأها بعناية.'
          : '🙌 Thanks! Your feedback is in — we read every single one.'
      );
      setRating(0);
      setReason('');
      if (user) {
        setTimeout(() => navigate('/my-feedback'), 1200);
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabel = (n: number) => {
    if (n === 0) return isArabic ? 'لم تختر بعد' : 'Not rated yet';
    if (n <= 3) return isArabic ? '😕 محتاج تحسين كبير' : '😕 Needs a lot of work';
    if (n <= 5) return isArabic ? '😐 لا بأس' : '😐 It\'s okay';
    if (n <= 7) return isArabic ? '🙂 كويس' : '🙂 Good';
    if (n <= 9) return isArabic ? '😄 ممتاز' : '😄 Great';
    return isArabic ? '🤩 أحببته!' : '🤩 Loving it!';
  };

  return (
    <MainLayout>
      <SEOHead
        title={isArabic ? 'قيّم سكنك - شاركنا رأيك' : 'Rate Sakanak — Share Your Feedback'}
        description={isArabic ? 'قيّم تجربتك في سكنك من 1 إلى 10 وساعدنا نطوّر النسخة التجريبية.' : 'Rate your Sakanak experience 1–10 and help us improve our beta.'}
        canonicalPath="/feedback"
      />
      <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {isArabic ? 'النسخة التجريبية' : 'Beta'}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {isArabic ? 'قيّم تجربتك في سكنك' : 'Rate your Sakanak experience'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isArabic
                ? 'سكنك مجاني لفترة محدودة — رأيك يساعدنا نبنيه صح.'
                : 'Sakanak is free for a limited time — your honest rating helps us build it right.'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                {isArabic ? 'كم تقيّم سكنك من 10؟' : 'How would you rate Sakanak out of 10?'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'السبب اختياري — لكن لو شاركتنا رأيك ده يساعدنا أكتر.' : 'The reason is optional — but sharing it helps us a lot more.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1-10 rating */}
                <div className="space-y-3">
                  <Label>
                    {isArabic ? 'تقييمك' : 'Your rating'}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-10 gap-1.5" dir="ltr">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                      const isActive = n <= (hoverRating || rating);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`aspect-square rounded-md font-semibold text-sm transition-all border ${
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary scale-105'
                              : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                          }`}
                          aria-label={`Rate ${n} out of 10`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{isArabic ? 'سيء جدًا' : 'Terrible'}</span>
                    <span className="font-medium text-foreground">
                      {ratingLabel(hoverRating || rating)}
                    </span>
                    <span>{isArabic ? 'ممتاز' : 'Excellent'}</span>
                  </div>
                </div>

                {/* Optional reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    {isArabic ? 'السبب' : 'Reason'}{' '}
                    <span className="text-muted-foreground text-xs font-normal">
                      ({isArabic ? 'اختياري' : 'optional'})
                    </span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      isArabic
                        ? 'إيه اللي عجبك؟ إيه اللي تحب نطوّره؟'
                        : 'What did you love? What should we improve?'
                    }
                    rows={5}
                    maxLength={2000}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {reason.length}/2000
                  </div>
                </div>

                {/* Name + Email (auto-filled if logged in, but editable) */}
                {!user && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fb-name">
                        {isArabic ? 'الاسم' : 'Name'} <span className="text-destructive">*</span>
                      </Label>
                      <input
                        id="fb-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={100}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={isArabic ? 'اسمك' : 'Your name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fb-email">
                        {isArabic ? 'البريد الإلكتروني' : 'Email'}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <input
                        id="fb-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={255}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={isArabic ? 'بريدك' : 'you@example.com'}
                      />
                    </div>
                  </div>
                )}
                {user && (
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
                    {isArabic ? 'سترسل ملاحظاتك من:' : 'Sending feedback as:'}{' '}
                    <span className="font-medium text-foreground">{name || user.email}</span>{' '}
                    <span className="text-muted-foreground">({email})</span>
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting
                    ? isArabic
                      ? 'جاري الإرسال...'
                      : 'Sending...'
                    : isArabic
                    ? 'إرسال الملاحظات'
                    : 'Send feedback'}
                </Button>

                {user && (
                  <Link
                    to="/my-feedback"
                    className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <History className="w-4 h-4" />
                    {isArabic ? 'عرض ملاحظاتي السابقة' : 'View my past feedback'}
                  </Link>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {isArabic
              ? 'ملاحظاتك خاصة — يراها فريق سكنك فقط، ولن تظهر علنًا.'
              : 'Your feedback is private — only the Sakanak team can see it. Nothing is shown publicly.'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Feedback;
