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
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import RoomCard from '@/components/rooms/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Home, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const filteredRooms = filterRooms(nonFeaturedRooms) || [];
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
         description="Browse verified rooms for rent across Egypt. Find shared apartments in Cairo, Giza, Alexandria. Student housing & furnished rooms. No brokers, no scams. غرف للإيجار، سكن مشترك، شقق مفروشة في مصر."
         keywords="rooms for rent Egypt, rooms for rent Cairo, shared apartment Cairo, rent room without broker, شقق للإيجار, إيجار غرفة, سكن مشترك, شقة مفروشة, سكن في القاهرة, غرف للايجار في الجيزة, سكن طلاب, rooms for rent Giza, rooms Alexandria"
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
       <div className="min-h-screen bg-secondary/30 pt-4 md:pt-8 pb-32">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              {t('rooms.browseTitle')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('rooms.browseSubtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4 md:mb-8 max-w-xl">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground`} />
            <Input
              type="text"
              placeholder={t('rooms.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'} sm:${isRTL ? 'pr-12' : 'pl-12'} h-10 sm:h-12 rounded-xl text-sm sm:text-base`}
            />
          </div>

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
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 md:mb-4">
                    {totalResults} {t('rooms.resultsFound')}
                  </p>

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
                              hasViewings={roomsWithViewings?.has(room.id as string)}
                              isFeatured={true}
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
                        hasViewings={roomsWithViewings?.has(room.id as string)}
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
