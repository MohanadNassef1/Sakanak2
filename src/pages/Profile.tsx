import React, { useState, useEffect, useRef } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
 import { useUserRooms, useSavedRooms, useDeleteRoom, useRelistRoom } from '@/hooks/useRooms';
import MainLayout from '@/components/MainLayout';
import RoomCard from '@/components/rooms/RoomCard';
import VerificationCard from '@/components/verification/VerificationCard';
import ReferralSection from '@/components/profile/ReferralSection';
import AvatarUploader from '@/components/profile/AvatarUploader';
 import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User, Home, Heart, Settings, Shield, CheckCircle, Clock, XCircle,
  Phone, Mail, MapPin, Briefcase, Globe, Cigarette, PawPrint, Plus, Lock,
  GraduationCap, Calendar, Sparkles, Gift, Copy, Share2, Loader2
} from 'lucide-react';
import { PERSONALITY_TAGS, getTagLabel } from '@/lib/personalityTags';
import DateOfBirthPicker, { parseDob, dobToString, getAgeFromDob } from '@/components/DateOfBirthPicker';
import { locationData, getGovernorateLabel, getAreaLabel, getGovernorates, getAreasForGovernorate } from '@/lib/locationData';

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
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

const UNIVERSITIES = [
  { value: 'cairo_university', labelEn: 'Cairo University', labelAr: 'جامعة القاهرة' },
  { value: 'ain_shams', labelEn: 'Ain Shams University', labelAr: 'جامعة عين شمس' },
  { value: 'alexandria', labelEn: 'Alexandria University', labelAr: 'جامعة الإسكندرية' },
  { value: 'auc', labelEn: 'American University in Cairo', labelAr: 'الجامعة الأمريكية بالقاهرة' },
  { value: 'guc', labelEn: 'German University in Cairo', labelAr: 'الجامعة الألمانية بالقاهرة' },
  { value: 'bue', labelEn: 'British University in Egypt', labelAr: 'الجامعة البريطانية بمصر' },
  { value: 'msa', labelEn: 'MSA University', labelAr: 'جامعة أكتوبر للعلوم الحديثة' },
  { value: 'helwan', labelEn: 'Helwan University', labelAr: 'جامعة حلوان' },
  { value: 'mansoura', labelEn: 'Mansoura University', labelAr: 'جامعة المنصورة' },
  { value: 'tanta', labelEn: 'Tanta University', labelAr: 'جامعة طنطا' },
  { value: 'zagazig', labelEn: 'Zagazig University', labelAr: 'جامعة الزقازيق' },
  { value: 'assiut', labelEn: 'Assiut University', labelAr: 'جامعة أسيوط' },
  { value: 'azhar', labelEn: 'Al-Azhar University', labelAr: 'جامعة الأزهر' },
  { value: 'suez_canal', labelEn: 'Suez Canal University', labelAr: 'جامعة قناة السويس' },
  { value: 'nile', labelEn: 'Nile University', labelAr: 'جامعة النيل' },
  { value: 'future', labelEn: 'Future University', labelAr: 'جامعة المستقبل' },
  { value: 'aast', labelEn: 'Arab Academy for Science and Technology', labelAr: 'الأكاديمية العربية للعلوم والتكنولوجيا' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

// Use shared PERSONALITY_TAGS from lib/personalityTags.ts

const ProfileContent: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: userRooms, isLoading: roomsLoading } = useUserRooms(user?.id);
  const { data: savedRooms } = useSavedRooms(user?.id);
  const updateProfile = useUpdateProfile();
  const deleteRoom = useDeleteRoom();
  const relistRoom = useRelistRoom();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    about: '',
    phone: '',
    whatsapp: '',
    nationality: '',
    occupation: '',
    looking_for: '',
    is_smoker: false,
    has_pets: false,
    pet_type: '',
    avatar_url: '' as string | null,
    age: null as number | null,
    date_of_birth: null as string | null,
    occupation_status: '' as 'student' | 'working' | 'unemployed' | '',
    university: '',
    job_title: '',
    personality_tags: [] as string[],
    interested_area_1: '' as string,
    interested_area_2: '' as string,
  });
  const [interestedGov1, setInterestedGov1] = useState('');
  const [interestedGov2, setInterestedGov2] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        about: profile.about || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        nationality: profile.nationality || '',
        occupation: profile.occupation || '',
        looking_for: profile.looking_for || '',
        is_smoker: profile.is_smoker || false,
        has_pets: profile.has_pets || false,
        pet_type: profile.pet_type || '',
        avatar_url: profile.avatar_url || null,
        age: profile.age || null,
        date_of_birth: (profile as any).date_of_birth || null,
        occupation_status: (profile.occupation_status as 'student' | 'working' | 'unemployed') || '',
        university: profile.university || '',
        job_title: profile.job_title || '',
        personality_tags: profile.personality_tags || [],
        interested_area_1: (profile as any).interested_area_1 || '',
        interested_area_2: (profile as any).interested_area_2 || '',
      });
      const dob = parseDob((profile as any).date_of_birth);
      setDobDay(dob.day);
      setDobMonth(dob.month);
      setDobYear(dob.year);
      // Derive governorates from areas
      if ((profile as any).interested_area_1) {
        for (const [gov, areas] of Object.entries(locationData)) {
          if (areas.includes((profile as any).interested_area_1)) { setInterestedGov1(gov); break; }
        }
      }
      if ((profile as any).interested_area_2) {
        for (const [gov, areas] of Object.entries(locationData)) {
          if (areas.includes((profile as any).interested_area_2)) { setInterestedGov2(gov); break; }
        }
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const dob = dobToString(dobDay, dobMonth, dobYear);
      const updateData = {
        ...formData,
        occupation_status: formData.occupation_status || null,
        date_of_birth: dob,
      };
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: updateData as any,
      });
      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
    } catch (error) {
      toast.error(t('profile.updateError'));
    }
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    
    const badges: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      verified: {
        icon: <CheckCircle className="w-4 h-4" />,
        className: 'bg-green-500 text-white',
        label: t('profile.verified'),
      },
      pending: {
        icon: <Clock className="w-4 h-4" />,
        className: 'bg-yellow-500 text-white',
        label: t('profile.pending'),
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        className: 'bg-red-500 text-white',
        label: t('profile.rejected'),
      },
      unverified: {
        icon: <Shield className="w-4 h-4" />,
        className: 'bg-muted text-muted-foreground',
        label: t('profile.unverified'),
      },
    };

    const badge = badges[profile.verification_status || 'unverified'];
    return (
      <Badge className={`${badge.className} gap-1`}>
        {badge.icon}
        {badge.label}
      </Badge>
    );
  };

  if (authLoading || profileLoading) {
    return (
      <MainLayout>
       <div className="min-h-screen bg-secondary/30 pt-8 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-48 rounded-2xl mb-8" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) return null;

  const isOwner = userRooms && userRooms.length > 0;

  return (
    <MainLayout>
      <SEOHead
        title="My Profile | Sakanak Account Settings"
        description="Manage your Sakanak profile, verification, and account settings."
        canonicalPath="/profile"
        noindex
      />
      <div className="min-h-screen bg-secondary/30 pt-6 md:pt-8 pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden border-border/60 shadow-sm">
            {/* Cover banner */}
            <div
              className="relative h-32 sm:h-44 md:h-52 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent bg-cover bg-center"
              style={
                (profile as any).cover_url
                  ? { backgroundImage: `url(${(profile as any).cover_url})` }
                  : undefined
              }
            >
              {!(profile as any).cover_url && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.25), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.15), transparent 45%)',
                  }}
                />
              )}
              {(profile as any).cover_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              )}

              {/* Cover upload button */}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground border border-border/60 hover:bg-background transition-colors disabled:opacity-60"
                aria-label={isRTL ? 'تغيير الغلاف' : 'Change cover'}
              >
                {isUploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                {(profile as any).cover_url
                  ? (isRTL ? 'تغيير الغلاف' : 'Change cover')
                  : (isRTL ? 'إضافة غلاف' : 'Add cover')}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                {/* Avatar overlapping banner */}
                <div className="-mt-16 sm:-mt-20 md:-mt-24 shrink-0 self-center sm:self-start">
                  <div className="rounded-full ring-4 ring-card">
                    <AvatarUploader
                      userId={user?.id || ''}
                      currentAvatarUrl={profile.avatar_url}
                      userName={profile.full_name}
                      onUploadComplete={async (url) => {
                        try {
                          await updateProfile.mutateAsync({
                            userId: user!.id,
                            updates: { avatar_url: url },
                          });
                        } catch (error) {
                          toast.error('Failed to update profile photo');
                        }
                      }}
                      onRemove={async () => {
                        try {
                          await updateProfile.mutateAsync({
                            userId: user!.id,
                            updates: { avatar_url: null },
                          });
                        } catch (error) {
                          toast.error('Failed to remove profile photo');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                          {profile.full_name}
                        </h1>
                        {getVerificationBadge()}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <span>{profile.gender === 'male' ? t('auth.male') : t('auth.female')}</span>
                        {(profile.age || (profile as any).date_of_birth) && (
                          <>
                            <span className="opacity-40">·</span>
                            <span>
                              {getAgeFromDob((profile as any).date_of_birth) ?? profile.age} {isRTL ? 'سنة' : 'years'}
                            </span>
                          </>
                        )}
                        {profile.nationality && (
                          <>
                            <span className="opacity-40">·</span>
                            <span className="capitalize">{profile.nationality}</span>
                          </>
                        )}
                        {(profile as any).public_id && (
                          <>
                            <span className="opacity-40">·</span>
                            <span className="font-mono text-xs tracking-wider opacity-80">
                              {(profile as any).public_id}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit Button */}
                    <div className="w-full md:w-auto flex justify-center md:justify-end">
                      <Button
                        variant={isEditing ? 'outline' : 'default'}
                        onClick={() => setIsEditing(!isEditing)}
                        className="w-full sm:w-auto"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {isEditing ? t('common.cancel') : t('profile.edit')}
                      </Button>
                    </div>
                  </div>

                  {/* Contact + context row */}
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Mail className="w-4 h-4 shrink-0 opacity-70" />
                      <span className="truncate">{profile.email}</span>
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 opacity-70" />
                        {profile.phone}
                      </span>
                    )}
                    {profile.occupation_status === 'student' && profile.university && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 opacity-70" />
                        {UNIVERSITIES.find(u => u.value === profile.university)?.[language === 'ar' ? 'labelAr' : 'labelEn'] || profile.university}
                      </span>
                    )}
                    {profile.occupation_status === 'working' && (profile.job_title || profile.occupation) && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 opacity-70" />
                        {profile.job_title || profile.occupation}
                      </span>
                    )}
                  </div>

                  {profile.about && (
                    <p className="mt-4 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl mx-auto sm:mx-0">
                      {profile.about}
                    </p>
                  )}

                  {/* Lifestyle + personality chips */}
                  {(profile.occupation_status || profile.is_smoker || profile.has_pets ||
                    (profile.personality_tags && profile.personality_tags.length > 0)) && (
                    <div className="mt-5 pt-5 border-t border-border/60 flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {profile.occupation_status && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
                          {profile.occupation_status === 'student' ? (
                            <><GraduationCap className="w-3 h-3" /> {isRTL ? 'طالب' : 'Student'}</>
                          ) : profile.occupation_status === 'working' ? (
                            <><Briefcase className="w-3 h-3" /> {isRTL ? 'يعمل' : 'Working'}</>
                          ) : (
                            <>{isRTL ? 'لا يعمل' : 'Unemployed'}</>
                          )}
                        </span>
                      )}
                      {profile.is_smoker && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
                          <Cigarette className="w-3 h-3" />
                          {t('profile.smoker')}
                        </span>
                      )}
                      {profile.has_pets && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground/80">
                          <PawPrint className="w-3 h-3" />
                          {profile.pet_type || t('profile.hasPets')}
                        </span>
                      )}
                      {profile.personality_tags?.slice(0, 6).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {getTagLabel(tag, language === 'ar')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Edit Form or Tabs */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.editProfile')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('auth.fullName')}</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('profile.phone')}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 xxx xxx xxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('profile.whatsapp')}</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="+20 xxx xxx xxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('profile.nationality')}</Label>
                    <Select 
                      value={formData.nationality} 
                      onValueChange={(value) => setFormData({ ...formData, nationality: value })}
                    >
                      <SelectTrigger className="h-10 bg-background">
                        <SelectValue placeholder={t('auth.selectNationality')} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50 max-h-60">
                        {NATIONALITIES.map((nat) => (
                          <SelectItem key={nat.value} value={nat.value}>
                            {language === 'ar' ? nat.labelAr : nat.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('profile.lookingFor')}</Label>
                    <Input
                      value={formData.looking_for}
                      onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
                      placeholder={t('profile.lookingForPlaceholder')}
                    />
                  </div>
                </div>

                {/* About You Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {isRTL ? 'معلومات عنك' : 'About You'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <DateOfBirthPicker
                        day={dobDay}
                        month={dobMonth}
                        year={dobYear}
                        onDayChange={setDobDay}
                        onMonthChange={setDobMonth}
                        onYearChange={setDobYear}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الحالة الوظيفية' : 'Occupation Status'}</Label>
                      <Select 
                        value={formData.occupation_status} 
                        onValueChange={(value) => setFormData({ ...formData, occupation_status: value as 'student' | 'working' | 'unemployed' })}
                      >
                        <SelectTrigger className="h-10 bg-background">
                          <SelectValue placeholder={isRTL ? 'اختر الحالة' : 'Select status'} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="student">{isRTL ? 'طالب' : 'Student'}</SelectItem>
                          <SelectItem value="working">{isRTL ? 'يعمل' : 'Working'}</SelectItem>
                          <SelectItem value="unemployed">{isRTL ? 'لا يعمل' : 'Unemployed'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.occupation_status === 'student' && (
                      <div className="space-y-2">
                        <Label>{isRTL ? 'الجامعة' : 'University'}</Label>
                        <Select 
                          value={formData.university} 
                          onValueChange={(value) => setFormData({ ...formData, university: value })}
                        >
                          <SelectTrigger className="h-10 bg-background">
                            <SelectValue placeholder={isRTL ? 'اختر الجامعة' : 'Select university'} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 max-h-60">
                            {UNIVERSITIES.map((uni) => (
                              <SelectItem key={uni.value} value={uni.value}>
                                {language === 'ar' ? uni.labelAr : uni.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {formData.occupation_status === 'working' && (
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</Label>
                        <Input
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          placeholder={isRTL ? 'مثل: مهندس برمجيات' : 'e.g. Software Engineer'}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Personality Tags */}
                  <div className="mt-6">
                    <Label className="mb-3 block">{isRTL ? 'شخصيتك وأسلوب حياتك (اختر حتى 5)' : 'Your Personality & Lifestyle (select up to 5)'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_TAGS.map((tag) => {
                        const isSelected = formData.personality_tags.includes(tag.value);
                        const canSelect = formData.personality_tags.length < 5 || isSelected;
                        return (
                          <div
                            key={tag.value}
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  personality_tags: formData.personality_tags.filter(t => t !== tag.value)
                                });
                              } else if (canSelect) {
                                setFormData({
                                  ...formData,
                                  personality_tags: [...formData.personality_tags, tag.value]
                                });
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : canSelect
                                  ? 'bg-secondary hover:bg-secondary/80'
                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}
                          >
                            {language === 'ar' ? tag.labelAr : tag.labelEn}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isRTL 
                        ? `${formData.personality_tags.length}/5 اختيارات` 
                        : `${formData.personality_tags.length}/5 selected`}
                    </p>
                  </div>

                  {/* Interested Areas */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {isRTL ? 'المنطقة المهتم بها' : 'Interested Area'}
                      </Label>
                      <Select value={interestedGov1} onValueChange={(v) => { setInterestedGov1(v); setFormData({ ...formData, interested_area_1: '' }); }}>
                        <SelectTrigger className="h-10 bg-background">
                          <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50 max-h-60">
                          {getGovernorates().map((gov) => (
                            <SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {interestedGov1 && (
                        <Select value={formData.interested_area_1} onValueChange={(v) => setFormData({ ...formData, interested_area_1: v })}>
                          <SelectTrigger className="h-10 bg-background">
                            <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select area'} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 max-h-60">
                            {getAreasForGovernorate(interestedGov1).map((area) => (
                              <SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {isRTL ? 'منطقة ثانية (اختياري)' : 'Second Area (optional)'}
                      </Label>
                      <Select value={interestedGov2} onValueChange={(v) => { setInterestedGov2(v); setFormData({ ...formData, interested_area_2: '' }); }}>
                        <SelectTrigger className="h-10 bg-background">
                          <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select governorate'} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50 max-h-60">
                          {getGovernorates().map((gov) => (
                            <SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {interestedGov2 && (
                        <Select value={formData.interested_area_2} onValueChange={(v) => setFormData({ ...formData, interested_area_2: v })}>
                          <SelectTrigger className="h-10 bg-background">
                            <SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select area'} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 max-h-60">
                            {getAreasForGovernorate(interestedGov2).map((area) => (
                              <SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('profile.about')}</Label>
                  <Textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    rows={4}
                    placeholder={t('profile.aboutPlaceholder')}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smoker">{t('profile.isSmoker')}</Label>
                    <Switch
                      id="smoker"
                      checked={formData.is_smoker}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_smoker: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pets">{t('profile.hasPets')}</Label>
                    <Switch
                      id="pets"
                      checked={formData.has_pets}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_pets: checked })}
                    />
                  </div>
                  {formData.has_pets && (
                    <div className="space-y-2">
                      <Label>{t('profile.petType')}</Label>
                      <Select
                        value={formData.pet_type}
                        onValueChange={(value) => setFormData({ ...formData, pet_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر نوع الحيوان الأليف' : 'Select pet type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat">{isRTL ? 'قطة' : 'Cat'}</SelectItem>
                          <SelectItem value="dog">{isRTL ? 'كلب' : 'Dog'}</SelectItem>
                          <SelectItem value="bird">{isRTL ? 'طائر' : 'Bird'}</SelectItem>
                          <SelectItem value="fish">{isRTL ? 'سمك' : 'Fish'}</SelectItem>
                          <SelectItem value="rabbit">{isRTL ? 'أرنب' : 'Rabbit'}</SelectItem>
                          <SelectItem value="hamster">{isRTL ? 'هامستر' : 'Hamster'}</SelectItem>
                          <SelectItem value="turtle">{isRTL ? 'سلحفاة' : 'Turtle'}</SelectItem>
                          <SelectItem value="other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-end">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={updateProfile.isPending}>
                    {t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Verification Card */}
              {profile.verification_status !== 'verified' && (
                <VerificationCard />
              )}

              <Tabs defaultValue={isOwner ? 'listings' : 'saved'}>
                <TabsList className="mb-6">
                  {isOwner && (
                    <TabsTrigger value="listings" className="gap-2">
                      <Home className="w-4 h-4" />
                      {t('profile.myListings')}
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="saved" className="gap-2">
                    <Heart className="w-4 h-4" />
                    {t('profile.savedRooms')}
                  </TabsTrigger>
                   <TabsTrigger value="security" className="gap-2">
                     <Lock className="w-4 h-4" />
                     {t('profile.changePassword.title')}
                   </TabsTrigger>
                   <TabsTrigger value="referral" className="gap-2">
                     <Gift className="w-4 h-4" />
                     {isRTL ? 'الإحالة' : 'Referral'}
                   </TabsTrigger>
                </TabsList>

              {isOwner && (
                <TabsContent value="listings">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{t('profile.myListings')}</h2>
                    <Button onClick={() => navigate('/list-room')}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('profile.addListing')}
                    </Button>
                  </div>
                  {roomsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
                      ))}
                    </div>
                  ) : userRooms && userRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userRooms.map(room => (
                         <RoomCard 
                           key={room.id} 
                           room={room}
                           showDeleteButton={true}
                           onDelete={() => {
                             deleteRoom.mutate(room.id, {
                               onSuccess: () => {
                                 toast.success(t('rooms.deleteSuccess'));
                               },
                               onError: () => {
                                 toast.error(t('rooms.deleteError'));
                               },
                             });
                           }}
                           isDeleting={deleteRoom.isPending}
                           onRelist={() => {
                             relistRoom.mutate(room.id, {
                               onSuccess: () => {
                                 toast.success(isRTL ? 'تم إعادة إدراج الغرفة بنجاح' : 'Room relisted successfully');
                               },
                               onError: () => {
                                 toast.error(isRTL ? 'فشل في إعادة الإدراج' : 'Failed to relist room');
                               },
                             });
                           }}
                           isRelisting={relistRoom.isPending}
                         />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                      <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{t('profile.noListings')}</p>
                      <Button className="mt-4" onClick={() => navigate('/list-room')}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('profile.addListing')}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="saved">
                <h2 className="text-xl font-semibold mb-6">{t('profile.savedRooms')}</h2>
                {savedRooms && savedRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedRooms.map(room => (
                      <RoomCard key={room.id} room={room} isSaved />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-card rounded-2xl border border-border">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('profile.noSaved')}</p>
                    <Button className="mt-4" onClick={() => navigate('/rooms')}>
                      {t('profile.browseRooms')}
                    </Button>
                  </div>
                )}
              </TabsContent>
               <TabsContent value="security">
                 <ChangePasswordForm />
               </TabsContent>
               <TabsContent value="referral">
                 <ReferralSection profile={profile} userId={user?.id || ''} />
               </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const Profile: React.FC = () => {
  return <ProfileContent />;
};

export default Profile;
