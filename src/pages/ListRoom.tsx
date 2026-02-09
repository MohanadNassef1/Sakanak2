import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCreateRoom, CreateRoomInput } from '@/hooks/useCreateRoom';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


import { Badge } from '@/components/ui/badge';
import PhotoUploader from '@/components/rooms/PhotoUploader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Home, Loader2, AlertTriangle, CheckCircle, Wallet, CreditCard, MapPin, Flame, Wifi, Building2, DoorOpen, Shield, Wind, Droplets, Users, PawPrint, Cigarette, UserCheck, Zap, Droplet, Wrench, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomType } from '@/types/room';
import { logError } from '@/lib/logger';
import { translateCity } from '@/lib/cityTranslations';

const EGYPTIAN_GOVERNORATES = [
  { id: 'cairo', labelEn: 'Cairo', labelAr: 'القاهرة' },
  { id: 'giza', labelEn: 'Giza', labelAr: 'الجيزة' },
  { id: 'alexandria', labelEn: 'Alexandria', labelAr: 'الإسكندرية' },
  { id: 'dakahlia', labelEn: 'Dakahlia', labelAr: 'الدقهلية' },
  { id: 'gharbia', labelEn: 'Gharbia', labelAr: 'الغربية' },
  { id: 'sharkia', labelEn: 'Sharkia', labelAr: 'الشرقية' },
  { id: 'qalyubia', labelEn: 'Qalyubia', labelAr: 'القليوبية' },
  { id: 'menoufia', labelEn: 'Menoufia', labelAr: 'المنوفية' },
  { id: 'beheira', labelEn: 'Beheira', labelAr: 'البحيرة' },
  { id: 'kafr_el_sheikh', labelEn: 'Kafr El Sheikh', labelAr: 'كفر الشيخ' },
  { id: 'damietta', labelEn: 'Damietta', labelAr: 'دمياط' },
  { id: 'port_said', labelEn: 'Port Said', labelAr: 'بورسعيد' },
  { id: 'ismailia', labelEn: 'Ismailia', labelAr: 'الإسماعيلية' },
  { id: 'suez', labelEn: 'Suez', labelAr: 'السويس' },
  { id: 'fayoum', labelEn: 'Fayoum', labelAr: 'الفيوم' },
  { id: 'beni_suef', labelEn: 'Beni Suef', labelAr: 'بني سويف' },
  { id: 'minya', labelEn: 'Minya', labelAr: 'المنيا' },
  { id: 'asyut', labelEn: 'Asyut', labelAr: 'أسيوط' },
  { id: 'sohag', labelEn: 'Sohag', labelAr: 'سوهاج' },
  { id: 'qena', labelEn: 'Qena', labelAr: 'قنا' },
  { id: 'luxor', labelEn: 'Luxor', labelAr: 'الأقصر' },
  { id: 'aswan', labelEn: 'Aswan', labelAr: 'أسوان' },
  { id: 'red_sea', labelEn: 'Red Sea', labelAr: 'البحر الأحمر' },
  { id: 'new_valley', labelEn: 'New Valley', labelAr: 'الوادي الجديد' },
  { id: 'matrouh', labelEn: 'Matrouh', labelAr: 'مطروح' },
  { id: 'north_sinai', labelEn: 'North Sinai', labelAr: 'شمال سيناء' },
  { id: 'south_sinai', labelEn: 'South Sinai', labelAr: 'جنوب سيناء' },
];

// STRICT gender options - no mixed gender allowed
const ALLOWED_GENDER_OPTIONS = [
  { id: 'males_only', labelEn: 'Males Only', labelAr: 'ذكور فقط' },
  { id: 'females_only', labelEn: 'Females Only', labelAr: 'إناث فقط' },
];

const EGYPTIAN_UNIVERSITIES = [
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
  { id: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

const BILLS_OPTIONS = [
  { id: 'electricity', labelEn: 'Electricity', labelAr: 'كهرباء', icon: Zap },
  { id: 'water', labelEn: 'Water', labelAr: 'مياه', icon: Droplet },
  { id: 'gas', labelEn: 'Gas', labelAr: 'غاز', icon: Flame },
  { id: 'internet', labelEn: 'Internet', labelAr: 'انترنت', icon: Globe },
  { id: 'maintenance', labelEn: 'Maintenance', labelAr: 'صيانة', icon: Wrench },
];

const PERSONALITY_TAGS = [
  { id: 'calm', labelEn: 'Calm', labelAr: 'هادئ' },
  { id: 'social', labelEn: 'Social', labelAr: 'اجتماعي' },
  { id: 'studious', labelEn: 'Studious', labelAr: 'مجتهد' },
  { id: 'night_owl', labelEn: 'Night Owl', labelAr: 'سهران' },
  { id: 'early_bird', labelEn: 'Early Bird', labelAr: 'صباحي' },
  { id: 'clean', labelEn: 'Clean & Tidy', labelAr: 'نظيف ومرتب' },
  { id: 'friendly', labelEn: 'Friendly', labelAr: 'ودود' },
  { id: 'private', labelEn: 'Private', labelAr: 'يفضل الخصوصية' },
];

const ListRoomContent: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const createRoom = useCreateRoom();
  const navigate = useNavigate();

  const [listerType, setListerType] = useState<'landlord' | 'current_tenant'>('landlord');
  const [billsIncluded, setBillsIncluded] = useState<string[]>([]);
  const [personalityTags, setPersonalityTags] = useState<string[]>([]);
  // STRICT: Default to user's gender - no mixed allowed
  const [allowedGender, setAllowedGender] = useState<string>(profile?.gender === 'female' ? 'females_only' : 'males_only');
  const [occupationStatus, setOccupationStatus] = useState<'student' | 'working' | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');

  // STRICT: When profile loads or lister type changes, enforce gender rules
  // Also auto-populate tenant info from profile
  useEffect(() => {
    if (profile?.gender) {
      // Current tenants MUST list for their own gender only
      // Landlords can choose, but no "any" option
      if (listerType === 'current_tenant') {
        setAllowedGender(profile.gender === 'female' ? 'females_only' : 'males_only');
        
        // Auto-populate from profile for current tenants
        if (profile.occupation_status === 'student' || profile.occupation_status === 'working') {
          setOccupationStatus(profile.occupation_status);
        }
        if (profile.university) {
          setSelectedUniversity(profile.university);
        }
        if (profile.personality_tags && profile.personality_tags.length > 0) {
          // Only set tags that exist in PERSONALITY_TAGS options
          const validTags = profile.personality_tags.filter(tag => 
            PERSONALITY_TAGS.some(pt => pt.id === tag)
          );
          setPersonalityTags(validTags.slice(0, 5));
        }
      }
    }
  }, [profile, listerType]);

  const [formData, setFormData] = useState<Partial<CreateRoomInput> & { deposit?: number }>({
    title: '',
    description: '',
    room_type: 'private_room',
    price_per_month: 0,
    city: '',
    area: '',
    address: '',
    photos: [],
    amenities: [],
    rules: [],
    available_from: format(new Date(), 'yyyy-MM-dd'),
    min_stay_months: 1,
    max_roommates: 1,
    current_roommates: 0,
    preferred_gender: profile?.gender || 'male',
    allows_smoking: false,
    allows_pets: false,
    insurance_amount: 0,
    owner_payout_method: 'instapay',
    payout_details: '',
    has_natural_gas: false,
    has_wifi: false,
    has_elevator: false,
    has_balcony: false,
    has_doorman: false,
    has_ac: false,
    has_water_heater: false,
    has_private_bathroom: false,
    allows_visits: true,
    total_bedrooms: 1,
    location_link: '',
    deposit: 0,
  });

  const [availableDate, setAvailableDate] = useState<Date>(new Date());

  const updateField = <K extends keyof CreateRoomInput>(key: K, value: CreateRoomInput[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isVerified = profile?.verification_status === 'verified';
  const isPending = profile?.verification_status === 'pending';
  const isLoading = authLoading || profileLoading;

  // Redirect unverified users to verification page
  useEffect(() => {
    if (!isLoading && user && !isVerified && !isPending) {
      navigate('/verify-identity', { state: { from: '/list-room' } });
    }
  }, [isLoading, user, isVerified, isPending, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast.error(t('rooms.form.verificationRequired'));
      return;
    }

    if (!formData.title || !formData.city || !formData.price_per_month) {
      toast.error(t('rooms.form.requiredFields'));
      return;
    }

    try {
      await createRoom.mutateAsync({
        ...formData,
        available_from: format(availableDate, 'yyyy-MM-dd'),
        lister_type: listerType,
        deposit: formData.deposit || 0,
        bills_included: billsIncluded,
        personality_tags: listerType === 'current_tenant' ? personalityTags : [],
        allowed_gender: allowedGender,
        preferred_gender: allowedGender === 'males_only' ? 'male' : allowedGender === 'females_only' ? 'female' : 'any',
      } as any);
      
      toast.success(t('rooms.form.success'));
      navigate('/profile');
    } catch (error: any) {
      logError('ListRoom.createRoom', error);
      toast.error(error.message || t('rooms.form.error'));
    }
  };

  if (!user && !authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('rooms.form.loginRequired')}</h1>
          <Button onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
        </div>
      </MainLayout>
    );
  }

  // Show pending verification message
  if (!isLoading && isPending) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                {isRTL ? 'التحقق قيد المراجعة' : 'Verification Pending'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL
                  ? 'يرجى الانتظار حتى يتم التحقق من هويتك قبل إضافة إعلان.'
                  : 'Please wait until your identity is verified before listing a room.'}
              </p>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                {isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={cn("container mx-auto px-4 py-8 max-w-3xl", isRTL && "rtl")}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8 text-primary" />
            {t('rooms.form.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('rooms.form.subtitle')}</p>
        </div>

        {!isVerified && !isLoading && (
          <Card className="mb-6 border-yellow-500 bg-yellow-500/10">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <p>{t('rooms.form.verificationNotice')}</p>
            </CardContent>
          </Card>
        )}

        {isVerified && (
          <Card className="mb-6 border-green-500 bg-green-500/10">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p>{t('rooms.form.verifiedNotice')}</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {isRTL ? 'من أنت؟' : 'Who Are You?'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'اختر دورك في هذا الإعلان' : 'Select your role for this listing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setListerType('landlord')}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all",
                    listerType === 'landlord'
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <Home className="w-8 h-8 mb-2 text-primary" />
                  <span className="font-medium">{isRTL ? 'مالك العقار' : 'Landlord'}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {isRTL ? 'أنا صاحب الشقة' : 'I own this property'}
                  </span>
                </div>
                <div
                  onClick={() => setListerType('current_tenant')}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-lg border-2 cursor-pointer transition-all",
                    listerType === 'current_tenant'
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  )}
                >
                  <Users className="w-8 h-8 mb-2 text-primary" />
                  <span className="font-medium">{isRTL ? 'مستأجر حالي' : 'Current Tenant'}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {isRTL ? 'أبحث عن شريك سكن' : 'Looking for a roommate'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.basicInfo')}</CardTitle>
              <CardDescription>{t('rooms.form.basicInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('rooms.form.roomTitle')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={t('rooms.form.roomTitlePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('rooms.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t('rooms.form.descriptionPlaceholder')}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('rooms.form.roomType')} *</Label>
                  <Select
                    value={formData.room_type}
                    onValueChange={(value) => updateField('room_type', value as RoomType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private_room">{t('rooms.privateRoom')}</SelectItem>
                      <SelectItem value="shared_room">{t('rooms.sharedRoom')}</SelectItem>
                      <SelectItem value="studio">{t('rooms.studio')}</SelectItem>
                      <SelectItem value="apartment">{t('rooms.apartment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">{t('rooms.form.price')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={formData.price_per_month || ''}
                    onChange={(e) => updateField('price_per_month', Number(e.target.value))}
                    placeholder="5000"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Financials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                {isRTL ? 'التفاصيل المالية' : 'Financial Details'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'حدد التأمين والفواتير المشمولة' : 'Specify deposit and included bills'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit">{isRTL ? 'التأمين (جنيه)' : 'Deposit (EGP)'}</Label>
                  <Input
                    id="deposit"
                    type="number"
                    min={0}
                    value={formData.deposit || ''}
                    onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'المبلغ المطلوب كتأمين عند دخول الشقة' : 'Amount required as security deposit'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{isRTL ? 'الفواتير المشمولة في الإيجار' : 'Bills Included in Rent'}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BILLS_OPTIONS.map((bill) => (
                    <div
                      key={bill.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        billsIncluded.includes(bill.id)
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                      onClick={() => {
                        setBillsIncluded((prev) =>
                          prev.includes(bill.id)
                            ? prev.filter((b) => b !== bill.id)
                            : [...prev, bill.id]
                        );
                      }}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                        billsIncluded.includes(bill.id)
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      )}>
                        {billsIncluded.includes(bill.id) && (
                          <CheckCircle className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <bill.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{language === 'ar' ? bill.labelAr : bill.labelEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('rooms.form.location')}
              </CardTitle>
              <CardDescription>{t('rooms.form.locationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'المحافظة' : 'Governorate'} *</Label>
                  <Select
                    value={formData.city || 'select'}
                    onValueChange={(value) => updateField('city', value === 'select' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select Governorate'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select" disabled>{isRTL ? 'اختر المحافظة' : 'Select Governorate'}</SelectItem>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <SelectItem key={gov.id} value={gov.labelEn}>
                          {language === 'ar' ? gov.labelAr : gov.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">{t('rooms.form.area')} *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => updateField('area', e.target.value)}
                    placeholder={t('rooms.form.areaPlaceholder')}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'مثال: المعادي، الزمالك، مدينة نصر' : 'e.g., Maadi, Zamalek, Nasr City'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('rooms.form.address')} *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={t('rooms.form.addressPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationLink">{t('rooms.form.locationLink')}</Label>
                <Input
                  id="locationLink"
                  value={formData.location_link}
                  onChange={(e) => updateField('location_link', e.target.value)}
                  placeholder={t('rooms.form.locationLinkPlaceholder')}
                />
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {t('rooms.form.locationPrivacyNotice')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.amenities')}</CardTitle>
              <CardDescription>{t('rooms.form.amenitiesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Natural Gas */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <Label htmlFor="naturalGas" className="cursor-pointer">{t('rooms.form.naturalGas')}</Label>
                  </div>
                  <Switch
                    id="naturalGas"
                    checked={formData.has_natural_gas}
                    onCheckedChange={(checked) => updateField('has_natural_gas', checked)}
                  />
                </div>

                {/* WiFi */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-500" />
                    <Label htmlFor="wifi" className="cursor-pointer">{t('rooms.form.wifi')}</Label>
                  </div>
                  <Switch
                    id="wifi"
                    checked={formData.has_wifi}
                    onCheckedChange={(checked) => updateField('has_wifi', checked)}
                  />
                </div>

                {/* Elevator */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <Label htmlFor="elevator" className="cursor-pointer">{t('rooms.form.elevator')}</Label>
                  </div>
                  <Switch
                    id="elevator"
                    checked={formData.has_elevator}
                    onCheckedChange={(checked) => updateField('has_elevator', checked)}
                  />
                </div>

                {/* Balcony */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-green-500" />
                    <Label htmlFor="balcony" className="cursor-pointer">{t('rooms.form.balcony')}</Label>
                  </div>
                  <Switch
                    id="balcony"
                    checked={formData.has_balcony}
                    onCheckedChange={(checked) => updateField('has_balcony', checked)}
                  />
                </div>

                {/* Doorman/Security */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <Label htmlFor="doorman" className="cursor-pointer">{t('rooms.form.doorman')}</Label>
                  </div>
                  <Switch
                    id="doorman"
                    checked={formData.has_doorman}
                    onCheckedChange={(checked) => updateField('has_doorman', checked)}
                  />
                </div>

                {/* Air Conditioning */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-cyan-500" />
                    <Label htmlFor="ac" className="cursor-pointer">{t('rooms.form.ac')}</Label>
                  </div>
                  <Switch
                    id="ac"
                    checked={formData.has_ac}
                    onCheckedChange={(checked) => updateField('has_ac', checked)}
                  />
                </div>

                {/* Water Heater */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-red-500" />
                    <Label htmlFor="waterHeater" className="cursor-pointer">{t('rooms.form.waterHeater')}</Label>
                  </div>
                  <Switch
                    id="waterHeater"
                    checked={formData.has_water_heater}
                    onCheckedChange={(checked) => updateField('has_water_heater', checked)}
                  />
                </div>

                {/* Private Bathroom */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-purple-500" />
                    <Label htmlFor="privateBathroom" className="cursor-pointer">{isRTL ? 'حمام خاص' : 'Private Bathroom'}</Label>
                  </div>
                  <Switch
                    id="privateBathroom"
                    checked={formData.has_private_bathroom}
                    onCheckedChange={(checked) => updateField('has_private_bathroom', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.houseRules')}</CardTitle>
              <CardDescription>{t('rooms.form.houseRulesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pets Allowed */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <PawPrint className="w-5 h-5 text-amber-500" />
                    <Label htmlFor="pets" className="cursor-pointer">{t('rooms.form.acceptPets')}</Label>
                  </div>
                  <Switch
                    id="pets"
                    checked={formData.allows_pets}
                    onCheckedChange={(checked) => updateField('allows_pets', checked)}
                  />
                </div>

                {/* Smoking Allowed */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Cigarette className="w-5 h-5 text-gray-500" />
                    <Label htmlFor="smoking" className="cursor-pointer">{t('rooms.form.acceptSmokers')}</Label>
                  </div>
                  <Switch
                    id="smoking"
                    checked={formData.allows_smoking}
                    onCheckedChange={(checked) => updateField('allows_smoking', checked)}
                  />
                </div>

                {/* Visits Allowed */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-green-500" />
                    <Label htmlFor="visits" className="cursor-pointer">{t('rooms.form.allowsVisits')}</Label>
                  </div>
                  <Switch
                    id="visits"
                    checked={formData.allows_visits}
                    onCheckedChange={(checked) => updateField('allows_visits', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student/Working & Personality - Only for Current Tenants */}
          {listerType === 'current_tenant' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isRTL ? 'معلوماتك الشخصية' : 'About You'}
                </CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'ساعد الباحثين على معرفة المزيد عنك كشريك سكن'
                    : 'Help seekers learn more about you as a potential roommate'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Occupation Status */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    {isRTL ? 'أنت حالياً...' : 'You are currently...'}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setOccupationStatus('student')}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        occupationStatus === 'student'
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl mb-1">🎓</span>
                      <span className="font-medium">{isRTL ? 'طالب' : 'Student'}</span>
                    </div>
                    <div
                      onClick={() => setOccupationStatus('working')}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        occupationStatus === 'working'
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl mb-1">💼</span>
                      <span className="font-medium">{isRTL ? 'يعمل' : 'Working'}</span>
                    </div>
                  </div>
                </div>

                {/* University Dropdown - Only for Students */}
                {occupationStatus === 'student' && (
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الجامعة' : 'University'}</Label>
                    <Select
                      value={selectedUniversity}
                      onValueChange={setSelectedUniversity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'اختر جامعتك' : 'Select your university'} />
                      </SelectTrigger>
                      <SelectContent>
                        {EGYPTIAN_UNIVERSITIES.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>
                            {language === 'ar' ? uni.labelAr : uni.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Job Title - Only for Working */}
                {occupationStatus === 'working' && (
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</Label>
                    <Input
                      id="jobTitle"
                      placeholder={isRTL ? 'مثال: مهندس برمجيات' : 'e.g. Software Engineer'}
                    />
                  </div>
                )}

                {/* Personality Tags */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    {isRTL ? 'شخصيتك وأسلوب حياتك' : 'Your Personality & Lifestyle'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'اختر حتى 5 صفات تصفك (اختياري)' : 'Select up to 5 traits that describe you (optional)'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TAGS.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={personalityTags.includes(tag.id) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer text-sm px-3 py-1.5 transition-all",
                          personalityTags.includes(tag.id)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10",
                          personalityTags.length >= 5 && !personalityTags.includes(tag.id)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        )}
                        onClick={() => {
                          if (personalityTags.length >= 5 && !personalityTags.includes(tag.id)) {
                            toast.error(isRTL ? 'الحد الأقصى 5 صفات' : 'Maximum 5 tags allowed');
                            return;
                          }
                          setPersonalityTags((prev) =>
                            prev.includes(tag.id)
                              ? prev.filter((t) => t !== tag.id)
                              : [...prev, tag.id]
                          );
                        }}
                      >
                        {language === 'ar' ? tag.labelAr : tag.labelEn}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {personalityTags.length}/5 {isRTL ? 'تم اختيارها' : 'selected'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.photos')}</CardTitle>
              <CardDescription>{t('rooms.form.photosDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={formData.photos || []}
                onPhotosChange={(photos) => updateField('photos', photos)}
                maxPhotos={6}
              />
            </CardContent>
          </Card>

          {/* Capacity & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {t('rooms.form.capacity')}
              </CardTitle>
              <CardDescription>{t('rooms.form.capacityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBedrooms">{t('rooms.form.totalBedrooms')} *</Label>
                  <Input
                    id="totalBedrooms"
                    type="number"
                    min={1}
                    value={formData.total_bedrooms}
                    onChange={(e) => updateField('total_bedrooms', Number(e.target.value))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('rooms.form.totalBedroomsHint')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentOccupants">{t('rooms.form.currentOccupants')} *</Label>
                  <Input
                    id="currentOccupants"
                    type="number"
                    min={0}
                    value={formData.current_roommates}
                    onChange={(e) => updateField('current_roommates', Number(e.target.value))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('rooms.form.currentOccupantsHint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRoommates">{t('rooms.form.maxRoommates')}</Label>
                  <Input
                    id="maxRoommates"
                    type="number"
                    min={1}
                    value={formData.max_roommates}
                    onChange={(e) => updateField('max_roommates', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'الجنس المسموح' : 'Allowed Gender'} *</Label>
                  {listerType === 'current_tenant' ? (
                    // Current tenants cannot change - locked to their gender
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="font-medium">
                        {profile?.gender === 'female' 
                          ? (isRTL ? 'إناث فقط' : 'Females Only')
                          : (isRTL ? 'ذكور فقط' : 'Males Only')
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRTL 
                          ? 'كمستأجر حالي، يجب أن يكون المستأجرون الجدد من نفس جنسك'
                          : 'As a current tenant, new roommates must be your same gender'}
                      </p>
                    </div>
                  ) : (
                    // Landlords can choose males_only or females_only
                    <Select
                      value={allowedGender}
                      onValueChange={(value) => setAllowedGender(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOWED_GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {language === 'ar' ? option.labelAr : option.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'لا يسمح بالسكن المختلط بين الجنسين' : 'Mixed gender housing is not allowed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.availability')}</CardTitle>
              <CardDescription>{t('rooms.form.availabilityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('rooms.form.availableFrom')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !availableDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {availableDate ? format(availableDate, "PPP") : t('rooms.form.pickDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={availableDate}
                        onSelect={(date) => date && setAvailableDate(date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStay">{t('rooms.form.minStay')}</Label>
                  <Input
                    id="minStay"
                    type="number"
                    min={1}
                    value={formData.min_stay_months}
                    onChange={(e) => updateField('min_stay_months', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings - HIDDEN FOR BETA */}
          {/* 
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {t('payment.settings')}
              </CardTitle>
              <CardDescription>
                {t('payment.settingsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              ... Payment Settings Content Hidden for Beta ...
            </CardContent>
          </Card>
          */}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isVerified || createRoom.isPending}
          >
            {createRoom.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('rooms.form.creating')}
              </>
            ) : (
              t('rooms.form.submit')
            )}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

const ListRoom: React.FC = () => {
  return (
    <LanguageProvider>
      <ListRoomContent />
    </LanguageProvider>
  );
};

export default ListRoom;
