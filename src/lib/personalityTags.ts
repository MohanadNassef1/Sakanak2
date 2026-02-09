// Shared personality tags used across the platform for consistency
// Used in: RoomFilters (vibes filter), Profile page (personality tags), Room listings

export interface PersonalityTag {
  value: string;
  labelEn: string;
  labelAr: string;
}

export const PERSONALITY_TAGS: PersonalityTag[] = [
  { value: 'early_bird', labelEn: 'Early Bird', labelAr: 'صباحي' },
  { value: 'night_owl', labelEn: 'Night Owl', labelAr: 'سهران' },
  { value: 'quiet', labelEn: 'Quiet', labelAr: 'هادئ' },
  { value: 'social', labelEn: 'Social', labelAr: 'اجتماعي' },
  { value: 'studious', labelEn: 'Studious', labelAr: 'مجتهد' },
  { value: 'fitness_lover', labelEn: 'Fitness Lover', labelAr: 'رياضي' },
  { value: 'gamer', labelEn: 'Gamer', labelAr: 'جيمر' },
  { value: 'music_lover', labelEn: 'Music Lover', labelAr: 'محب للموسيقى' },
  { value: 'pet_lover', labelEn: 'Pet Lover', labelAr: 'محب للحيوانات' },
  { value: 'foodie', labelEn: 'Foodie', labelAr: 'محب للطعام' },
  { value: 'clean_freak', labelEn: 'Clean Freak', labelAr: 'نظيف جداً' },
  { value: 'chill', labelEn: 'Chill', labelAr: 'ريلاكس' },
  { value: 'workaholic', labelEn: 'Workaholic', labelAr: 'مدمن عمل' },
  { value: 'traveler', labelEn: 'Traveler', labelAr: 'مسافر' },
  { value: 'homebody', labelEn: 'Homebody', labelAr: 'بيتوتي' },
];

// Get translated label for a tag value
export const getTagLabel = (value: string, isArabic: boolean): string => {
  const tag = PERSONALITY_TAGS.find(t => t.value === value);
  if (tag) {
    return isArabic ? tag.labelAr : tag.labelEn;
  }
  // Fallback for legacy values - try to find by labelEn match
  const legacyTag = PERSONALITY_TAGS.find(t => t.labelEn === value);
  if (legacyTag) {
    return isArabic ? legacyTag.labelAr : legacyTag.labelEn;
  }
  return value;
};

// Get all tag values for filtering
export const getTagValues = (): string[] => PERSONALITY_TAGS.map(t => t.value);
