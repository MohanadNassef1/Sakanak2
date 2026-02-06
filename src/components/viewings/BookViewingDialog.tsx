import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateViewing } from '@/hooks/useViewings';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Eye } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [message, setMessage] = useState('');

  const isVerified = profile?.verification_status === 'verified';
  const minDate = addDays(new Date(), 1); // At least tomorrow

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) return;

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
    setEndTime('');
    setMessage('');
  };

  const availableEndTimes = TIME_SLOTS.filter(t => t > startTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {t('viewing.bookTitle') || 'Book a Viewing'}
          </DialogTitle>
          <DialogDescription>
            {roomTitle}
          </DialogDescription>
        </DialogHeader>

        {!isVerified ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('viewing.verificationRequired') || 'You need to verify your identity before booking viewings. Please complete verification in your profile.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>{t('viewing.selectDate') || 'Select Date'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : (t('viewing.pickDate') || 'Pick a date')}
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

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('viewing.startTime') || 'Start Time'}</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('viewing.selectTime') || 'Select'}>
                      {startTime && (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {startTime}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.slice(0, -1).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('viewing.endTime') || 'End Time'}</Label>
                <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('viewing.selectTime') || 'Select'}>
                      {endTime && (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {endTime}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableEndTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label>{t('viewing.message') || 'Message (Optional)'}</Label>
              <Textarea
                placeholder={t('viewing.messagePlaceholder') || 'Any specific questions or requests...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!date || !startTime || !endTime || createViewing.isPending}
            >
              {createViewing.isPending
                ? (t('common.loading') || 'Loading...')
                : (t('viewing.sendRequest') || 'Send Viewing Request')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookViewingDialog;
