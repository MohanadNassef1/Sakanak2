import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { containsBlockedContent } from '@/lib/messageFilter';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRoom } from '@/hooks/useRooms';
import { useUpdateRoom, UpdateRoomInput } from '@/hooks/useUpdateRoom';
import { useUploadRoomPhoto } from '@/hooks/useCreateRoom';
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
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Home, Loader2, AlertTriangle, CheckCircle, Wallet, MapPin, Flame, Wifi, Building2, DoorOpen, Shield, Wind, Droplets, Users, PawPrint, Cigarette, UserCheck, Zap, Droplet, Wrench, Globe, ArrowLeft, Save, Plus, Minus, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomType } from '@/types/room';
import { logError } from '@/lib/logger';

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

const ALLOWED_GENDER_OPTIONS = [
  { id: 'males_only', labelEn: 'Males Only', labelAr: 'ذكور فقط' },
  { id: 'females_only', labelEn: 'Females Only', labelAr: 'إناث فقط' },
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

const EditRoomContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: room, isLoading: roomLoading, error: roomError } = useRoom(id || '');
  
  // Load payout info from secure table (only accessible to owner)
  const { data: payoutInfo } = useQuery({
    queryKey: ['room_payout_info', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase
        .from('room_payout_info')
        .select('payout_method, payout_details')
        .eq('room_id', id)
        .maybeSingle();
      return data;
    },
    enabled: !!id,
  });
  const updateRoom = useUpdateRoom();
  const navigate = useNavigate();

  const [listerType, setListerType] = useState<'landlord' | 'current_tenant'>('landlord');
  const [billsIncluded, setBillsIncluded] = useState<string[]>([]);
  const [personalityTags, setPersonalityTags] = useState<string[]>([]);
  const [allowedGender, setAllowedGender] = useState<string>('males_only');

  const [formData, setFormData] = useState<Partial<UpdateRoomInput> & { deposit?: number }>({
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
    preferred_gender: 'male',
    allows_smoking: false,
    allows_pets: false,
    insurance_amount: 0,
    owner_payout_method: 'instapay' as 'instapay' | 'vodafone_cash' | 'fawry',
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form with room data
  useEffect(() => {
    if (room && !isInitialized) {
      setFormData({
        title: room.title || '',
        description: room.description || '',
        room_type: room.room_type || 'private_room',
        price_per_month: room.price_per_month || 0,
        city: room.city || '',
        area: room.area || '',
        address: room.address || '',
        photos: room.photos || [],
        amenities: room.amenities || [],
        rules: room.rules || [],
        available_from: room.available_from || format(new Date(), 'yyyy-MM-dd'),
        min_stay_months: room.min_stay_months || 1,
        max_roommates: room.max_roommates || 1,
        current_roommates: room.current_roommates || 0,
        preferred_gender: room.preferred_gender || 'male',
        allows_smoking: room.allows_smoking || false,
        allows_pets: room.allows_pets || false,
        insurance_amount: room.insurance_amount || 0,
        owner_payout_method: (payoutInfo?.payout_method as 'instapay' | 'vodafone_cash' | 'fawry') || 'instapay',
        payout_details: '',
        has_natural_gas: room.has_natural_gas || false,
        has_wifi: room.has_wifi || false,
        has_elevator: room.has_elevator || false,
        has_balcony: room.has_balcony || false,
        has_doorman: room.has_doorman || false,
        has_ac: room.has_ac || false,
        has_water_heater: room.has_water_heater || false,
        has_private_bathroom: room.has_private_bathroom || false,
        allows_visits: room.allows_visits ?? true,
        total_bedrooms: room.total_bedrooms || 1,
        location_link: room.location_link || '',
        deposit: room.deposit || 0,
        price_negotiable: (room as any).price_negotiable || false,
        instant_book: (room as any).instant_book || false,
      });
      setListerType(room.lister_type as 'landlord' | 'current_tenant' || 'landlord');
      setBillsIncluded(room.bills_included || []);
      setPersonalityTags(room.personality_tags || []);
      setAllowedGender((room as any).allowed_gender || room.preferred_gender || 'males_only');
      if (room.available_from) {
        setAvailableDate(parseISO(room.available_from));
      }
      setIsInitialized(true);
    }
  }, [room, payoutInfo, isInitialized]);

  const updateField = <K extends keyof UpdateRoomInput>(key: K, value: UpdateRoomInput[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isLoading = authLoading || profileLoading || roomLoading;
  const isOwner = user?.id === room?.owner_id;

  // Redirect if not owner
  useEffect(() => {
    if (!isLoading && room && !isOwner) {
      toast.error(isRTL ? 'لا يمكنك تعديل هذا الإعلان' : 'You cannot edit this listing');
      navigate('/profile');
    }
  }, [isLoading, room, isOwner, navigate, isRTL]);

  // Auto-set gender for current tenant based on profile
  useEffect(() => {
    if (listerType === 'current_tenant' && profile?.gender) {
      const genderValue = profile.gender === 'male' ? 'males_only' : 'females_only';
      setAllowedGender(genderValue);
    }
  }, [listerType, profile?.gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!formData.title || !formData.city || !formData.address || !formData.price_per_month) {
      toast.error(t('rooms.form.requiredFields'));
      return;
    }

    if (containsBlockedContent(formData.description || '') || containsBlockedContent(formData.title || '') || containsBlockedContent(formData.address || '')) {
      toast.error(isRTL ? 'غير مسموح بإضافة أرقام هواتف أو بريد إلكتروني أو روابط في وصف أو عنوان الغرفة' : 'Phone numbers, emails, links and social media are not allowed in room details');
      return;
    }

    try {
      // For current tenant, always use their profile gender
      const finalAllowedGender = listerType === 'current_tenant' && profile?.gender
        ? (profile.gender === 'male' ? 'males_only' : 'females_only')
        : allowedGender;

      await updateRoom.mutateAsync({
        roomId: id,
        input: {
          ...formData,
          available_from: format(availableDate, 'yyyy-MM-dd'),
          lister_type: listerType,
          deposit: formData.deposit || 0,
          bills_included: billsIncluded,
          personality_tags: listerType === 'current_tenant' ? personalityTags : [],
          allowed_gender: finalAllowedGender,
          preferred_gender: finalAllowedGender === 'males_only' ? 'male' : finalAllowedGender === 'females_only' ? 'female' : 'any',
        } as any,
      });
      
      toast.success(isRTL ? 'تم تحديث الإعلان بنجاح' : 'Listing updated successfully');
      navigate('/profile');
    } catch (error: any) {
      logError('EditRoom.updateRoom', error);
      toast.error(error.message || (isRTL ? 'فشل في تحديث الإعلان' : 'Failed to update listing'));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (roomError || !room) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-16 h-16 text-yellow-500" />
          <h1 className="text-2xl font-bold">{isRTL ? 'الإعلان غير موجود' : 'Listing not found'}</h1>
          <Button onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isRTL ? 'العودة للملف الشخصي' : 'Back to Profile'}
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <MainLayout>
      <div className={cn("container mx-auto px-4 py-8 max-w-3xl", isRTL && "rtl")}>
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/profile')}>
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'العودة' : 'Back'}
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8 text-primary" />
            {isRTL ? 'تعديل الإعلان' : 'Edit Listing'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRTL ? 'قم بتحديث تفاصيل إعلانك' : 'Update your listing details'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {isRTL ? 'من أنت؟' : 'Who Are You?'}
              </CardTitle>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('rooms.form.roomTitle')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('rooms.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
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
                  <div className="flex items-center gap-3">
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={formData.price_per_month || ''}
                      onChange={(e) => updateField('price_per_month', Number(e.target.value))}
                      required
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        id="price_negotiable_edit"
                        checked={(formData as any).price_negotiable || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, price_negotiable: checked }))}
                      />
                      <Label htmlFor="price_negotiable_edit" className="text-sm whitespace-nowrap">
                        {isRTL ? 'قابل للتفاوض' : 'Negotiable'}
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      id="instant_book_edit"
                      checked={(formData as any).instant_book || false}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, instant_book: checked }))}
                    />
                    <Label htmlFor="instant_book_edit" className="text-sm cursor-pointer">
                      {isRTL ? '⚡ حجز فوري (بدون معاينة)' : '⚡ Instant Book (skip viewing)'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                {isRTL ? 'التفاصيل المالية' : 'Financial Details'}
              </CardTitle>
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
                  />
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
                      <SelectValue />
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('rooms.form.address')} *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationLink">{t('rooms.form.locationLink')}</Label>
                <Input
                  id="locationLink"
                  value={formData.location_link}
                  onChange={(e) => updateField('location_link', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.amenities')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <Label htmlFor="naturalGas">{t('rooms.form.naturalGas')}</Label>
                  </div>
                  <Switch
                    id="naturalGas"
                    checked={formData.has_natural_gas}
                    onCheckedChange={(checked) => updateField('has_natural_gas', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-500" />
                    <Label htmlFor="wifi">{t('rooms.form.wifi')}</Label>
                  </div>
                  <Switch
                    id="wifi"
                    checked={formData.has_wifi}
                    onCheckedChange={(checked) => updateField('has_wifi', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <Label htmlFor="elevator">{t('rooms.form.elevator')}</Label>
                  </div>
                  <Switch
                    id="elevator"
                    checked={formData.has_elevator}
                    onCheckedChange={(checked) => updateField('has_elevator', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-green-500" />
                    <Label htmlFor="balcony">{t('rooms.form.balcony')}</Label>
                  </div>
                  <Switch
                    id="balcony"
                    checked={formData.has_balcony}
                    onCheckedChange={(checked) => updateField('has_balcony', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-500" />
                    <Label htmlFor="doorman">{t('rooms.form.doorman')}</Label>
                  </div>
                  <Switch
                    id="doorman"
                    checked={formData.has_doorman}
                    onCheckedChange={(checked) => updateField('has_doorman', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-cyan-500" />
                    <Label htmlFor="ac">{t('rooms.form.ac')}</Label>
                  </div>
                  <Switch
                    id="ac"
                    checked={formData.has_ac}
                    onCheckedChange={(checked) => updateField('has_ac', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <Label htmlFor="waterHeater">{t('rooms.form.waterHeater')}</Label>
                  </div>
                  <Switch
                    id="waterHeater"
                    checked={formData.has_water_heater}
                    onCheckedChange={(checked) => updateField('has_water_heater', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <Label htmlFor="privateBathroom">{isRTL ? 'حمام خاص' : 'Private Bathroom'}</Label>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Cigarette className="w-5 h-5 text-amber-600" />
                    <Label htmlFor="smoking">{t('rooms.form.allowsSmoking')}</Label>
                  </div>
                  <Switch
                    id="smoking"
                    checked={formData.allows_smoking}
                    onCheckedChange={(checked) => updateField('allows_smoking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <PawPrint className="w-5 h-5 text-amber-700" />
                    <Label htmlFor="pets">{t('rooms.form.allowsPets')}</Label>
                  </div>
                  <Switch
                    id="pets"
                    checked={formData.allows_pets}
                    onCheckedChange={(checked) => updateField('allows_pets', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <Label htmlFor="visits">{t('rooms.form.allowsVisits')}</Label>
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

          {/* Capacity & Availability */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'السعة والتوفر' : 'Capacity & Availability'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Bedrooms - Stepper */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'عدد الغرف' : 'Bedrooms'}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('total_bedrooms', Math.max(1, (formData.total_bedrooms || 1) - 1))}
                      disabled={(formData.total_bedrooms || 1) <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg bg-muted rounded-md py-2">
                      {formData.total_bedrooms || 1}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('total_bedrooms', (formData.total_bedrooms || 1) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Max Roommates - Stepper */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'الحد الأقصى للسكان' : 'Max Roommates'}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('max_roommates', Math.max(1, (formData.max_roommates || 1) - 1))}
                      disabled={(formData.max_roommates || 1) <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg bg-muted rounded-md py-2">
                      {formData.max_roommates || 1}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('max_roommates', (formData.max_roommates || 1) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Roommates - Stepper */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'السكان الحاليون' : 'Current Roommates'}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('current_roommates', Math.max(0, (formData.current_roommates || 0) - 1))}
                      disabled={(formData.current_roommates || 0) <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg bg-muted rounded-md py-2">
                      {formData.current_roommates || 0}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('current_roommates', (formData.current_roommates || 0) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Min Stay - Stepper */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'الحد الأدنى للإقامة (شهور)' : 'Min Stay (months)'}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('min_stay_months', Math.max(1, (formData.min_stay_months || 1) - 1))}
                      disabled={(formData.min_stay_months || 1) <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg bg-muted rounded-md py-2">
                      {formData.min_stay_months || 1}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => updateField('min_stay_months', (formData.min_stay_months || 1) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'متاح من' : 'Available From'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(availableDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={availableDate}
                      onSelect={(date) => date && setAvailableDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Gender Selection - Locked for current tenant */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {isRTL ? 'مسموح لـ' : 'Allowed For'} *
                  {listerType === 'current_tenant' && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      {isRTL ? 'مقفل حسب جنسك' : 'Locked to your gender'}
                    </span>
                  )}
                </Label>
                {listerType === 'current_tenant' ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {profile?.gender === 'male' 
                        ? (language === 'ar' ? 'ذكور فقط' : 'Males Only')
                        : (language === 'ar' ? 'إناث فقط' : 'Females Only')
                      }
                    </span>
                  </div>
                ) : (
                  <Select
                    value={allowedGender}
                    onValueChange={setAllowedGender}
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
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.photos')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                photos={formData.photos || []}
                onPhotosChange={(photos) => updateField('photos', photos)}
                maxPhotos={10}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateRoom.isPending}
              className="flex-1"
            >
              {updateRoom.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

const EditRoom: React.FC = () => {
  return (
    <LanguageProvider>
      <EditRoomContent />
    </LanguageProvider>
  );
};

export default EditRoom;
