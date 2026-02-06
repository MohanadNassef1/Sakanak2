import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCounterProposeViewing } from '@/hooks/useViewings';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, RefreshCw } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CounterProposeDialogProps {
  viewingId: string;
  originalDate: string;
  originalTimeStart: string;
  originalTimeEnd: string;
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

export const CounterProposeDialog: React.FC<CounterProposeDialogProps> = ({
  viewingId,
  originalDate,
  originalTimeStart,
  originalTimeEnd,
  open,
  onOpenChange,
}) => {
  const { t, isRTL } = useLanguage();
  const counterPropose = useCounterProposeViewing();

  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [response, setResponse] = useState('');

  const minDate = new Date();
  const durationOptions = isRTL ? DURATION_OPTIONS_AR : DURATION_OPTIONS;

  const handleSubmit = async () => {
    if (!date || !startTime) return;

    const endTime = calculateEndTime(startTime, parseInt(duration));

    await counterPropose.mutateAsync({
      viewingId,
      counter_proposed_date: format(date, 'yyyy-MM-dd'),
      counter_proposed_time_start: startTime + ':00',
      counter_proposed_time_end: endTime + ':00',
      landlord_response: response || undefined,
    });

    onOpenChange(false);
    setDate(undefined);
    setStartTime('');
    setDuration('60');
    setResponse('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            {t('viewing.proposeNewTimeTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('viewing.counterProposeDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Request Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t('viewing.originalRequest')}:
            </p>
            <p className="text-sm">
              {originalDate} • {originalTimeStart?.substring(0, 5)} - {originalTimeEnd?.substring(0, 5)}
            </p>
          </div>

          {/* New Date Picker */}
          <div className="space-y-2">
            <Label>{t('viewing.newDate')}</Label>
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
                  {date ? format(date, 'PPP') : t('viewing.pickDate')}
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

          {/* Response Message */}
          <div className="space-y-2">
            <Label>{t('viewing.responseMessage')}</Label>
            <Textarea
              placeholder={t('viewing.responseMessagePlaceholder')}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!date || !startTime || counterPropose.isPending}
            >
              {counterPropose.isPending
                ? t('common.loading')
                : t('viewing.sendProposal')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounterProposeDialog;
