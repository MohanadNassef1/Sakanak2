import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoomFilters as RoomFiltersType, RoomType } from '@/types/room';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X, Check, Sparkles, GraduationCap, Video } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { PERSONALITY_TAGS, getTagLabel } from '@/lib/personalityTags';
import { getGovernorates, getAreasForGovernorate, getGovernorateLabel, getAreaLabel } from '@/lib/locationData';

interface RoomFiltersProps {
  filters: RoomFiltersType;
  onFiltersChange: (filters: RoomFiltersType) => void;
  onClear: () => void;
}

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

  // IMPORTANT: Don't define this as an inline React component (e.g. <FilterContent />)
  // because the function identity changes on each render, causing a remount and losing
  // input focus on mobile (keyboard closes after every keystroke).
  const renderFilterContent = (isMobile = false) => (
    <div className="space-y-3">
      {/* Governorate */}
      <div className="space-y-1.5">
        <Label>{isRTL ? 'المحافظة' : 'Governorate'}</Label>
        <Select
          value={filters.city || 'all'}
          onValueChange={(value) => {
            onFiltersChange({ ...filters, city: value === 'all' ? undefined : value, area: undefined });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'كل المحافظات' : 'All Governorates'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'كل المحافظات' : 'All Governorates'}</SelectItem>
            {getGovernorates().map(gov => (
              <SelectItem key={gov} value={gov}>{getGovernorateLabel(gov, isRTL)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Area */}
      {filters.city && (
        <div className="space-y-1.5">
          <Label>{isRTL ? 'المنطقة' : 'Area'}</Label>
          <Select
            value={filters.area || 'all'}
            onValueChange={(value) => updateFilter('area', value === 'all' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={isRTL ? 'كل المناطق' : 'All Areas'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'كل المناطق' : 'All Areas'}</SelectItem>
              {getAreasForGovernorate(filters.city).map(area => (
                <SelectItem key={area} value={area}>{getAreaLabel(area, isRTL)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Budget Range */}
      <div className="space-y-1.5">
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

      {/* Availability */}
      <div className="space-y-1.5">
        <Label>{isRTL ? 'الحالة' : 'Availability'}</Label>
        <Select
          value={filters.availability || 'all'}
          onValueChange={(value) => updateFilter('availability', value === 'all' ? undefined : value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? 'الكل' : 'All'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="available">{isRTL ? 'متاح' : 'Available'}</SelectItem>
            <SelectItem value="has_viewings">{isRTL ? 'قيد التفاوض' : 'Pending'}</SelectItem>
            <SelectItem value="rented">{isRTL ? 'مؤجرة' : 'Rented'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Room Type */}
      <div className="space-y-1.5">
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

      {/* Vibes / Personality Tags */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            {isRTL ? 'الأجواء' : 'Vibes'}
          </Label>
          {filters.vibes && filters.vibes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => updateFilter('vibes', undefined)}
            >
              <X className="w-3 h-3 mr-1" />
              {isRTL ? 'مسح' : 'Clear'}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERSONALITY_TAGS.map(tag => {
            const isSelected = filters.vibes?.includes(tag.value);
            return (
              <Badge
                key={tag.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:bg-primary/80"
                onClick={() => {
                  const currentVibes = filters.vibes || [];
                  const newVibes = isSelected
                    ? currentVibes.filter(v => v !== tag.value)
                    : [...currentVibes, tag.value];
                  updateFilter('vibes', newVibes.length > 0 ? newVibes : undefined);
                }}
              >
                {isRTL ? tag.labelAr : tag.labelEn}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="students" className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            {isRTL ? 'طلاب فقط' : 'Students Only'}
          </Label>
          <Switch
            id="students"
            checked={filters.studentsOnly || false}
            onCheckedChange={(checked) => updateFilter('studentsOnly', checked || undefined)}
          />
        </div>
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
      <div className="hidden lg:block bg-card rounded-2xl p-4 border border-border sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
        <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          {t('rooms.filters.title')}
        </h3>
        {renderFilterContent(false)}
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
              {renderFilterContent(true)}
            </div>
            {/* Done Button */}
            <div className="pt-4 border-t border-border mt-4 shrink-0 pb-[env(safe-area-inset-bottom)]">
              <SheetClose asChild>
                <Button className="w-full gap-2" size="lg" onClick={handleDone}>
                  <Check className="w-5 h-5" />
                  {t('rooms.filters.done')}
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
