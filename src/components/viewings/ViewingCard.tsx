import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { getMatchPercentage, getMatchBreakdown } from '@/lib/matchScore';
import MatchScoreCircle from '@/components/MatchScoreCircle';
import { ViewingRequest, VIEWING_STATUS_LABELS, VIEWING_STATUS_LABELS_AR } from '@/types/viewing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, Clock, MapPin, Check, X, MessageSquare, 
  RefreshCw, Home, AlertTriangle, MessageCircle,
  GraduationCap, Briefcase, Sparkles, Globe
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ViewingChat from './ViewingChat';

const PERSONALITY_TAG_LABELS: Record<string, { en: string; ar: string }> = {
  calm: { en: 'Calm', ar: 'هادئ' },
  social: { en: 'Social', ar: 'اجتماعي' },
  studious: { en: 'Studious', ar: 'مجتهد' },
  night_owl: { en: 'Night Owl', ar: 'سهران' },
  early_bird: { en: 'Early Bird', ar: 'صباحي' },
  clean: { en: 'Clean & Tidy', ar: 'نظيف ومرتب' },
  friendly: { en: 'Friendly', ar: 'ودود' },
  private: { en: 'Private', ar: 'يفضل الخصوصية' },
  organized: { en: 'Organized', ar: 'منظم' },
  creative: { en: 'Creative', ar: 'مبدع' },
};

interface ViewingCardProps {
  viewing: ViewingRequest;
  role: 'tenant' | 'landlord';
  hasConfirmedForRoom?: boolean;
  queuePosition?: number;
  onConfirm?: () => void;
  onCounterPropose?: () => void;
  onCancel?: () => void;
  onAcceptCounter?: () => void;
  onConfirmRental?: () => void;
  onDecline?: () => void;
  onShareLocation?: () => void;
  onMarkCompleted?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  counter_proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  rental_confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export const ViewingCard: React.FC<ViewingCardProps> = ({
  viewing,
  role,
  hasConfirmedForRoom = false,
  queuePosition,
  onConfirm,
  onCounterPropose,
  onCancel,
  onAcceptCounter,
  onConfirmRental,
  onDecline,
  onShareLocation,
  onMarkCompleted,
}) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: viewerProfile } = useProfile(user?.id);
  const [showChat, setShowChat] = useState(false);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr?.substring(0, 5) || timeStr;
  };

  const otherUser = role === 'tenant' ? viewing.landlord : viewing.tenant;
  const room = viewing.room;

  const showConfirmedTime = viewing.confirmed_date && viewing.confirmed_time;
  const showCounterTime = viewing.status === 'counter_proposed' && viewing.counter_proposed_date;

  const statusLabels = isRTL ? VIEWING_STATUS_LABELS_AR : VIEWING_STATUS_LABELS;
  const roomPhoto = room?.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
  
  // Chat is only unlocked when viewing is confirmed, completed, or rental_confirmed
  const isChatUnlocked = ['counter_proposed', 'confirmed', 'completed', 'rental_confirmed'].includes(viewing.status);
  const otherUserId = role === 'tenant' ? viewing.landlord_id : viewing.tenant_id;

  // Calculate match score only for current_tenant listings
  const isCurrentTenant = room?.lister_type === 'current_tenant';
  const viewerData = viewerProfile ? { age: viewerProfile.age, occupation_status: viewerProfile.occupation_status, university: viewerProfile.university, personality_tags: viewerProfile.personality_tags, is_smoker: viewerProfile.is_smoker, has_pets: viewerProfile.has_pets, nationality: viewerProfile.nationality, looking_for: viewerProfile.looking_for } : null;
  const profileData = otherUser ? { age: otherUser.age, occupation: otherUser.occupation, university: otherUser.university, avatar_url: otherUser.avatar_url, job_title: otherUser.job_title, verification_status: otherUser.verification_status, personality_tags: otherUser.personality_tags, is_smoker: otherUser.is_smoker, has_pets: otherUser.has_pets, nationality: otherUser.nationality, looking_for: (otherUser as any).looking_for } : null;
  const matchScore = isCurrentTenant && viewerData && profileData ? getMatchPercentage(viewerData, profileData) : null;
  const matchBreakdown = isCurrentTenant && viewerData && profileData ? getMatchBreakdown(viewerData, profileData) : undefined;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Room Photo Banner */}
      {room && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={roomPhoto}
            alt={room.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Queue Position Badge */}
          {queuePosition && role === 'landlord' && (
            <div className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
              #{queuePosition}
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="text-white">
              <p className="font-semibold text-sm line-clamp-1">{room.title}</p>
              <p className="text-xs opacity-90">{room.area ? `${room.area}, ` : ''}{room.city}</p>
            </div>
            {room.price_per_month && (
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                EGP {room.price_per_month.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <Link to={`/user/${otherUserId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarImage src={otherUser?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {otherUser?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base hover:text-primary transition-colors">
                  {otherUser?.full_name || t('common.unknown')}
                </CardTitle>
                {matchScore !== null && (
                  <MatchScoreCircle score={matchScore} size="sm" breakdown={matchBreakdown} />
                )}
                {otherUser?.age && (
                  <span className="text-sm text-muted-foreground">
                    {otherUser.age} {isRTL ? 'سنة' : 'y/o'}
                  </span>
                )}
                {otherUser?.nationality && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    {otherUser.nationality}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {role === 'tenant' 
                  ? (room?.lister_type === 'current_tenant' 
                      ? (isRTL ? 'مستأجر حالي' : 'Current Tenant')
                      : t('viewing.landlord'))
                  : t('viewing.tenant')
                }
              </p>
              {/* Show occupation/university for the other user */}
              {otherUser?.occupation_status && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  {otherUser.occupation_status === 'student' ? (
                    <>
                      <GraduationCap className="w-3 h-3" />
                      <span>{otherUser.university || (isRTL ? 'طالب' : 'Student')}</span>
                    </>
                  ) : otherUser.occupation_status === 'working' ? (
                    <>
                      <Briefcase className="w-3 h-3" />
                      <span>{otherUser.job_title || otherUser.occupation || (isRTL ? 'يعمل' : 'Working')}</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </Link>
          <Badge className={STATUS_COLORS[viewing.status]}>
            {statusLabels[viewing.status]}
          </Badge>
        </div>
        
        {/* Personality Tags for the other user */}
        {otherUser?.personality_tags && otherUser.personality_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {otherUser.personality_tags.slice(0, 5).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isRTL 
                  ? PERSONALITY_TAG_LABELS[tag]?.ar || tag 
                  : PERSONALITY_TAG_LABELS[tag]?.en || tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Proposed Time */}
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          {showConfirmedTime ? (
            <>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {t('viewing.confirmedTime')}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(viewing.confirmed_date!)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(viewing.confirmed_time!)}
                </span>
              </div>
            </>
          ) : showCounterTime ? (
            <>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                {t('viewing.newTimeProposed')}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(viewing.counter_proposed_date!)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(viewing.counter_proposed_time_start!)} - {formatTime(viewing.counter_proposed_time_end!)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-through mt-1">
                {t('viewing.originalTime')}: {formatDate(viewing.proposed_date)} {formatTime(viewing.proposed_time_start)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                {t('viewing.proposedTime')}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(viewing.proposed_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(viewing.proposed_time_start)} - {formatTime(viewing.proposed_time_end)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        {viewing.tenant_message && (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground mb-1">
              {t('viewing.tenantMessage')}:
            </p>
            <p className="text-foreground">{viewing.tenant_message}</p>
          </div>
        )}

        {viewing.landlord_response && (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground mb-1">
              {t('viewing.landlordResponse')}:
            </p>
            <p className="text-foreground">{viewing.landlord_response}</p>
          </div>
        )}

        {/* Location Shared Indicator */}
        {viewing.location_shared && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <MapPin className="w-4 h-4" />
            <span>{t('viewing.locationShared')}</span>
          </div>
        )}

        {/* Chat Toggle Button - Always visible */}
        <div className="pt-2 border-t border-border">
          <Button
            size="sm"
            variant={isChatUnlocked ? "default" : "outline"}
            className="w-full gap-2"
            onClick={() => setShowChat(!showChat)}
            disabled={!isChatUnlocked && viewing.status !== 'counter_proposed'}
          >
            <MessageCircle className="w-4 h-4" />
            {showChat 
              ? (isRTL ? 'إخفاء المحادثة' : 'Hide Chat')
              : isChatUnlocked 
                ? t('viewing.chat')
                : t('viewing.chatLocked')
            }
          </Button>
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="mt-4">
            <ViewingChat
              viewingId={viewing.id}
              otherUserId={otherUserId}
              otherUserName={otherUser?.full_name || (isRTL ? 'مستخدم' : 'User')}
              otherUserAvatar={otherUser?.avatar_url}
              isLocked={!isChatUnlocked}
              lockReason={t('viewing.chatUnlocksAfterConfirm')}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Landlord actions for pending requests */}
          {role === 'landlord' && viewing.status === 'pending' && (
            <>
              {hasConfirmedForRoom ? (
                <Badge className="flex-1 justify-center py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                  <Clock className="w-4 h-4 mr-1" />
                  {isRTL ? 'في الانتظار' : 'Pending'}
                </Badge>
              ) : (
                <>
                  <Button size="sm" onClick={onConfirm} className="flex-1">
                    <Check className="w-4 h-4 mr-1" />
                    {t('viewing.confirm')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCounterPropose} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {isRTL ? 'تأكيد بوقت جديد' : 'Confirm New Time'}
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <X className="w-4 h-4 mr-1" />
                {t('viewing.cancel')}
              </Button>
            </>
          )}

          {/* Landlord action for confirmed - share location */}
          {role === 'landlord' && viewing.status === 'confirmed' && !viewing.location_shared && (
            <Button size="sm" onClick={onShareLocation} className="flex-1">
              <MapPin className="w-4 h-4 mr-1" />
              {t('viewing.shareLocation')}
            </Button>
          )}

          {/* Landlord action for confirmed - mark viewing as completed */}
          {role === 'landlord' && viewing.status === 'confirmed' && (
            <Button size="sm" onClick={onMarkCompleted} className="flex-1 bg-primary hover:bg-primary/90">
              <Check className="w-4 h-4 mr-1" />
              {isRTL ? 'تمت المعاينة' : 'Mark Viewing Done'}
            </Button>
          )}

          {/* Tenant actions for counter-proposed */}
          {role === 'tenant' && viewing.status === 'counter_proposed' && (
            <>
              <Button size="sm" onClick={onAcceptCounter} className="flex-1">
                <Check className="w-4 h-4 mr-1" />
                {t('viewing.acceptTime')}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                <X className="w-4 h-4 mr-1" />
                {t('viewing.cancel')}
              </Button>
            </>
          )}

          {/* Rental confirmation for BOTH roles after viewing is completed */}
          {viewing.status === 'completed' && (
            <>
              {/* Show confirmation status */}
              <div className="w-full p-3 bg-secondary/50 rounded-lg mb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {isRTL ? 'تأكيد الإيجار:' : 'Rental Confirmation:'}
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2">
                    {viewing.tenant_rental_confirmed ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={viewing.tenant_rental_confirmed ? 'text-green-600 dark:text-green-400' : ''}>
                      {isRTL ? 'المستأجر' : 'Tenant'}: {viewing.tenant_rental_confirmed 
                        ? (isRTL ? 'تم التأكيد ✓' : 'Confirmed ✓') 
                        : (isRTL ? 'في الانتظار' : 'Pending')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewing.landlord_rental_confirmed ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={viewing.landlord_rental_confirmed ? 'text-green-600 dark:text-green-400' : ''}>
                      {room?.lister_type === 'current_tenant' 
                        ? (isRTL ? 'المستأجر الحالي' : 'Current Tenant')
                        : (isRTL ? 'المالك' : 'Landlord')}: {viewing.landlord_rental_confirmed 
                        ? (isRTL ? 'تم التأكيد ✓' : 'Confirmed ✓') 
                        : (isRTL ? 'في الانتظار' : 'Pending')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tenant confirm button */}
              {role === 'tenant' && !viewing.tenant_rental_confirmed && (
                <>
                  <Button size="sm" onClick={onConfirmRental} className="flex-1 bg-primary hover:bg-primary/90">
                    <Home className="w-4 h-4 mr-1" />
                    {t('viewing.confirmRental')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onDecline} className="flex-1">
                    <X className="w-4 h-4 mr-1" />
                    {t('viewing.decline')}
                  </Button>
                </>
              )}

              {/* Landlord confirm button */}
              {role === 'landlord' && !viewing.landlord_rental_confirmed && (
                <Button size="sm" onClick={onConfirmRental} className="flex-1 bg-primary hover:bg-primary/90">
                  <Home className="w-4 h-4 mr-1" />
                  {isRTL ? 'تأكيد تأجير الغرفة' : 'Confirm Room Rented'}
                </Button>
              )}

              {/* Already confirmed message */}
              {role === 'tenant' && viewing.tenant_rental_confirmed && !viewing.landlord_rental_confirmed && (
                <p className="text-sm text-muted-foreground text-center w-full">
                  {room?.lister_type === 'current_tenant'
                    ? (isRTL ? 'في انتظار تأكيد المستأجر الحالي...' : 'Waiting for current tenant confirmation...')
                    : (isRTL ? 'في انتظار تأكيد المالك...' : 'Waiting for landlord confirmation...')}
                </p>
              )}
              {role === 'landlord' && viewing.landlord_rental_confirmed && !viewing.tenant_rental_confirmed && (
                <p className="text-sm text-muted-foreground text-center w-full">
                  {isRTL ? 'في انتظار تأكيد المستأجر...' : 'Waiting for tenant confirmation...'}
                </p>
              )}
            </>
          )}

          {/* Both confirmed - show success */}
          {viewing.status === 'rental_confirmed' && (
            <div className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
              <Home className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="font-medium text-green-700 dark:text-green-300">
                {isRTL ? '🎉 تم تأكيد الإيجار!' : '🎉 Rental Confirmed!'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {isRTL ? 'مبروك! تم تأجير الغرفة بنجاح.' : 'Congratulations! The room has been rented successfully.'}
              </p>
            </div>
          )}

          {/* Universal cancel for any active status (not already handled in pending landlord block or counter-proposed tenant block) */}
          {onCancel && ['confirmed', 'completed'].includes(viewing.status) && (
            <Button size="sm" variant="ghost" onClick={onCancel} className="text-destructive hover:text-destructive">
              <X className="w-4 h-4 mr-1" />
              {isRTL ? 'إلغاء الحجز' : 'Cancel Booking'}
            </Button>
          )}

          {/* Tenant cancel for pending */}
          {role === 'tenant' && viewing.status === 'pending' && onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel} className="text-destructive hover:text-destructive">
              <X className="w-4 h-4 mr-1" />
              {t('viewing.cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewingCard;
