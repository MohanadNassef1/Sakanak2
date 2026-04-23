import React, { useState, useEffect, useCallback } from 'react';
import { containsBlockedContent } from '@/lib/messageFilter';
import { supabase } from '@/integrations/supabase/client';
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
import VideoUploader from '@/components/rooms/VideoUploader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Home, Loader2, AlertTriangle, CheckCircle, Wallet, MapPin, Flame, Wifi, Building2, DoorOpen, Shield, Wind, Droplets, Users, PawPrint, Cigarette, UserCheck, Zap, Droplet, Wrench, Globe, Sparkles, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomType } from '@/types/room';
import { logError } from '@/lib/logger';
import { useIsAdmin } from '@/hooks/useUserRole';
import { getGovernorates, getAreasForGovernorate, getGovernorateLabel, getAreaLabel } from '@/lib/locationData';
import RoomListerChat from '@/components/rooms/RoomListerChat';

// Gender options - landlords can choose all three, tenants are auto-locked
const ALLOWED_GENDER_OPTIONS = [
  { id: 'males_only', labelEn: 'Males Only', labelAr: 'ذكور فقط' },
  { id: 'females_only', labelEn: 'Females Only', labelAr: 'إناث فقط' },
];

const LANDLORD_GENDER_OPTIONS = [
  { id: 'males_only', labelEn: 'Males Only', labelAr: 'ذكور فقط' },
  { id: 'females_only', labelEn: 'Females Only', labelAr: 'إناث فقط' },
  { id: 'males_and_females', labelEn: 'Males or Females', labelAr: 'ذكور أو إناث' },
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

const DRAFT_KEY = 'sakanak_listing_draft';

const ListRoomContent: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { isAdmin } = useIsAdmin(user?.id);
  const createRoom = useCreateRoom();
  const navigate = useNavigate();

  const [listerType, setListerType] = useState<'landlord' | 'current_tenant' | 'landlord_and_tenant'>('landlord');
  const [billsIncluded, setBillsIncluded] = useState<string[]>([]);
  const [personalityTags, setPersonalityTags] = useState<string[]>([]);
  const [allowedGender, setAllowedGender] = useState<string>(profile?.gender === 'female' ? 'females_only' : 'males_only');
  
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [isAiDescription, setIsAiDescription] = useState(false);
  const [isAutoTitle, setIsAutoTitle] = useState(true);

  useEffect(() => {
    if (profile?.gender) {
      if (isAdmin) return;
      // Landlords can choose gender freely; tenants are auto-locked to their profile gender
      if (listerType !== 'landlord') {
        setAllowedGender(profile.gender === 'female' ? 'females_only' : 'males_only');
      }
    }
    if (profile && (listerType === 'current_tenant' || listerType === 'landlord_and_tenant')) {
      if (profile.personality_tags && profile.personality_tags.length > 0) {
        const validTags = profile.personality_tags.filter(tag => PERSONALITY_TAGS.some(pt => pt.id === tag));
        setPersonalityTags(validTags.slice(0, 5));
      }
    }
  }, [profile, listerType, isAdmin]);

  const [formData, setFormData] = useState<Partial<CreateRoomInput> & { deposit?: number }>({
    title: '', description: '', room_type: 'private_room', price_per_month: 0,
    city: '', area: '', address: '', photos: [], videos: [], amenities: [], rules: [],
    available_from: format(new Date(), 'yyyy-MM-dd'), min_stay_months: 1,
    max_roommates: 1, current_roommates: 0, preferred_gender: profile?.gender || 'male',
    allows_smoking: false, allows_pets: false, insurance_amount: 0,
    owner_payout_method: 'instapay', payout_details: '',
    has_natural_gas: false, has_wifi: false, has_elevator: false, has_balcony: false,
    has_doorman: false, has_ac: false, has_water_heater: false, has_private_bathroom: false,
    allows_visits: true, total_bedrooms: 1, location_link: '', deposit: 0, price_negotiable: false,
  });

  const [availableDate, setAvailableDate] = useState<Date>(new Date());
  const [contactInfoWarning, setContactInfoWarning] = useState<string | null>(null);

  // --- Auto-save draft ---
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        formData, listerType, billsIncluded, personalityTags, allowedGender,
        availableDate: availableDate.toISOString(), savedAt: new Date().toISOString(),
      }));
    } catch {}
  }, [formData, listerType, billsIncluded, personalityTags, allowedGender, availableDate]);

  useEffect(() => {
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [saveDraft]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.formData) setFormData(prev => ({ ...prev, ...draft.formData }));
        if (draft.listerType) setListerType(draft.listerType);
        if (draft.billsIncluded) setBillsIncluded(draft.billsIncluded);
        if (draft.personalityTags) setPersonalityTags(draft.personalityTags);
        if (draft.allowedGender) setAllowedGender(draft.allowedGender);
        if (draft.availableDate) setAvailableDate(new Date(draft.availableDate));
        
        toast.info(isRTL ? 'تم استعادة المسودة المحفوظة' : 'Draft restored', { duration: 2000 });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

  const updateField = <K extends keyof CreateRoomInput>(key: K, value: CreateRoomInput[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === 'description') {
      setIsAiDescription(false); // User is manually editing
    }
    if (key === 'title') {
      setIsAutoTitle(false); // User is manually editing title
    }
    if (key === 'title' || key === 'description' || key === 'address') {
      if (containsBlockedContent(String(value || ''))) {
        setContactInfoWarning(isRTL ? 'غير مسموح بإضافة أرقام هواتف أو بريد إلكتروني أو روابط' : 'Phone numbers, emails, links and social media are not allowed');
      } else {
        setContactInfoWarning(null);
      }
    }
  };

  // --- Smart title auto-fill ---
  useEffect(() => {
    // Only skip auto-fill if user manually typed a title
    if (!isAutoTitle && formData.title && formData.title.trim().length > 0) return;
    const roomTypeLabels: Record<string, { en: string; ar: string }> = {
      private_room: { en: 'Private Room', ar: 'غرفة خاصة' },
      shared_room: { en: 'Shared Room', ar: 'غرفة مشتركة' },
      studio: { en: 'Studio', ar: 'ستوديو' },
      apartment: { en: 'Apartment', ar: 'شقة' },
    };
    const typeLabel = roomTypeLabels[formData.room_type || 'private_room'];
    const areaLabel = formData.area ? getAreaLabel(formData.area, isRTL) : '';
    const cityLabel = formData.city ? getGovernorateLabel(formData.city, isRTL) : '';
    if (areaLabel && cityLabel) {
      const newTitle = isRTL ? `${typeLabel.ar} في ${areaLabel}، ${cityLabel}` : `${typeLabel.en} in ${areaLabel}, ${cityLabel}`;
      setFormData(prev => ({ ...prev, title: newTitle }));
      setIsAutoTitle(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.city, formData.area, formData.room_type]);

  // --- Generate description from photos ---
  const handleGenerateFromPhotos = async () => {
    if (generatingDesc) return;
    const photos = formData.photos || [];
    if (photos.length === 0) {
      toast.error(isRTL ? 'أضف صور أولاً' : 'Add photos first');
      return;
    }
    setGeneratingDesc(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: {
          photos,
          roomDetails: {
            title: formData.title,
            room_type: formData.room_type,
            city: formData.city,
            area: formData.area,
            price: formData.price_per_month,
            has_wifi: formData.has_wifi,
            has_ac: formData.has_ac,
            has_elevator: formData.has_elevator,
            has_balcony: formData.has_balcony,
            has_doorman: formData.has_doorman,
            has_natural_gas: formData.has_natural_gas,
            has_water_heater: formData.has_water_heater,
            has_private_bathroom: formData.has_private_bathroom,
            allows_pets: formData.allows_pets,
            allows_smoking: formData.allows_smoking,
            allows_visits: formData.allows_visits,
            total_bedrooms: formData.total_bedrooms,
            current_roommates: formData.current_roommates,
            bills_included: billsIncluded,
            gender: allowedGender,
            lister_type: listerType,
          },
          language,
        },
      });
      if (error) throw error;
      if (data?.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
        setIsAiDescription(true);
        setContactInfoWarning(null);
        toast.success(isRTL ? 'تم إنشاء الوصف من الصور!' : 'Description generated from photos!');
      }
    } catch (err: any) {
      console.error('AI description error:', err);
      toast.error(isRTL ? 'فشل إنشاء الوصف' : 'Failed to generate description');
    } finally {
      setGeneratingDesc(false);
    }
  };


  const isLoading = authLoading || profileLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.city || !formData.area || !formData.address || !formData.price_per_month) {
      toast.error(t('rooms.form.requiredFields'));
      return;
    }
    const descBlocked = !isAiDescription && containsBlockedContent(formData.description || '');
    if (descBlocked || containsBlockedContent(formData.title || '') || containsBlockedContent(formData.address || '')) {
      toast.error(isRTL ? 'غير مسموح بإضافة أرقام هواتف أو بريد إلكتروني أو روابط في وصف أو عنوان الغرفة' : 'Phone numbers, emails, links and social media are not allowed in room details');
      return;
    }
    try {
      await createRoom.mutateAsync({
        ...formData,
        available_from: format(availableDate, 'yyyy-MM-dd'),
        lister_type: listerType,
        deposit: formData.deposit || 0,
        bills_included: billsIncluded,
        personality_tags: (listerType === 'current_tenant' || listerType === 'landlord_and_tenant') ? personalityTags : [],
        allowed_gender: allowedGender,
        videos: formData.videos || [],
        preferred_gender: allowedGender === 'males_only' ? 'male' : allowedGender === 'females_only' ? 'female' : allowedGender === 'males_and_females' ? 'males_and_females' : 'any',
      } as any);
      clearDraft();
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
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('rooms.form.loginRequired')}</h1>
          <Button onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className={cn("container mx-auto px-3 sm:px-4 py-4 md:py-8 max-w-3xl", isRTL && "rtl")}>
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            {t('rooms.form.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{t('rooms.form.subtitle')}</p>
          <div className="mt-4">
            <RoomListerChat />
          </div>
        </div>


        {/* Auto-save indicator */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
          <Save className="w-3 h-3" />
          {isRTL ? 'يتم حفظ المسودة تلقائياً' : 'Draft auto-saved'}
          <button type="button" onClick={() => { clearDraft(); toast.success(isRTL ? 'تم مسح المسودة' : 'Draft cleared'); window.location.reload(); }}
            className="text-destructive hover:underline ml-auto">
            {isRTL ? 'مسح المسودة' : 'Clear draft'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ===== 1. Role Selection ===== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {isRTL ? 'من أنت؟' : 'Who Are You?'}
              </CardTitle>
              <CardDescription>{isRTL ? 'اختر دورك في هذا الإعلان' : 'Select your role for this listing'}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  { type: 'landlord' as const, icon: <Home className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />, labelEn: 'Landlord', labelAr: 'مالك العقار', descEn: "I own this property and don't live in it", descAr: 'أنا صاحب الشقة ولا أسكن فيها' },
                  { type: 'current_tenant' as const, icon: <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />, labelEn: 'Current Tenant', labelAr: 'مستأجر حالي', descEn: 'Looking for a roommate', descAr: 'أبحث عن شريك سكن' },
                  { type: 'landlord_and_tenant' as const, icon: <><Home className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /><Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></>, labelEn: 'Landlord & Tenant', labelAr: 'مالك وساكن', descEn: 'Owner living in the property', descAr: 'مالك وساكن في نفس الشقة' },
                ].map(role => (
                  <div key={role.type} onClick={() => setListerType(role.type)}
                    className={cn("flex flex-col items-center justify-center p-3 sm:p-6 rounded-lg border-2 cursor-pointer transition-all",
                      listerType === role.type ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50")}>
                    <div className="flex items-center gap-0.5 mb-1 sm:mb-2">{role.icon}</div>
                    <span className="font-medium text-xs sm:text-base text-center">{isRTL ? role.labelAr : role.labelEn}</span>
                    <span className="text-[9px] sm:text-xs text-muted-foreground text-center mt-1">{isRTL ? role.descAr : role.descEn}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== 2. PHOTOS ===== */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                {t('rooms.form.photos')}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'أضف صور الغرفة' : 'Upload your room photos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PhotoUploader
                photos={formData.photos || []}
                onPhotosChange={(photos) => updateField('photos', photos)}
                maxPhotos={6}
              />
              <div className="pt-4 border-t border-border">
                <Label className="flex items-center gap-2 mb-3">
                  {isRTL ? 'فيديو الجولة (اختياري)' : 'Walkthrough video (optional)'}
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  {isRTL ? 'فيديو قصير يساعد المستأجرين على تخيل المكان' : 'A short clip helps tenants visualize the place'}
                </p>
                <VideoUploader
                  videos={formData.videos || []}
                  onVideosChange={(videos) => updateField('videos' as any, videos as any)}
                  maxVideos={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* ===== 3. Location ===== */}
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
                  <Select value={formData.city || 'select'} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value === 'select' ? '' : value, area: '' }))}>
                    <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select Governorate'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select" disabled>{isRTL ? 'اختر المحافظة' : 'Select Governorate'}</SelectItem>
                      {getGovernorates().map((gov) => (<SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'المنطقة' : 'Area'} *</Label>
                  <Select value={formData.area || 'select'} onValueChange={(value) => updateField('area', value === 'select' ? '' : value)} disabled={!formData.city}>
                    <SelectTrigger><SelectValue placeholder={isRTL ? 'اختر المنطقة' : 'Select Area'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select" disabled>{isRTL ? 'اختر المنطقة' : 'Select Area'}</SelectItem>
                      {formData.city && getAreasForGovernorate(formData.city).map((area) => (<SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('rooms.form.address')} *</Label>
                <Input id="address" value={formData.address} onChange={(e) => updateField('address', e.target.value)} placeholder={t('rooms.form.addressPlaceholder')} required className={containsBlockedContent(formData.address || '') ? 'border-destructive' : ''} />
                {containsBlockedContent(formData.address || '') && (
                  <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{contactInfoWarning}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationLink">{t('rooms.form.locationLink')}</Label>
                <Input id="locationLink" value={formData.location_link} onChange={(e) => updateField('location_link', e.target.value)} placeholder={t('rooms.form.locationLinkPlaceholder')} />
                <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{t('rooms.form.locationPrivacyNotice')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== 4. Basic Info ===== */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.basicInfo')}</CardTitle>
              <CardDescription>{t('rooms.form.basicInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('rooms.form.roomType')} *</Label>
                  <Select value={formData.room_type} onValueChange={(value) => updateField('room_type', value as RoomType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <div className="flex items-center gap-3">
                    <Input id="price" type="number" min={0} value={formData.price_per_month || ''} onChange={(e) => updateField('price_per_month', Number(e.target.value))} placeholder="5000" required className="flex-1" />
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch id="price_negotiable" checked={(formData as any).price_negotiable || false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, price_negotiable: checked }))} />
                      <Label htmlFor="price_negotiable" className="text-sm whitespace-nowrap cursor-pointer">{isRTL ? 'قابل للتفاوض' : 'Negotiable'}</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">{t('rooms.form.roomTitle')} *</Label>
                  <span className="text-[10px] text-muted-foreground">{isRTL ? 'يتم ملؤه تلقائياً عند اختيار الموقع' : 'Auto-fills when you pick a location'}</span>
                </div>
                <Input id="title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder={t('rooms.form.roomTitlePlaceholder')} required className={containsBlockedContent(formData.title || '') ? 'border-destructive' : ''} />
                {containsBlockedContent(formData.title || '') && (
                  <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{contactInfoWarning}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('rooms.form.description')}</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder={t('rooms.form.descriptionPlaceholder')} rows={5} className={cn(
                  'resize-none scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors',
                  !isAiDescription && containsBlockedContent(formData.description || '') ? 'border-destructive' : ''
                )} />
                {(formData.photos || []).length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateFromPhotos}
                    disabled={generatingDesc}
                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    {generatingDesc ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {generatingDesc
                      ? (isRTL ? 'جاري كتابة الوصف...' : 'Writing description...')
                      : (isRTL ? '✨ اكتب الوصف من الصور' : '✨ Write description from photos')}
                  </Button>
                )}
                {!isAiDescription && containsBlockedContent(formData.description || '') && (
                  <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{contactInfoWarning}</p>
                )}
                {/* Suggested keywords */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1 self-center">{isRTL ? 'أضف:' : 'Add:'}</span>
                  {(() => {
                    const baseKeywords = isRTL
                      ? ['قريب من المواصلات', 'هادئ', 'مفروش', 'نظيف', 'مشمس', 'قريب من الجامعة', 'واسعة', 'بتشطيب حديث', 'شارع رئيسي', 'جاهزة للسكن', 'دور أرضي', 'إطلالة مميزة', 'أمان', 'قريب من المحلات', 'قريب من المترو', 'موقع مميز', 'سوبر ماركت قريب', 'هادئ ليلاً', 'جيران محترمين', 'تهوية ممتازة', 'قريب من المستشفى', 'شقة مؤمنة', 'إضاءة طبيعية', 'مساحة تخزين', 'قريب من الصيدلية', 'بدون وسيط', 'كمبوند', 'سعر مناسب', 'مطبخ مجهز', 'غسالة', 'ثلاجة', 'مكان للدراسة', 'انترنت سريع', 'موقف سيارات', 'حديقة', 'قريب من المولات']
                      : ['Near transport', 'Quiet', 'Furnished', 'Clean', 'Sunny', 'Near university', 'Spacious', 'Modern finish', 'Main street', 'Move-in ready', 'Ground floor', 'Great view', 'Safe area', 'Near shops', 'Near metro', 'Prime location', 'Supermarket nearby', 'Quiet at night', 'Friendly neighbors', 'Well ventilated', 'Near hospital', 'Secured building', 'Natural light', 'Storage space', 'Near pharmacy', 'No broker', 'Gated community', 'Affordable', 'Equipped kitchen', 'Washing machine', 'Fridge included', 'Study-friendly', 'High-speed internet', 'Parking available', 'Garden access', 'Near malls'];
                    const roomTypeKeywords = formData.room_type === 'studio' || formData.room_type === 'apartment'
                      ? (isRTL ? ['استقلالية كاملة', 'مدخل خاص', 'مطبخ منفصل'] : ['Full privacy', 'Private entrance', 'Separate kitchen'])
                      : formData.room_type === 'shared_room'
                      ? (isRTL ? ['سرير مريح', 'مساحة مشتركة', 'زميل محترم'] : ['Comfortable bed', 'Shared space', 'Respectful roommate'])
                      : (isRTL ? ['غرفة خاصة', 'باب بمفتاح'] : ['Private room', 'Lockable door']);
                    const amenityKeywords = [
                      ...(formData.has_wifi ? [isRTL ? 'واي فاي سريع' : 'Fast WiFi'] : []),
                      ...(formData.has_ac ? [isRTL ? 'تكييف' : 'Air conditioned'] : []),
                      ...(formData.has_balcony ? [isRTL ? 'بلكونة' : 'Balcony view'] : []),
                      ...(formData.has_private_bathroom ? [isRTL ? 'حمام خاص' : 'Private bathroom'] : []),
                      ...(formData.has_elevator ? [isRTL ? 'أسانسير' : 'Elevator access'] : []),
                      ...(formData.has_doorman ? [isRTL ? 'بواب' : 'Doorman'] : []),
                      ...(formData.has_natural_gas ? [isRTL ? 'غاز طبيعي' : 'Natural gas'] : []),
                      ...(formData.has_water_heater ? [isRTL ? 'سخان مياه' : 'Water heater'] : []),
                      ...(formData.allows_pets ? [isRTL ? 'حيوانات أليفة مرحب بها' : 'Pet-friendly'] : []),
                      ...(formData.allows_smoking ? [isRTL ? 'التدخين مسموح' : 'Smoking allowed'] : []),
                    ];
                    const keywords = [...amenityKeywords, ...roomTypeKeywords, ...baseKeywords];
                    return keywords
                      .filter(kw => !(formData.description || '').toLowerCase().includes(kw.toLowerCase()))
                      .slice(0, 12)
                      .map(kw => (
                        <button key={kw} type="button" onClick={() => {
                          const current = (formData.description || '').trim();
                          const separator = current ? (isRTL ? '، ' : ', ') : '';
                          updateField('description', current + separator + kw);
                        }} className="text-xs px-2.5 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                          + {kw}
                        </button>
                      ));
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== 5. Financial Details ===== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                {isRTL ? 'التفاصيل المالية' : 'Financial Details'}
              </CardTitle>
              <CardDescription>{isRTL ? 'حدد التأمين والفواتير المشمولة' : 'Specify deposit and included bills'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deposit">{isRTL ? 'التأمين (جنيه)' : 'Deposit (EGP)'}</Label>
                <Input id="deposit" type="number" min={0} value={formData.deposit || ''} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} placeholder="0" />
                <p className="text-xs text-muted-foreground">{isRTL ? 'المبلغ المطلوب كتأمين عند دخول الشقة' : 'Amount required as security deposit'}</p>
              </div>
              <div className="space-y-3">
                <Label>{isRTL ? 'الفواتير المشمولة في الإيجار' : 'Bills Included in Rent'}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BILLS_OPTIONS.map((bill) => (
                    <div key={bill.id}
                      className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        billsIncluded.includes(bill.id) ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50")}
                      onClick={() => setBillsIncluded((prev) => prev.includes(bill.id) ? prev.filter((b) => b !== bill.id) : [...prev, bill.id])}>
                      <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center",
                        billsIncluded.includes(bill.id) ? "border-primary bg-primary" : "border-muted-foreground")}>
                        {billsIncluded.includes(bill.id) && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <bill.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{language === 'ar' ? bill.labelAr : bill.labelEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* ===== 6. Amenities ===== */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.amenities')}</CardTitle>
              <CardDescription>{t('rooms.form.amenitiesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'naturalGas', key: 'has_natural_gas' as const, icon: Flame, label: t('rooms.form.naturalGas'), iconClass: 'text-orange-500' },
                  { id: 'wifi', key: 'has_wifi' as const, icon: Wifi, label: t('rooms.form.wifi'), iconClass: 'text-blue-500' },
                  { id: 'elevator', key: 'has_elevator' as const, icon: Building2, label: t('rooms.form.elevator'), iconClass: 'text-muted-foreground' },
                  { id: 'balcony', key: 'has_balcony' as const, icon: DoorOpen, label: t('rooms.form.balcony'), iconClass: 'text-green-500' },
                  { id: 'doorman', key: 'has_doorman' as const, icon: Shield, label: t('rooms.form.doorman'), iconClass: 'text-indigo-500' },
                  { id: 'ac', key: 'has_ac' as const, icon: Wind, label: t('rooms.form.ac'), iconClass: 'text-cyan-500' },
                  { id: 'waterHeater', key: 'has_water_heater' as const, icon: Droplets, label: t('rooms.form.waterHeater'), iconClass: 'text-red-500' },
                  { id: 'privateBathroom', key: 'has_private_bathroom' as const, icon: DoorOpen, label: isRTL ? 'حمام خاص' : 'Private Bathroom', iconClass: 'text-purple-500' },
                ].map(({ id, key, icon: Icon, label, iconClass }) => (
                  <div key={id} className="flex items-center justify-between rtl:flex-row-reverse p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", iconClass)} />
                      <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                    </div>
                    <Switch id={id} checked={formData[key] as boolean} onCheckedChange={(checked) => updateField(key, checked)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== 7. House Rules ===== */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.houseRules')}</CardTitle>
              <CardDescription>{t('rooms.form.houseRulesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 'pets', key: 'allows_pets' as const, icon: PawPrint, label: t('rooms.form.acceptPets'), iconClass: 'text-amber-500' },
                  { id: 'smoking', key: 'allows_smoking' as const, icon: Cigarette, label: t('rooms.form.acceptSmokers'), iconClass: 'text-muted-foreground' },
                  { id: 'visits', key: 'allows_visits' as const, icon: UserCheck, label: t('rooms.form.allowsVisits'), iconClass: 'text-green-500' },
                ].map(({ id, key, icon: Icon, label, iconClass }) => (
                  <div key={id} className="flex items-center justify-between rtl:flex-row-reverse p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", iconClass)} />
                      <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                    </div>
                    <Switch id={id} checked={formData[key] as boolean} onCheckedChange={(checked) => updateField(key, checked)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== 8. About You (for tenants) ===== */}
          {(listerType === 'current_tenant' || listerType === 'landlord_and_tenant') && (profile?.occupation_status || (profile?.personality_tags && profile.personality_tags.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{isRTL ? 'معلوماتك الشخصية' : 'About You'}</CardTitle>
                <CardDescription>{isRTL ? 'هذه المعلومات مأخوذة من ملفك الشخصي تلقائياً.' : 'This info is auto-filled from your profile.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.occupation_status && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-xl">{profile.occupation_status === 'student' ? '🎓' : '💼'}</span>
                    <div>
                      <p className="font-medium text-sm">{profile.occupation_status === 'student' ? (isRTL ? 'طالب' : 'Student') : (isRTL ? 'يعمل' : 'Working')}</p>
                      {profile.occupation_status === 'student' && profile.university && <p className="text-xs text-muted-foreground">{profile.university}</p>}
                      {profile.occupation_status === 'working' && profile.job_title && <p className="text-xs text-muted-foreground">{profile.job_title}</p>}
                    </div>
                  </div>
                )}
                {personalityTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{isRTL ? 'الفايبز' : 'Vibes'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {personalityTags.map((tagId) => {
                        const tag = PERSONALITY_TAGS.find(t => t.id === tagId);
                        return tag ? <Badge key={tagId} variant="default" className="text-sm px-3 py-1.5">{language === 'ar' ? tag.labelAr : tag.labelEn}</Badge> : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ===== 9. Capacity & Availability ===== */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{t('rooms.form.capacity')}</CardTitle>
              <CardDescription>{t('rooms.form.capacityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBedrooms">{t('rooms.form.totalBedrooms')} *</Label>
                  <Input id="totalBedrooms" type="number" min={1} value={formData.total_bedrooms} onChange={(e) => updateField('total_bedrooms', Number(e.target.value))} required />
                  <p className="text-xs text-muted-foreground">{t('rooms.form.totalBedroomsHint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentOccupants">{t('rooms.form.currentOccupants')} *</Label>
                  <Input id="currentOccupants" type="number" min={0} value={formData.current_roommates} onChange={(e) => updateField('current_roommates', Number(e.target.value))} required />
                  <p className="text-xs text-muted-foreground">{t('rooms.form.currentOccupantsHint')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRoommates">{t('rooms.form.maxRoommates')}</Label>
                  <Input id="maxRoommates" type="number" min={1} value={formData.max_roommates} onChange={(e) => updateField('max_roommates', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الجنس المسموح' : 'Allowed Gender'} *</Label>
                  {isAdmin || listerType === 'landlord' ? (
                    <Select value={allowedGender} onValueChange={setAllowedGender}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(listerType === 'landlord' || isAdmin ? LANDLORD_GENDER_OPTIONS : ALLOWED_GENDER_OPTIONS).map((option) => (
                          <SelectItem key={option.id} value={option.id}>{language === 'ar' ? option.labelAr : option.labelEn}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="font-medium">{profile?.gender === 'female' ? (isRTL ? 'إناث فقط' : 'Females Only') : (isRTL ? 'ذكور فقط' : 'Males Only')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'يتم تحديد الجنس تلقائياً بناءً على حسابك' : 'Gender is automatically set based on your profile'}</p>
                    </div>
                  )}
                  {listerType === 'landlord' && (
                    <p className="text-xs text-muted-foreground">{isRTL ? 'كمالك عقار، يمكنك اختيار الجنس المسموح للسكن' : 'As a landlord, you can choose the allowed gender for your listing'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== 10. Availability ===== */}
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
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !availableDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {availableDate ? format(availableDate, "PPP") : t('rooms.form.pickDate')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={availableDate} onSelect={(date) => date && setAvailableDate(date)} disabled={(date) => date < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStay">{t('rooms.form.minStay')}</Label>
                  <Input id="minStay" type="number" min={1} value={formData.min_stay_months} onChange={(e) => updateField('min_stay_months', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full" disabled={createRoom.isPending}>
            {createRoom.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('rooms.form.creating')}</>
            ) : t('rooms.form.submit')}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

const ListRoom: React.FC = () => (
  <LanguageProvider>
    <ListRoomContent />
  </LanguageProvider>
);

export default ListRoom;
