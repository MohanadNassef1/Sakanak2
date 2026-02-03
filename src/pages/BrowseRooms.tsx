import React, { useState } from 'react';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms, useSavedRooms, useSaveRoom, useUnsaveRoom } from '@/hooks/useRooms';
import { RoomFilters as RoomFiltersType } from '@/types/room';
import MainLayout from '@/components/MainLayout';
import RoomCard from '@/components/rooms/RoomCard';
import RoomFilters from '@/components/rooms/RoomFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BrowseRoomsContent: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [filters, setFilters] = useState<RoomFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rooms, isLoading } = useRooms(filters);
  const { data: savedRooms } = useSavedRooms(user?.id);
  const saveRoom = useSaveRoom();
  const unsaveRoom = useUnsaveRoom();

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
      <div className="min-h-screen bg-secondary/30 pt-24 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {t('rooms.browseTitle')}
            </h1>
            <p className="text-muted-foreground">
              {t('rooms.browseSubtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-xl">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-muted-foreground`} />
            <Input
              type="text"
              placeholder={t('rooms.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 rounded-xl`}
            />
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-80 shrink-0">
              <RoomFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={() => setFilters({})}
              />
            </aside>

            {/* Room Grid */}
            <main className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredRooms.length} {t('rooms.resultsFound')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Mobile Filters */}
        <RoomFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClear={() => setFilters({})}
        />
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
