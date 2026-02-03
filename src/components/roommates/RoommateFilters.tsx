import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoommateFilters as RoommateFiltersType } from '@/types/roommate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface RoommateFiltersProps {
  filters: RoommateFiltersType;
  onFiltersChange: (filters: RoommateFiltersType) => void;
  onClear: () => void;
}

const RoommateFilters: React.FC<RoommateFiltersProps> = ({ filters, onFiltersChange, onClear }) => {
  const { t } = useLanguage();

  const updateFilter = <K extends keyof RoommateFiltersType>(key: K, value: RoommateFiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, about, or occupation..."
            value={filters.searchQuery || ''}
            onChange={(e) => updateFilter('searchQuery', e.target.value || undefined)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label>Occupation</Label>
        <Input
          placeholder="e.g., Student, Engineer..."
          value={filters.occupation || ''}
          onChange={(e) => updateFilter('occupation', e.target.value || undefined)}
        />
      </div>

      {/* Lifestyle Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="smoker">Smoker</Label>
          <Switch
            id="smoker"
            checked={filters.isSmoker || false}
            onCheckedChange={(checked) => updateFilter('isSmoker', checked || undefined)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="pets">Has Pets</Label>
          <Switch
            id="pets"
            checked={filters.hasPets || false}
            onCheckedChange={(checked) => updateFilter('hasPets', checked || undefined)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={onClear}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-card rounded-2xl p-6 border border-border sticky top-24">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </h3>
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="bg-primary-foreground text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default RoommateFilters;
