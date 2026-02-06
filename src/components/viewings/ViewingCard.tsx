import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ViewingRequest, VIEWING_STATUS_LABELS } from '@/types/viewing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, Clock, MapPin, Check, X, MessageSquare, 
  RefreshCw, Home, AlertTriangle 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ViewingCardProps {
  viewing: ViewingRequest;
  role: 'tenant' | 'landlord';
  onConfirm?: () => void;
  onCounterPropose?: () => void;
  onCancel?: () => void;
  onAcceptCounter?: () => void;
  onConfirmRental?: () => void;
  onDecline?: () => void;
  onShareLocation?: () => void;
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
  onConfirm,
  onCounterPropose,
  onCancel,
  onAcceptCounter,
  onConfirmRental,
  onDecline,
  onShareLocation,
}) => {
  const { t, isRTL } = useLanguage();
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'PPP');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    // Remove seconds if present
    return timeStr?.substring(0, 5) || timeStr;
  };

  const otherUser = role === 'tenant' ? viewing.landlord : viewing.tenant;
  const room = viewing.room;

  const showConfirmedTime = viewing.confirmed_date && viewing.confirmed_time;
  const showCounterTime = viewing.status === 'counter_proposed' && viewing.counter_proposed_date;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url || undefined} />
              <AvatarFallback>
                {otherUser?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {otherUser?.full_name || (t('common.unknown') || 'Unknown')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {role === 'tenant' 
                  ? (t('viewing.landlord') || 'Landlord')
                  : (t('viewing.tenant') || 'Tenant')
                }
              </p>
            </div>
          </div>
          <Badge className={STATUS_COLORS[viewing.status]}>
            {VIEWING_STATUS_LABELS[viewing.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Room Info */}
        {room && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{room.title}</span>
            <span className="text-muted-foreground">• {room.city}</span>
          </div>
        )}

        {/* Proposed Time */}
        <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
          {showConfirmedTime ? (
            <>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {t('viewing.confirmedTime') || 'Confirmed Time'}
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
                {t('viewing.newTimeProposed') || 'New Time Proposed'}
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
                {t('viewing.originalTime') || 'Original'}: {formatDate(viewing.proposed_date)} {formatTime(viewing.proposed_time_start)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                {t('viewing.proposedTime') || 'Proposed Time'}
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
              {t('viewing.tenantMessage') || 'Tenant Message'}:
            </p>
            <p className="text-foreground">{viewing.tenant_message}</p>
          </div>
        )}

        {viewing.landlord_response && (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground mb-1">
              {t('viewing.landlordResponse') || 'Landlord Response'}:
            </p>
            <p className="text-foreground">{viewing.landlord_response}</p>
          </div>
        )}

        {/* Location Shared Indicator */}
        {viewing.location_shared && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <MapPin className="w-4 h-4" />
            <span>{t('viewing.locationShared') || 'Location shared via chat'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Landlord actions for pending requests */}
          {role === 'landlord' && viewing.status === 'pending' && (
            <>
              <Button size="sm" onClick={onConfirm} className="flex-1">
                <Check className="w-4 h-4 mr-1" />
                {t('viewing.confirm') || 'Confirm'}
              </Button>
              <Button size="sm" variant="outline" onClick={onCounterPropose} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-1" />
                {t('viewing.proposeNewTime') || 'New Time'}
              </Button>
            </>
          )}

          {/* Landlord action for confirmed - share location */}
          {role === 'landlord' && viewing.status === 'confirmed' && !viewing.location_shared && (
            <Button size="sm" onClick={onShareLocation} className="flex-1">
              <MapPin className="w-4 h-4 mr-1" />
              {t('viewing.shareLocation') || 'Share Location'}
            </Button>
          )}

          {/* Tenant actions for counter-proposed */}
          {role === 'tenant' && viewing.status === 'counter_proposed' && (
            <>
              <Button size="sm" onClick={onAcceptCounter} className="flex-1">
                <Check className="w-4 h-4 mr-1" />
                {t('viewing.acceptTime') || 'Accept Time'}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                <X className="w-4 h-4 mr-1" />
                {t('viewing.cancel') || 'Cancel'}
              </Button>
            </>
          )}

          {/* Tenant actions after viewing (completed status) */}
          {role === 'tenant' && viewing.status === 'completed' && (
            <>
              <Button size="sm" onClick={onConfirmRental} className="flex-1 bg-green-600 hover:bg-green-700">
                <Home className="w-4 h-4 mr-1" />
                {t('viewing.confirmRental') || 'Confirm Rental'}
              </Button>
              <Button size="sm" variant="destructive" onClick={onDecline} className="flex-1">
                <X className="w-4 h-4 mr-1" />
                {t('viewing.decline') || 'Decline'}
              </Button>
            </>
          )}

          {/* Cancel button for pending/confirmed viewings */}
          {(viewing.status === 'pending' || viewing.status === 'confirmed') && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              {t('viewing.cancel') || 'Cancel'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewingCard;
