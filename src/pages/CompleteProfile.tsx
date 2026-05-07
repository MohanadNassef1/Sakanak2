import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Phone, GraduationCap, Briefcase, Sparkles, Globe, User, Calendar, MapPin } from 'lucide-react';
import DateOfBirthPicker, { dobToString, parseDob, getAgeFromDob } from '@/components/DateOfBirthPicker';
import { PERSONALITY_TAGS, getTagLabel } from '@/lib/personalityTags';
import { locationData, getGovernorateLabel, getAreaLabel, getGovernorates, getAreasForGovernorate } from '@/lib/locationData';
import { FACULTIES, JOB_TITLES } from '@/lib/professionData';

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
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

const UNIVERSITIES = [
  { id: 'cairo_uni', labelEn: 'Cairo University', labelAr: 'جامعة القاهرة' },
  { id: 'ain_shams', labelEn: 'Ain Shams University', labelAr: 'جامعة عين شمس' },
  { id: 'alexandria_uni', labelEn: 'Alexandria University', labelAr: 'جامعة الإسكندرية' },
  { id: 'helwan', labelEn: 'Helwan University', labelAr: 'جامعة حلوان' },
  { id: 'azhar', labelEn: 'Al-Azhar University', labelAr: 'جامعة الأزهر' },
  { id: 'mansoura', labelEn: 'Mansoura University', labelAr: 'جامعة المنصورة' },
  { id: 'zagazig', labelEn: 'Zagazig University', labelAr: 'جامعة الزقازيق' },
  { id: 'tanta', labelEn: 'Tanta University', labelAr: 'جامعة طنطا' },
  { id: 'assiut', labelEn: 'Assiut University', labelAr: 'جامعة أسيوط' },
  { id: 'guc', labelEn: 'German University in Cairo (GUC)', labelAr: 'الجامعة الألمانية بالقاهرة' },
  { id: 'auc', labelEn: 'American University in Cairo (AUC)', labelAr: 'الجامعة الأمريكية بالقاهرة' },
  { id: 'bue', labelEn: 'British University in Egypt (BUE)', labelAr: 'الجامعة البريطانية في مصر' },
  { id: 'msa', labelEn: 'MSA University', labelAr: 'جامعة أكتوبر للعلوم الحديثة' },
  { id: 'nile', labelEn: 'Nile University', labelAr: 'جامعة النيل' },
  { id: 'aast', labelEn: 'Arab Academy for Science and Technology (AAST)', labelAr: 'الأكاديمية العربية للعلوم والتكنولوجيا' },
  { id: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

const CompleteProfileContent: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [nationality, setNationality] = useState('');
  const [phone, setPhone] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [occupationStatus, setOccupationStatus] = useState<'student' | 'working' | ''>('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [interestedGov1, setInterestedGov1] = useState('');
  const [interestedArea1, setInterestedArea1] = useState('');
  const [interestedGov2, setInterestedGov2] = useState('');
  const [interestedArea2, setInterestedArea2] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingProfile, setCheckingProfile] = useState(true);

  // If not logged in, redirect to auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/complete-profile');
    }
  }, [user, authLoading, navigate]);

  // Check if profile already exists (user doesn't need this page)
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, gender, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && profile.gender && profile.phone) {
        // Profile already complete, redirect home
        navigate('/');
        return;
      }
      
      // Pre-fill name from OAuth if available
      setCheckingProfile(false);
    };
    if (!authLoading && user) {
      checkProfile();
    }
  }, [user, authLoading, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!gender) errs.gender = isRTL ? 'يرجى اختيار الجنس' : 'Please select your gender';
    if (!nationality) errs.nationality = isRTL ? 'يرجى اختيار الجنسية' : 'Please select nationality';
    if (!phone || !/^01[0-9]{9}$/.test(phone.trim())) {
      errs.phone = isRTL ? 'يرجى إدخال رقم هاتف مصري صالح (01xxxxxxxxx)' : 'Please enter a valid Egyptian phone number (01xxxxxxxxx)';
    }
    const dob = dobToString(dobDay, dobMonth, dobYear);
    if (!dob) {
      errs.dob = isRTL ? 'يرجى إدخال تاريخ ميلادك' : 'Please enter your date of birth';
    } else {
      const age = getAgeFromDob(dob);
      if (age === null || age < 16 || age > 80) {
        errs.dob = isRTL ? 'يجب أن يكون عمرك بين 16 و 80 سنة' : 'You must be between 16 and 80 years old';
      }
    }
    if (!occupationStatus) errs.occupationStatus = isRTL ? 'يرجى اختيار حالتك' : 'Please select your status';
    if (occupationStatus === 'student' && !selectedUniversity) {
      errs.university = isRTL ? 'يرجى اختيار جامعتك' : 'Please select your university';
    }
    if (occupationStatus === 'student' && !faculty) {
      errs.faculty = isRTL ? 'يرجى اختيار كليتك' : 'Please select your faculty/college';
    }
    if (occupationStatus === 'working' && !jobTitle) {
      errs.jobTitle = isRTL ? 'يرجى اختيار مسمى وظيفتك' : 'Please select your job title';
    }
    if (!interestedArea1) {
      errs.interestedArea1 = isRTL ? 'يرجى اختيار المنطقة المهتم بها' : 'Please select your interested area';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setSaving(true);

    try {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData: Record<string, any> = {
        gender: gender as 'male' | 'female',
        nationality,
        phone: phone.trim(),
        date_of_birth: dobToString(dobDay, dobMonth, dobYear),
        occupation_status: occupationStatus || null,
        occupation: occupationStatus === 'student' ? 'Student' : occupationStatus === 'working' ? 'Working' : null,
        personality_tags: selectedVibes.length > 0 ? selectedVibes : [],
        interested_area_1: interestedArea1 || null,
        interested_area_2: interestedArea2 || null,
      };

      if (occupationStatus === 'student') {
        if (selectedUniversity) profileData.university = selectedUniversity;
        if (faculty) profileData.faculty = faculty;
      }
      if (occupationStatus === 'working' && jobTitle) {
        profileData.job_title = jobTitle;
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Insert new profile (OAuth user with no profile from trigger)
        const { error } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            full_name: fullName,
            email: user.email || '',
            gender: gender as 'male' | 'female',
            nationality,
            phone: phone.trim(),
            date_of_birth: dobToString(dobDay, dobMonth, dobYear),
            occupation_status: occupationStatus || null,
            personality_tags: selectedVibes.length > 0 ? selectedVibes : [],
            interested_area_1: interestedArea1 || null,
            interested_area_2: interestedArea2 || null,
            ...(occupationStatus === 'student' && selectedUniversity ? { university: selectedUniversity } : {}),
            ...(occupationStatus === 'student' && faculty ? { faculty } : {}),
            ...(occupationStatus === 'working' && jobTitle ? { job_title: jobTitle } : {}),
          }]);
        if (error) throw error;
      }

      toast.success(isRTL ? 'تم حفظ الملف الشخصي بنجاح!' : 'Profile completed successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4">
            <span className="text-3xl font-bold text-primary">Sakanak</span>
          </a>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isRTL ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'نحتاج بعض المعلومات للبدء' : 'We need a few details to get you started'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border space-y-6">
          {/* Gender */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              {isRTL ? 'الجنس' : 'Gender'} *
            </Label>
            <RadioGroup
              value={gender}
              onValueChange={(v) => setGender(v as 'male' | 'female')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">{isRTL ? 'ذكر' : 'Male'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">{isRTL ? 'أنثى' : 'Female'}</Label>
              </div>
            </RadioGroup>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {isRTL ? 'الجنسية' : 'Nationality'} *
            </Label>
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? 'اختر الجنسية' : 'Select nationality'} />
              </SelectTrigger>
              <SelectContent>
                {NATIONALITIES.map((n) => (
                  <SelectItem key={n.value} value={n.value}>
                    {isRTL ? n.labelAr : n.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.nationality && <p className="text-sm text-destructive">{errors.nationality}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {isRTL ? 'رقم الهاتف' : 'Phone Number'} *
            </Label>
            <Input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
              dir="ltr"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          {/* Date of Birth */}
          <DateOfBirthPicker
            day={dobDay}
            month={dobMonth}
            year={dobYear}
            onDayChange={setDobDay}
            onMonthChange={setDobMonth}
            onYearChange={setDobYear}
            error={errors.dob}
            required
          />

          {/* Occupation Status */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {isRTL ? 'الحالة' : 'Status'} *
            </Label>
            <RadioGroup
              value={occupationStatus}
              onValueChange={(v) => setOccupationStatus(v as 'student' | 'working')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="occ-student" />
                <Label htmlFor="occ-student" className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  {isRTL ? 'طالب' : 'Student'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="working" id="occ-working" />
                <Label htmlFor="occ-working" className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {isRTL ? 'يعمل' : 'Working'}
                </Label>
              </div>
            </RadioGroup>
            {errors.occupationStatus && <p className="text-sm text-destructive">{errors.occupationStatus}</p>}
          </div>

          {/* University (if student) */}
          {occupationStatus === 'student' && (
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {isRTL ? 'الجامعة' : 'University'} *
              </Label>
              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر جامعتك' : 'Select university'} />
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((uni) => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {isRTL ? uni.labelAr : uni.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.university && <p className="text-sm text-destructive">{errors.university}</p>}
            </div>
          )}

          {/* Faculty (if student) */}
          {occupationStatus === 'student' && (
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {isRTL ? 'الكلية' : 'Faculty / College'} *
              </Label>
              <Select value={faculty} onValueChange={setFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر كليتك' : 'Select your faculty'} />
                </SelectTrigger>
                <SelectContent>
                  {FACULTIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {isRTL ? f.labelAr : f.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculty && <p className="text-sm text-destructive">{errors.faculty}</p>}
            </div>
          )}

          {/* Job Title (if working) */}
          {occupationStatus === 'working' && (
            <div className="space-y-2">
              <Label className="font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {isRTL ? 'المسمى الوظيفي' : 'Job Title'} *
              </Label>
              <Select value={jobTitle} onValueChange={setJobTitle}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر مسمى وظيفتك' : 'Select your job title'} />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TITLES.map((j) => (
                    <SelectItem key={j.value} value={j.value}>
                      {isRTL ? j.labelAr : j.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle}</p>}
            </div>
          )}
          )}

          {/* Interested Area 1 (Required) */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {isRTL ? 'المنطقة المهتم بها' : 'Interested Area'} *
            </Label>
            <Select value={interestedGov1} onValueChange={(v) => { setInterestedGov1(v); setInterestedArea1(''); }}>
              <SelectTrigger>
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
                <SelectTrigger>
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
            {errors.interestedArea1 && <p className="text-sm text-destructive">{errors.interestedArea1}</p>}
          </div>

          {/* Interested Area 2 (Optional) */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {isRTL ? 'منطقة ثانية (اختياري)' : 'Second Area (optional)'}
            </Label>
            <Select value={interestedGov2} onValueChange={(v) => { setInterestedGov2(v); setInterestedArea2(''); }}>
              <SelectTrigger>
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
                <SelectTrigger>
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

          {/* Vibes */}
          <div className="space-y-2">
            <Label className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isRTL ? 'الـ Vibes بتاعتك' : 'Your Vibes'} ({isRTL ? 'اختر حتى 5' : 'pick up to 5'})
            </Label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => {
                const isSelected = selectedVibes.includes(tag.value);
                return (
                  <Badge
                    key={tag.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-primary/10'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedVibes(selectedVibes.filter(v => v !== tag.value));
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

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isRTL ? 'ابدأ الآن' : 'Get Started'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CompleteProfile: React.FC = () => <CompleteProfileContent />;

export default CompleteProfile;
