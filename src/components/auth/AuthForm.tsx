import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Gift,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { z } from 'zod';
import DateOfBirthPicker, { dobToString, getAgeFromDob } from '@/components/DateOfBirthPicker';
import { UNIVERSITIES, FACULTIES, JOB_TITLES } from '@/lib/professionData';
import { Badge } from '@/components/ui/badge';
import { PERSONALITY_TAGS, getTagLabel } from '@/lib/personalityTags';
import { getGovernorates, getAreasForGovernorate, getGovernorateLabel, getAreaLabel } from '@/lib/locationData';
import { Phone, MapPin, Sparkles } from 'lucide-react';
import PhoneInput, { DEFAULT_COUNTRY, isValidLocal, toE164, type Country } from '@/components/PhoneInput';

const NATIONALITIES = [
  { value: 'egyptian', labelEn: 'Egyptian', labelAr: 'مصري' },
  { value: 'saudi', labelEn: 'Saudi', labelAr: 'سعودي' },
  { value: 'emirati', labelEn: 'Emirati', labelAr: 'إماراتي' },
  { value: 'kuwaiti', labelEn: 'Kuwaiti', labelAr: 'كويتي' },
  { value: 'qatari', labelEn: 'Qatari', labelAr: 'قطري' },
  { value: 'bahraini', labelEn: 'Bahraini', labelAr: 'بحريني' },
  { value: 'omani', labelEn: 'Omani', labelAr: 'عماني' },
  { value: 'jordanian', labelEn: 'Jordanian', labelAr: 'أردني' },
  { value: 'lebanese', labelEn: 'Lebanese', labelAr: 'لبناني' },
  { value: 'syrian', labelEn: 'Syrian', labelAr: 'سوري' },
  { value: 'palestinian', labelEn: 'Palestinian', labelAr: 'فلسطيني' },
  { value: 'iraqi', labelEn: 'Iraqi', labelAr: 'عراقي' },
  { value: 'yemeni', labelEn: 'Yemeni', labelAr: 'يمني' },
  { value: 'libyan', labelEn: 'Libyan', labelAr: 'ليبي' },
  { value: 'tunisian', labelEn: 'Tunisian', labelAr: 'تونسي' },
  { value: 'algerian', labelEn: 'Algerian', labelAr: 'جزائري' },
  { value: 'moroccan', labelEn: 'Moroccan', labelAr: 'مغربي' },
  { value: 'sudanese', labelEn: 'Sudanese', labelAr: 'سوداني' },
  { value: 'somali', labelEn: 'Somali', labelAr: 'صومالي' },
  { value: 'american', labelEn: 'American', labelAr: 'أمريكي' },
  { value: 'british', labelEn: 'British', labelAr: 'بريطاني' },
  { value: 'french', labelEn: 'French', labelAr: 'فرنسي' },
  { value: 'german', labelEn: 'German', labelAr: 'ألماني' },
  { value: 'italian', labelEn: 'Italian', labelAr: 'إيطالي' },
  { value: 'spanish', labelEn: 'Spanish', labelAr: 'إسباني' },
  { value: 'indian', labelEn: 'Indian', labelAr: 'هندي' },
  { value: 'pakistani', labelEn: 'Pakistani', labelAr: 'باكستاني' },
  { value: 'bangladeshi', labelEn: 'Bangladeshi', labelAr: 'بنغلاديشي' },
  { value: 'filipino', labelEn: 'Filipino', labelAr: 'فلبيني' },
  { value: 'indonesian', labelEn: 'Indonesian', labelAr: 'إندونيسي' },
  { value: 'turkish', labelEn: 'Turkish', labelAr: 'تركي' },
  { value: 'iranian', labelEn: 'Iranian', labelAr: 'إيراني' },
  { value: 'chinese', labelEn: 'Chinese', labelAr: 'صيني' },
  { value: 'japanese', labelEn: 'Japanese', labelAr: 'ياباني' },
  { value: 'korean', labelEn: 'Korean', labelAr: 'كوري' },
  { value: 'russian', labelEn: 'Russian', labelAr: 'روسي' },
  { value: 'ukrainian', labelEn: 'Ukrainian', labelAr: 'أوكراني' },
  { value: 'nigerian', labelEn: 'Nigerian', labelAr: 'نيجيري' },
  { value: 'south_african', labelEn: 'South African', labelAr: 'جنوب أفريقي' },
];

const HEAR_ABOUT_OPTIONS = [
  { value: '', labelEn: 'Select an option', labelAr: 'اختر خياراً' },
  { value: 'facebook', labelEn: 'Facebook', labelAr: 'فيسبوك' },
  { value: 'instagram', labelEn: 'Instagram', labelAr: 'إنستغرام' },
  { value: 'tiktok', labelEn: 'TikTok', labelAr: 'تيك توك' },
  { value: 'twitter', labelEn: 'Twitter / X', labelAr: 'تويتر / إكس' },
  { value: 'linkedin', labelEn: 'LinkedIn', labelAr: 'لينكدإن' },
  { value: 'youtube', labelEn: 'YouTube', labelAr: 'يوتيوب' },
  { value: 'google', labelEn: 'Google Search', labelAr: 'بحث جوجل' },
  { value: 'friend', labelEn: 'Friend / Word of mouth', labelAr: 'صديق / نصيحة' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

// Student email domain validation
const STUDENT_EMAIL_DOMAINS = ['.edu', '.edu.eg', '.ac.uk', '.ac.', '.edu.au', '.edu.sa', '.edu.ae', '.edu.jo', '.edu.lb', '.edu.iq'];

function isStudentEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return STUDENT_EMAIL_DOMAINS.some(domain => lower.endsWith(domain) || lower.includes(domain + '.'));
}


interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot' | 'student-signup';
  onToggleMode: (mode?: 'login' | 'signup' | 'forgot' | 'student-signup') => void;
  initialReferralCode?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode, initialReferralCode = '' }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const { t, isRTL } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [nationality, setNationality] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [occupationStatus, setOccupationStatus] = useState<'student' | 'working' | ''>(mode === 'student-signup' ? 'student' : '');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [interestedGov1, setInterestedGov1] = useState('');
  const [interestedArea1, setInterestedArea1] = useState('');
  const [interestedGov2, setInterestedGov2] = useState('');
  const [interestedArea2, setInterestedArea2] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [hearAboutUs, setHearAboutUs] = useState('');
  
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { language } = useLanguage();

  // Lock occupation to 'student' whenever in student-signup mode
  useEffect(() => {
    if (mode === 'student-signup') {
      setOccupationStatus('student');
      setJobTitle('');
    }
  }, [mode]);

  // Validate initial referral code if provided
  useEffect(() => {
    const validateInitialCode = async () => {
      if (initialReferralCode && initialReferralCode.length >= 3) {
        setReferralValidating(true);
        const { data } = await supabase.rpc('validate_referral_code', { p_code: initialReferralCode });
        setReferralValid(data === true);
        setReferralValidating(false);
      }
    };
    validateInitialCode();
  }, [initialReferralCode]);
  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        errors.email = e.errors[0].message;
      }
    }

    if (mode !== 'forgot') {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          errors.password = e.errors[0].message;
        }
      }
    }

    if (mode === 'signup' || mode === 'student-signup') {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          errors.fullName = e.errors[0].message;
        }
      }

      if (!gender) {
        errors.gender = 'Please select your gender';
      }

      if (!nationality) {
        errors.nationality = 'Please select your nationality';
      }

      const dob = dobToString(dobDay, dobMonth, dobYear);
      if (!dob) {
        errors.dob = isRTL ? 'يرجى إدخال تاريخ ميلادك' : 'Please enter your date of birth';
      } else {
        const age = getAgeFromDob(dob);
        if (age === null || age < 16 || age > 80) {
          errors.dob = isRTL ? 'يجب أن يكون عمرك بين 16 و 80 سنة' : 'You must be between 16 and 80 years old';
        }
      }

      if (!phone || !isValidLocal(phoneCountry, phone)) {
        errors.phone = isRTL ? 'يرجى إدخال رقم هاتف صالح' : 'Please enter a valid phone number';
      }

      if (!interestedArea1) {
        errors.interestedArea1 = isRTL ? 'يرجى اختيار المنطقة المهتم بها' : 'Please select an interested area';
      }

      if (mode === 'student-signup' && !isStudentEmail(email)) {
        errors.email = t('auth.studentEmailError');
      }

      // Occupation status mandatory
      if (!occupationStatus) {
        errors.occupationStatus = isRTL ? 'يرجى اختيار حالتك (طالب أو يعمل)' : 'Please select your status (student or working)';
      } else if (occupationStatus === 'student') {
        if (!university) errors.university = isRTL ? 'يرجى اختيار جامعتك' : 'Please select your university';
        if (!faculty) errors.faculty = isRTL ? 'يرجى اختيار كليتك' : 'Please select your faculty/college';
      } else if (occupationStatus === 'working') {
        if (!jobTitle) errors.jobTitle = isRTL ? 'يرجى اختيار مسمى وظيفتك' : 'Please select your job title';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowResendButton(false);

    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
            setError(t('auth.error.rateLimitExceeded'));
          } else {
            setError(error.message);
          }
        } else {
          setSuccess(t('auth.resetEmailSent'));
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.error.invalidCredentials'));
          } else if (error.message.includes('Email not confirmed')) {
            setError(t('auth.error.emailNotConfirmed'));
            setShowResendButton(true);
          } else {
            setError(error.message);
          }
        }
      } else {
        if (!gender) return;
        const dob = dobToString(dobDay, dobMonth, dobYear);
        const { error } = await signUp(
          email,
          password,
          fullName,
          gender,
          nationality,
          referralCode || undefined,
          dob || undefined,
          (occupationStatus || undefined) as 'student' | 'working' | undefined,
          occupationStatus === 'student' ? university : undefined,
          occupationStatus === 'student' ? faculty : undefined,
          occupationStatus === 'working' ? jobTitle : undefined,
          phone ? toE164(phoneCountry, phone) : undefined,
          interestedArea1 || undefined,
          interestedArea2 || undefined,
          selectedVibes.length > 0 ? selectedVibes : undefined,
          hearAboutUs || undefined,
        );
        if (error) {
          if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
            setError(t('auth.error.rateLimitExceeded'));
          } else if (error.message.includes('already registered')) {
            setError(t('auth.error.alreadyRegistered'));
          } else {
            setError(error.message);
          }
        } else {
          const isStudent = mode === 'student-signup';
          if (isStudent) {
            // Mark student verification in profile
            const updateStudentFlag = async (retries = 3) => {
              for (let i = 0; i < retries; i++) {
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ is_student_verified: true })
                  .eq('email', email);
                if (!updateError) break;
                await new Promise(r => setTimeout(r, 1000));
              }
            };
            updateStudentFlag();
          }
          setSuccess(isStudent ? t('auth.success.checkStudentEmail') : t('auth.success.checkEmail'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Use native Supabase resend (no auth required for unconfirmed users)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('over_email_send_rate_limit')) {
          setError(t('auth.error.rateLimitExceeded'));
        } else {
          setError(error.message);
        }
      } else {
        setSuccess(t('auth.resendEmailSuccess'));
        setShowResendButton(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err?.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-sakanak-success/10 border border-sakanak-success/20">
          <CheckCircle className="w-5 h-5 text-sakanak-success flex-shrink-0" />
          <p className="text-sm text-sakanak-success">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
          {/* Resend Email Button - appears when email not confirmed */}
          {showResendButton && mode === 'login' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full mt-1"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('auth.resendEmailSending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('auth.resendEmail')}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Full Name - Signup and Student Signup */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground font-medium">
            {t('auth.fullName')}
          </Label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              id="fullName"
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground font-medium">
          {mode === 'student-signup' ? t('auth.studentEmail') : t('auth.email')}
        </Label>
        <div className="relative">
          <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            id="email"
            type="email"
            placeholder={mode === 'student-signup' ? t('auth.studentEmailPlaceholder') : t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}
          />
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      {mode !== 'forgot' && (
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground font-medium">
          {t('auth.password')}
        </Label>
        <div className="relative">
          <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} h-12 rounded-xl border-border bg-background`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
      </div>
      )}

      {/* Forgot Password Link - Login only */}
      {mode === 'login' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onToggleMode('forgot')}
            className="text-sm text-primary hover:underline"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>
      )}

      {/* Gender - Signup and Student Signup */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {t('auth.gender')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">{t('auth.genderNote')}</p>
          <RadioGroup
            value={gender}
            onValueChange={(value) => setGender(value as 'male' | 'female')}
            className="flex gap-4"
          >
            <div className="flex-1">
              <RadioGroupItem
                value="male"
                id="male"
                className="peer sr-only"
              />
              <Label
                htmlFor="male"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <span className="text-lg">👨</span>
                <span className="font-medium">{t('auth.male')}</span>
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem
                value="female"
                id="female"
                className="peer sr-only"
              />
              <Label
                htmlFor="female"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <span className="text-lg">👩</span>
                <span className="font-medium">{t('auth.female')}</span>
              </Label>
            </div>
          </RadioGroup>
          {fieldErrors.gender && (
            <p className="text-sm text-destructive">{fieldErrors.gender}</p>
          )}
        </div>
      )}

      {/* Nationality - Signup and Student Signup */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-foreground font-medium">
            {t('auth.nationality')} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 ${isRTL ? 'right-3' : 'left-3'}`} />
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}>
                <SelectValue placeholder={t('auth.selectNationality')} />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((nat) => (
                  <SelectItem key={nat.value} value={nat.value}>
                    {language === 'ar' ? nat.labelAr : nat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fieldErrors.nationality && (
            <p className="text-sm text-destructive">{fieldErrors.nationality}</p>
          )}
        </div>
      )}

      {/* Date of Birth - Signup and Student Signup */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <DateOfBirthPicker
          day={dobDay}
          month={dobMonth}
          year={dobYear}
          onDayChange={setDobDay}
          onMonthChange={setDobMonth}
          onYearChange={setDobYear}
          error={fieldErrors.dob}
          required
        />
      )}

      {/* Occupation Status (mandatory) - Signup only. Student-signup is locked to student. */}
      {mode === 'signup' && (
        <div className="space-y-3">
          <Label className="text-foreground font-medium">
            {isRTL ? 'الحالة' : 'Status'} <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={occupationStatus}
            onValueChange={(v) => {
              setOccupationStatus(v as 'student' | 'working');
              if (v === 'student') setJobTitle('');
              if (v === 'working') { setUniversity(''); setFaculty(''); }
            }}
            className="flex gap-4"
          >
            <div className="flex-1">
              <RadioGroupItem value="student" id="occ-student" className="peer sr-only" />
              <Label
                htmlFor="occ-student"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">{isRTL ? 'طالب' : 'Student'}</span>
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem value="working" id="occ-working" className="peer sr-only" />
              <Label
                htmlFor="occ-working"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50"
              >
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{isRTL ? 'يعمل' : 'Working'}</span>
              </Label>
            </div>
          </RadioGroup>
          {fieldErrors.occupationStatus && (
            <p className="text-sm text-destructive">{fieldErrors.occupationStatus}</p>
          )}
        </div>
      )}

      {/* University + Faculty (if student) */}
      {(mode === 'signup' || mode === 'student-signup') && occupationStatus === 'student' && (
        <>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {isRTL ? 'الجامعة' : 'University'} <span className="text-destructive">*</span>
            </Label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر جامعتك' : 'Select your university'} />
              </SelectTrigger>
              <SelectContent>
                {UNIVERSITIES.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {language === 'ar' ? u.labelAr : u.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.university && (
              <p className="text-sm text-destructive">{fieldErrors.university}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {isRTL ? 'الكلية' : 'Faculty / College'} <span className="text-destructive">*</span>
            </Label>
            <Select value={faculty} onValueChange={setFaculty}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر كليتك' : 'Select your faculty'} />
              </SelectTrigger>
              <SelectContent>
                {FACULTIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {language === 'ar' ? f.labelAr : f.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.faculty && (
              <p className="text-sm text-destructive">{fieldErrors.faculty}</p>
            )}
          </div>
        </>
      )}

      {/* Job Title (if working) */}
      {(mode === 'signup' || mode === 'student-signup') && occupationStatus === 'working' && (
        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            {isRTL ? 'المسمى الوظيفي' : 'Job Title'} <span className="text-destructive">*</span>
          </Label>
          <Select value={jobTitle} onValueChange={setJobTitle}>
            <SelectTrigger className="h-12 rounded-xl border-border bg-background">
              <SelectValue placeholder={isRTL ? 'اختر مسمى وظيفتك' : 'Select your job title'} />
            </SelectTrigger>
            <SelectContent>
              {JOB_TITLES.map((j) => (
                <SelectItem key={j.value} value={j.value}>
                  {language === 'ar' ? j.labelAr : j.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.jobTitle && (
            <p className="text-sm text-destructive">{fieldErrors.jobTitle}</p>
          )}
        </div>
      )}

      {/* Phone - Signup & Student Signup */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground font-medium">
            {isRTL ? 'رقم الهاتف' : 'Phone Number'} <span className="text-destructive">*</span>
          </Label>
          <PhoneInput
            id="phone"
            country={phoneCountry}
            onCountryChange={setPhoneCountry}
            local={phone}
            onLocalChange={setPhone}
            isRTL={isRTL}
            language={language as 'en' | 'ar'}
            invalid={!!fieldErrors.phone}
          />
          {fieldErrors.phone && (
            <p className="text-sm text-destructive">{fieldErrors.phone}</p>
          )}
        </div>
      )}

      {/* Interested Area 1 (Required) */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label className="text-foreground font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {isRTL ? 'المنطقة المهتم بها' : 'Interested Area'} <span className="text-destructive">*</span>
          </Label>
          <Select value={interestedGov1} onValueChange={(v) => { setInterestedGov1(v); setInterestedArea1(''); }}>
            <SelectTrigger className="h-12 rounded-xl border-border bg-background">
              <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
            </SelectTrigger>
            <SelectContent>
              {getGovernorates().map((gov) => (
                <SelectItem key={gov} value={gov}>
                  {getGovernorateLabel(gov, isRTL)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {interestedGov1 && (
            <Select value={interestedArea1} onValueChange={setInterestedArea1}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select area'} />
              </SelectTrigger>
              <SelectContent>
                {getAreasForGovernorate(interestedGov1).map((area) => (
                  <SelectItem key={area} value={area}>
                    {getAreaLabel(area, isRTL)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {fieldErrors.interestedArea1 && (
            <p className="text-sm text-destructive">{fieldErrors.interestedArea1}</p>
          )}
        </div>
      )}

      {/* Interested Area 2 (Optional) */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label className="text-foreground font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {isRTL ? 'منطقة ثانية (اختياري)' : 'Second Area (optional)'}
          </Label>
          <Select value={interestedGov2} onValueChange={(v) => { setInterestedGov2(v); setInterestedArea2(''); }}>
            <SelectTrigger className="h-12 rounded-xl border-border bg-background">
              <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
            </SelectTrigger>
            <SelectContent>
              {getGovernorates().map((gov) => (
                <SelectItem key={gov} value={gov}>
                  {getGovernorateLabel(gov, isRTL)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {interestedGov2 && (
            <Select value={interestedArea2} onValueChange={setInterestedArea2}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select area'} />
              </SelectTrigger>
              <SelectContent>
                {getAreasForGovernorate(interestedGov2).map((area) => (
                  <SelectItem key={area} value={area}>
                    {getAreaLabel(area, isRTL)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* Vibes (Optional) */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label className="text-foreground font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isRTL ? 'الـ Vibes بتاعتك' : 'Your Vibes'}{' '}
            <span className="text-xs text-muted-foreground font-normal">
              ({isRTL ? 'اختر حتى 5' : 'pick up to 5'})
            </span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TAGS.map((tag) => {
              const isSelected = selectedVibes.includes(tag.value);
              return (
                <Badge
                  key={tag.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedVibes(selectedVibes.filter((v) => v !== tag.value));
                    } else if (selectedVibes.length < 5) {
                      setSelectedVibes([...selectedVibes, tag.value]);
                    }
                  }}
                >
                  {getTagLabel(tag.value, language === 'ar')}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="referralCode" className="text-foreground font-medium">
            {isRTL ? 'كود الإحالة (اختياري)' : 'Referral Code (Optional)'}
          </Label>
          <div className="relative">
            <Gift className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              id="referralCode"
              type="text"
              placeholder={isRTL ? 'مثال: AHMED10' : 'e.g., AHMED10'}
              value={referralCode}
              onChange={async (e) => {
                const code = e.target.value.toUpperCase();
                setReferralCode(code);
                setReferralValid(null);
                
                if (code.length >= 3) {
                  setReferralValidating(true);
                  const { data } = await supabase.rpc('validate_referral_code', { p_code: code });
                  setReferralValid(data === true);
                  setReferralValidating(false);
                }
              }}
              className={`${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} h-12 rounded-xl border-border bg-background uppercase`}
            />
            {referralCode.length >= 3 && (
              <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}>
                {referralValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : referralValid === true ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : referralValid === false ? (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                ) : null}
              </div>
            )}
          </div>
          {referralCode.length >= 3 && referralValid === false && (
            <p className="text-sm text-destructive">
              {isRTL ? 'كود الإحالة غير صالح' : 'Invalid referral code'}
            </p>
          )}
          {referralCode.length >= 3 && referralValid === true && (
            <p className="text-sm text-green-600">
              {isRTL ? 'كود صالح! ✓' : 'Valid code! ✓'}
            </p>
          )}
        </div>
      )}

      {/* How did you hear about Sakanak? (Optional) */}
      {(mode === 'signup' || mode === 'student-signup') && (
        <div className="space-y-2">
          <Label htmlFor="hearAboutUs" className="text-foreground font-medium">
            {isRTL ? 'إزاي سمعت عن سكنك؟' : 'How did you hear about Sakanak?'}
          </Label>
          <Select value={hearAboutUs} onValueChange={setHearAboutUs}>
            <SelectTrigger className="h-12 rounded-xl border-border bg-background">
              <SelectValue placeholder={isRTL ? 'اختر خياراً (اختياري)' : 'Select an option (optional)'} />
            </SelectTrigger>
            <SelectContent>
              {HEAR_ABOUT_OPTIONS.filter(o => o.value !== '').map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {isRTL ? opt.labelAr : opt.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base rounded-xl gap-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {mode === 'forgot' 
              ? t('auth.sendResetLink') 
              : mode === 'login' 
                ? t('auth.signIn') 
                : t('auth.createAccount')}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </>
        )}
      </Button>

      {/* Divider - Not on forgot password */}
      {mode !== 'forgot' && (
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">{t('auth.or')}</span>
          <Separator className="flex-1" />
        </div>
      )}

      {/* Social Sign In - Not on forgot password */}
      {mode !== 'forgot' && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-12 font-medium text-base rounded-xl gap-3"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.continueWithGoogle')}
              </>
            )}
          </Button>

        </div>
      )}

      {/* Join as Student - Only on signup and login */}
      {(mode === 'signup' || mode === 'login') && (
        <Button
          type="button"
          variant="outline"
          onClick={() => onToggleMode('student-signup')}
          disabled={loading}
          className="w-full h-12 font-medium text-base rounded-xl gap-3 border-primary/30 text-primary hover:bg-primary/5"
        >
          <GraduationCap className="w-5 h-5" />
          {t('auth.joinAsStudent')}
        </Button>
      )}

      {/* Toggle Mode */}
      {mode === 'forgot' ? (
        <p className="text-center text-muted-foreground">
          <button
            type="button"
            onClick={() => onToggleMode('login')}
            className="text-primary font-semibold hover:underline"
          >
            {t('auth.backToLogin')}
          </button>
        </p>
      ) : mode === 'student-signup' ? (
        <p className="text-center text-muted-foreground">
          <button
            type="button"
            onClick={() => onToggleMode('signup')}
            className="text-primary font-semibold hover:underline"
          >
            {t('auth.backToSignup')}
          </button>
        </p>
      ) : (
        <p className="text-center text-muted-foreground">
          {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button
            type="button"
            onClick={() => onToggleMode()}
            className="text-primary font-semibold hover:underline"
          >
            {mode === 'login' ? t('auth.signUpLink') : t('auth.signInLink')}
          </button>
        </p>
      )}
    </form>
  );
};

export default AuthForm;
