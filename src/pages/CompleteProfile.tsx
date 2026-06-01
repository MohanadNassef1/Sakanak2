import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, GraduationCap, Briefcase, Phone, MapPin, Globe, Sparkles, Gift } from 'lucide-react';
import { toast } from 'sonner';
import DateOfBirthPicker, { dobToString, getAgeFromDob } from '@/components/DateOfBirthPicker';
import { UNIVERSITIES, FACULTIES, JOB_TITLES } from '@/lib/professionData';
import { getGovernorates, getAreasForGovernorate, getGovernorateLabel, getAreaLabel } from '@/lib/locationData';
import { Badge } from '@/components/ui/badge';
import { PERSONALITY_TAGS, getTagLabel } from '@/lib/personalityTags';
import PhoneInput, { DEFAULT_COUNTRY, isValidLocal, toE164, parsePhone, type Country } from '@/components/PhoneInput';
import { NATIONALITIES } from '@/lib/nationalities';

const HEAR_ABOUT_OPTIONS = [
  { value: 'facebook', labelEn: 'Facebook', labelAr: 'فيسبوك' },
  { value: 'instagram', labelEn: 'Instagram', labelAr: 'إنستغرام' },
  { value: 'tiktok', labelEn: 'TikTok', labelAr: 'تيك توك' },
  { value: 'twitter', labelEn: 'Twitter / X', labelAr: 'تويتر / إكس' },
  { value: 'linkedin', labelEn: 'LinkedIn', labelAr: 'لينكدإن' },
  { value: 'youtube', labelEn: 'YouTube', labelAr: 'يوتيوب' },
  { value: 'google', labelEn: 'Google Search', labelAr: 'بحث جوجل' },
  { value: 'friend', labelEn: 'Friend / Word of mouth', labelAr: 'صديق / نصيحة' },
];


const CompleteProfile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isRTL, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [genderLocked, setGenderLocked] = useState(false);

  // form state
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [nationality, setNationality] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [occupationStatus, setOccupationStatus] = useState<'student' | 'working' | ''>('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interestedGov1, setInterestedGov1] = useState('');
  const [interestedArea1, setInterestedArea1] = useState('');
  const [interestedGov2, setInterestedGov2] = useState('');
  const [interestedArea2, setInterestedArea2] = useState('');
  const [isSmoker, setIsSmoker] = useState<'yes' | 'no' | ''>('');
  const [hasPets, setHasPets] = useState<'yes' | 'no' | ''>('');
  const [petType, setPetType] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [hearAboutUs, setHearAboutUs] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralLocked, setReferralLocked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('gender, phone, nationality, date_of_birth, occupation_status, university, faculty, job_title, interested_area_1, interested_area_2, is_smoker, has_pets, pet_type, personality_tags, hear_about_us, referred_by')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        if (data.gender) { setGender(data.gender as any); setGenderLocked(true); }
        if (data.phone) {
          const parsed = parsePhone(data.phone);
          setPhoneCountry(parsed.country);
          setPhone(parsed.local);
        }
        if (data.nationality) setNationality(data.nationality);
        if (data.date_of_birth) {
          const d = new Date(data.date_of_birth);
          setDobYear(String(d.getFullYear()));
          setDobMonth(String(d.getMonth() + 1).padStart(2, '0'));
          setDobDay(String(d.getDate()).padStart(2, '0'));
        }
        if (data.occupation_status) setOccupationStatus(data.occupation_status as any);
        if (data.university) setUniversity(data.university);
        if (data.faculty) setFaculty(data.faculty);
        if (data.job_title) setJobTitle(data.job_title);
        if (data.interested_area_1) setInterestedArea1(data.interested_area_1);
        if (data.interested_area_2) setInterestedArea2(data.interested_area_2);
        if (typeof data.is_smoker === 'boolean') setIsSmoker(data.is_smoker ? 'yes' : 'no');
        if (typeof data.has_pets === 'boolean') setHasPets(data.has_pets ? 'yes' : 'no');
        if (data.pet_type) setPetType(data.pet_type);
        if (data.personality_tags?.length) setSelectedVibes(data.personality_tags);
        if (data.hear_about_us) setHearAboutUs(data.hear_about_us);
        if (data.referred_by) {
          setReferralCode(data.referred_by);
          setReferralLocked(true);
          setReferralValid(true);
        }
        // NOTE: do NOT auto-redirect to '/' here. The global
        // useProfileCompletionGuard owns redirect logic; bouncing from this
        // page can ping-pong with the guard and create an infinite loop.
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  // Validate referral code on change (debounced)
  useEffect(() => {
    if (referralLocked) return;
    const code = referralCode.trim();
    if (!code) { setReferralValid(null); return; }
    if (code.length < 3) { setReferralValid(null); return; }
    setReferralValidating(true);
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('validate_referral_code', { p_code: code });
      setReferralValid(data === true);
      setReferralValidating(false);
    }, 400);
    return () => clearTimeout(t);
  }, [referralCode, referralLocked]);

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!gender) e.gender = isRTL ? 'يرجى اختيار النوع' : 'Please select your gender';
    if (!nationality) e.nationality = isRTL ? 'يرجى اختيار الجنسية' : 'Please select nationality';
    const dob = dobToString(dobDay, dobMonth, dobYear);
    if (!dob) e.dob = isRTL ? 'يرجى إدخال تاريخ الميلاد' : 'Please enter your date of birth';
    else {
      const age = getAgeFromDob(dob);
      if (age === null || age < 16 || age > 80) e.dob = isRTL ? 'العمر يجب أن يكون بين 16 و80' : 'Age must be 16-80';
    }
    if (!phone || !isValidLocal(phoneCountry, phone)) e.phone = isRTL ? 'يرجى إدخال رقم هاتف صالح' : 'Please enter a valid phone number';
    if (!occupationStatus) e.occupationStatus = isRTL ? 'اختر حالتك' : 'Select your status';
    else if (occupationStatus === 'student') {
      if (!university) e.university = isRTL ? 'اختر جامعتك' : 'Select university';
      if (!faculty) e.faculty = isRTL ? 'اختر كليتك' : 'Select faculty';
    } else if (occupationStatus === 'working') {
      if (!jobTitle) e.jobTitle = isRTL ? 'اختر مسمى وظيفتك' : 'Select job title';
    }
    if (!interestedArea1) e.interestedArea1 = isRTL ? 'اختر منطقة مهتم بها' : 'Select an interested area';
    if (!hearAboutUs) e.hearAboutUs = isRTL ? 'يرجى اختيار كيف سمعت عنّا' : 'Please tell us how you heard about us';
    if (!isSmoker) e.isSmoker = isRTL ? 'يرجى اختيار إذا كنت مدخن' : 'Please select if you smoke';
    if (!hasPets) e.hasPets = isRTL ? 'يرجى اختيار إذا كان لديك حيوان أليف' : 'Please select if you have pets';
    else if (hasPets === 'yes' && !petType) e.petType = isRTL ? 'اختر نوع الحيوان الأليف' : 'Select pet type';
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      const issues = Object.values(errs).filter(Boolean);
      const summary = issues.join(' • ');
      setSaveError(summary);
      toast.error((isRTL ? 'تعذر الحفظ: ' : 'Cannot save: ') + summary);
      setTimeout(() => {
        document.querySelector('.text-destructive')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      const dob = dobToString(dobDay, dobMonth, dobYear);
      const update: any = {
        phone: toE164(phoneCountry, phone),
        nationality,
        date_of_birth: dob,
        occupation_status: occupationStatus,
        university: occupationStatus === 'student' ? university : null,
        faculty: occupationStatus === 'student' ? faculty : null,
        job_title: occupationStatus === 'working' ? jobTitle : null,
        interested_area_1: interestedArea1,
        interested_area_2: interestedArea2 || null,
        is_smoker: isSmoker === 'yes',
        has_pets: hasPets === 'yes',
        pet_type: hasPets === 'yes' ? (petType || null) : null,
        personality_tags: selectedVibes,
        hear_about_us: hearAboutUs || null,
      };
      if (!genderLocked) update.gender = gender;
      if (!referralLocked && referralCode.trim() && referralValid) {
        update.referred_by = referralCode.trim().toUpperCase();
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(update)
        .eq('user_id', user.id)
        .select('user_id')
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedProfile) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User';

        const { error: insertError } = await supabase.from('profiles').insert({
          user_id: user.id,
          email: user.email || '',
          full_name: fullName,
          gender: gender || null,
          ...update,
        });

        if (insertError) throw insertError;
      }
      toast.success(isRTL ? 'تم حفظ ملفك بنجاح' : 'Profile saved');
      navigate('/', { replace: true });
    } catch (err: any) {
      // Build a detailed, user-readable error from Supabase/Postgres error shape
      const parts = [
        err?.message,
        err?.details,
        err?.hint,
        err?.code ? `(${err.code})` : null,
      ].filter(Boolean);
      const detail = parts.length
        ? parts.join(' — ')
        : (isRTL ? 'حدث خطأ غير معروف' : 'Unknown error');
      setSaveError(detail);
      toast.error((isRTL ? 'فشل حفظ الملف: ' : 'Failed to save profile: ') + detail, {
        duration: 8000,
      });
      // eslint-disable-next-line no-console
      console.error('[CompleteProfile] save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {isRTL ? 'أكمل ملفك الشخصي' : 'Complete your profile'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isRTL
            ? 'نحتاج بعض المعلومات الإضافية قبل ما تستخدم المنصة'
            : 'We need a few more details before you can use the platform.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {saveError && (
            <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-semibold mb-1">
                {isRTL ? 'تعذر حفظ ملفك الشخصي' : 'Could not save your profile'}
              </p>
              <p className="whitespace-pre-wrap break-words">{saveError}</p>
            </div>
          )}
          {/* Gender */}
          <div className="space-y-3">
            <Label className="font-medium">
              {isRTL ? 'النوع' : 'Gender'} <span className="text-destructive">*</span>
            </Label>
            {genderLocked && (
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'النوع لا يمكن تغييره بعد الحفظ' : 'Gender cannot be changed once set'}
              </p>
            )}
            <RadioGroup
              value={gender}
              onValueChange={(v) => !genderLocked && setGender(v as 'male' | 'female')}
              className="flex gap-4"
              disabled={genderLocked}
            >
              {(['male', 'female'] as const).map((g) => (
                <div key={g} className="flex-1">
                  <RadioGroupItem value={g} id={`g-${g}`} className="peer sr-only" disabled={genderLocked} />
                  <Label
                    htmlFor={`g-${g}`}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 ${genderLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg">{g === 'male' ? '👨' : '👩'}</span>
                    <span className="font-medium">{isRTL ? (g === 'male' ? 'ذكر' : 'أنثى') : (g === 'male' ? 'Male' : 'Female')}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label className="font-medium">{isRTL ? 'الجنسية' : 'Nationality'} <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Globe className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 ${isRTL ? 'right-3' : 'left-3'}`} />
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className={`${isRTL ? 'pr-11' : 'pl-11'} h-12 rounded-xl border-border bg-background`}>
                  <SelectValue placeholder={isRTL ? 'اختر الجنسية' : 'Select nationality'} />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITIES.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      {language === 'ar' ? n.labelAr : n.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.nationality && <p className="text-sm text-destructive">{errors.nationality}</p>}
          </div>

          {/* DOB */}
          <DateOfBirthPicker
            day={dobDay} month={dobMonth} year={dobYear}
            onDayChange={setDobDay} onMonthChange={setDobMonth} onYearChange={setDobYear}
            error={errors.dob} required
          />

          {/* Phone */}
          <div className="space-y-2">
            <Label className="font-medium">{isRTL ? 'رقم الهاتف' : 'Phone'} <span className="text-destructive">*</span></Label>
            <PhoneInput
              country={phoneCountry}
              onCountryChange={setPhoneCountry}
              local={phone}
              onLocalChange={setPhone}
              isRTL={isRTL}
              language={language as 'en' | 'ar'}
              invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          {/* Occupation */}
          <div className="space-y-3">
            <Label className="font-medium">{isRTL ? 'الحالة' : 'Status'} <span className="text-destructive">*</span></Label>
            <RadioGroup
              value={occupationStatus}
              onValueChange={(v) => {
                setOccupationStatus(v as any);
                if (v === 'student') setJobTitle('');
                if (v === 'working') { setUniversity(''); setFaculty(''); }
              }}
              className="flex gap-4"
            >
              <div className="flex-1">
                <RadioGroupItem value="student" id="occ-student" className="peer sr-only" />
                <Label htmlFor="occ-student" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{isRTL ? 'طالب' : 'Student'}</span>
                </Label>
              </div>
              <div className="flex-1">
                <RadioGroupItem value="working" id="occ-working" className="peer sr-only" />
                <Label htmlFor="occ-working" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium">{isRTL ? 'يعمل' : 'Working'}</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.occupationStatus && <p className="text-sm text-destructive">{errors.occupationStatus}</p>}
          </div>

          {occupationStatus === 'student' && (
            <>
              <div className="space-y-2">
                <Label className="font-medium">{isRTL ? 'الجامعة' : 'University'} <span className="text-destructive">*</span></Label>
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                    <SelectValue placeholder={isRTL ? 'اختر جامعتك' : 'Select university'} />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIVERSITIES.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{language === 'ar' ? u.labelAr : u.labelEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.university && <p className="text-sm text-destructive">{errors.university}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-medium">{isRTL ? 'الكلية' : 'Faculty'} <span className="text-destructive">*</span></Label>
                <Select value={faculty} onValueChange={setFaculty}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                    <SelectValue placeholder={isRTL ? 'اختر كليتك' : 'Select faculty'} />
                  </SelectTrigger>
                  <SelectContent>
                    {FACULTIES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{language === 'ar' ? f.labelAr : f.labelEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && <p className="text-sm text-destructive">{errors.faculty}</p>}
              </div>
            </>
          )}

          {occupationStatus === 'working' && (
            <div className="space-y-2">
              <Label className="font-medium">{isRTL ? 'المسمى الوظيفي' : 'Job Title'} <span className="text-destructive">*</span></Label>
              <Select value={jobTitle} onValueChange={setJobTitle}>
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder={isRTL ? 'اختر مسمى وظيفتك' : 'Select job title'} />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TITLES.map((j) => (
                    <SelectItem key={j.value} value={j.value}>{language === 'ar' ? j.labelAr : j.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle}</p>}
            </div>
          )}

          {/* Interested area */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {isRTL ? 'المنطقة المهتم بها' : 'Interested Area'} <span className="text-destructive">*</span>
            </Label>
            <Select value={interestedGov1} onValueChange={(v) => { setInterestedGov1(v); setInterestedArea1(''); }}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
              </SelectTrigger>
              <SelectContent>
                {getGovernorates().map((gov) => (
                  <SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>
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
                    <SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.interestedArea1 && <p className="text-sm text-destructive">{errors.interestedArea1}</p>}
          </div>

          {/* Second Interested Area (optional) */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {isRTL ? 'منطقة ثانية (اختياري)' : 'Second Area (optional)'}
            </Label>
            <Select value={interestedGov2} onValueChange={(v) => { setInterestedGov2(v); setInterestedArea2(''); }}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
              </SelectTrigger>
              <SelectContent>
                {getGovernorates().map((gov) => (
                  <SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>
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
                    <SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Smoker */}
          <div className="space-y-3">
            <Label className="font-medium">
              {isRTL ? 'هل أنت مدخن؟' : 'Do you smoke?'} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={isSmoker}
              onValueChange={(v) => setIsSmoker(v as 'yes' | 'no')}
              className="flex gap-4"
            >
              {(['yes', 'no'] as const).map((v) => (
                <div key={v} className="flex-1">
                  <RadioGroupItem value={v} id={`smoker-${v}`} className="peer sr-only" />
                  <Label htmlFor={`smoker-${v}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50">
                    <span className="font-medium">{isRTL ? (v === 'yes' ? 'نعم' : 'لا') : (v === 'yes' ? 'Yes' : 'No')}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.isSmoker && <p className="text-sm text-destructive">{errors.isSmoker}</p>}
          </div>

          {/* Pets */}
          <div className="space-y-3">
            <Label className="font-medium">
              {isRTL ? 'هل لديك حيوان أليف؟' : 'Do you have pets?'} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={hasPets}
              onValueChange={(v) => { setHasPets(v as 'yes' | 'no'); if (v === 'no') setPetType(''); }}
              className="flex gap-4"
            >
              {(['yes', 'no'] as const).map((v) => (
                <div key={v} className="flex-1">
                  <RadioGroupItem value={v} id={`pets-${v}`} className="peer sr-only" />
                  <Label htmlFor={`pets-${v}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-border bg-background cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50">
                    <span className="font-medium">{isRTL ? (v === 'yes' ? 'نعم' : 'لا') : (v === 'yes' ? 'Yes' : 'No')}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.hasPets && <p className="text-sm text-destructive">{errors.hasPets}</p>}
            {hasPets === 'yes' && (
              <div className="space-y-2 pt-1">
                <Label className="font-medium">
                  {isRTL ? 'نوع الحيوان الأليف' : 'Pet type'} <span className="text-destructive">*</span>
                </Label>
                <Select value={petType} onValueChange={setPetType}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                    <SelectValue placeholder={isRTL ? 'اختر النوع' : 'Select pet type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat">{isRTL ? 'قطة' : 'Cat'}</SelectItem>
                    <SelectItem value="dog">{isRTL ? 'كلب' : 'Dog'}</SelectItem>
                    <SelectItem value="bird">{isRTL ? 'طائر' : 'Bird'}</SelectItem>
                    <SelectItem value="rabbit">{isRTL ? 'أرنب' : 'Rabbit'}</SelectItem>
                    <SelectItem value="fish">{isRTL ? 'سمك' : 'Fish'}</SelectItem>
                    <SelectItem value="other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.petType && <p className="text-sm text-destructive">{errors.petType}</p>}
              </div>
            )}
          </div>

          {/* Vibes (optional) */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isRTL ? 'الـ Vibes بتاعتك' : 'Your Vibes'}{' '}
              <span className="text-xs text-muted-foreground font-normal">
                ({isRTL ? 'اختياري - حتى 5' : 'optional - up to 5'})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => {
                const isSelected = selectedVibes.includes(tag.value);
                return (
                  <Badge
                    key={tag.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                    onClick={() => {
                      if (isSelected) setSelectedVibes(selectedVibes.filter((v) => v !== tag.value));
                      else if (selectedVibes.length < 5) setSelectedVibes([...selectedVibes, tag.value]);
                    }}
                  >
                    {getTagLabel(tag.value, isRTL)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* How did you hear about us (optional) */}
          <div className="space-y-2">
            <Label className="font-medium">{isRTL ? 'كيف عرفت عن سكنك؟' : 'How did you hear about Sakanak?'}</Label>
            <Select value={hearAboutUs} onValueChange={setHearAboutUs}>
              <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                <SelectValue placeholder={isRTL ? 'اختر خياراً' : 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {HEAR_ABOUT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{language === 'ar' ? o.labelAr : o.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referral code (optional, only if not already set) */}
          {!referralLocked && (
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {isRTL ? 'كود الإحالة (اختياري)' : 'Referral Code (optional)'}
              </Label>
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder={isRTL ? 'أدخل كود صديقك' : "Enter your friend's code"}
                className="h-12 rounded-xl border-border bg-background"
              />
              {referralCode.trim().length >= 3 && (
                <p className={`text-xs ${referralValidating ? 'text-muted-foreground' : referralValid ? 'text-sakanak-success' : 'text-destructive'}`}>
                  {referralValidating
                    ? (isRTL ? 'جاري التحقق...' : 'Validating...')
                    : referralValid
                      ? (isRTL ? 'كود صالح ✓' : 'Valid code ✓')
                      : (isRTL ? 'كود غير صالح' : 'Invalid code')}
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRTL ? 'حفظ ومتابعة' : 'Save and continue')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
