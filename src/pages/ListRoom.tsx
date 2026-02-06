import React, { useState } from 'react';
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
import PhotoUploader from '@/components/rooms/PhotoUploader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Home, Loader2, AlertTriangle, CheckCircle, Wallet, CreditCard, MapPin, Flame, Wifi, Building2, DoorOpen, Shield, Wind, Droplets, Users, PawPrint, Cigarette, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomType } from '@/types/room';
import { logError } from '@/lib/logger';
import { translateCity } from '@/lib/cityTranslations';

const EGYPTIAN_CITIES = [
  'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada',
  'Luxor', 'Aswan', 'Port Said', 'Suez', 'Mansoura',
];


const ListRoomContent: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const createRoom = useCreateRoom();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<CreateRoomInput>>({
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
    // New amenity fields
    has_natural_gas: false,
    has_wifi: false,
    has_elevator: false,
    has_balcony: false,
    has_doorman: false,
    has_ac: false,
    has_water_heater: false,
    // House rules
    allows_visits: true,
    // Capacity
    total_bedrooms: 1,
    // Location
    location_link: '',
  });

  const [availableDate, setAvailableDate] = useState<Date>(new Date());

  const updateField = <K extends keyof CreateRoomInput>(key: K, value: CreateRoomInput[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isVerified = profile?.verification_status === 'verified';
  const isLoading = authLoading || profileLoading;

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
      } as CreateRoomInput);
      
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
          <AlertTriangle className="w-16 h-16 mx-auto text-warning mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t('rooms.form.loginRequired')}</h1>
          <Button onClick={() => navigate('/auth')}>{t('nav.signIn')}</Button>
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
                  <Label>{t('rooms.form.city')} *</Label>
                  <Select
                    value={formData.city || 'select'}
                    onValueChange={(value) => updateField('city', value === 'select' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('rooms.form.selectCity')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select" disabled>{t('rooms.form.selectCity')}</SelectItem>
                      {EGYPTIAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{translateCity(city, isRTL)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">{t('rooms.form.area')}</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => updateField('area', e.target.value)}
                    placeholder={t('rooms.form.areaPlaceholder')}
                  />
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
                <p className="text-xs text-muted-foreground">{t('rooms.form.locationLinkHint')}</p>
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
                  <Label>{t('rooms.form.preferredGender')}</Label>
                  <Select
                    value={formData.preferred_gender || profile?.gender || 'male'}
                    onValueChange={(value) => updateField('preferred_gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('auth.male')}</SelectItem>
                      <SelectItem value="female">{t('auth.female')}</SelectItem>
                    </SelectContent>
                  </Select>
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
