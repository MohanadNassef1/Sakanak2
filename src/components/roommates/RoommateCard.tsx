import React, { useState } from 'react';
import { RoommateWithScore } from '@/types/roommate';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useStartConversation } from '@/hooks/useConversations';
import { useIsAdmin, useAdminRemoveRoommate } from '@/hooks/useAdminActions';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User,
  Briefcase,
  Cigarette,
  PawPrint,
  CheckCircle,
  MessageCircle,
  Star,
  Info,
  Loader2,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { getMatchExplanation } from '@/lib/matchingAlgorithm';

interface RoommateCardProps {
  roommate: RoommateWithScore;
}

const RoommateCard: React.FC<RoommateCardProps> = ({ roommate }) => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const adminRemove = useAdminRemoveRoommate();
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleMessage = async () => {
    if (!user) {
      toast.error('Please sign in to message');
      navigate('/auth');
      return;
    }

    try {
      const conv = await startConversation.mutateAsync({
        otherUserId: roommate.user_id,
      });
      navigate(`/messages?conversation=${conv.id}`);
    } catch (error) {
      toast.error('Failed to start conversation. Please verify your account.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-muted-foreground';
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-muted';
  };

  const handleViewProfile = () => {
    navigate(`/roommates/${roommate.user_id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewProfile}>
      <CardContent className="p-0">
        {/* Header with avatar and match score */}
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6">
          {roommate.isBestMatch && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground gap-1">
              <Star className="w-3 h-3 fill-current" />
              {t('roommates.bestMatch')}
            </Badge>
          )}

          {/* Admin Remove Button */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-3 ${roommate.isBestMatch ? 'right-24' : 'right-3'} bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground`}
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveDialog(true);
              }}
              title={isRTL ? 'إزالة المستخدم (مشرف)' : 'Remove user (Admin)'}
            >
              <ShieldAlert className="w-4 h-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
              {roommate.avatar_url ? (
                <img
                  src={roommate.avatar_url}
                  alt={roommate.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                roommate.full_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Name and verification */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{roommate.full_name}</h3>
                {roommate.verification_status === 'verified' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              
              {roommate.occupation && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Briefcase className="w-3 h-3" />
                  {roommate.occupation}
                </div>
              )}

              {roommate.nationality && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {roommate.nationality}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Compatibility score */}
        {roommate.compatibilityScore > 0 && (
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('roommates.compatibility')}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-1">
                      <span className={`font-bold ${getScoreColor(roommate.compatibilityScore)}`}>
                        {roommate.compatibilityScore}%
                      </span>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium mb-1">Why this match?</p>
                    <ul className="text-xs space-y-1">
                      {roommate.matchReasons.map((reason, i) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress 
              value={roommate.compatibilityScore} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {getMatchExplanation(roommate.matchReasons)}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-4 space-y-3">
          {/* Lifestyle badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <User className="w-3 h-3" />
              {roommate.gender === 'male' ? t('auth.male') : t('auth.female')}
            </Badge>
            <Badge 
              variant={roommate.is_smoker ? 'destructive' : 'secondary'}
              className="gap-1"
            >
              <Cigarette className="w-3 h-3" />
              {roommate.is_smoker ? t('roommates.smoker') : t('roommates.nonSmoker')}
            </Badge>
            {roommate.has_pets && (
              <Badge variant="secondary" className="gap-1">
                <PawPrint className="w-3 h-3" />
                {roommate.pet_type || t('roommates.hasPets')}
              </Badge>
            )}
          </div>

          {/* About */}
          {roommate.about && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {roommate.about}
            </p>
          )}

          {/* Looking for */}
          {roommate.looking_for && (
            <div className="text-sm">
              <span className="font-medium">{t('roommates.lookingFor')}: </span>
              <span className="text-muted-foreground">{roommate.looking_for}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <Button 
            className="flex-1 gap-2" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
          >
            {t('roommates.viewProfile')}
          </Button>
          {/* Message Button - HIDDEN FOR BETA */}
        </div>
      </CardContent>

      {/* Admin Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              {isRTL ? 'إزالة المستخدم' : 'Remove User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL 
                ? `هل أنت متأكد من إزالة "${roommate.full_name}" من قائمة الباحثين عن سكن؟ سيتم تغيير حالة التحقق إلى "مرفوض".`
                : `Are you sure you want to remove "${roommate.full_name}" from roommate listings? Their verification status will be set to rejected.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                adminRemove.mutate(roommate.user_id);
                setShowRemoveDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {adminRemove.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isRTL ? 'إزالة' : 'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default RoommateCard;
