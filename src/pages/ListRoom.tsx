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
import TagInput from '@/components/rooms/TagInput';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Home, Loader2, AlertTriangle, CheckCircle, Wallet, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoomType } from '@/types/room';

const EGYPTIAN_CITIES = [
  'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada',
  'Luxor', 'Aswan', 'Port Said', 'Suez', 'Mansoura',
];

const AMENITY_SUGGESTIONS = [
  'WiFi', 'AC', 'Washing Machine', 'Kitchen Access', 'Gym', 'Pool',
  'Parking', 'Balcony', 'Security', 'Elevator', 'Furnished', 'TV',
];

const RULE_SUGGESTIONS = [
  'No smoking inside', 'No pets', 'No parties', 'Quiet after 10pm',
  'No overnight guests', 'Clean shared spaces', 'Students preferred',
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
      console.error('Create room error:', error);
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
              <CardTitle>{t('rooms.form.location')}</CardTitle>
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
                        <SelectItem key={city} value={city}>{city}</SelectItem>
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
                <Label htmlFor="address">{t('rooms.form.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={t('rooms.form.addressPlaceholder')}
                />
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

          {/* Amenities & Rules */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rooms.form.amenitiesRules')}</CardTitle>
              <CardDescription>{t('rooms.form.amenitiesRulesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('rooms.form.amenities')}</Label>
                <TagInput
                  tags={formData.amenities || []}
                  onTagsChange={(tags) => updateField('amenities', tags)}
                  placeholder={t('rooms.form.addAmenity')}
                  suggestions={AMENITY_SUGGESTIONS}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('rooms.form.rules')}</Label>
                <TagInput
                  tags={formData.rules || []}
                  onTagsChange={(tags) => updateField('rules', tags)}
                  placeholder={t('rooms.form.addRule')}
                  suggestions={RULE_SUGGESTIONS}
                />
              </div>
            </CardContent>
          </Card>

          {/* Availability & Preferences */}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="currentRoommates">{t('rooms.form.currentRoommates')}</Label>
                  <Input
                    id="currentRoommates"
                    type="number"
                    min={0}
                    value={formData.current_roommates}
                    onChange={(e) => updateField('current_roommates', Number(e.target.value))}
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

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smoking">{t('rooms.form.allowsSmoking')}</Label>
                  <Switch
                    id="smoking"
                    checked={formData.allows_smoking}
                    onCheckedChange={(checked) => updateField('allows_smoking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pets">{t('rooms.form.allowsPets')}</Label>
                  <Switch
                    id="pets"
                    checked={formData.allows_pets}
                    onCheckedChange={(checked) => updateField('allows_pets', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Set your insurance deposit and preferred payout method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance/Deposit Amount (EGP)</Label>
                  <Input
                    id="insurance"
                    type="number"
                    min={0}
                    value={formData.insurance_amount || 0}
                    onChange={(e) => updateField('insurance_amount', Number(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    This amount will be collected from the seeker as a security deposit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  <Select
                    value={formData.owner_payout_method || 'instapay'}
                    onValueChange={(value) => {
                      updateField('owner_payout_method', value as 'instapay' | 'vodafone_cash' | 'fawry');
                      updateField('payout_details', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instapay">Instapay</SelectItem>
                      <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                      <SelectItem value="fawry">Fawry</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How you want to receive your payment after seeker confirms
                  </p>
                </div>
              </div>

              {/* Payout Details */}
              <div className="space-y-2">
                <Label htmlFor="payout_details">
                  {formData.owner_payout_method === 'instapay' && 'Instapay Account Number / Phone'}
                  {formData.owner_payout_method === 'vodafone_cash' && 'Vodafone Cash Phone Number'}
                  {formData.owner_payout_method === 'fawry' && 'Fawry Reference Number / Phone'}
                </Label>
                <Input
                  id="payout_details"
                  type="text"
                  value={formData.payout_details || ''}
                  onChange={(e) => updateField('payout_details', e.target.value)}
                  placeholder={
                    formData.owner_payout_method === 'instapay' 
                      ? 'Enter your Instapay phone number or IPA'
                      : formData.owner_payout_method === 'vodafone_cash'
                      ? 'Enter your Vodafone Cash number (e.g., 01xxxxxxxxx)'
                      : 'Enter your Fawry reference or phone number'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  This is where we'll send your payment. Make sure it's correct!
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Payment Flow</p>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      <li>• Seeker pays room price + insurance (5% platform fee deducted)</li>
                      <li>• When seeker confirms they got the room, you receive your payment</li>
                      <li>• Payment sent via your chosen method above</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
