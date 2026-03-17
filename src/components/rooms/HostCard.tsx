import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Home, Users, GraduationCap, Briefcase, Globe } from 'lucide-react';
import MatchScoreCircle from '@/components/MatchScoreCircle';

interface HostCardProps {
  host: {
    full_name: string;
    avatar_url: string | null;
    verification_status: string;
    age?: number | null;
    occupation?: string | null;
    university?: string | null;
    personality_tags?: string[] | null;
    nationality?: string | null;
  };
  userId?: string;
  listerType?: 'landlord' | 'current_tenant' | 'landlord_and_tenant' | null;
  matchScore?: number | null;
  className?: string;
}

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

const HostCard: React.FC<HostCardProps> = ({ host, userId, listerType, matchScore, className }) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const isVerified = host.verification_status === 'verified';
  const isLandlord = listerType === 'landlord' || !listerType;
  const isTenant = listerType === 'current_tenant';
  const isLandlordAndTenant = listerType === 'landlord_and_tenant';
  const showTenantDetails = isTenant || isLandlordAndTenant;

  const handleClick = () => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{host.full_name}</h3>
              {isVerified && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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

            {/* Occupation/University for Tenants or Landlord+Tenant */}
            {showTenantDetails && (host.occupation || host.university) && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                {host.university ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{host.university}</span>
                  </>
                ) : host.occupation ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{host.occupation}</span>
                  </>
                ) : null}
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
                    {isRTL ? 'مالك ومستأجر' : 'Landlord & Tenant'}
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
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {isRTL ? 'موثق' : 'Verified'}
                </Badge>
              )}
            </div>
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
