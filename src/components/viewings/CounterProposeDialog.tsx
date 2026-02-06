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
import { format, addDays, isBefore, startOfDay } from 'date-fns';
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
  const [endTime, setEndTime] = useState<string>('');
  const [response, setResponse] = useState('');

  const minDate = new Date();

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) return;

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
    setEndTime('');
    setResponse('');
  };

  const availableEndTimes = TIME_SLOTS.filter(t => t > startTime);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            {t('viewing.proposeNewTimeTitle') || 'Propose New Time'}
          </DialogTitle>
          <DialogDescription>
            {t('viewing.counterProposeDescription') || 'Suggest an alternative time that works better for you.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original Request Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">
              {t('viewing.originalRequest') || 'Original Request'}:
            </p>
            <p className="text-sm">
              {originalDate} • {originalTimeStart?.substring(0, 5)} - {originalTimeEnd?.substring(0, 5)}
            </p>
          </div>

          {/* New Date Picker */}
          <div className="space-y-2">
            <Label>{t('viewing.newDate') || 'New Date'}</Label>
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

          {/* Response Message */}
          <div className="space-y-2">
            <Label>{t('viewing.responseMessage') || 'Message (Optional)'}</Label>
            <Textarea
              placeholder={t('viewing.responseMessagePlaceholder') || 'Explain why this time works better...'}
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
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!date || !startTime || !endTime || counterPropose.isPending}
            >
              {counterPropose.isPending
                ? (t('common.loading') || 'Loading...')
                : (t('viewing.sendProposal') || 'Send Proposal')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounterProposeDialog;
