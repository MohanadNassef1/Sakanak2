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
  const { user } = useAuth();
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-10 h-10 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Find a Roommate</h1>
            </div>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Browse verified roommates with smart compatibility matching. 
              Find someone who shares your lifestyle preferences.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, occupation, or interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 h-14 text-lg rounded-full bg-background border-2"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                >
                  Search
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
                <h3 className="font-semibold mb-1">Sign in for better matches</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Sign in to see personalized compatibility scores based on your profile.
                </p>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-72 flex-shrink-0">
              <RoommateFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={clearFilters}
              />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    `${roommates?.length || 0} roommates found`
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
                  <p className="text-destructive">Failed to load roommates</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && roommates?.length === 0 && (
                <div className="text-center py-20">
                  <UserPlus className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No roommates found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your filters or check back later. 
                    New verified users are added regularly.
                  </p>
                  {Object.keys(filters).length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
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
