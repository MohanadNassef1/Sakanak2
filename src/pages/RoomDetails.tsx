import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoom } from "@/hooks/useRooms";
import { useRoomViewingCount, useUserConfirmedViewing } from "@/hooks/useViewings";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAreaLabel, getGovernorateLabel } from "@/lib/locationData";
import { useStartConversation } from "@/hooks/useConversations";
import { useProfile } from "@/hooks/useProfile";
import { getMatchPercentage } from "@/lib/matchScore";
import MainLayout from "@/components/MainLayout";
import SEOHead from "@/components/SEOHead";
import BookViewingDialog from "@/components/viewings/BookViewingDialog";
import ListingQA from "@/components/rooms/ListingQA";
import HostCard from "@/components/rooms/HostCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Info,
  Eye,
  Pencil,
  BedDouble,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { trackCustomEvent } from '@/lib/fbPixel';
import { VerifiedBadge } from '@/components/VerifiedBadge';

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
  const { user, loading: authLoading } = useAuth();
  const { t, isRTL } = useLanguage();
  const { data: room, isLoading, error } = useRoom(id || "");
  const { data: viewingCount } = useRoomViewingCount(id || "");
  const { data: confirmedViewing } = useUserConfirmedViewing(id || "");
  const startConversation = useStartConversation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookViewing, setShowBookViewing] = useState(false);
  const { data: viewerProfile } = useProfile(user?.id);

  const roomTypeLabels: Record<string, string> = {
    private_room: t("rooms.privateRoom"),
    shared_room: t("rooms.sharedRoom"),
    studio: t("rooms.studio"),
    apartment: t("rooms.apartment"),
  };

  // Generate localized display title from room type + area + city
  const getLocalizedTitle = (r: typeof room) => {
    if (!r) return '';
    const typeLabel = roomTypeLabels[r.room_type] || r.room_type;
    const areaLabel = r.area ? getAreaLabel(r.area, isRTL) : '';
    const cityLabel = r.city ? getGovernorateLabel(r.city, isRTL) : '';
    if (areaLabel && cityLabel) {
      return isRTL
        ? `${typeLabel} في ${areaLabel}، ${cityLabel}`
        : `${typeLabel} in ${areaLabel}, ${cityLabel}`;
    }
    return r.title;
  };

  const allowedGenderLabels: Record<string, { en: string; ar: string }> = {
    any: { en: "Anyone Welcome", ar: "الجميع مرحب بهم" },
    males_only: { en: "Males Only", ar: "ذكور فقط" },
    females_only: { en: "Females Only", ar: "إناث فقط" },
    families: { en: "Families Only", ar: "عائلات فقط" },
  };

  // Room details are publicly viewable — only actions (book viewing, contact) require auth

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
          <h1 className="text-2xl font-bold">{t("roomDetails.notFound")}</h1>
          <p className="text-muted-foreground">{t("roomDetails.notFoundDesc")}</p>
          <Button onClick={() => navigate("/rooms")}>
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("roomDetails.browseRooms")}
          </Button>
        </div>
      </MainLayout>
    );
  }

  const images = room.photos?.length
    ? room.photos
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop"];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isOwner = user?.id === room.owner_id;

  const handleContactOwner = async () => {
    if (!user) {
      toast.error(isRTL ? "يرجى تسجيل الدخول أولاً للتواصل مع المالك" : "Please login first to contact the owner");
      navigate("/auth");
      return;
    }
    try {
      const conv = await startConversation.mutateAsync({
        otherUserId: room.owner_id,
        roomId: room.id,
      });
      navigate(`/messages?conversation=${conv.id}`);
    } catch (error) {
      toast.error(t("roomDetails.messageFailed"));
    }
  };

  return (
    <MainLayout>
      <SEOHead
        title={`${room.title} - ${room.room_type === 'private_room' ? 'Private Room' : room.room_type === 'shared_room' ? 'Shared Room' : room.room_type === 'studio' ? 'Studio' : 'Apartment'} for Rent in ${room.city} | Sakanak`}
        description={`${room.title} in ${room.area ? room.area + ', ' : ''}${room.city}. ${room.price_per_month.toLocaleString()} EGP/month. ${room.description?.slice(0, 120) || 'Find verified rooms for rent in Egypt on Sakanak.'}`}
        keywords={`room for rent ${room.city}, ${room.area || ''}, إيجار غرفة ${room.city}, سكن مشترك, شقة مفروشة, ${room.room_type} ${room.city}, Sakanak`}
        canonicalPath={`/rooms/${room.id}`}
        ogImage={room.photos?.[0] || undefined}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: room.title,
            description: room.description?.slice(0, 200) || `Room for rent in ${room.city}`,
            image: room.photos?.[0] || undefined,
            url: `https://sakanakeg.com/rooms/${room.id}`,
            offers: {
              '@type': 'Offer',
              price: room.price_per_month,
              priceCurrency: 'EGP',
              availability: room.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
              areaServed: { '@type': 'City', name: room.city },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sakanakeg.com/' },
              { '@type': 'ListItem', position: 2, name: 'Rooms', item: 'https://sakanakeg.com/rooms' },
              { '@type': 'ListItem', position: 3, name: room.title, item: `https://sakanakeg.com/rooms/${room.id}` },
            ],
          },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* --- Beta Banner (Multi-language) --- */}
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-primary">{isRTL ? "نسخة تجريبية (Beta)" : "Beta Version"}</h3>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? "موقع Sakanak في مرحلة التشغيل التجريبي حالياً. جميع خدمات البحث والتواصل مجانية تماماً لفترة محدودة."
                : "Sakanak is currently in beta. All search and contact services are completely free for a limited time."}
            </p>
          </div>
        </div>
        {/* --- Beta Banner End --- */}

        {/* Back Button & Edit Button */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate("/rooms")}>
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {t("roomDetails.backToRooms")}
          </Button>
          {isOwner && (
            <Button onClick={() => navigate(`/edit-room/${room.id}`)}>
              <Pencil className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {isRTL ? "تعديل الإعلان" : "Edit Listing"}
            </Button>
          )}
        </div>

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
                          idx === currentImageIndex ? "bg-primary" : "bg-background/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {room.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">{t("roomDetails.featured")}</Badge>
                )}
                {room.owner?.verification_status === "verified" && (
                  <VerifiedBadge variant="solid" label={t("roomDetails.verifiedOwner")} />
                )}
            </div>
            </div>

            {/* Walkthrough Videos */}
            {((room as any).videos?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {isRTL ? 'فيديو الجولة' : 'Walkthrough Video'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(room as any).videos.map((videoUrl: string, idx: number) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border">
                      <video
                        src={videoUrl}
                        controls
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title & Location */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Home className="w-4 h-4" />
                <span>{roomTypeLabels[room.room_type]}</span>
                <span>•</span>
                <Badge 
                  variant="outline" 
                  className={
                    (room as any).allowed_gender === 'males_only' 
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                      : (room as any).allowed_gender === 'females_only'
                      ? "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800"
                      : (room as any).allowed_gender === 'families'
                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                      : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                  }
                >
                  <Users className="w-3 h-3 mr-1" />
                  {isRTL 
                    ? allowedGenderLabels[(room as any).allowed_gender || 'any']?.ar 
                    : allowedGenderLabels[(room as any).allowed_gender || 'any']?.en}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{getLocalizedTitle(room)}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {room.address && `${room.address}, `}
                  {room.area && `${getAreaLabel(room.area, isRTL)}, `}
                  {getGovernorateLabel(room.city, isRTL)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {room.price_per_month.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("roomDetails.perMonth")}</p>
                  {(room as any).price_negotiable && (
                    <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary text-xs">
                      {isRTL ? 'قابل للتفاوض' : 'Negotiable'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
              {room.total_bedrooms && room.total_bedrooms > 0 && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                      <BedDouble className="w-5 h-5" />
                      {room.total_bedrooms}
                    </div>
                    <p className="text-sm text-muted-foreground">{isRTL ? "غرف النوم" : "Bedrooms"}</p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Users className="w-5 h-5" />
                    {room.current_roommates}/{room.max_roommates}
                  </div>
                  <p className="text-sm text-muted-foreground">{t("roomDetails.roommates")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Calendar className="w-5 h-5" />
                    {room.min_stay_months || 1}+
                  </div>
                  <p className="text-sm text-muted-foreground">{t("roomDetails.minMonths")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h2 className="text-xl font-semibold mb-3">{t("roomDetails.aboutRoom")}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{room.description}</p>
              </div>
            )}

            <Separator />

            {/* Amenities - Boolean Fields */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("roomDetails.amenities")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* WiFi */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_wifi ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <Wifi className="w-4 h-4" />
                  <span>{isRTL ? "واي فاي" : "WiFi"}</span>
                  {room.has_wifi && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* AC */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_ac ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <Wind className="w-4 h-4" />
                  <span>{isRTL ? "تكييف" : "AC"}</span>
                  {room.has_ac && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Water Heater */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_water_heater ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "سخان مياه" : "Water Heater"}</span>
                  {room.has_water_heater && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Natural Gas */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_natural_gas ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "غاز طبيعي" : "Natural Gas"}</span>
                  {room.has_natural_gas && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Elevator */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_elevator ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "مصعد" : "Elevator"}</span>
                  {room.has_elevator && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Balcony */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_balcony ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "بلكونة" : "Balcony"}</span>
                  {room.has_balcony && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Doorman */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_doorman ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "بواب" : "Doorman"}</span>
                  {room.has_doorman && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
                {/* Private Bathroom */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${room.has_private_bathroom ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted/50 text-muted-foreground"}`}>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isRTL ? "حمام خاص" : "Private Bathroom"}</span>
                  {room.has_private_bathroom && <CheckCircle className="w-3 h-3 ml-auto" />}
                </div>
              </div>
              
              {/* Legacy amenities array (if any) */}
              {room.amenities && room.amenities.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {room.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      {amenityIcons[amenity.toLowerCase()] || <CheckCircle className="w-4 h-4 text-primary" />}
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("roomDetails.houseRules")}</h2>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${room.allows_smoking ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}
                >
                  <Cigarette className="w-4 h-4" />
                  <span>{room.allows_smoking ? t("roomDetails.smokingAllowed") : t("roomDetails.noSmoking")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${room.allows_pets ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}
                >
                  <PawPrint className="w-4 h-4" />
                  <span>{room.allows_pets ? t("roomDetails.petsAllowed") : t("roomDetails.noPets")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${room.allows_visits ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>{room.allows_visits ? (isRTL ? "الزيارات مسموحة" : "Visits Allowed") : (isRTL ? "الزيارات ممنوعة" : "No Visits")}</span>
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

            {/* Q&A Section */}
            <div id="qa" className="scroll-mt-20">
              <ListingQA roomId={room.id} ownerId={room.owner_id} listerType={room.lister_type as any} />
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Host Card with Landlord/Tenant Badge */}
              {room.owner && (() => {
                const lType = room.lister_type as 'landlord' | 'current_tenant' | 'landlord_and_tenant' | null;
                const showMatchScore = lType === 'current_tenant' || lType === 'landlord_and_tenant';
                const hostMatchScore = showMatchScore && viewerProfile && user?.id !== room.owner_id
                  ? getMatchPercentage(
                      { age: viewerProfile.age, occupation_status: viewerProfile.occupation_status, university: viewerProfile.university, personality_tags: viewerProfile.personality_tags, is_smoker: viewerProfile.is_smoker, has_pets: viewerProfile.has_pets, nationality: viewerProfile.nationality, looking_for: viewerProfile.looking_for },
                      { age: room.owner.age, occupation: (room.owner as any).occupation, university: (room.owner as any).university, is_verified: room.owner.verification_status === 'verified', avatar_url: room.owner.avatar_url, job_title: (room.owner as any).job_title, personality_tags: (room.owner as any).personality_tags, is_smoker: (room.owner as any).is_smoker, has_pets: (room.owner as any).has_pets, nationality: (room.owner as any).nationality, looking_for: (room.owner as any).looking_for }
                    )
                  : null;
                return (
                  <HostCard
                    host={{
                      full_name: room.owner.full_name,
                      avatar_url: room.owner.avatar_url,
                      verification_status: room.owner.verification_status,
                      age: room.owner.age,
                      occupation: (room.owner as any).occupation,
                      university: (room.owner as any).university,
                      personality_tags: (room.owner as any).personality_tags,
                      nationality: (room.owner as any).nationality,
                    }}
                    userId={room.owner_id}
                    listerType={lType}
                    matchScore={hostMatchScore}
                  />
                );
              })()}

              {/* Price Breakdown Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{isRTL ? "تفاصيل السعر" : "Price Breakdown"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{isRTL ? "الإيجار الشهري" : "Monthly Rent"}</span>
                    <span className="font-semibold text-lg">
                      {room.price_per_month.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                      {(room as any).price_negotiable && (
                        <span className="text-xs font-normal text-primary ml-1">({isRTL ? 'قابل للتفاوض' : 'Negotiable'})</span>
                      )}
                    </span>
                  </div>
                  
                  {room.deposit != null && room.deposit > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{isRTL ? "مقدم التأمين" : "Security Deposit"}</span>
                      <span className="font-medium">
                        {room.deposit.toLocaleString()} {isRTL ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  )}

                  {/* Bills Included */}
                  {room.bills_included && room.bills_included.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">{isRTL ? "الفواتير المشمولة" : "Bills Included"}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {room.bills_included.map((bill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                              {bill === 'electricity' && (isRTL ? "كهرباء" : "Electricity")}
                              {bill === 'water' && (isRTL ? "مياه" : "Water")}
                              {bill === 'gas' && (isRTL ? "غاز" : "Gas")}
                              {bill === 'internet' && (isRTL ? "إنترنت" : "Internet")}
                              {bill === 'maintenance' && (isRTL ? "صيانة" : "Maintenance")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Personality Tags - Now shown only in HostCard from user profile */}
                </CardContent>
              </Card>

              {/* Guest Sign-Up Banner */}
              {!user && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {isRTL ? "سجّل مجاناً لحجز معاينة" : "Sign up free to book a viewing"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? "أنشئ حسابك في ثوانٍ لحجز معاينة، التواصل مع المالك، وضمان حقوقك."
                        : "Create your account in seconds to book viewings, message the host, and stay protected."}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => {
                        trackCustomEvent('ClickSignUp', { source: 'room_details', room_id: room.id });
                        localStorage.setItem('sakanak_redirect_after_auth', `/rooms/${room.id}`);
                        navigate("/auth", { state: { from: `/rooms/${room.id}` } });
                      }}
                    >
                      {isRTL ? "سجّل الآن" : "Sign Up Now"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Booking Card */}
              {isOwner ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold mb-2">{t("roomDetails.yourListing")}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("roomDetails.cantReserveOwn")}</p>
                    <Button variant="outline" onClick={() => navigate("/profile")}>
                      {t("roomDetails.manageListing")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-primary/50 shadow-md">
                  <CardHeader className="bg-primary/5 pb-4">
                    <Badge className="w-fit mb-2 bg-primary text-white hover:bg-primary">
                      {isRTL ? "عرض لفترة محدودة" : "Limited Time Offer"}
                    </Badge>
                    <CardTitle className="text-lg text-primary">
                      {isRTL 
                        ? (room.room_type === 'shared_room' ? 'احجز هذا السرير مجاناً'
                          : room.room_type === 'apartment' ? 'احجز هذه الشقة مجاناً'
                          : room.room_type === 'studio' ? 'احجز هذا الاستوديو مجاناً'
                          : 'احجز هذه الغرفة مجاناً')
                        : (room.room_type === 'shared_room' ? 'Book This Bed For Free'
                          : room.room_type === 'apartment' ? 'Book This Apartment For Free'
                          : room.room_type === 'studio' ? 'Book This Studio For Free'
                          : 'Book This Room For Free')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground text-sm">
                        {isRTL
                          ? "بمناسبة الافتتاح التجريبي لـ Sakanak، تم إلغاء عمولة الموقع ورسوم الحجز بالكامل."
                          : "To celebrate Sakanak's beta launch, all platform fees and booking charges have been waived."}
                      </p>
                      <p className="text-sm font-medium">
                        {isRTL
                          ? "يمكنك التواصل مع المالك مباشرة والاتفاق معه."
                          : "You can contact the owner directly and arrange the details."}
                      </p>
                    </div>

                    {/* Viewing count indicator */}
                    {(viewingCount ?? 0) > 0 && (
                      <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 rounded-lg">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {isRTL
                            ? `${viewingCount} ${viewingCount === 1 ? 'شخص حجز معاينة' : 'أشخاص حجزوا معاينة'}`
                            : `${viewingCount} ${viewingCount === 1 ? 'person booked a viewing' : 'people booked a viewing'}`}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 space-y-3">
                      {confirmedViewing?.hasConfirmed ? (
                        <Button 
                          className="w-full font-bold text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all"
                          variant="default"
                          size="lg"
                          onClick={() => navigate('/chats')}
                        >
                          <MessageCircle className={`h-6 w-6 ${isRTL ? "ml-2" : "mr-2"}`} />
                          {isRTL ? "افتح المحادثة" : "Open Chat"}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button 
                            className="w-full font-bold text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 animate-pulse hover:animate-none transition-all"
                            variant="default"
                            size="lg"
                            onClick={() => {
                              trackCustomEvent('ClickBookViewing', { room_id: room.id, room_type: room.room_type, city: room.city });
                              if (!user) {
                                localStorage.setItem('sakanak_redirect_after_auth', `/rooms/${room.id}`);
                                toast.info(isRTL ? "يرجى تسجيل الدخول أولاً لحجز معاينة" : "Please sign in first to book a viewing");
                                navigate("/auth", { state: { from: `/rooms/${room.id}` } });
                                return;
                              }
                              setShowBookViewing(true);
                            }}
                          >
                            <Eye className={`h-6 w-6 ${isRTL ? "ml-2" : "mr-2"}`} />
                            {isRTL 
                              ? (room.room_type === 'shared_room' ? 'احجز معاينة السرير الآن' 
                                : room.room_type === 'apartment' ? 'احجز معاينة الشقة الآن'
                                : room.room_type === 'studio' ? 'احجز معاينة الاستوديو الآن'
                                : 'احجز معاينة الغرفة الآن')
                              : (room.room_type === 'shared_room' ? 'Book This Bed Now' 
                                : room.room_type === 'apartment' ? 'Book This Apartment Now'
                                : room.room_type === 'studio' ? 'Book This Studio Now'
                                : 'Book This Room Now')}
                          </Button>
                          
                          <p className="text-xs text-center text-muted-foreground mt-3">
                            {isRTL
                              ? "لا تقم بتحويل أي أموال قبل معاينة الشقة على أرض الواقع."
                              : "Do not transfer any money before viewing the apartment in person."}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Book Viewing Dialog */}
      {room && !isOwner && (
        <BookViewingDialog
          roomId={room.id}
          landlordId={room.owner_id}
          roomTitle={room.title}
          open={showBookViewing}
          onOpenChange={setShowBookViewing}
        />
      )}
    </MainLayout>
  );
};

export default RoomDetails;
