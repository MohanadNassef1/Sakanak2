import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Users, GraduationCap, Briefcase, Globe, Sparkles, Sun, Moon, Volume2, Users as UsersIcon, BookOpen, Dumbbell, Gamepad2, Music, UtensilsCrossed, Sparkle, Coffee, Plane, House, Heart, PawPrint } from 'lucide-react';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import MatchScoreCircle from '@/components/MatchScoreCircle';
import AvatarLightbox from '@/components/AvatarLightbox';
import { getFacultyLabel, getUniversityLabel, getJobTitleLabel } from '@/lib/professionData';
import { getTagLabel } from '@/lib/personalityTags';

interface HostCardProps {
  host: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    age?: number | null;
    occupation?: string | null;
    university?: string | null;
    faculty?: string | null;
    job_title?: string | null;
    personality_tags?: string[] | null;
    nationality?: string | null;
  };
  userId?: string;
  listerType?: 'landlord' | 'current_tenant' | 'landlord_and_tenant' | null;
  matchScore?: number | null;
  className?: string;
}

const TAG_STYLES: Record<string, { icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  early_bird:    { icon: Sun,             cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' },
  night_owl:     { icon: Moon,            cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30' },
  quiet:         { icon: Volume2,         cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30' },
  social:        { icon: UsersIcon,       cls: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/30' },
  studious:      { icon: BookOpen,        cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30' },
  fitness_lover: { icon: Dumbbell,        cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30' },
  gamer:         { icon: Gamepad2,        cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30' },
  music_lover:   { icon: Music,           cls: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30' },
  pet_lover:     { icon: PawPrint,        cls: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30' },
  foodie:        { icon: UtensilsCrossed, cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30' },
  clean_freak:   { icon: Sparkle,         cls: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30' },
  chill:         { icon: Coffee,          cls: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30' },
  workaholic:    { icon: Briefcase,       cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/30' },
  traveler:      { icon: Plane,           cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30' },
  homebody:      { icon: House,           cls: 'bg-lime-500/10 text-lime-600 dark:text-lime-300 border-lime-500/30' },
  friendly:      { icon: Heart,           cls: 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30' },
};

const HostCard: React.FC<HostCardProps> = ({ host, userId, listerType, matchScore, className }) => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: viewerProfile } = useProfile(user?.id);
  const navigate = useNavigate();

  const isVerified = host.verification_status === 'verified';
  const isLandlord = listerType === 'landlord' || !listerType;
  const isTenant = listerType === 'current_tenant';
  const isLandlordAndTenant = listerType === 'landlord_and_tenant';
  const showTenantDetails = isTenant || isLandlordAndTenant;

  const isSelf = !!user?.id && !!userId && user.id === userId;
  const sameUniversity = !isSelf && !!viewerProfile?.university && !!host.university && viewerProfile.university === host.university;
  const sameFaculty = !isSelf && !!viewerProfile?.faculty && !!host.faculty && viewerProfile.faculty === host.faculty;
  const sameJobTitle = !isSelf && !!viewerProfile?.job_title && !!host.job_title && viewerProfile.job_title === host.job_title;

  const handleClick = () => {
    if (!userId) return;
    if (!user) {
      toast.info(isRTL ? 'يجب تسجيل الدخول أولاً لعرض الملف الشخصي' : 'Please sign in to view this profile');
      navigate('/auth');
      return;
    }
    navigate(`/user/${userId}`);
  };

  return (
    <Card 
      className={`${className} ${userId ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Match score on the right */}
          {matchScore != null && (
            <div className="order-last ml-auto flex flex-col items-center gap-0.5 shrink-0">
              <MatchScoreCircle score={matchScore} size="sm" />
              <span className="text-[10px] text-muted-foreground">{isRTL ? 'توافق' : 'Match'}</span>
            </div>
          )}
          <AvatarLightbox src={host.avatar_url} alt={host.full_name}>
            <Avatar className="w-16 h-16 min-w-[4rem] border-2 border-primary/20">
              <AvatarImage 
                src={host.avatar_url || undefined} 
                alt={host.full_name}
                loading="eager"
              />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {host.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </AvatarLightbox>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{host.full_name}</h3>
              {isVerified && (
                <VerifiedBadge verified size="md" />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              {host.age && (
                <span>{host.age} {isRTL ? 'سنة' : 'years old'}</span>
              )}
              {host.nationality && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {host.nationality}
                </span>
              )}
            </div>

            {/* Occupation/University/Faculty/Job for everyone */}
            {(host.university || host.faculty || host.job_title || host.occupation) && (
              <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                {(host.university || host.faculty) && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {[getFacultyLabel(host.faculty, isRTL), getUniversityLabel(host.university, isRTL)]
                        .filter(Boolean)
                        .join(isRTL ? ' - ' : ' · ')}
                    </span>
                  </div>
                )}
                {!host.university && !host.faculty && (host.job_title || host.occupation) && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {getJobTitleLabel(host.job_title, isRTL) || host.job_title || host.occupation}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant="secondary"
                className={
                  isLandlordAndTenant
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                    : isLandlord
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                }
              >
                {isLandlordAndTenant ? (
                  <>
                    <Home className="w-3 h-3 mr-1" />
                    {isRTL ? 'مالك وساكن' : 'Landlord & Tenant'}
                  </>
                ) : isLandlord ? (
                  <>
                    <Home className="w-3 h-3 mr-1" />
                    {isRTL ? 'مالك' : 'Landlord'}
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    {isRTL ? 'مستأجر حالي' : 'Current Tenant'}
                  </>
                )}
              </Badge>

              {isVerified && (
                <VerifiedBadge variant="outline" />
              )}
            </div>

            {/* Same school / job match badges */}
            {(sameUniversity || sameFaculty || sameJobTitle) && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {sameFaculty && (
                  <Badge className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">
                    <GraduationCap className="w-3 h-3" />
                    {isRTL ? 'نفس الكلية' : 'Same Faculty'}
                  </Badge>
                )}
                {sameUniversity && !sameFaculty && (
                  <Badge className="text-xs gap-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/15">
                    <GraduationCap className="w-3 h-3" />
                    {isRTL ? 'نفس الجامعة' : 'Same University'}
                  </Badge>
                )}
                {sameJobTitle && (
                  <Badge className="text-xs gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15">
                    <Briefcase className="w-3 h-3" />
                    {isRTL ? 'نفس المهنة' : 'Same Job'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Personality Tags for Tenants */}
        {showTenantDetails && host.personality_tags && host.personality_tags.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {isRTL ? 'شخصية الساكن' : 'Roommate Vibe'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {host.personality_tags.slice(0, 5).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {isRTL 
                    ? PERSONALITY_TAG_LABELS[tag]?.ar || tag 
                    : PERSONALITY_TAG_LABELS[tag]?.en || tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HostCard;
