import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRooms, useSavedRooms, useSaveRoom, useUnsaveRoom } from '@/hooks/useRooms';
import { RoomFilters as RoomFiltersType } from '@/types/room';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import RoomCard from '@/components/rooms/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BrowseRoomsContent: React.FC = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [filters, setFilters] = useState<RoomFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Get user's gender for filtering (only for logged-in users)
  const userGender = profile?.gender as 'male' | 'female' | undefined;

  // Pass userGender and isAuthenticated to useRooms
  // - Authenticated users query the rooms table (owner-restricted by RLS)
  // - Guests query public_rooms view (excludes sensitive payout info)
  const { data: rooms, isLoading: roomsLoading } = useRooms(filters, userGender, !!user);
  const { data: savedRooms } = useSavedRooms(user?.id);
  const saveRoom = useSaveRoom();
  const unsaveRoom = useUnsaveRoom();

  const isLoading = roomsLoading;
  const savedRoomIds = new Set(savedRooms?.map(r => r.id) || []);

  const filteredRooms = rooms?.filter(room => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      room.title.toLowerCase().includes(query) ||
      room.city.toLowerCase().includes(query) ||
      room.area?.toLowerCase().includes(query)
    );
  });

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
         description="Browse verified rooms for rent across Egypt. Find shared apartments in Cairo, student housing & furnished rooms. No brokers. غرف للإيجار، سكن مشترك في القاهرة."
         keywords="rooms for rent in Egypt, shared apartment Cairo, rent room without broker, شقق للإيجار, إيجار غرفة, سكن مشترك, شقة مفروشة, سكن في القاهرة"
         canonicalPath="/rooms"
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
              ) : filteredRooms && filteredRooms.length > 0 ? (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 md:mb-4">
                    {filteredRooms.length} {t('rooms.resultsFound')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {filteredRooms.map(room => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        isSaved={savedRoomIds.has(room.id)}
                        onSave={user ? () => handleSave(room.id) : undefined}
                        onUnsave={user ? () => handleUnsave(room.id) : undefined}
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
