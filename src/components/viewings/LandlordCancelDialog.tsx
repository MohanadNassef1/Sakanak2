import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface LandlordCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: (reason?: string) => void;
  isLoading?: boolean;
}

export const LandlordCancelDialog: React.FC<LandlordCancelDialogProps> = ({
  open,
  onOpenChange,
  onConfirmCancel,
  isLoading,
}) => {
  const { isRTL } = useLanguage();
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onConfirmCancel(reason.trim() || undefined);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {isRTL ? 'إلغاء الحجز' : 'Cancel Booking'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'هل أنت متأكد أنك تريد إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.'
              : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {isRTL ? 'سبب الإلغاء (اختياري)' : 'Cancellation reason (optional)'}
            </Label>
            <Textarea
              placeholder={isRTL ? 'أخبرنا لماذا تقوم بالإلغاء...' : 'Let us know why you\'re cancelling...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { onOpenChange(false); setReason(''); }}
              className="flex-1"
              disabled={isLoading}
            >
              {isRTL ? 'تراجع' : 'Go Back'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading
                ? (isRTL ? 'جارِ الإلغاء...' : 'Cancelling...')
                : (isRTL ? 'نعم، إلغاء الحجز' : 'Yes, Cancel Booking')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandlordCancelDialog;
