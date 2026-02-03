import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useVerificationRequest, useUploadVerificationDocument, useSubmitVerification, useCancelVerification } from '@/hooks/useVerification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Upload, Loader2, CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const VerificationCard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: verificationRequest, isLoading } = useVerificationRequest(user?.id);
  
  const uploadDocument = useUploadVerificationDocument();
  const submitVerification = useSubmitVerification();
  const cancelVerification = useCancelVerification();

  const [documentType, setDocumentType] = useState<string>('national_id');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('verification.fileTooLarge'));
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error(t('verification.invalidFileType'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error(t('verification.selectDocument'));
      return;
    }

    try {
      const documentUrl = await uploadDocument.mutateAsync(selectedFile);
      await submitVerification.mutateAsync({
        documentType,
        documentUrl,
      });
      toast.success(t('verification.submitSuccess'));
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || t('verification.submitError'));
    }
  };

  const handleCancel = async () => {
    if (!verificationRequest) return;
    
    try {
      await cancelVerification.mutateAsync(verificationRequest.id);
      toast.success(t('verification.cancelSuccess'));
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(t('verification.cancelError'));
    }
  };

  const isSubmitting = uploadDocument.isPending || submitVerification.isPending;
  const isCancelling = cancelVerification.isPending;

  // Already verified
  if (profile?.verification_status === 'verified') {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-green-600">{t('verification.verified')}</h3>
              <p className="text-sm text-muted-foreground">{t('verification.verifiedDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (profile?.verification_status === 'pending' && verificationRequest?.status === 'pending') {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-600">{t('verification.pending')}</h3>
                <p className="text-sm text-muted-foreground">{t('verification.pendingDesc')}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('verification.cancel')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected
  if (profile?.verification_status === 'rejected') {
    return (
      <Card className="border-red-500/50 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <div>
              <CardTitle className="text-red-600">{t('verification.rejected')}</CardTitle>
              <CardDescription>{t('verification.rejectedDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        {verificationRequest?.rejection_reason && (
          <CardContent>
            <div className="bg-red-500/10 rounded-lg p-4">
              <p className="text-sm font-medium text-red-600">{t('verification.reason')}:</p>
              <p className="text-sm text-red-600/80">{verificationRequest.rejection_reason}</p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Upload form (unverified)
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>{t('verification.title')}</CardTitle>
            <CardDescription>{t('verification.subtitle')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-700">{t('verification.whyVerify')}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('verification.documentType')}</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id">{t('verification.nationalId')}</SelectItem>
                <SelectItem value="passport">{t('verification.passport')}</SelectItem>
                <SelectItem value="driver_license">{t('verification.driverLicense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('verification.uploadDocument')}</Label>
            <label className={cn(
              "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
              selectedFile ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
            )}>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <>
                  <FileText className="w-10 h-10 text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">{t('verification.clickToChange')}</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('verification.dragOrClick')}</span>
                  <span className="text-xs text-muted-foreground">{t('verification.maxSize')}</span>
                </>
              )}
            </label>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('verification.submitting')}
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              {t('verification.submit')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerificationCard;
