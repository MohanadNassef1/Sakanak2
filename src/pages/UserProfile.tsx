import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getMatchPercentage, getMatchBreakdown } from '@/lib/matchScore';
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
  GraduationCap,
  Home,
  MapPin,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  Users as UsersIcon,
  BookOpen,
  Dumbbell,
  Gamepad2,
  Music,
  UtensilsCrossed,
  Sparkle,
  Coffee,
  Plane,
  House,
  Heart,
} from 'lucide-react';
import RoomCard from '@/components/rooms/RoomCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import AvatarLightbox from '@/components/AvatarLightbox';
import { getFacultyLabel, getUniversityLabel, getJobTitleLabel } from '@/lib/professionData';
import { getTagLabel } from '@/lib/personalityTags';

const TAG_STYLES: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  early_bird:    { icon: Sun,              cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' },
  night_owl:     { icon: Moon,             cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30' },
  quiet:         { icon: Volume2,          cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30' },
  social:        { icon: UsersIcon,        cls: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/30' },
  studious:      { icon: BookOpen,         cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30' },
  fitness_lover: { icon: Dumbbell,         cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' },
  gamer:         { icon: Gamepad2,         cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30' },
  music_lover:   { icon: Music,            cls: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30' },
  pet_lover:     { icon: PawPrint,         cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30' },
  foodie:        { icon: UtensilsCrossed,  cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30' },
  clean_freak:   { icon: Sparkle,          cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30' },
  chill:         { icon: Coffee,           cls: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30' },
  workaholic:    { icon: Briefcase,        cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/30' },
  traveler:      { icon: Plane,            cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30' },
  homebody:      { icon: House,            cls: 'bg-lime-500/10 text-lime-600 dark:text-lime-300 border-lime-500/30' },
  friendly:      { icon: Heart,            cls: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30' },
};





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

  // Show match score for all users
  const matchScore = profile && viewerProfile && userId !== user?.id
    ? getMatchPercentage(
        { age: viewerProfile.age, occupation_status: viewerProfile.occupation_status, university: viewerProfile.university, personality_tags: viewerProfile.personality_tags, is_smoker: viewerProfile.is_smoker, has_pets: viewerProfile.has_pets, nationality: viewerProfile.nationality, looking_for: viewerProfile.looking_for },
        { age: profile.age, occupation: profile.occupation, university: profile.university, is_verified: profile.is_verified, avatar_url: profile.avatar_url, job_title: profile.job_title, personality_tags: profile.personality_tags, is_smoker: profile.is_smoker, has_pets: profile.has_pets, nationality: profile.nationality, looking_for: profile.looking_for }
      )
    : null;
  const matchBreakdown = profile && viewerProfile && userId !== user?.id
    ? getMatchBreakdown(
        { age: viewerProfile.age, occupation_status: viewerProfile.occupation_status, university: viewerProfile.university, personality_tags: viewerProfile.personality_tags, is_smoker: viewerProfile.is_smoker, has_pets: viewerProfile.has_pets, nationality: viewerProfile.nationality, looking_for: viewerProfile.looking_for },
        { age: profile.age, occupation: profile.occupation, university: profile.university, is_verified: profile.is_verified, avatar_url: profile.avatar_url, job_title: profile.job_title, personality_tags: profile.personality_tags, is_smoker: profile.is_smoker, has_pets: profile.has_pets, nationality: profile.nationality, looking_for: profile.looking_for }
      )
    : undefined;

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
          <Card className="overflow-hidden mb-6 border-primary/10 shadow-lg">
            {/* Decorative cover band */}
            <div className="relative h-32 bg-gradient-to-br from-primary/30 via-primary/15 to-accent/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
            </div>

            <div className="px-6 md:px-8 pb-8 -mt-16">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar */}
                <AvatarLightbox src={profile.avatar_url} alt={profile.full_name}>
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-full bg-card ring-4 ring-background shadow-xl overflow-hidden flex items-center justify-center text-4xl font-bold text-primary">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: 'center 20%' }}
                        />
                      ) : (
                        profile.full_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {profile.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-md">
                        <CheckCircle className="w-7 h-7 text-green-500 fill-background" />
                      </div>
                    )}
                  </div>
                </AvatarLightbox>

                {/* Info */}
                <div className="flex-1 text-center md:text-left pt-2 md:pb-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold tracking-tight">{profile.full_name}</h1>
                    <VerifiedBadge verified={profile.is_verified} variant="solid" />
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    {profile.age && (
                      <span>{profile.age} {isRTL ? 'سنة' : 'years old'}</span>
                    )}
                    {(profile.university || profile.faculty) && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        {[getFacultyLabel(profile.faculty, isRTL), getUniversityLabel(profile.university, isRTL)]
                          .filter(Boolean)
                          .join(isRTL ? ' - ' : ' · ')}
                      </span>
                    )}
                    {(profile.job_title || profile.occupation) && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {getJobTitleLabel(profile.job_title, isRTL) || profile.job_title || profile.occupation}
                      </span>
                    )}
                    {profile.nationality && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        {profile.nationality}
                      </span>
                    )}
                    {(profile.interested_area_1 || profile.interested_area_2) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {[profile.interested_area_1, profile.interested_area_2].filter(Boolean).join(isRTL ? '، ' : ', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score - inside header */}
                {matchScore !== null && (
                  <div className="flex flex-col items-center gap-1 shrink-0 md:pb-2">
                    <MatchScoreCircle score={matchScore} size="lg" breakdown={matchBreakdown} showLabel />
                  </div>
                )}
              </div>

              {/* Same-school / same-job match badges */}
              {viewerProfile && userId !== user?.id && (
                ((viewerProfile.university && profile.university && viewerProfile.university === profile.university) ||
                (viewerProfile.faculty && profile.faculty && viewerProfile.faculty === profile.faculty) ||
                (viewerProfile.job_title && profile.job_title && viewerProfile.job_title === profile.job_title)) && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-5">
                    {viewerProfile.university && profile.university && viewerProfile.university === profile.university && (
                      <Badge className="gap-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15">
                        <GraduationCap className="w-3 h-3" />
                        {isRTL ? 'نفس الجامعة' : 'Same University'}
                      </Badge>
                    )}
                    {viewerProfile.faculty && profile.faculty && viewerProfile.faculty === profile.faculty && (
                      <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15">
                        <GraduationCap className="w-3 h-3" />
                        {isRTL ? 'نفس الكلية' : 'Same Faculty'}
                      </Badge>
                    )}
                    {viewerProfile.job_title && profile.job_title && viewerProfile.job_title === profile.job_title && (
                      <Badge className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/15">
                        <Briefcase className="w-3 h-3" />
                        {isRTL ? 'نفس المهنة' : 'Same Job Title'}
                      </Badge>
                    )}
                  </div>
                )
              )}

              {/* Lifestyle badge cards */}
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center ${
                  profile.gender === 'male'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
                    : 'bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300'
                }`}>
                  <User className="w-5 h-5" />
                  <span className="text-xs font-semibold">
                    {profile.gender === 'male'
                      ? (isRTL ? 'ذكر' : 'Male')
                      : (isRTL ? 'أنثى' : 'Female')}
                  </span>
                </div>

                <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center ${
                  profile.is_smoker
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <Cigarette className="w-5 h-5" />
                  <span className="text-xs font-semibold">
                    {profile.is_smoker
                      ? (isRTL ? 'مدخن' : 'Smoker')
                      : (isRTL ? 'غير مدخن' : 'Non-smoker')}
                  </span>
                </div>

                <div className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center ${
                  profile.has_pets
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300'
                    : 'bg-muted/40 border-border text-muted-foreground'
                }`}>
                  <PawPrint className="w-5 h-5" />
                  <span className="text-xs font-semibold truncate max-w-full">
                    {profile.has_pets
                      ? (profile.pet_type || (isRTL ? 'لديه حيوانات' : 'Has pets'))
                      : (isRTL ? 'لا يوجد حيوانات' : 'No pets')}
                  </span>
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
            <Card className="mt-6 overflow-hidden border-primary/10">
              <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold leading-tight">
                        {isRTL ? 'شخصية الساكن' : 'Personality & Vibe'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'كيف يصف نفسه' : 'How they describe themselves'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.personality_tags.map((tag: string, idx: number) => {
                      const style = TAG_STYLES[tag];
                      const Icon = style?.icon ?? Sparkles;
                      const cls = style?.cls ?? 'bg-muted text-foreground border-border';
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${cls}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {getTagLabel(tag, isRTL)}
                        </span>
                      );
                    })}
                  </div>
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
