import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Camera, FileText, Briefcase, Phone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStrengthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  percentage: number;
  missingFields: string[];
  onProceedAnyway: () => void;
}

const fieldLabels: Record<string, { en: string; ar: string; icon: React.ReactNode }> = {
  avatar_url: { en: 'Profile Photo', ar: 'صورة الملف الشخصي', icon: <Camera className="w-4 h-4" /> },
  about: { en: 'About Me', ar: 'نبذة عني', icon: <FileText className="w-4 h-4" /> },
  bio: { en: 'Bio', ar: 'السيرة الذاتية', icon: <FileText className="w-4 h-4" /> },
  occupation: { en: 'Occupation', ar: 'المهنة', icon: <Briefcase className="w-4 h-4" /> },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف', icon: <Phone className="w-4 h-4" /> },
  full_name: { en: 'Full Name', ar: 'الاسم الكامل', icon: <User className="w-4 h-4" /> },
  age: { en: 'Age', ar: 'العمر', icon: <User className="w-4 h-4" /> },
  nationality: { en: 'Nationality', ar: 'الجنسية', icon: <User className="w-4 h-4" /> },
};

const ProfileStrengthModal: React.FC<ProfileStrengthModalProps> = ({
  open,
  onOpenChange,
  percentage,
  missingFields,
  onProceedAnyway,
}) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", isRTL && "rtl")}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <DialogTitle className="text-xl">
              {isRTL ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isRTL
              ? 'المالكون يفضلون الملفات الشخصية الكاملة. يمكنك تحسين فرصك بإكمال ملفك الشخصي.'
              : 'Hosts prefer complete profiles. You can improve your chances by completing your profile.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? 'قوة الملف الشخصي' : 'Profile Strength'}
              </span>
              <span className="font-semibold">{percentage}%</span>
            </div>
            <div className="relative">
              <Progress value={percentage} className="h-3" />
              <div
                className={cn(
                  "absolute top-0 left-0 h-full rounded-full transition-all",
                  getProgressColor()
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isRTL ? 'الحقول المفقودة:' : 'Missing fields:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {missingFields.slice(0, 4).map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full text-sm"
                  >
                    {fieldLabels[field]?.icon}
                    <span>{isRTL ? fieldLabels[field]?.ar : fieldLabels[field]?.en}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onProceedAnyway}
            className="sm:flex-1"
          >
            {isRTL ? 'إرسال على أي حال' : 'Send Anyway'}
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate('/profile');
            }}
            className="sm:flex-1"
          >
            {isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileStrengthModal;
