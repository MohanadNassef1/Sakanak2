import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Country = {
  code: string;       // ISO-2, e.g. "EG"
  name: string;
  nameAr: string;
  dial: string;       // e.g. "+20"
  flag: string;       // emoji
  /** Local subscriber number length(s) WITHOUT country code, excluding any trunk-0 the user types */
  lengths: number[];
  /** If true, allow & strip a leading trunk "0" before validation (e.g. Egypt 01x...) */
  trunkZero?: boolean;
};

// Curated list — Egypt first, then common MENA + popular destinations
export const COUNTRIES: Country[] = [
  { code: 'EG', name: 'Egypt',          nameAr: 'مصر',           dial: '+20',  flag: '🇪🇬', lengths: [10], trunkZero: true },
  { code: 'SA', name: 'Saudi Arabia',   nameAr: 'السعودية',       dial: '+966', flag: '🇸🇦', lengths: [9],  trunkZero: true },
  { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات', dial: '+971', flag: '🇦🇪', lengths: [9],  trunkZero: true },
  { code: 'KW', name: 'Kuwait',         nameAr: 'الكويت',         dial: '+965', flag: '🇰🇼', lengths: [8] },
  { code: 'QA', name: 'Qatar',          nameAr: 'قطر',            dial: '+974', flag: '🇶🇦', lengths: [8] },
  { code: 'BH', name: 'Bahrain',        nameAr: 'البحرين',        dial: '+973', flag: '🇧🇭', lengths: [8] },
  { code: 'OM', name: 'Oman',           nameAr: 'عُمان',          dial: '+968', flag: '🇴🇲', lengths: [8] },
  { code: 'JO', name: 'Jordan',         nameAr: 'الأردن',         dial: '+962', flag: '🇯🇴', lengths: [9],  trunkZero: true },
  { code: 'LB', name: 'Lebanon',        nameAr: 'لبنان',          dial: '+961', flag: '🇱🇧', lengths: [7, 8] },
  { code: 'SY', name: 'Syria',          nameAr: 'سوريا',          dial: '+963', flag: '🇸🇾', lengths: [9],  trunkZero: true },
  { code: 'IQ', name: 'Iraq',           nameAr: 'العراق',         dial: '+964', flag: '🇮🇶', lengths: [10], trunkZero: true },
  { code: 'PS', name: 'Palestine',      nameAr: 'فلسطين',         dial: '+970', flag: '🇵🇸', lengths: [9],  trunkZero: true },
  { code: 'YE', name: 'Yemen',          nameAr: 'اليمن',          dial: '+967', flag: '🇾🇪', lengths: [9],  trunkZero: true },
  { code: 'SD', name: 'Sudan',          nameAr: 'السودان',        dial: '+249', flag: '🇸🇩', lengths: [9],  trunkZero: true },
  { code: 'LY', name: 'Libya',          nameAr: 'ليبيا',          dial: '+218', flag: '🇱🇾', lengths: [9],  trunkZero: true },
  { code: 'TN', name: 'Tunisia',        nameAr: 'تونس',           dial: '+216', flag: '🇹🇳', lengths: [8] },
  { code: 'DZ', name: 'Algeria',        nameAr: 'الجزائر',        dial: '+213', flag: '🇩🇿', lengths: [9],  trunkZero: true },
  { code: 'MA', name: 'Morocco',        nameAr: 'المغرب',         dial: '+212', flag: '🇲🇦', lengths: [9],  trunkZero: true },
  { code: 'TR', name: 'Turkey',         nameAr: 'تركيا',          dial: '+90',  flag: '🇹🇷', lengths: [10], trunkZero: true },
  { code: 'GB', name: 'United Kingdom', nameAr: 'بريطانيا',       dial: '+44',  flag: '🇬🇧', lengths: [10], trunkZero: true },
  { code: 'US', name: 'United States',  nameAr: 'الولايات المتحدة', dial: '+1',   flag: '🇺🇸', lengths: [10] },
  { code: 'CA', name: 'Canada',         nameAr: 'كندا',           dial: '+1',   flag: '🇨🇦', lengths: [10] },
  { code: 'DE', name: 'Germany',        nameAr: 'ألمانيا',        dial: '+49',  flag: '🇩🇪', lengths: [10, 11] },
  { code: 'FR', name: 'France',         nameAr: 'فرنسا',          dial: '+33',  flag: '🇫🇷', lengths: [9],  trunkZero: true },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Egypt

/** Strip trunk zero according to country rules and return digits-only local number */
function normalizeLocal(country: Country, raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (country.trunkZero && digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  // cap at max length for the country
  const maxLen = Math.max(...country.lengths);
  return digits.slice(0, maxLen);
}

/** Validate a local (no country code) number against country rules */
export function isValidLocal(country: Country, local: string): boolean {
  const digits = local.replace(/\D/g, '');
  return country.lengths.includes(digits.length);
}

/** Build E.164 from country + local digits */
export function toE164(country: Country, local: string): string {
  return `${country.dial}${local.replace(/\D/g, '')}`;
}

/** Try to parse an existing stored phone (E.164 or legacy local "01...") into country + local */
export function parsePhone(stored: string | null | undefined): { country: Country; local: string } {
  const s = (stored || '').trim();
  if (!s) return { country: DEFAULT_COUNTRY, local: '' };
  if (s.startsWith('+')) {
    // Find longest matching dial code
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    const match = sorted.find((c) => s.startsWith(c.dial));
    if (match) {
      return { country: match, local: s.slice(match.dial.length).replace(/\D/g, '') };
    }
  }
  // Legacy: assume Egyptian local format
  const digits = s.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return { country: DEFAULT_COUNTRY, local: digits.replace(/^0+/, '') };
  }
  return { country: DEFAULT_COUNTRY, local: digits };
}

interface PhoneInputProps {
  country: Country;
  onCountryChange: (c: Country) => void;
  /** Local digits only (no country code, no trunk zero) */
  local: string;
  onLocalChange: (digits: string) => void;
  isRTL?: boolean;
  language?: 'en' | 'ar';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  invalid?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  country,
  onCountryChange,
  local,
  onLocalChange,
  isRTL = false,
  language = 'en',
  placeholder,
  disabled = false,
  className,
  id,
  invalid = false,
}) => {
  const [open, setOpen] = useState(false);
  const ph = placeholder ?? (country.code === 'EG' ? '1xxxxxxxxx' : 'phone number');

  const filtered = useMemo(() => COUNTRIES, []);

  return (
    <div
      dir="ltr"
      className={cn(
        'flex items-stretch h-12 rounded-xl border-2 bg-background overflow-hidden transition-colors',
        invalid ? 'border-destructive' : 'border-border focus-within:border-primary',
        disabled && 'opacity-60',
        className,
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className="h-full px-3 gap-1.5 rounded-none border-0 border-r border-border hover:bg-secondary/60 focus:ring-0 focus-visible:ring-0"
            aria-label="Select country code"
          >
            <span className="text-xl leading-none">{country.flag}</span>
            <span className="text-sm font-medium tabular-nums">{country.dial}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder={language === 'ar' ? 'ابحث عن دولة...' : 'Search country...'} />
            <CommandList>
              <CommandEmpty>{language === 'ar' ? 'لا توجد نتائج' : 'No results'}</CommandEmpty>
              <CommandGroup>
                {filtered.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.nameAr} ${c.dial} ${c.code}`}
                    onSelect={() => {
                      onCountryChange(c);
                      // Re-normalize current digits for the new country (mostly for length cap)
                      onLocalChange(normalizeLocal(c, local));
                      setOpen(false);
                    }}
                    className="gap-2"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1 text-sm">{language === 'ar' ? c.nameAr : c.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.dial}</span>
                    {c.code === country.code && <Check className="w-4 h-4 text-primary" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder={ph}
        value={local}
        disabled={disabled}
        onChange={(e) => onLocalChange(normalizeLocal(country, e.target.value))}
        className="flex-1 h-full border-0 rounded-none focus-visible:ring-0 bg-transparent px-3 text-base tabular-nums"
      />
    </div>
  );
};

export default PhoneInput;
