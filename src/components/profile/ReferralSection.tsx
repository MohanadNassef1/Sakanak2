import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Gift, Copy, Share2, Loader2, CheckCircle, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReferralSectionProps {
  profile: {
    referral_code?: string | null;
    referral_count?: number;
    full_name: string;
  };
  userId: string;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ profile, userId }) => {
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      // Call the database function to generate a unique code
      const { data: newCode, error: rpcError } = await supabase.rpc('generate_referral_code', {
        p_full_name: profile.full_name
      });

      if (rpcError) throw rpcError;

      // Update the profile with the new code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: newCode })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Refresh the profile data
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast.success(isRTL ? 'تم إنشاء كود الإحالة بنجاح!' : 'Referral code generated successfully!');
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast.error(isRTL ? 'فشل في إنشاء الكود' : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    if (profile.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success(isRTL ? 'تم نسخ الكود!' : 'Code copied!');
    }
  };

  const shareLink = () => {
    const link = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    if (navigator.share) {
      navigator.share({
        title: isRTL ? 'انضم إلى Sakanak' : 'Join Sakanak',
        text: isRTL 
          ? 'استخدم كود الإحالة الخاص بي للتسجيل في Sakanak!' 
          : 'Use my referral code to sign up on Sakanak!',
        url: link,
      }).catch(() => {
        navigator.clipboard.writeText(link);
        toast.success(isRTL ? 'تم نسخ الرابط!' : 'Link copied!');
      });
    } else {
      navigator.clipboard.writeText(link);
      toast.success(isRTL ? 'تم نسخ الرابط!' : 'Link copied!');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            {isRTL ? 'برنامج الإحالة' : 'Referral Program'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'شارك كود الإحالة الخاص بك مع أصدقائك وتتبع تسجيلاتهم'
              : 'Share your referral code with friends and track their signups'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.referral_code ? (
            <>
              {/* Code Display */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRTL ? 'كود الإحالة الخاص بك' : 'Your Referral Code'}
                </label>
                <div className="flex gap-2">
                  <Input
                    value={profile.referral_code}
                    readOnly
                    className="font-mono text-lg font-bold text-center bg-muted"
                  />
                  <Button variant="outline" size="icon" onClick={copyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareLink}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
                      <Users className="w-6 h-6" />
                      {profile.referral_count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL ? 'إجمالي الإحالات' : 'Total Referrals'}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        {isRTL ? 'كيفية المشاركة' : 'How to Share'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? 'شارك الكود أو الرابط مع أصدقائك. عندما يسجلون باستخدام كودك، ستزيد إحالاتك!'
                        : 'Share the code or link with friends. When they sign up using your code, your referrals increase!'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? 'ليس لديك كود إحالة بعد' : "You don't have a referral code yet"}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {isRTL 
                  ? 'أنشئ كود الإحالة الخاص بك لبدء دعوة الأصدقاء'
                  : 'Generate your referral code to start inviting friends'}
              </p>
              <Button onClick={generateCode} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    {isRTL ? 'إنشاء كود الإحالة' : 'Generate Referral Code'}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSection;
