// Browse Roommates page with smart matching
import SEOHead from '@/components/SEOHead';
import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoommates } from '@/hooks/useRoommates';
import { RoommateFilters as RoommateFiltersType } from '@/types/roommate';
import MainLayout from '@/components/MainLayout';
import RoommateCard from '@/components/roommates/RoommateCard';
import RoommateFilters from '@/components/roommates/RoommateFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Search, UserPlus, AlertTriangle, ArrowUpDown, Star, Clock, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BrowseRoommates: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RoommateFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match_score' | 'newest' | 'name'>('match_score');
  
  // IMPORTANT: All hooks must be called before any conditional returns
  const { data: roommates, isLoading, error } = useRoommates({
    ...filters,
    searchQuery: searchQuery || undefined,
  });

  const sortedRoommates = useMemo(() => {
    if (!roommates) return [];
    const list = [...roommates];
    if (sortBy === 'match_score') {
      return list.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    return list;
  }, [roommates, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Redirect unauthenticated users to auth page (after all hooks)
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
       <SEOHead
         title={t('roommates.seoTitle') !== 'roommates.seoTitle'
           ? t('roommates.seoTitle')
           : 'Find Roommates in Egypt | شريك سكن في مصر - Sakanak'}
          description="Sakanak – The first roommate finder in Egypt. Find verified, compatible roommates in Cairo, Giza, Sheikh Zayed, 6th October & across Egypt. Smart matching algorithm, zero commission. سكنك – أول موقع للبحث عن شريك سكن في مصر."
           keywords="roommate finder, roommate finder Egypt, roommate finder Cairo, find a roommate, roommate search, roommate matching, best roommate finder app, Sakanak, سكنك, sknk, saknk, سكن في مصر, سكن في القاهرة, سكن في الجيزة, سكن في الشيخ زايد, سكن في اكتوبر, find roommate Egypt, roommate Cairo, شريك سكن, شريك سكن في القاهرة, البحث عن شريك سكن, مشاركة شقة, flat share Egypt, compatible roommate, سكن طلاب, سكن شباب, سكنك مصر"
         canonicalPath="/roommates"
         jsonLd={[
           {
             '@context': 'https://schema.org',
             '@type': 'BreadcrumbList',
             itemListElement: [
               { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sakanakeg.com/' },
               { '@type': 'ListItem', position: 2, name: 'Find Roommates', item: 'https://sakanakeg.com/roommates' },
             ],
           },
           {
             '@context': 'https://schema.org',
             '@type': 'CollectionPage',
             name: 'Find Roommates in Egypt',
             description: 'Browse verified roommates across Egypt with smart compatibility matching.',
             url: 'https://sakanakeg.com/roommates',
           },
         ]}
       />
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
              {/* Results count & Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <p className="text-muted-foreground">
                  {isLoading ? (
                    t('common.loading')
                  ) : (
                    `${sortedRoommates.length || 0} ${t('roommates.resultsFound')}`
                  )}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {isRTL ? 'ترتيب:' : 'Sort:'}
                  </span>
                  <Button
                    variant={sortBy === 'match_score' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => setSortBy('match_score')}
                  >
                    <Star className="w-3 h-3" />
                    {isRTL ? 'نسبة التوافق' : 'Match Score'}
                  </Button>
                  <Button
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => setSortBy('newest')}
                  >
                    <Clock className="w-3 h-3" />
                    {isRTL ? 'الأحدث' : 'Newest'}
                  </Button>
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => setSortBy('name')}
                  >
                    <SortAsc className="w-3 h-3" />
                    {isRTL ? 'الاسم' : 'Name'}
                  </Button>
                </div>
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
              {!isLoading && !error && sortedRoommates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedRoommates.map((roommate) => (
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
