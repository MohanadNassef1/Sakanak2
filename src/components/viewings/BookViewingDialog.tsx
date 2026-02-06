import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateViewing, useHasExistingViewing } from '@/hooks/useViewings';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Eye, AlertCircle } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { containsBlockedContent, getBlockedContentMessage } from '@/lib/messageFilter';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const createViewing = useCreateViewing();
  const { data: hasExistingViewing, isLoading: checkingExisting } = useHasExistingViewing(roomId);

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('60'); // Default 1 hour
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);

  const isVerified = profile?.verification_status === 'verified';
  const minDate = addDays(new Date(), 1); // At least tomorrow

  const durationOptions = isRTL ? DURATION_OPTIONS_AR : DURATION_OPTIONS;

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

        {hasExistingViewing ? (
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium">
                {t('viewing.alreadyRequested')}
              </p>
            </div>
          </div>
        ) : !isVerified ? (
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              {t('viewing.verificationRequired')}
            </p>
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
              onClick={handleSubmit}
              disabled={!date || !startTime || !!messageError || createViewing.isPending}
            >
              {createViewing.isPending
                ? (t('common.loading'))
                : (t('viewing.sendRequest'))}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookViewingDialog;
