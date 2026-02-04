import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoomFilters as RoomFiltersType, RoomType } from '@/types/room';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface RoomFiltersProps {
  filters: RoomFiltersType;
  onFiltersChange: (filters: RoomFiltersType) => void;
  onClear: () => void;
}

const EGYPTIAN_CITIES = [
  'Cairo', 'Alexandria', 'Giza', 'Sharm El Sheikh', 'Hurghada',
  'Luxor', 'Aswan', 'Port Said', 'Suez', 'Mansoura',
  'Tanta', 'Ismailia', 'Faiyum', 'Zagazig', 'Damietta',
  '6th of October City', 'New Cairo', 'Maadi', 'Heliopolis', 'Nasr City'
];

const RoomFilters: React.FC<RoomFiltersProps> = ({ filters, onFiltersChange, onClear }) => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Local state for number inputs to prevent keyboard from closing
  const [localMinPrice, setLocalMinPrice] = useState<string>(filters.minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(filters.maxPrice?.toString() || '');

  // Sync local state when filters change externally
  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || '');
    setLocalMaxPrice(filters.maxPrice?.toString() || '');
  }, [filters.minPrice, filters.maxPrice]);

  const updateFilter = <K extends keyof RoomFiltersType>(key: K, value: RoomFiltersType[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Apply price filters on blur (when user finishes typing)
  const handleMinPriceBlur = () => {
    updateFilter('minPrice', localMinPrice ? Number(localMinPrice) : undefined);
  };

  const handleMaxPriceBlur = () => {
    updateFilter('maxPrice', localMaxPrice ? Number(localMaxPrice) : undefined);
  };

  const handleDone = () => {
    // Apply any pending price changes
    onFiltersChange({
      ...filters,
      minPrice: localMinPrice ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice ? Number(localMaxPrice) : undefined,
    });
  };

  const handleClear = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label>{t('rooms.filters.city')}</Label>
        <Select
          value={filters.city || 'all'}
          onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('rooms.filters.allCities')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('rooms.filters.allCities')}</SelectItem>
            {EGYPTIAN_CITIES.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range */}
      <div className="space-y-2">
        <Label>{t('rooms.filters.budget')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('rooms.filters.min')}
            value={isMobile ? localMinPrice : (filters.minPrice || '')}
            onChange={(e) => {
              if (isMobile) {
                setLocalMinPrice(e.target.value);
              } else {
                updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined);
              }
            }}
            onBlur={isMobile ? handleMinPriceBlur : undefined}
            className="flex-1"
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t('rooms.filters.max')}
            value={isMobile ? localMaxPrice : (filters.maxPrice || '')}
            onChange={(e) => {
              if (isMobile) {
                setLocalMaxPrice(e.target.value);
              } else {
                updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined);
              }
            }}
            onBlur={isMobile ? handleMaxPriceBlur : undefined}
            className="flex-1"
          />
        </div>
      </div>

      {/* Room Type */}
      <div className="space-y-2">
        <Label>{t('rooms.filters.roomType')}</Label>
        <Select
          value={filters.roomType || 'all'}
          onValueChange={(value) => updateFilter('roomType', value === 'all' ? undefined : value as RoomType)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('rooms.filters.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('rooms.filters.allTypes')}</SelectItem>
            <SelectItem value="private_room">{t('rooms.privateRoom')}</SelectItem>
            <SelectItem value="shared_room">{t('rooms.sharedRoom')}</SelectItem>
            <SelectItem value="studio">{t('rooms.studio')}</SelectItem>
            <SelectItem value="apartment">{t('rooms.apartment')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="smoking">{t('rooms.filters.allowsSmoking')}</Label>
          <Switch
            id="smoking"
            checked={filters.allowsSmoking || false}
            onCheckedChange={(checked) => updateFilter('allowsSmoking', checked || undefined)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="pets">{t('rooms.filters.allowsPets')}</Label>
          <Switch
            id="pets"
            checked={filters.allowsPets || false}
            onCheckedChange={(checked) => updateFilter('allowsPets', checked || undefined)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={handleClear}>
          <X className="w-4 h-4 mr-2" />
          {t('rooms.filters.clear')}
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
          {t('rooms.filters.title')}
        </h3>
        <FilterContent isMobile={false} />
      </div>

      {/* Mobile Filter Button */}
      <div
        className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-opacity ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              {t('rooms.filters.title')}
              {hasActiveFilters && (
                <span className="bg-primary-foreground text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                {t('rooms.filters.title')}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto flex-1 min-h-0">
              <FilterContent isMobile={true} />
            </div>
            {/* Done Button */}
            <div className="pt-4 border-t border-border mt-4 shrink-0 pb-[env(safe-area-inset-bottom)]">
              <SheetClose asChild>
                <Button className="w-full gap-2" size="lg" onClick={handleDone}>
                  <Check className="w-5 h-5" />
                  Done
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default RoomFilters;
