import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

interface DateOfBirthPickerProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (val: string) => void;
  onMonthChange: (val: string) => void;
  onYearChange: (val: string) => void;
  error?: string;
  required?: boolean;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export function getAgeFromDob(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function dobToString(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function parseDob(dateStr: string | null | undefined): { day: string; month: string; year: string } {
  if (!dateStr) return { day: '', month: '', year: '' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(d.getDate()),
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
  };
}

const DateOfBirthPicker: React.FC<DateOfBirthPickerProps> = ({
  day, month, year,
  onDayChange, onMonthChange, onYearChange,
  error, required,
}) => {
  const { isRTL, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 80;
  const maxYear = currentYear - 16;

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = language === 'ar' ? MONTHS_AR : MONTHS_EN;

  return (
    <div className="space-y-2">
      <Label className="font-medium flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <Select value={day} onValueChange={onDayChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={isRTL ? 'يوم' : 'Day'} />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {days.map(d => (
              <SelectItem key={d} value={String(d)}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month */}
        <Select value={month} onValueChange={onMonthChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={isRTL ? 'شهر' : 'Month'} />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {months.map((m, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year */}
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue placeholder={isRTL ? 'سنة' : 'Year'} />
          </SelectTrigger>
          <SelectContent className="max-h-48">
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default DateOfBirthPicker;
