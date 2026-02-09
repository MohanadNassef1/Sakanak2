import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUploadVerificationDocument, useSubmitVerification } from '@/hooks/useVerification';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import { Shield, Upload, Loader2, CheckCircle, FileText, ArrowLeft, Lock, Eye, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logError } from '@/lib/logger';

const VerifyIdentity: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = (location.state as any)?.from || '/profile';

  const uploadDocument = useUploadVerificationDocument();
  const submitVerification = useSubmitVerification();

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  // Determine if Egyptian based on profile nationality
  const isEgyptian = profile?.nationality?.toLowerCase() === 'egyptian' || 
                     profile?.nationality?.toLowerCase() === 'egypt' ||
                     profile?.nationality === 'مصري' ||
                     profile?.nationality === 'مصر';
  const documentType = isEgyptian ? 'national_id' : 'passport';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(isRTL ? 'الملف كبير جداً (الحد الأقصى 10MB)' : 'File too large (max 10MB)');
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error(isRTL ? 'نوع ملف غير صالح' : 'Invalid file type');
        return;
      }
      if (side === 'front') {
        setFrontFile(file);
      } else {
        setBackFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!frontFile || (!isEgyptian && !frontFile) || (isEgyptian && !backFile)) {
      toast.error(isRTL ? 'يرجى رفع جميع المستندات المطلوبة' : 'Please upload all required documents');
      return;
    }

    try {
      const frontUrl = await uploadDocument.mutateAsync(frontFile);
      const backUrl = isEgyptian && backFile ? await uploadDocument.mutateAsync(backFile) : frontUrl;

      await submitVerification.mutateAsync({
        documentType,
        documentUrlFront: frontUrl,
        documentUrlBack: backUrl,
      });

      toast.success(
        isRTL
          ? 'تم رفع المستندات بنجاح. سنقوم بمراجعتها قريباً.'
          : 'Documents uploaded successfully. We will review them shortly.'
      );

      navigate(returnPath);
    } catch (error: any) {
      logError('VerifyIdentity.submit', error);
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء الإرسال' : 'Error submitting verification'));
    }
  };

  const isSubmitting = uploadDocument.isPending || submitVerification.isPending;
  const isLoading = authLoading || profileLoading;

  // Already verified - redirect back
  if (!isLoading && profile?.verification_status === 'verified') {
    navigate(returnPath);
    return null;
  }

  // Pending verification
  if (!isLoading && profile?.verification_status === 'pending') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                {isRTL ? 'قيد المراجعة' : 'Verification Pending'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL
                  ? 'مستنداتك قيد المراجعة. سنخطرك بمجرد الانتهاء.'
                  : 'Your documents are being reviewed. We will notify you once complete.'}
              </p>
              <Button variant="outline" onClick={() => navigate(returnPath)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isRTL ? 'العودة' : 'Go Back'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!user && !authLoading) {
    navigate('/auth');
    return null;
  }

  return (
    <MainLayout>
      <div className={cn("container mx-auto px-4 py-8 max-w-2xl", isRTL && "rtl")}>
        {/* Trust Banner */}
        <Card className="mb-8 border-green-500/30 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">
                  {isRTL ? 'لماذا نطلب التحقق من الهوية؟' : 'Why We Require ID Verification'}
                </h3>
                <p className="text-sm text-green-600/80 dark:text-green-300/80">
                  {isRTL
                    ? 'لبناء مجتمع آمن، نطلب التحقق من الهوية لجميع المستخدمين. بياناتك مشفرة وتُستخدم فقط للتحقق من هويتك.'
                    : 'To build a safe community, we require ID verification for all hosts and seekers. Your data is encrypted and used ONLY for safety checks.'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-green-600/70">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {isRTL ? 'مشفر' : 'Encrypted'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {isRTL ? 'خاص' : 'Private'}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {isRTL ? 'آمن' : 'Secure'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isRTL ? 'التحقق من الهوية' : 'Identity Verification'}
            </CardTitle>
            <CardDescription>
              {isRTL
                ? 'أكمل التحقق للوصول إلى جميع الميزات'
                : 'Complete verification to access all features'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Document Type Info */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'بناءً على جنسيتك المسجلة:' : 'Based on your registered nationality:'}
              </p>
              <p className="font-semibold mt-1">
                {isEgyptian 
                  ? (isRTL ? 'البطاقة الشخصية المصرية (الوجهين)' : 'Egyptian National ID (Both Sides)')
                  : (isRTL ? 'جواز السفر' : 'Passport')}
              </p>
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                {isEgyptian
                  ? (isRTL ? 'رفع البطاقة الشخصية (الوجهين)' : 'Upload National ID (Both Sides)')
                  : (isRTL ? 'رفع جواز السفر' : 'Upload Passport')}
              </Label>

              {/* Front Upload */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {isEgyptian
                    ? (isRTL ? 'الوجه الأمامي' : 'Front Side')
                    : (isRTL ? 'صفحة المعلومات' : 'Information Page')}
                </Label>
                <label
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                    frontFile
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'front')}
                  />
                  {frontFile ? (
                    <>
                      <FileText className="w-10 h-10 text-primary" />
                      <span className="text-sm font-medium truncate max-w-full">{frontFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'اضغط للتغيير' : 'Click to change'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {isRTL ? 'اسحب الملف هنا أو اضغط للرفع' : 'Drag file here or click to upload'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'الحد الأقصى 10MB' : 'Max 10MB'}
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Back Upload (Only for Egyptian National ID) */}
              {isEgyptian && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    {isRTL ? 'الوجه الخلفي' : 'Back Side'}
                  </Label>
                  <label
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                      backFile
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e, 'back')}
                    />
                    {backFile ? (
                      <>
                        <FileText className="w-10 h-10 text-primary" />
                        <span className="text-sm font-medium truncate max-w-full">{backFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {isRTL ? 'اضغط للتغيير' : 'Click to change'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {isRTL ? 'اسحب الملف هنا أو اضغط للرفع' : 'Drag file here or click to upload'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isRTL ? 'الحد الأقصى 10MB' : 'Max 10MB'}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <Button
              className="w-full h-12 text-lg"
              onClick={handleSubmit}
              disabled={!frontFile || (isEgyptian && !backFile) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isRTL ? 'جارٍ الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isRTL ? 'إرسال للمراجعة' : 'Submit for Review'}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {isRTL
                ? 'بإرسال هذا النموذج، أنت توافق على شروط الاستخدام وسياسة الخصوصية'
                : 'By submitting, you agree to our Terms of Service and Privacy Policy'}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VerifyIdentity;
