import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { calculateMatchScore } from '@/lib/matchScore';
import MatchScoreCircle from '@/components/MatchScoreCircle';
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
  Home,
  Sparkles,
} from 'lucide-react';
import RoomCard from '@/components/rooms/RoomCard';

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

function calculateMatchScore(
  viewer: { age?: number | null; occupation_status?: string | null; university?: string | null },
  profile: { age?: number | null; occupation?: string | null; university?: string | null; is_verified: boolean; avatar_url?: string | null; job_title?: string | null }
): { score: number; breakdown: { key: string; points: number; maxPoints: number; met: boolean }[] } {
  const breakdown: { key: string; points: number; maxPoints: number; met: boolean }[] = [];
  let total = 0;

  // 1. University match (3 pts) or Student (2 pts)
  const sameUni = viewer.university && profile.university && 
    viewer.university.toLowerCase().trim() === profile.university.toLowerCase().trim();
  const isStudent = viewer.occupation_status === 'student';
  if (sameUni) {
    total += 3;
    breakdown.push({ key: 'university', points: 3, maxPoints: 3, met: true });
  } else if (isStudent) {
    total += 2;
    breakdown.push({ key: 'student', points: 2, maxPoints: 3, met: true });
  } else {
    breakdown.push({ key: 'university', points: 0, maxPoints: 3, met: false });
  }

  // 2. Age within 5 years (3 pts)
  const ageClose = viewer.age && profile.age && Math.abs(viewer.age - profile.age) <= 5;
  if (ageClose) {
    total += 3;
  }
  breakdown.push({ key: 'age', points: ageClose ? 3 : 0, maxPoints: 3, met: !!ageClose });

  // 3. Working / has job (3 pts) - check if profile user is working
  const isWorking = !!(profile.occupation || profile.job_title);
  if (isWorking) {
    total += 3;
  }
  breakdown.push({ key: 'working', points: isWorking ? 3 : 0, maxPoints: 3, met: isWorking });

  // 4. Verified (3 pts)
  if (profile.is_verified) {
    total += 3;
  }
  breakdown.push({ key: 'verified', points: profile.is_verified ? 3 : 0, maxPoints: 3, met: profile.is_verified });

  // 5. Profile photo (2 pts)
  const hasPhoto = !!profile.avatar_url;
  if (hasPhoto) {
    total += 2;
  }
  breakdown.push({ key: 'photo', points: hasPhoto ? 2 : 0, maxPoints: 2, met: hasPhoto });

  // Scale: total out of max possible (14 theoretical, but cap at 10 → percentage)
  const maxPoints = 3 + 3 + 3 + 3 + 2; // 14
  const score = Math.min(Math.round((total / 10) * 100), 100);

  return { score, breakdown };
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: viewerProfile } = useProfile(user?.id);

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

  const { data: userRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['userRooms', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', userId)
        .in('status', ['active', 'rented'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Calculate match score
  const matchData = profile && viewerProfile && userId !== user?.id
    ? calculateMatchScore(
        { age: viewerProfile.age, occupation_status: viewerProfile.occupation_status, university: viewerProfile.university },
        { age: profile.age, occupation: profile.occupation, university: profile.university, is_verified: profile.is_verified, avatar_url: profile.avatar_url, job_title: profile.job_title }
      )
    : null;

  const breakdownLabels: Record<string, { en: string; ar: string }> = {
    university: { en: 'Same University', ar: 'نفس الجامعة' },
    student: { en: 'Student', ar: 'طالب' },
    age: { en: 'Similar Age', ar: 'عمر متقارب' },
    working: { en: 'Working', ar: 'يعمل' },
    verified: { en: 'Verified', ar: 'موثق' },
    photo: { en: 'Profile Photo', ar: 'صورة شخصية' },
  };

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
                      <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1">
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

          {/* Match Score Card */}
          {matchData && (
            <Card className="mb-6 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold">
                    {isRTL ? 'نسبة التوافق' : 'Match Score'}
                  </h2>
                  <span className="ml-auto text-2xl font-bold text-green-600 dark:text-green-400">
                    {matchData.score}%
                  </span>
                </div>
                <Progress value={matchData.score} className="h-3 mb-4 [&>div]:bg-green-500" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {matchData.breakdown.map((item) => (
                    <div
                      key={item.key}
                      className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                        item.met 
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${item.met ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                      <span>{isRTL ? breakdownLabels[item.key]?.ar : breakdownLabels[item.key]?.en}</span>
                      <span className="ml-auto text-xs font-medium">{item.points}/{item.maxPoints}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* User's Rooms */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                {isRTL ? 'غرف على سكنك' : 'Rooms on Sakanak'}
              </h2>
              {roomsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </div>
              ) : userRooms && userRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRooms.map((room) => (
                    <RoomCard key={room.id} room={room as any} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {isRTL ? 'لا توجد غرف حالياً' : 'No rooms listed yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
