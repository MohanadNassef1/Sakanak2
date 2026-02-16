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
  "Alexandria": [
    "Smouha",
    "Gleem",
    "Loran",
    "Miami",
    "San Stefano",
    "Kafr Abdo",
    "Sidi Gaber",
    "Mandara",
    "Montazah",
    "Stanley",
    "Agami",
    "Borg El Arab",
  ],
  "Gharbia": [
    "Tanta - El Stad Area",
    "Tanta - Seberbay (University District)",
    "Tanta - Medical Campus",
    "Tanta - El Geish St.",
    "Tanta - El Bahr St.",
    "Tanta - El Mahata",
  ],
  "Dakahlia": [
    "Mansoura - University District",
    "Mansoura - Toreel",
    "Mansoura - El Mashaya",
    "Mansoura - Hay El Gameaa",
    "Mansoura - El Mokhtalat",
    "Mansoura - Sherbin Road",
  ],
  "Sharkia": [
    "Zagazig - University District",
    "Zagazig - El Qawmia",
    "Zagazig - El Azhary",
    "10th of Ramadan City",
  ],
  "Qalyubia": [
    "Shubra El Kheima",
    "Banha",
    "Qalyub",
  ],
  "Red Sea": [
    "Hurghada - Downtown",
    "Hurghada - El Dahar",
    "Hurghada - Sakkala",
    "Hurghada - El Kawther",
    "Hurghada - El Mamsha",
  ],
  "South Sinai": [
    "Sharm El Sheikh - Naama Bay",
    "Sharm El Sheikh - Hadaba",
    "Sharm El Sheikh - Nabq Bay",
    "Dahab",
  ],
  "Menoufia": [
    "Shebin El Kom",
    "Menouf",
    "Sadat City",
  ],
  "Port Said": [
    "Port Said - El Arab District",
    "Port Said - El Sharq District",
    "Port Said - El Manakh",
  ],
  "Suez": [
    "Suez - El Arbaeen",
    "Suez - Faisal District",
    "Suez - Ataka",
  ],
  "Ismailia": [
    "Ismailia - El Sheikh Zayed",
    "Ismailia - El Salam",
    "Ismailia - University District",
  ],
  "Fayoum": [
    "Fayoum City",
    "Fayoum - University District",
  ],
  "Luxor": [
    "Luxor - East Bank",
    "Luxor - West Bank",
  ],
  "Aswan": [
    "Aswan City Center",
  ],
  "Beni Suef": [
    "Beni Suef City",
    "Beni Suef - University District",
  ],
  "Minya": [
    "Minya City",
    "Minya - University District",
  ],
};

// Arabic translations for governorate names
export const governorateTranslations: Record<string, string> = {
  "Cairo": "القاهرة",
  "Giza": "الجيزة",
  "Alexandria": "الإسكندرية",
  "Gharbia": "الغربية",
  "Dakahlia": "الدقهلية",
  "Sharkia": "الشرقية",
  "Qalyubia": "القليوبية",
  "Red Sea": "البحر الأحمر",
  "South Sinai": "جنوب سيناء",
  "Menoufia": "المنوفية",
  "Port Said": "بورسعيد",
  "Suez": "السويس",
  "Ismailia": "الإسماعيلية",
  "Fayoum": "الفيوم",
  "Luxor": "الأقصر",
  "Aswan": "أسوان",
  "Beni Suef": "بني سويف",
  "Minya": "المنيا",
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
  // Alexandria
  "Smouha": "سموحة",
  "Gleem": "جليم",
  "Loran": "لوران",
  "Miami": "ميامي",
  "San Stefano": "سان ستيفانو",
  "Kafr Abdo": "كفر عبده",
  "Sidi Gaber": "سيدي جابر",
  "Mandara": "المندرة",
  "Montazah": "المنتزه",
  "Stanley": "ستانلي",
  "Agami": "العجمي",
  "Borg El Arab": "برج العرب",
  // Gharbia
  "Tanta - El Stad Area": "طنطا - منطقة الاستاد",
  "Tanta - Seberbay (University District)": "طنطا - سبرباي (الحي الجامعي)",
  "Tanta - Medical Campus": "طنطا - الحرم الطبي",
  "Tanta - El Geish St.": "طنطا - شارع الجيش",
  "Tanta - El Bahr St.": "طنطا - شارع البحر",
  "Tanta - El Mahata": "طنطا - المحطة",
  // Dakahlia
  "Mansoura - University District": "المنصورة - الحي الجامعي",
  "Mansoura - Toreel": "المنصورة - التوريل",
  "Mansoura - El Mashaya": "المنصورة - المشاية",
  "Mansoura - Hay El Gameaa": "المنصورة - حي الجامعة",
  "Mansoura - El Mokhtalat": "المنصورة - المختلط",
  "Mansoura - Sherbin Road": "المنصورة - طريق شربين",
  // Sharkia
  "Zagazig - University District": "الزقازيق - الحي الجامعي",
  "Zagazig - El Qawmia": "الزقازيق - القومية",
  "Zagazig - El Azhary": "الزقازيق - الأزهري",
  "10th of Ramadan City": "مدينة العاشر من رمضان",
  // Qalyubia
  "Shubra El Kheima": "شبرا الخيمة",
  "Banha": "بنها",
  "Qalyub": "قليوب",
  // Red Sea
  "Hurghada - Downtown": "الغردقة - وسط المدينة",
  "Hurghada - El Dahar": "الغردقة - الدهار",
  "Hurghada - Sakkala": "الغردقة - السقالة",
  "Hurghada - El Kawther": "الغردقة - الكوثر",
  "Hurghada - El Mamsha": "الغردقة - الممشى",
  // South Sinai
  "Sharm El Sheikh - Naama Bay": "شرم الشيخ - خليج نعمة",
  "Sharm El Sheikh - Hadaba": "شرم الشيخ - الهضبة",
  "Sharm El Sheikh - Nabq Bay": "شرم الشيخ - خليج نبق",
  "Dahab": "دهب",
  // Menoufia
  "Shebin El Kom": "شبين الكوم",
  "Menouf": "منوف",
  "Sadat City": "مدينة السادات",
  // Port Said
  "Port Said - El Arab District": "بورسعيد - حي العرب",
  "Port Said - El Sharq District": "بورسعيد - حي الشرق",
  "Port Said - El Manakh": "بورسعيد - المناخ",
  // Suez
  "Suez - El Arbaeen": "السويس - الأربعين",
  "Suez - Faisal District": "السويس - حي فيصل",
  "Suez - Ataka": "السويس - عتاقة",
  // Ismailia
  "Ismailia - El Sheikh Zayed": "الإسماعيلية - الشيخ زايد",
  "Ismailia - El Salam": "الإسماعيلية - السلام",
  "Ismailia - University District": "الإسماعيلية - الحي الجامعي",
  // Fayoum
  "Fayoum City": "مدينة الفيوم",
  "Fayoum - University District": "الفيوم - الحي الجامعي",
  // Luxor
  "Luxor - East Bank": "الأقصر - البر الشرقي",
  "Luxor - West Bank": "الأقصر - البر الغربي",
  // Aswan
  "Aswan City Center": "أسوان - وسط المدينة",
  // Beni Suef
  "Beni Suef City": "مدينة بني سويف",
  "Beni Suef - University District": "بني سويف - الحي الجامعي",
  // Minya
  "Minya City": "مدينة المنيا",
  "Minya - University District": "المنيا - الحي الجامعي",
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
