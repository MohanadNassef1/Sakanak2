import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateViewing, useHasExistingViewing, useHasConfirmedViewing } from '@/hooks/useViewings';
import { calculateProfileStrength } from '@/hooks/useVerificationGate';
import ProfileStrengthModal from '@/components/booking/ProfileStrengthModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Eye, AlertCircle, Shield } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { containsBlockedContent, getBlockedContentMessage } from '@/lib/messageFilter';
import { toast } from 'sonner';
import { trackCustomEvent } from '@/lib/fbPixel';

interface BookViewingDialogProps {
  roomId: string;
  landlordId: string;
  roomTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
];

const DURATION_OPTIONS_AR = [
  { value: '30', label: '٣٠ دقيقة' },
  { value: '60', label: 'ساعة واحدة' },
  { value: '90', label: 'ساعة ونصف' },
  { value: '120', label: 'ساعتان' },
];

// Calculate end time based on start time and duration
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};

export const BookViewingDialog: React.FC<BookViewingDialogProps> = ({
  roomId,
  landlordId,
  roomTitle,
  open,
  onOpenChange,
}) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const createViewing = useCreateViewing();
  const { data: hasExistingViewing, isLoading: checkingExisting } = useHasExistingViewing(roomId);
  const { data: confirmedViewing } = useHasConfirmedViewing();

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [showProfileStrengthModal, setShowProfileStrengthModal] = useState(false);

  const isVerified = profile?.verification_status === 'verified';
  const minDate = addDays(new Date(), 1);

  const durationOptions = isRTL ? DURATION_OPTIONS_AR : DURATION_OPTIONS;

  // Calculate profile strength - pass all relevant fields
  const profileStrength = profile ? calculateProfileStrength({
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    about: profile.about,
    bio: profile.bio,
    occupation: profile.occupation,
    occupation_status: profile.occupation_status,
    phone: profile.phone,
    age: profile.age,
    nationality: profile.nationality,
  }) : { percentage: 0, missingFields: [], isComplete: false };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Validate for blocked content
    if (newMessage && containsBlockedContent(newMessage)) {
      setMessageError(t('viewing.noContactInfo') || 'Contact information (phone, email, links) is not allowed');
    } else {
      setMessageError(null);
    }
  };

  const handleSubmitAttempt = () => {
    trackCustomEvent('ClickSubmitViewing', { room_id: roomId });
    if (!date || !startTime) return;

    // Verification gate — RLS requires verified tenants
    if (!isVerified) {
      toast.error(
        isRTL
          ? 'يجب توثيق هويتك أولاً قبل حجز معاينة'
          : 'You must verify your identity before booking a viewing'
      );
      onOpenChange(false);
      navigate('/verify-identity', { state: { from: `/rooms/${roomId}` } });
      return;
    }

    // Check profile strength (soft gate)
    if (!profileStrength.isComplete) {
      setShowProfileStrengthModal(true);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!date || !startTime) return;

    // Final validation before submit
    if (message && containsBlockedContent(message)) {
      toast.error(getBlockedContentMessage());
      return;
    }

    const endTime = calculateEndTime(startTime, parseInt(duration));

    await createViewing.mutateAsync({
      room_id: roomId,
      landlord_id: landlordId,
      proposed_date: format(date, 'yyyy-MM-dd'),
      proposed_time_start: startTime + ':00',
      proposed_time_end: endTime + ':00',
      tenant_message: message || undefined,
    });

    onOpenChange(false);
    setDate(undefined);
    setStartTime('');
    setDuration('60');
    setMessage('');
    setMessageError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {t('viewing.bookTitle')}
          </DialogTitle>
          <DialogDescription>
            {roomTitle}
          </DialogDescription>
        </DialogHeader>

        {confirmedViewing ? (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  {isRTL
                    ? `لديك معاينة ${confirmedViewing.status === 'completed' ? 'مكتملة' : 'مؤكدة'} بالفعل في "${confirmedViewing.roomTitle}". يرجى إلغاؤها أولاً قبل حجز معاينة جديدة.`
                    : `You have a ${confirmedViewing.status === 'completed' ? 'completed' : 'confirmed'} viewing for "${confirmedViewing.roomTitle}". Please cancel it first before booking another viewing.`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => { onOpenChange(false); navigate('/my-viewings'); }}
                >
                  {isRTL ? 'الذهاب لمعايناتي' : 'Go to My Viewings'}
                </Button>
              </div>
            </div>
          </div>
        ) : hasExistingViewing ? (
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">
                {t('viewing.alreadyRequested')}
              </p>
            </div>
          </div>
        ) : !isVerified ? (
          <div className="p-4 bg-muted rounded-lg border border-border space-y-3">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {isRTL
                  ? 'يجب توثيق هويتك (رفع جواز السفر) قبل أن تتمكن من حجز معاينة. هذا يضمن أمان جميع المستخدمين.'
                  : 'You must verify your identity (upload your passport) before you can book a viewing. This keeps everyone on the platform safe.'}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => { onOpenChange(false); navigate('/verify-identity', { state: { from: `/rooms/${roomId}` } }); }}
            >
              {isRTL ? 'توثيق الهوية الآن' : 'Verify Identity Now'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>{t('viewing.selectDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {date ? format(date, 'PPP') : (t('viewing.pickDate'))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => isBefore(date, startOfDay(minDate))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time and Duration Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('viewing.preferredTime')}</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('viewing.selectTime')}>
                      {startTime && (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {startTime}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('viewing.duration')}</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue>
                      {durationOptions.find(d => d.value === duration)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Message with validation */}
            <div className="space-y-2">
              <Label>{t('viewing.message')}</Label>
              <Textarea
                placeholder={t('viewing.messagePlaceholder')}
                value={message}
                onChange={handleMessageChange}
                rows={3}
                className={cn(messageError && 'border-destructive focus-visible:ring-destructive')}
              />
              {messageError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{messageError}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {t('viewing.messageNote')}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSubmitAttempt}
              disabled={!date || !startTime || !!messageError || createViewing.isPending}
            >
              {createViewing.isPending
                ? (t('common.loading'))
                : (t('viewing.sendRequest'))}
            </Button>
          </div>
        )}
      </DialogContent>

      {/* Profile Strength Modal */}
      <ProfileStrengthModal
        open={showProfileStrengthModal}
        onOpenChange={setShowProfileStrengthModal}
        percentage={profileStrength.percentage}
        missingFields={profileStrength.missingFields}
        onProceedAnyway={() => {
          setShowProfileStrengthModal(false);
          handleSubmit();
        }}
      />
    </Dialog>
  );
};

export default BookViewingDialog;
