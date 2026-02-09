import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDeclineRental } from '@/hooks/useViewings';
import { DeclineReason, DECLINE_REASON_LABELS } from '@/types/viewing';
import { supabase } from '@/integrations/supabase/client';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface DeclineDialogProps {
  viewingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeclineDialog: React.FC<DeclineDialogProps> = ({
  viewingId,
  open,
  onOpenChange,
}) => {
  const { t, isRTL } = useLanguage();
  const declineRental = useDeclineRental();

  const [reason, setReason] = useState<DeclineReason | ''>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [brokerFlag, setBrokerFlag] = useState(false);
  const [brokerDetails, setBrokerDetails] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    setPhotos(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast.error(t('viewing.selectReason') || 'Please select a reason');
      return;
    }

    setUploading(true);

    try {
      // Upload photos if any
      const uploadedUrls: string[] = [];
      const { data: userData } = await supabase.auth.getUser();
      
      if (photos.length > 0 && userData.user) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${userData.user.id}/${viewingId}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('decline-evidence')
            .upload(fileName, photo);
          
          if (!uploadError) {
            // Store only the file path, not a public URL
            // Signed URLs will be generated on-demand when viewing evidence
            uploadedUrls.push(fileName);
          }
        }
      }

      await declineRental.mutateAsync({
        viewingId,
        reason: reason as DeclineReason,
        reason_details: reasonDetails || undefined,
        broker_illegal_fees: brokerFlag,
        broker_fee_details: brokerFlag ? brokerDetails : undefined,
        evidence_photos: uploadedUrls,
      });

      onOpenChange(false);
      // Reset form
      setReason('');
      setReasonDetails('');
      setBrokerFlag(false);
      setBrokerDetails('');
      setPhotos([]);
    } catch (error) {
      console.error('Decline error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            {t('viewing.declineTitle') || 'Why are you declining?'}
          </DialogTitle>
          <DialogDescription>
            {t('viewing.declineDescription') || 'Your feedback helps us improve the platform and protect other users.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reason Selection */}
          <div className="space-y-3">
            <Label>{t('viewing.reason') || 'Reason'} *</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as DeclineReason)}>
              {(Object.keys(DECLINE_REASON_LABELS) as DeclineReason[]).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="font-normal cursor-pointer">
                    {DECLINE_REASON_LABELS[key]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label>{t('viewing.additionalDetails') || 'Additional Details'}</Label>
            <Textarea
              placeholder={t('viewing.detailsPlaceholder') || 'Please provide more details...'}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={3}
            />
          </div>

          {/* Broker Fraud Flag */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="broker-flag"
                checked={brokerFlag}
                onCheckedChange={(checked) => setBrokerFlag(!!checked)}
              />
              <div>
                <Label htmlFor="broker-flag" className="font-medium text-red-800 dark:text-red-200 cursor-pointer">
                  {t('viewing.brokerFlagLabel') || '⚠️ Broker asked for extra/illegal fees'}
                </Label>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {t('viewing.brokerFlagHelp') || 'Check this if someone demanded cash payments, key money, or other illegal fees not mentioned in the listing.'}
                </p>
              </div>
            </div>

            {brokerFlag && (
              <Textarea
                placeholder={t('viewing.brokerDetailsPlaceholder') || 'What fees were requested? Any names or details?'}
                value={brokerDetails}
                onChange={(e) => setBrokerDetails(e.target.value)}
                rows={2}
                className="bg-white dark:bg-background"
              />
            )}
          </div>

          {/* Evidence Upload */}
          <div className="space-y-3">
            <Label>{t('viewing.evidence') || 'Upload Evidence (Optional)'}</Label>
            <p className="text-xs text-muted-foreground">
              {t('viewing.evidenceHelp') || 'Photos or screenshots showing differences from the listing.'}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {photos.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={uploading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!reason || uploading}
            >
              {uploading
                ? (t('common.uploading') || 'Uploading...')
                : (t('viewing.submitDecline') || 'Submit & Decline')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeclineDialog;
