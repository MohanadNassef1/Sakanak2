// Shared location data for governorate -> area cascading dropdowns
// Used by both RoomFilters (search) and ListRoom (listing form)

export const locationData: Record<string, string[]> = {
  "Cairo": [
    "New Cairo - Tagamoa",
    "New Cairo - Rehab City",
    "New Cairo - Madinaty",
    "Nasr City",
    "Heliopolis (Masr El Gedida)",
    "Maadi & Degla",
    "Zamalek",
    "Garden City",
    "Downtown (Wust El Balad)",
    "Mokattam",
    "Sheraton",
    "Shorouk City",
    "Obour City",
    "New Administrative Capital",
  ],
  "Giza": [
    "Sheikh Zayed",
    "6th of October - Hosary & Districts",
    "6th of October - Hadayek October",
    "Dokki",
    "Mohandessin",
    "Agouza",
    "Haram",
    "Hadayek El Ahram",
  ],
  "Gharbia": [
    "Tanta - El Stad Area",
    "Tanta - Seberbay (University District)",
    "Tanta - Medical Campus",
    "Tanta - El Geish St.",
    "Tanta - El Bahr St.",
    "Tanta - El Mahata",
  ],
  "Alexandria": [
    "Smouha",
    "Gleem",
    "Loran",
    "Miami",
    "San Stefano",
    "Kafr Abdo",
  ],
};

// Arabic translations for governorate names
export const governorateTranslations: Record<string, string> = {
  "Cairo": "القاهرة",
  "Giza": "الجيزة",
  "Gharbia": "الغربية",
  "Alexandria": "الإسكندرية",
};

// Arabic translations for area names
export const areaTranslations: Record<string, string> = {
  // Cairo
  "New Cairo - Tagamoa": "القاهرة الجديدة - التجمع",
  "New Cairo - Rehab City": "القاهرة الجديدة - الرحاب",
  "New Cairo - Madinaty": "القاهرة الجديدة - مدينتي",
  "Nasr City": "مدينة نصر",
  "Heliopolis (Masr El Gedida)": "مصر الجديدة",
  "Maadi & Degla": "المعادي ودجلة",
  "Zamalek": "الزمالك",
  "Garden City": "جاردن سيتي",
  "Downtown (Wust El Balad)": "وسط البلد",
  "Mokattam": "المقطم",
  "Sheraton": "شيراتون",
  "Shorouk City": "الشروق",
  "Obour City": "مدينة العبور",
  "New Administrative Capital": "العاصمة الإدارية الجديدة",
  // Giza
  "Sheikh Zayed": "الشيخ زايد",
  "6th of October - Hosary & Districts": "٦ أكتوبر - الحصري والأحياء",
  "6th of October - Hadayek October": "٦ أكتوبر - حدائق أكتوبر",
  "Dokki": "الدقي",
  "Mohandessin": "المهندسين",
  "Agouza": "العجوزة",
  "Haram": "الهرم",
  "Hadayek El Ahram": "حدائق الأهرام",
  // Gharbia
  "Tanta - El Stad Area": "طنطا - منطقة الاستاد",
  "Tanta - Seberbay (University District)": "طنطا - سبرباي (الحي الجامعي)",
  "Tanta - Medical Campus": "طنطا - الحرم الطبي",
  "Tanta - El Geish St.": "طنطا - شارع الجيش",
  "Tanta - El Bahr St.": "طنطا - شارع البحر",
  "Tanta - El Mahata": "طنطا - المحطة",
  // Alexandria
  "Smouha": "سموحة",
  "Gleem": "جليم",
  "Loran": "لوران",
  "Miami": "ميامي",
  "San Stefano": "سان ستيفانو",
  "Kafr Abdo": "كفر عبده",
};

export const getGovernorateLabel = (governorate: string, isArabic: boolean): string => {
  if (isArabic && governorateTranslations[governorate]) {
    return governorateTranslations[governorate];
  }
  return governorate;
};

export const getAreaLabel = (area: string, isArabic: boolean): string => {
  if (isArabic && areaTranslations[area]) {
    return areaTranslations[area];
  }
  return area;
};

export const getGovernorates = (): string[] => Object.keys(locationData);

export const getAreasForGovernorate = (governorate: string): string[] => {
  return locationData[governorate] || [];
};
