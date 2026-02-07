// Browse Roommates page with smart matching
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoommates } from '@/hooks/useRoommates';
import { RoommateFilters as RoommateFiltersType } from '@/types/roommate';
import MainLayout from '@/components/MainLayout';
import RoommateCard from '@/components/roommates/RoommateCard';
import RoommateFilters from '@/components/roommates/RoommateFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, UserPlus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BrowseRoommates: React.FC = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RoommateFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: roommates, isLoading, error } = useRoommates({
    ...filters,
    searchQuery: searchQuery || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Redirect unauthenticated users to auth page
  if (!authLoading && !user) {
    navigate('/auth', { state: { from: '/roommates' } });
    return null;
  }

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
       <div className="min-h-screen bg-background pt-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-10 h-10 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">{t('roommates.title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              {t('roommates.subtitle')}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('roommates.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-14 text-lg rounded-full bg-background border-2"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  {t('nav.signIn').split(' ')[0] === 'Sign' ? 'Search' : 'بحث'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!user && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">{t('roommates.signInNotice')}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {t('roommates.signInDesc')}
                </p>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  {t('nav.signIn')}
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters Sidebar - Hidden on mobile, shown in Sheet instead */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <RoommateFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={clearFilters}
              />
            </aside>
            
            {/* Mobile Filters - Only visible on mobile */}
            <div className="lg:hidden">
              <RoommateFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={clearFilters}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1">
              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {isLoading ? (
                    t('common.loading')
                  ) : (
                    `${roommates?.length || 0} ${t('roommates.resultsFound')}`
                  )}
                </p>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-destructive">{t('roommates.noResults')}</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && roommates?.length === 0 && (
                <div className="text-center py-20">
                  <UserPlus className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('roommates.noResults')}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t('roommates.noResultsHint')}
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      {t('rooms.filters.clear')}
                    </Button>
                  )}
                </div>
              )}

              {/* Roommate Grid */}
              {!isLoading && !error && roommates && roommates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {roommates.map((roommate) => (
                    <RoommateCard key={roommate.id} roommate={roommate} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BrowseRoommates;
