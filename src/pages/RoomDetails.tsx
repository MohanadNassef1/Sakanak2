import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStartConversation } from '@/hooks/useConversations';
import MainLayout from '@/components/MainLayout';
import ReservationForm from '@/components/reservations/ReservationForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  MapPin,
  Home,
  Users,
  Calendar,
  Cigarette,
  PawPrint,
  CheckCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
  Wifi,
  Car,
  Wind,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Refrigerator,
} from 'lucide-react';
import { toast } from 'sonner';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />,
  parking: <Car className="w-4 h-4" />,
  ac: <Wind className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />,
  kitchen: <UtensilsCrossed className="w-4 h-4" />,
  washer: <WashingMachine className="w-4 h-4" />,
  fridge: <Refrigerator className="w-4 h-4" />,
};

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const { data: room, isLoading, error } = useRoom(id || '');
  const startConversation = useStartConversation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const roomTypeLabels: Record<string, string> = {
    private_room: t('rooms.privateRoom'),
    shared_room: t('rooms.sharedRoom'),
    studio: t('rooms.studio'),
    apartment: t('rooms.apartment'),
  };

  const genderLabels: Record<string, string> = {
    male: 'Males Only',
    female: 'Females Only',
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

  if (error || !room) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Room Not Found</h1>
          <p className="text-muted-foreground">This room may no longer be available.</p>
          <Button onClick={() => navigate('/rooms')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Rooms
          </Button>
        </div>
      </MainLayout>
    );
  }

  const images = room.photos?.length ? room.photos : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isOwner = user?.id === room.owner_id;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/rooms')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
              <img
                src={images[currentImageIndex]}
                alt={`${room.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-primary' : 'bg-background/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {room.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
                {room.owner?.verification_status === 'verified' && (
                  <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Owner
                  </Badge>
                )}
              </div>
            </div>

            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Home className="w-4 h-4" />
                <span>{roomTypeLabels[room.room_type]}</span>
                <span>•</span>
                <span>{genderLabels[room.preferred_gender || 'any']}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{room.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {room.address && `${room.address}, `}
                  {room.area && `${room.area}, `}
                  {room.city}
                </span>
              </div>
            </div>

            <Separator />

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    EGP {room.price_per_month.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Users className="w-5 h-5" />
                    {room.current_roommates}/{room.max_roommates}
                  </div>
                  <p className="text-sm text-muted-foreground">roommates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Calendar className="w-5 h-5" />
                    {room.min_stay_months || 1}+
                  </div>
                  <p className="text-sm text-muted-foreground">min months</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Shield className="w-5 h-5" />
                    {room.insurance_amount ? `EGP ${room.insurance_amount.toLocaleString()}` : 'None'}
                  </div>
                  <p className="text-sm text-muted-foreground">deposit</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">About This Room</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {room.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      {amenityIcons[amenity.toLowerCase()] || <CheckCircle className="w-4 h-4 text-primary" />}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* House Rules */}
            <div>
              <h2 className="text-xl font-semibold mb-4">House Rules</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.allows_smoking ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                  <Cigarette className="w-4 h-4" />
                  <span>{room.allows_smoking ? 'Smoking allowed' : 'No smoking'}</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.allows_pets ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                  <PawPrint className="w-4 h-4" />
                  <span>{room.allows_pets ? 'Pets allowed' : 'No pets'}</span>
                </div>
              </div>
              {room.rules && room.rules.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {room.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator />

            {/* Owner Info */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Listed By</h2>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                  {room.owner?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{room.owner?.full_name || 'Unknown'}</h3>
                    {room.owner?.verification_status === 'verified' && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Room Owner</p>
                </div>
                {user && room.owner?.verification_status === 'verified' && !isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const conv = await startConversation.mutateAsync({
                          otherUserId: room.owner_id,
                          roomId: room.id,
                        });
                        navigate(`/messages?conversation=${conv.id}`);
                      } catch (error) {
                        toast.error('Failed to start conversation. Please verify your account.');
                      }
                    }}
                    disabled={startConversation.isPending}
                  >
                    {startConversation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {isOwner ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">This is your listing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You cannot reserve your own room.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/profile')}>
                      Manage Listing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <ReservationForm roomId={room.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RoomDetails;
