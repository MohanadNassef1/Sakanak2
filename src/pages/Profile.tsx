import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
 import { useUserRooms, useSavedRooms, useDeleteRoom } from '@/hooks/useRooms';
import MainLayout from '@/components/MainLayout';
import RoomCard from '@/components/rooms/RoomCard';
import VerificationCard from '@/components/verification/VerificationCard';
import AvatarUploader from '@/components/profile/AvatarUploader';
 import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User, Home, Heart, Settings, Shield, CheckCircle, Clock, XCircle,
  Phone, Mail, MapPin, Briefcase, Globe, Cigarette, PawPrint, Plus, Lock
} from 'lucide-react';

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

const ProfileContent: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: userRooms, isLoading: roomsLoading } = useUserRooms(user?.id);
  const { data: savedRooms } = useSavedRooms(user?.id);
  const updateProfile = useUpdateProfile();
   const deleteRoom = useDeleteRoom();

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
  });

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
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: formData,
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
      <div className="min-h-screen bg-secondary/30 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar with Upload */}
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

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {profile.full_name}
                    </h1>
                    {getVerificationBadge()}
                    <Badge variant="outline">
                      {profile.gender === 'male' ? t('auth.male') : t('auth.female')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-muted-foreground text-sm mb-4">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {profile.phone}
                      </span>
                    )}
                    {profile.nationality && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        {profile.nationality}
                      </span>
                    )}
                    {profile.occupation && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {profile.occupation}
                      </span>
                    )}
                  </div>

                  {profile.about && (
                    <p className="text-muted-foreground">{profile.about}</p>
                  )}

                  {/* Lifestyle Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.is_smoker && (
                      <Badge variant="secondary" className="gap-1">
                        <Cigarette className="w-3 h-3" />
                        {t('profile.smoker')}
                      </Badge>
                    )}
                    {profile.has_pets && (
                      <Badge variant="secondary" className="gap-1">
                        <PawPrint className="w-3 h-3" />
                        {profile.pet_type || t('profile.hasPets')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  variant={isEditing ? 'outline' : 'default'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isEditing ? t('common.cancel') : t('profile.edit')}
                </Button>
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
                    <Label>{t('profile.occupation')}</Label>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    />
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
                      <Input
                        value={formData.pet_type}
                        onChange={(e) => setFormData({ ...formData, pet_type: e.target.value })}
                        placeholder={t('profile.petTypePlaceholder')}
                      />
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
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const Profile: React.FC = () => {
  return (
    <LanguageProvider>
      <ProfileContent />
    </LanguageProvider>
  );
};

export default Profile;
