import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Briefcase,
  Cigarette,
  PawPrint,
  CheckCircle,
  Globe,
  ArrowLeft,
  Calendar,
  GraduationCap,
} from 'lucide-react';

const PERSONALITY_TAG_LABELS: Record<string, { en: string; ar: string }> = {
  calm: { en: 'Calm', ar: 'هادئ' },
  social: { en: 'Social', ar: 'اجتماعي' },
  studious: { en: 'Studious', ar: 'مجتهد' },
  night_owl: { en: 'Night Owl', ar: 'سهران' },
  early_bird: { en: 'Early Bird', ar: 'صباحي' },
  clean: { en: 'Clean & Tidy', ar: 'نظيف ومرتب' },
  friendly: { en: 'Friendly', ar: 'ودود' },
  private: { en: 'Private', ar: 'يفضل الخصوصية' },
};

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID');
      const { data, error } = await supabase.rpc('get_room_owner_public_info', {
        _owner_id: userId,
      });
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Profile not found');
      return data[0];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 rounded-2xl mb-6" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">
              {isRTL ? 'الملف الشخصي غير موجود' : 'Profile Not Found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isRTL ? 'لا يمكن العثور على هذا المستخدم' : 'This user could not be found'}
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isRTL ? 'رجوع' : 'Go Back'}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'رجوع' : 'Go Back'}
          </Button>

          {/* Profile Header */}
          <Card className="overflow-hidden mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.full_name?.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    {profile.is_verified && (
                      <Badge className="bg-primary text-primary-foreground gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {isRTL ? 'موثق' : 'Verified'}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                    {profile.age && (
                      <span>{profile.age} {isRTL ? 'سنة' : 'years old'}</span>
                    )}
                    {profile.occupation && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {profile.occupation}
                      </span>
                    )}
                    {profile.university && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        {profile.university}
                      </span>
                    )}
                    {profile.nationality && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        {profile.nationality}
                      </span>
                    )}
                  </div>

                  {/* Lifestyle Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge variant="outline" className="gap-1">
                      <User className="w-3 h-3" />
                      {profile.gender === 'male' 
                        ? (isRTL ? 'ذكر' : 'Male') 
                        : (isRTL ? 'أنثى' : 'Female')}
                    </Badge>
                    <Badge
                      variant={profile.is_smoker ? 'destructive' : 'secondary'}
                      className="gap-1"
                    >
                      <Cigarette className="w-3 h-3" />
                      {profile.is_smoker 
                        ? (isRTL ? 'مدخن' : 'Smoker') 
                        : (isRTL ? 'غير مدخن' : 'Non-smoker')}
                    </Badge>
                    {profile.has_pets && (
                      <Badge variant="secondary" className="gap-1">
                        <PawPrint className="w-3 h-3" />
                        {profile.pet_type || (isRTL ? 'لديه حيوانات' : 'Has pets')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.about && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {isRTL ? 'نبذة' : 'About'}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {profile.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {profile.looking_for && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-3">
                    {isRTL ? 'يبحث عن' : 'Looking For'}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {profile.looking_for}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Personality Tags */}
          {profile.personality_tags && profile.personality_tags.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">
                  {isRTL ? 'شخصية الساكن' : 'Personality & Vibe'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.personality_tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {isRTL
                        ? PERSONALITY_TAG_LABELS[tag]?.ar || tag
                        : PERSONALITY_TAG_LABELS[tag]?.en || tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.job_title && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">
                  {isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                </h2>
                <p className="text-muted-foreground">{profile.job_title}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
