import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useRooms, useSavedRooms, useSaveRoom, useUnsaveRoom, useRoomsWithViewings } from '@/hooks/useRooms';
import { RoomFilters as RoomFiltersType } from '@/types/room';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getMatchPercentage } from '@/lib/matchScore';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import RoomCard from '@/components/rooms/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Home, Sparkles, Star, Clock, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RoomFinderChat from '@/components/rooms/RoomFinderChat';

const BrowseRoomsContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { isAdmin, isLoading: adminLoading } = useIsAdmin(user?.id);

  // Initialize filters from URL query params (e.g. ?city=Cairo)
  const initialCity = searchParams.get('city') || undefined;
  const [filters, setFilters] = useState<RoomFiltersType>(() => ({
    ...(initialCity ? { city: initialCity } : {}),
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match_score' | 'newest' | 'price_low'>('match_score');
  // Admins bypass gender filtering to see all rooms
  // Non-admins MUST have gender loaded before querying to prevent showing wrong gender rooms
  const userGender = isAdmin ? undefined : (profile?.gender as 'male' | 'female' | undefined);
  const isProfileReady = !user || isAdmin || !!userGender;
  const isAdminCheckReady = !user || !adminLoading;

  const { data: rooms, isLoading: roomsLoading } = useRooms(filters, userGender, !!user, isProfileReady && isAdminCheckReady);
  const { data: savedRooms } = useSavedRooms(user?.id);
  const { data: roomsWithViewings } = useRoomsWithViewings();
  const saveRoom = useSaveRoom();
  const unsaveRoom = useUnsaveRoom();

  // Fetch admin-selected featured room IDs from site_settings (same source as homepage)
  const { data: featuredRoomIds } = useQuery({
    queryKey: ['homepage-featured-rooms-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_featured_rooms')
        .single();
      if (error) return [];
      return (data?.value as string[]) || [];
    },
  });

  const isLoading = roomsLoading;
  const savedRoomIds = new Set(savedRooms?.map(r => r.id) || []);
  const featuredIdSet = useMemo(() => new Set(featuredRoomIds || []), [featuredRoomIds]);
  const featuredRooms = rooms?.filter(room => featuredIdSet.has(room.id) && room.status !== 'rented') || [];
  const nonFeaturedRooms = rooms?.filter(room => !featuredIdSet.has(room.id) || room.status === 'rented') || [];

  const filterRooms = (roomList: typeof rooms) => roomList?.filter(room => {
    if (filters.availability === 'has_viewings' && !roomsWithViewings?.all.has(room.id as string)) {
      return false;
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.title.toLowerCase().includes(query) ||
      room.city.toLowerCase().includes(query) ||
      room.area?.toLowerCase().includes(query)
    );
  });

  const filteredFeatured = filterRooms(featuredRooms) || [];
  const filteredRoomsRaw = filterRooms(nonFeaturedRooms) || [];

  // Sort rooms based on selected sort
  const getRoomScore = (room: any): number => {
    if (!profile) return 0;
    const viewerData = {
      age: profile.age,
      occupation_status: profile.occupation_status,
      university: profile.university,
      personality_tags: profile.personality_tags,
      is_smoker: profile.is_smoker,
      has_pets: profile.has_pets,
      nationality: profile.nationality,
      looking_for: profile.looking_for,
      interested_area_1: (profile as any).interested_area_1,
      interested_area_2: (profile as any).interested_area_2,
    };
    // Combine room location data with owner profile data for full matching
    const roomAsProfile: any = {
      area: room.area,
      city: room.city,
    };
    // If room has owner info (current_tenant or landlord_and_tenant), include roommate-level data
    if (room.owner && (room.lister_type === 'current_tenant' || room.lister_type === 'landlord_and_tenant')) {
      roomAsProfile.age = room.owner.age;
      roomAsProfile.university = room.owner.university;
      roomAsProfile.occupation = room.owner.occupation;
      roomAsProfile.personality_tags = room.owner.personality_tags;
      roomAsProfile.is_smoker = room.owner.is_smoker;
      roomAsProfile.has_pets = room.owner.has_pets;
      roomAsProfile.nationality = room.owner.nationality;
      roomAsProfile.avatar_url = room.owner.avatar_url;
      roomAsProfile.verification_status = room.owner.verification_status;
      roomAsProfile.looking_for = room.owner.looking_for;
    }
    return getMatchPercentage(viewerData, roomAsProfile);
  };

  const filteredRooms = useMemo(() => {
    const list = [...filteredRoomsRaw];
    if (sortBy === 'match_score') return list.sort((a, b) => getRoomScore(b) - getRoomScore(a));
    if (sortBy === 'newest') return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sortBy === 'price_low') return list.sort((a, b) => a.price_per_month - b.price_per_month);
    return list;
  }, [filteredRoomsRaw, sortBy, profile]);

  const totalResults = filteredFeatured.length + filteredRooms.length;

  const handleSave = (roomId: string) => {
    if (!user) return;
    saveRoom.mutate({ userId: user.id, roomId });
  };

  const handleUnsave = (roomId: string) => {
    if (!user) return;
    unsaveRoom.mutate({ userId: user.id, roomId });
  };

  return (
    <MainLayout>
       <SEOHead
         title="Browse Rooms for Rent in Egypt | شقق وغرف للإيجار - Sakanak"
          description="Sakanak (سكنك) – Browse verified rooms for rent across Egypt. Find shared apartments in Cairo, Giza, Sheikh Zayed, 6th October. سكن في مصر، سكن في القاهرة، سكن في الجيزة، سكن في الشيخ زايد واكتوبر. No brokers – بدون سمسار."
          keywords="Sakanak, سكنك, sknk, saknk, sakan, سكن, سكن في مصر, سكن في القاهرة, سكن في الجيزة, سكن في الشيخ زايد, سكن في اكتوبر, سكن فالقاهرة, سكن فالجيزة, سكن فالشيخ زايد, rooms for rent Egypt, rooms for rent Cairo, shared apartment Cairo, rent room without broker, شقق للإيجار, إيجار غرفة, سكن مشترك, شقة مفروشة, غرف للايجار في القاهرة, غرف للايجار في الجيزة, سكن طلاب, سكن شباب, rooms for rent Giza, rooms Alexandria, سكنك مصر"
         canonicalPath="/rooms"
         jsonLd={[
           {
             '@context': 'https://schema.org',
             '@type': 'BreadcrumbList',
             itemListElement: [
               { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sakanakeg.com/' },
               { '@type': 'ListItem', position: 2, name: 'Browse Rooms', item: 'https://sakanakeg.com/rooms' },
             ],
           },
           {
             '@context': 'https://schema.org',
             '@type': 'CollectionPage',
             name: 'Rooms for Rent in Egypt',
             description: 'Browse verified rooms for rent across Egypt. Shared apartments, student housing, furnished rooms.',
             url: 'https://sakanakeg.com/rooms',
           },
         ]}
       />
       <div className="min-h-screen bg-secondary/30 pb-32">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-orange-500/5 border-b border-border/50 pt-6 md:pt-10 pb-6 md:pb-8">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {t('rooms.browseTitle')}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('rooms.browseSubtitle')}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4 max-w-xl">
              <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground`} />
              <Input
                type="text"
                placeholder={t('rooms.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'} sm:${isRTL ? 'pr-12' : 'pl-12'} h-10 sm:h-12 rounded-xl text-sm sm:text-base bg-background shadow-sm border-border/80`}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 md:pt-6">

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sidebar Filters - Hidden on mobile, shown via Sheet */}
            <aside className="hidden lg:block w-80 shrink-0">
              <RoomFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={() => setFilters({})}
              />
            </aside>
            
            {/* Mobile Filter Component (Sheet trigger is inside) */}
            <div className="lg:hidden">
              <RoomFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={() => setFilters({})}
              />
            </div>

            {/* Room Grid */}
            <main className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[4/3] rounded-2xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : totalResults > 0 ? (
                <>
                   <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                     <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                       {totalResults} {t('rooms.resultsFound')}
                     </p>
                     <div className="flex gap-1 p-1 bg-muted/60 rounded-lg border border-border/50">
                       <button
                         onClick={() => setSortBy('match_score')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                           sortBy === 'match_score'
                             ? 'bg-primary text-primary-foreground shadow-sm'
                             : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                         }`}
                       >
                         <Star className="w-3.5 h-3.5" />
                         {isRTL ? 'التوافق' : 'Match'}
                       </button>
                       <button
                         onClick={() => setSortBy('newest')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                           sortBy === 'newest'
                             ? 'bg-primary text-primary-foreground shadow-sm'
                             : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                         }`}
                       >
                         <Clock className="w-3.5 h-3.5" />
                         {isRTL ? 'الأحدث' : 'Newest'}
                       </button>
                       <button
                         onClick={() => setSortBy('price_low')}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                           sortBy === 'price_low'
                             ? 'bg-primary text-primary-foreground shadow-sm'
                             : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                         }`}
                       >
                         <SortAsc className="w-3.5 h-3.5" />
                         {isRTL ? 'السعر' : 'Price'}
                       </button>
                     </div>
                   </div>

                  {/* Featured Rooms Section */}
                  {filteredFeatured.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">
                          {isRTL ? 'إعلانات مميزة' : 'Featured Listings'}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                         {filteredFeatured.map(room => (
                          <div key={room.id} className="relative rounded-2xl bg-gradient-to-br from-primary/60 via-primary/30 to-orange-400/40 p-[2px] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] animate-pulse-slow">
                            <RoomCard
                              room={room}
                              isSaved={savedRoomIds.has(room.id)}
                              onSave={user ? () => handleSave(room.id) : undefined}
                              onUnsave={user ? () => handleUnsave(room.id) : undefined}
                              hasViewings={roomsWithViewings?.all.has(room.id as string)}
                              hasConfirmedViewing={roomsWithViewings?.confirmed.has(room.id as string)}
                              isFeatured={true}
                              matchScore={profile ? getRoomScore(room) : undefined}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Rooms */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {filteredRooms.map(room => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        isSaved={savedRoomIds.has(room.id)}
                        onSave={user ? () => handleSave(room.id) : undefined}
                        onUnsave={user ? () => handleUnsave(room.id) : undefined}
                        hasViewings={roomsWithViewings?.all.has(room.id as string)}
                        hasConfirmedViewing={roomsWithViewings?.confirmed.has(room.id as string)}
                        matchScore={profile ? getRoomScore(room) : undefined}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Home className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('rooms.noResults')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('rooms.noResultsHint')}
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <RoomFinderChat />
    </MainLayout>
  );
};

const BrowseRooms: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowseRoomsContent />
    </LanguageProvider>
  );
};

export default BrowseRooms;
