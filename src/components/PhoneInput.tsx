import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  parsePhoneNumberFromString,
  getExampleNumber,
  AsYouType,
  type CountryCode,
} from 'libphonenumber-js';
import examples from 'libphonenumber-js/examples.mobile.json';

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

// Curated list — Egypt first, then MENA + worldwide
export const COUNTRIES: Country[] = [
  { code: 'EG', name: 'Egypt',                nameAr: 'مصر',              dial: '+20',   flag: '🇪🇬', lengths: [10], trunkZero: true },
  // GCC + MENA
  { code: 'SA', name: 'Saudi Arabia',         nameAr: 'السعودية',          dial: '+966',  flag: '🇸🇦', lengths: [9],  trunkZero: true },
  { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات',          dial: '+971',  flag: '🇦🇪', lengths: [9],  trunkZero: true },
  { code: 'KW', name: 'Kuwait',               nameAr: 'الكويت',            dial: '+965',  flag: '🇰🇼', lengths: [8] },
  { code: 'QA', name: 'Qatar',                nameAr: 'قطر',               dial: '+974',  flag: '🇶🇦', lengths: [8] },
  { code: 'BH', name: 'Bahrain',              nameAr: 'البحرين',           dial: '+973',  flag: '🇧🇭', lengths: [8] },
  { code: 'OM', name: 'Oman',                 nameAr: 'عُمان',             dial: '+968',  flag: '🇴🇲', lengths: [8] },
  { code: 'JO', name: 'Jordan',               nameAr: 'الأردن',            dial: '+962',  flag: '🇯🇴', lengths: [9],  trunkZero: true },
  { code: 'LB', name: 'Lebanon',              nameAr: 'لبنان',             dial: '+961',  flag: '🇱🇧', lengths: [7, 8] },
  { code: 'SY', name: 'Syria',                nameAr: 'سوريا',             dial: '+963',  flag: '🇸🇾', lengths: [9],  trunkZero: true },
  { code: 'IQ', name: 'Iraq',                 nameAr: 'العراق',            dial: '+964',  flag: '🇮🇶', lengths: [10], trunkZero: true },
  { code: 'PS', name: 'Palestine',            nameAr: 'فلسطين',            dial: '+970',  flag: '🇵🇸', lengths: [9],  trunkZero: true },
  { code: 'YE', name: 'Yemen',                nameAr: 'اليمن',             dial: '+967',  flag: '🇾🇪', lengths: [9],  trunkZero: true },
  { code: 'SD', name: 'Sudan',                nameAr: 'السودان',           dial: '+249',  flag: '🇸🇩', lengths: [9],  trunkZero: true },
  { code: 'SS', name: 'South Sudan',          nameAr: 'جنوب السودان',      dial: '+211',  flag: '🇸🇸', lengths: [9] },
  { code: 'LY', name: 'Libya',                nameAr: 'ليبيا',             dial: '+218',  flag: '🇱🇾', lengths: [9],  trunkZero: true },
  { code: 'TN', name: 'Tunisia',              nameAr: 'تونس',              dial: '+216',  flag: '🇹🇳', lengths: [8] },
  { code: 'DZ', name: 'Algeria',              nameAr: 'الجزائر',           dial: '+213',  flag: '🇩🇿', lengths: [9],  trunkZero: true },
  { code: 'MA', name: 'Morocco',              nameAr: 'المغرب',            dial: '+212',  flag: '🇲🇦', lengths: [9],  trunkZero: true },
  { code: 'MR', name: 'Mauritania',           nameAr: 'موريتانيا',         dial: '+222',  flag: '🇲🇷', lengths: [8] },
  { code: 'SO', name: 'Somalia',              nameAr: 'الصومال',           dial: '+252',  flag: '🇸🇴', lengths: [7, 8, 9] },
  { code: 'DJ', name: 'Djibouti',             nameAr: 'جيبوتي',            dial: '+253',  flag: '🇩🇯', lengths: [8] },
  { code: 'KM', name: 'Comoros',              nameAr: 'جزر القمر',         dial: '+269',  flag: '🇰🇲', lengths: [7] },

  // Africa
  { code: 'NG', name: 'Nigeria',              nameAr: 'نيجيريا',           dial: '+234',  flag: '🇳🇬', lengths: [10], trunkZero: true },
  { code: 'KE', name: 'Kenya',                nameAr: 'كينيا',             dial: '+254',  flag: '🇰🇪', lengths: [9],  trunkZero: true },
  { code: 'ET', name: 'Ethiopia',             nameAr: 'إثيوبيا',           dial: '+251',  flag: '🇪🇹', lengths: [9],  trunkZero: true },
  { code: 'GH', name: 'Ghana',                nameAr: 'غانا',              dial: '+233',  flag: '🇬🇭', lengths: [9],  trunkZero: true },
  { code: 'ZA', name: 'South Africa',         nameAr: 'جنوب أفريقيا',      dial: '+27',   flag: '🇿🇦', lengths: [9],  trunkZero: true },
  { code: 'TZ', name: 'Tanzania',             nameAr: 'تنزانيا',           dial: '+255',  flag: '🇹🇿', lengths: [9],  trunkZero: true },
  { code: 'UG', name: 'Uganda',               nameAr: 'أوغندا',            dial: '+256',  flag: '🇺🇬', lengths: [9],  trunkZero: true },
  { code: 'RW', name: 'Rwanda',               nameAr: 'رواندا',            dial: '+250',  flag: '🇷🇼', lengths: [9] },
  { code: 'SN', name: 'Senegal',              nameAr: 'السنغال',           dial: '+221',  flag: '🇸🇳', lengths: [9] },
  { code: 'CI', name: "Côte d'Ivoire",        nameAr: 'ساحل العاج',        dial: '+225',  flag: '🇨🇮', lengths: [10] },
  { code: 'CM', name: 'Cameroon',             nameAr: 'الكاميرون',         dial: '+237',  flag: '🇨🇲', lengths: [9] },
  { code: 'AO', name: 'Angola',               nameAr: 'أنغولا',            dial: '+244',  flag: '🇦🇴', lengths: [9] },
  { code: 'ZM', name: 'Zambia',               nameAr: 'زامبيا',            dial: '+260',  flag: '🇿🇲', lengths: [9],  trunkZero: true },
  { code: 'ZW', name: 'Zimbabwe',             nameAr: 'زيمبابوي',          dial: '+263',  flag: '🇿🇼', lengths: [9],  trunkZero: true },

  // Europe
  { code: 'GB', name: 'United Kingdom',       nameAr: 'بريطانيا',          dial: '+44',   flag: '🇬🇧', lengths: [10], trunkZero: true },
  { code: 'IE', name: 'Ireland',              nameAr: 'أيرلندا',           dial: '+353',  flag: '🇮🇪', lengths: [9],  trunkZero: true },
  { code: 'DE', name: 'Germany',              nameAr: 'ألمانيا',           dial: '+49',   flag: '🇩🇪', lengths: [10, 11] },
  { code: 'FR', name: 'France',               nameAr: 'فرنسا',             dial: '+33',   flag: '🇫🇷', lengths: [9],  trunkZero: true },
  { code: 'IT', name: 'Italy',                nameAr: 'إيطاليا',           dial: '+39',   flag: '🇮🇹', lengths: [9, 10] },
  { code: 'ES', name: 'Spain',                nameAr: 'إسبانيا',           dial: '+34',   flag: '🇪🇸', lengths: [9] },
  { code: 'PT', name: 'Portugal',             nameAr: 'البرتغال',          dial: '+351',  flag: '🇵🇹', lengths: [9] },
  { code: 'NL', name: 'Netherlands',          nameAr: 'هولندا',            dial: '+31',   flag: '🇳🇱', lengths: [9],  trunkZero: true },
  { code: 'BE', name: 'Belgium',              nameAr: 'بلجيكا',            dial: '+32',   flag: '🇧🇪', lengths: [9],  trunkZero: true },
  { code: 'CH', name: 'Switzerland',          nameAr: 'سويسرا',            dial: '+41',   flag: '🇨🇭', lengths: [9],  trunkZero: true },
  { code: 'AT', name: 'Austria',              nameAr: 'النمسا',            dial: '+43',   flag: '🇦🇹', lengths: [10, 11] },
  { code: 'SE', name: 'Sweden',               nameAr: 'السويد',            dial: '+46',   flag: '🇸🇪', lengths: [9],  trunkZero: true },
  { code: 'NO', name: 'Norway',               nameAr: 'النرويج',           dial: '+47',   flag: '🇳🇴', lengths: [8] },
  { code: 'DK', name: 'Denmark',              nameAr: 'الدنمارك',          dial: '+45',   flag: '🇩🇰', lengths: [8] },
  { code: 'FI', name: 'Finland',              nameAr: 'فنلندا',            dial: '+358',  flag: '🇫🇮', lengths: [9],  trunkZero: true },
  { code: 'IS', name: 'Iceland',              nameAr: 'آيسلندا',           dial: '+354',  flag: '🇮🇸', lengths: [7] },
  { code: 'PL', name: 'Poland',               nameAr: 'بولندا',            dial: '+48',   flag: '🇵🇱', lengths: [9] },
  { code: 'CZ', name: 'Czech Republic',       nameAr: 'التشيك',            dial: '+420',  flag: '🇨🇿', lengths: [9] },
  { code: 'SK', name: 'Slovakia',             nameAr: 'سلوفاكيا',          dial: '+421',  flag: '🇸🇰', lengths: [9],  trunkZero: true },
  { code: 'HU', name: 'Hungary',              nameAr: 'المجر',             dial: '+36',   flag: '🇭🇺', lengths: [9],  trunkZero: true },
  { code: 'RO', name: 'Romania',              nameAr: 'رومانيا',           dial: '+40',   flag: '🇷🇴', lengths: [9],  trunkZero: true },
  { code: 'BG', name: 'Bulgaria',             nameAr: 'بلغاريا',           dial: '+359',  flag: '🇧🇬', lengths: [9],  trunkZero: true },
  { code: 'GR', name: 'Greece',               nameAr: 'اليونان',           dial: '+30',   flag: '🇬🇷', lengths: [10] },
  { code: 'CY', name: 'Cyprus',               nameAr: 'قبرص',              dial: '+357',  flag: '🇨🇾', lengths: [8] },
  { code: 'MT', name: 'Malta',                nameAr: 'مالطا',             dial: '+356',  flag: '🇲🇹', lengths: [8] },
  { code: 'HR', name: 'Croatia',              nameAr: 'كرواتيا',           dial: '+385',  flag: '🇭🇷', lengths: [8, 9],  trunkZero: true },
  { code: 'RS', name: 'Serbia',               nameAr: 'صربيا',             dial: '+381',  flag: '🇷🇸', lengths: [8, 9],  trunkZero: true },
  { code: 'SI', name: 'Slovenia',             nameAr: 'سلوفينيا',          dial: '+386',  flag: '🇸🇮', lengths: [8],  trunkZero: true },
  { code: 'BA', name: 'Bosnia & Herzegovina', nameAr: 'البوسنة',           dial: '+387',  flag: '🇧🇦', lengths: [8],  trunkZero: true },
  { code: 'AL', name: 'Albania',              nameAr: 'ألبانيا',           dial: '+355',  flag: '🇦🇱', lengths: [9],  trunkZero: true },
  { code: 'MK', name: 'North Macedonia',      nameAr: 'مقدونيا الشمالية',  dial: '+389',  flag: '🇲🇰', lengths: [8],  trunkZero: true },
  { code: 'UA', name: 'Ukraine',              nameAr: 'أوكرانيا',          dial: '+380',  flag: '🇺🇦', lengths: [9],  trunkZero: true },
  { code: 'RU', name: 'Russia',               nameAr: 'روسيا',             dial: '+7',    flag: '🇷🇺', lengths: [10] },
  { code: 'BY', name: 'Belarus',              nameAr: 'بيلاروسيا',         dial: '+375',  flag: '🇧🇾', lengths: [9] },
  { code: 'MD', name: 'Moldova',              nameAr: 'مولدوفا',           dial: '+373',  flag: '🇲🇩', lengths: [8] },
  { code: 'LT', name: 'Lithuania',            nameAr: 'ليتوانيا',          dial: '+370',  flag: '🇱🇹', lengths: [8] },
  { code: 'LV', name: 'Latvia',               nameAr: 'لاتفيا',            dial: '+371',  flag: '🇱🇻', lengths: [8] },
  { code: 'EE', name: 'Estonia',              nameAr: 'إستونيا',           dial: '+372',  flag: '🇪🇪', lengths: [7, 8] },

  // Americas
  { code: 'US', name: 'United States',        nameAr: 'الولايات المتحدة',  dial: '+1',    flag: '🇺🇸', lengths: [10] },
  { code: 'CA', name: 'Canada',               nameAr: 'كندا',              dial: '+1',    flag: '🇨🇦', lengths: [10] },
  { code: 'MX', name: 'Mexico',               nameAr: 'المكسيك',           dial: '+52',   flag: '🇲🇽', lengths: [10] },
  { code: 'BR', name: 'Brazil',               nameAr: 'البرازيل',          dial: '+55',   flag: '🇧🇷', lengths: [10, 11] },
  { code: 'AR', name: 'Argentina',            nameAr: 'الأرجنتين',         dial: '+54',   flag: '🇦🇷', lengths: [10] },
  { code: 'CL', name: 'Chile',                nameAr: 'تشيلي',             dial: '+56',   flag: '🇨🇱', lengths: [9] },
  { code: 'CO', name: 'Colombia',             nameAr: 'كولومبيا',          dial: '+57',   flag: '🇨🇴', lengths: [10] },
  { code: 'PE', name: 'Peru',                 nameAr: 'بيرو',              dial: '+51',   flag: '🇵🇪', lengths: [9] },
  { code: 'VE', name: 'Venezuela',            nameAr: 'فنزويلا',           dial: '+58',   flag: '🇻🇪', lengths: [10] },
  { code: 'UY', name: 'Uruguay',              nameAr: 'الأوروغواي',        dial: '+598',  flag: '🇺🇾', lengths: [8] },
  { code: 'PY', name: 'Paraguay',             nameAr: 'باراغواي',          dial: '+595',  flag: '🇵🇾', lengths: [9] },
  { code: 'BO', name: 'Bolivia',              nameAr: 'بوليفيا',           dial: '+591',  flag: '🇧🇴', lengths: [8] },
  { code: 'EC', name: 'Ecuador',              nameAr: 'الإكوادور',         dial: '+593',  flag: '🇪🇨', lengths: [9],  trunkZero: true },
  { code: 'CR', name: 'Costa Rica',           nameAr: 'كوستاريكا',         dial: '+506',  flag: '🇨🇷', lengths: [8] },
  { code: 'PA', name: 'Panama',               nameAr: 'بنما',              dial: '+507',  flag: '🇵🇦', lengths: [7, 8] },
  { code: 'DO', name: 'Dominican Republic',   nameAr: 'الدومينيكان',       dial: '+1',    flag: '🇩🇴', lengths: [10] },

  // Asia & Pacific
  { code: 'TR', name: 'Turkey',               nameAr: 'تركيا',             dial: '+90',   flag: '🇹🇷', lengths: [10], trunkZero: true },
  { code: 'IR', name: 'Iran',                 nameAr: 'إيران',             dial: '+98',   flag: '🇮🇷', lengths: [10], trunkZero: true },
  { code: 'IL', name: 'Israel',               nameAr: 'إسرائيل',           dial: '+972',  flag: '🇮🇱', lengths: [9],  trunkZero: true },
  { code: 'AF', name: 'Afghanistan',          nameAr: 'أفغانستان',         dial: '+93',   flag: '🇦🇫', lengths: [9],  trunkZero: true },
  { code: 'PK', name: 'Pakistan',             nameAr: 'باكستان',           dial: '+92',   flag: '🇵🇰', lengths: [10], trunkZero: true },
  { code: 'IN', name: 'India',                nameAr: 'الهند',             dial: '+91',   flag: '🇮🇳', lengths: [10] },
  { code: 'BD', name: 'Bangladesh',           nameAr: 'بنغلاديش',          dial: '+880',  flag: '🇧🇩', lengths: [10], trunkZero: true },
  { code: 'LK', name: 'Sri Lanka',            nameAr: 'سريلانكا',          dial: '+94',   flag: '🇱🇰', lengths: [9],  trunkZero: true },
  { code: 'NP', name: 'Nepal',                nameAr: 'نيبال',             dial: '+977',  flag: '🇳🇵', lengths: [10] },
  { code: 'MV', name: 'Maldives',             nameAr: 'المالديف',          dial: '+960',  flag: '🇲🇻', lengths: [7] },
  { code: 'CN', name: 'China',                nameAr: 'الصين',             dial: '+86',   flag: '🇨🇳', lengths: [11] },
  { code: 'HK', name: 'Hong Kong',            nameAr: 'هونغ كونغ',         dial: '+852',  flag: '🇭🇰', lengths: [8] },
  { code: 'TW', name: 'Taiwan',               nameAr: 'تايوان',            dial: '+886',  flag: '🇹🇼', lengths: [9],  trunkZero: true },
  { code: 'JP', name: 'Japan',                nameAr: 'اليابان',           dial: '+81',   flag: '🇯🇵', lengths: [10], trunkZero: true },
  { code: 'KR', name: 'South Korea',          nameAr: 'كوريا الجنوبية',    dial: '+82',   flag: '🇰🇷', lengths: [9, 10], trunkZero: true },
  { code: 'MN', name: 'Mongolia',             nameAr: 'منغوليا',           dial: '+976',  flag: '🇲🇳', lengths: [8] },
  { code: 'TH', name: 'Thailand',             nameAr: 'تايلاند',           dial: '+66',   flag: '🇹🇭', lengths: [9],  trunkZero: true },
  { code: 'VN', name: 'Vietnam',              nameAr: 'فيتنام',            dial: '+84',   flag: '🇻🇳', lengths: [9, 10], trunkZero: true },
  { code: 'PH', name: 'Philippines',          nameAr: 'الفلبين',           dial: '+63',   flag: '🇵🇭', lengths: [10], trunkZero: true },
  { code: 'ID', name: 'Indonesia',            nameAr: 'إندونيسيا',         dial: '+62',   flag: '🇮🇩', lengths: [9, 10, 11], trunkZero: true },
  { code: 'MY', name: 'Malaysia',             nameAr: 'ماليزيا',           dial: '+60',   flag: '🇲🇾', lengths: [9, 10], trunkZero: true },
  { code: 'SG', name: 'Singapore',            nameAr: 'سنغافورة',          dial: '+65',   flag: '🇸🇬', lengths: [8] },
  { code: 'BN', name: 'Brunei',               nameAr: 'بروناي',            dial: '+673',  flag: '🇧🇳', lengths: [7] },
  { code: 'KH', name: 'Cambodia',             nameAr: 'كمبوديا',           dial: '+855',  flag: '🇰🇭', lengths: [8, 9], trunkZero: true },
  { code: 'LA', name: 'Laos',                 nameAr: 'لاوس',              dial: '+856',  flag: '🇱🇦', lengths: [9, 10], trunkZero: true },
  { code: 'MM', name: 'Myanmar',              nameAr: 'ميانمار',           dial: '+95',   flag: '🇲🇲', lengths: [8, 9, 10], trunkZero: true },
  { code: 'AU', name: 'Australia',            nameAr: 'أستراليا',          dial: '+61',   flag: '🇦🇺', lengths: [9],  trunkZero: true },
  { code: 'NZ', name: 'New Zealand',          nameAr: 'نيوزيلندا',         dial: '+64',   flag: '🇳🇿', lengths: [8, 9, 10], trunkZero: true },

  // Caucasus / Central Asia
  { code: 'AZ', name: 'Azerbaijan',           nameAr: 'أذربيجان',          dial: '+994',  flag: '🇦🇿', lengths: [9] },
  { code: 'AM', name: 'Armenia',              nameAr: 'أرمينيا',           dial: '+374',  flag: '🇦🇲', lengths: [8] },
  { code: 'GE', name: 'Georgia',              nameAr: 'جورجيا',            dial: '+995',  flag: '🇬🇪', lengths: [9] },
  { code: 'KZ', name: 'Kazakhstan',           nameAr: 'كازاخستان',         dial: '+7',    flag: '🇰🇿', lengths: [10] },
  { code: 'UZ', name: 'Uzbekistan',           nameAr: 'أوزبكستان',         dial: '+998',  flag: '🇺🇿', lengths: [9] },
  { code: 'TM', name: 'Turkmenistan',         nameAr: 'تركمانستان',        dial: '+993',  flag: '🇹🇲', lengths: [8] },
  { code: 'KG', name: 'Kyrgyzstan',           nameAr: 'قيرغيزستان',        dial: '+996',  flag: '🇰🇬', lengths: [9] },
  { code: 'TJ', name: 'Tajikistan',           nameAr: 'طاجيكستان',         dial: '+992',  flag: '🇹🇯', lengths: [9] },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Egypt

/**
 * Reasonable hard cap for typing (E.164 max is 15 digits, minus the country dial).
 * Used only to prevent runaway input; real validation is done by libphonenumber.
 */
function maxLocalDigits(country: Country): number {
  const dialDigits = country.dial.replace(/\D/g, '').length;
  return Math.max(15 - dialDigits, 12);
}

/** Strip trunk zero according to country rules and return digits-only local number */
export function normalizeLocal(country: Country, raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (country.trunkZero && digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  return digits.slice(0, maxLocalDigits(country));
}

/** Validate a local (no country code) number using libphonenumber-js */
export function isValidLocal(country: Country, local: string): boolean {
  const digits = local.replace(/\D/g, '');
  if (!digits) return false;
  const pn = parsePhoneNumberFromString(`${country.dial}${digits}`, country.code as CountryCode);
  return !!pn && pn.isValid() && pn.country === (country.code as CountryCode);
}

/** Build E.164 from country + local digits, using libphonenumber when possible */
export function toE164(country: Country, local: string): string {
  const digits = local.replace(/\D/g, '');
  const pn = parsePhoneNumberFromString(`${country.dial}${digits}`, country.code as CountryCode);
  if (pn && pn.isValid()) return pn.number;
  return `${country.dial}${digits}`;
}

/** Format the local part as the user types, country-aware */
export function formatAsYouType(country: Country, local: string): string {
  const digits = local.replace(/\D/g, '');
  if (!digits) return '';
  return new AsYouType(country.code as CountryCode).input(`${country.dial}${digits}`)
    .replace(new RegExp(`^\\${country.dial}\\s?`), '')
    .trim();
}

/** Country-specific example local number (mobile) for placeholders */
export function getPlaceholderExample(country: Country): string {
  const ex = getExampleNumber(country.code as CountryCode, examples);
  return ex ? ex.nationalNumber.toString() : '';
}

/** Try to parse an existing stored phone (E.164 or legacy local) into country + local */
export function parsePhone(stored: string | null | undefined): { country: Country; local: string } {
  const s = (stored || '').trim();
  if (!s) return { country: DEFAULT_COUNTRY, local: '' };

  // Try libphonenumber first (handles E.164 and many national formats)
  const pn = parsePhoneNumberFromString(s, DEFAULT_COUNTRY.code as CountryCode);
  if (pn && pn.country) {
    const match = COUNTRIES.find((c) => c.code === pn.country);
    if (match) return { country: match, local: pn.nationalNumber.toString() };
  }

  // Fallback: longest dial-code prefix match for "+..." inputs
  if (s.startsWith('+')) {
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    const match = sorted.find((c) => s.startsWith(c.dial));
    if (match) return { country: match, local: s.slice(match.dial.length).replace(/\D/g, '') };
  }

  // Legacy: assume default-country local format
  const digits = s.replace(/\D/g, '');
  if (DEFAULT_COUNTRY.trunkZero && digits.startsWith('0')) {
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
  const ph = placeholder ?? (getPlaceholderExample(country) || (language === 'ar' ? 'رقم الهاتف' : 'phone number'));

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
