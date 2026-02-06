// City name translations for Arabic
const cityTranslations: Record<string, string> = {
  // Major Egyptian cities
  'Cairo': 'القاهرة',
  'Alexandria': 'الإسكندرية',
  'Giza': 'الجيزة',
  'Shubra El Kheima': 'شبرا الخيمة',
  'Port Said': 'بورسعيد',
  'Suez': 'السويس',
  'Luxor': 'الأقصر',
  'Mansoura': 'المنصورة',
  'El-Mahalla El-Kubra': 'المحلة الكبرى',
  'Tanta': 'طنطا',
  'Asyut': 'أسيوط',
  'Ismailia': 'الإسماعيلية',
  'Faiyum': 'الفيوم',
  'Zagazig': 'الزقازيق',
  'Aswan': 'أسوان',
  'Damietta': 'دمياط',
  'Damanhur': 'دمنهور',
  'Minya': 'المنيا',
  'Beni Suef': 'بني سويف',
  'Qena': 'قنا',
  'Sohag': 'سوهاج',
  'Hurghada': 'الغردقة',
  'Sharm El Sheikh': 'شرم الشيخ',
  '6th of October City': 'مدينة ٦ أكتوبر',
  '6th October': 'السادس من أكتوبر',
  '6 October': 'السادس من أكتوبر',
  'New Cairo': 'القاهرة الجديدة',
  'Sheikh Zayed': 'الشيخ زايد',
  '10th of Ramadan City': 'مدينة العاشر من رمضان',
  'Obour City': 'مدينة العبور',
  'Helwan': 'حلوان',
  'Nasr City': 'مدينة نصر',
  
  // Cairo neighborhoods/areas
  'Maadi': 'المعادي',
  'Zamalek': 'الزمالك',
  'Heliopolis': 'مصر الجديدة',
  'Mohandessin': 'المهندسين',
  'Dokki': 'الدقي',
  'Agouza': 'العجوزة',
  'Garden City': 'جاردن سيتي',
  'Downtown': 'وسط البلد',
  'Hadayek El-Maadi': 'حدائق المعادي',
  'Degla': 'دجلة',
  'Rehab City': 'مدينة الرحاب',
  'Madinet Nasr': 'مدينة نصر',
  'Abbassia': 'العباسية',
  'Shubra': 'شبرا',
  'Rod El Farag': 'روض الفرج',
  'Ain Shams': 'عين شمس',
  'El Marg': 'المرج',
  'El Matariya': 'المطرية',
  'El Zawya El Hamra': 'الزاوية الحمراء',
  'Boulaq': 'بولاق',
  'El Sahel': 'الساحل',
  'El Warraq': 'الوراق',
  'Imbaba': 'إمبابة',
  'Giza City': 'مدينة الجيزة',
  'Haram': 'الهرم',
  'Faisal': 'فيصل',
  'Pyramids': 'الأهرامات',
  'El Omraniya': 'العمرانية',
  'El Hawamdeya': 'الحوامدية',
  'El Badrashin': 'البدرشين',
  'El Ayat': 'العياط',
  
  // New cities and compounds
  'New Administrative Capital': 'العاصمة الإدارية الجديدة',
  'El Shorouk': 'الشروق',
  'Badr City': 'مدينة بدر',
  'New Heliopolis': 'هليوبوليس الجديدة',
  '5th Settlement': 'التجمع الخامس',
  'First Settlement': 'التجمع الأول',
  'El Tagamoa': 'التجمع',
  'Katameya': 'القطامية',
  'Palm Hills': 'بالم هيلز',
  'Madinaty': 'مدينتي',
  'Zayed': 'زايد',
  'Sodic': 'سوديك',
  'Beverly Hills': 'بيفرلي هيلز',
  
  // Alexandria areas
  'Smouha': 'سموحة',
  'Sidi Gaber': 'سيدي جابر',
  'Mandara': 'المندرة',
  'Miami': 'ميامي',
  'Montazah': 'المنتزه',
  'Stanley': 'ستانلي',
  'Gleem': 'جليم',
  'Cleopatra': 'كليوباترا',
  'El Raml': 'الرمل',
  'Moharam Bek': 'محرم بك',
  'El Saraya': 'السراية',
  'Agami': 'العجمي',
  'Borg El Arab': 'برج العرب',
};

/**
 * Get the Arabic translation of a city/area name
 * Returns the original name if no translation is found
 */
export const translateCity = (cityName: string, isArabic: boolean): string => {
  if (!isArabic || !cityName) return cityName;
  
  // Check for exact match
  if (cityTranslations[cityName]) {
    return cityTranslations[cityName];
  }
  
  // Check for case-insensitive match
  const lowerCity = cityName.toLowerCase();
  for (const [key, value] of Object.entries(cityTranslations)) {
    if (key.toLowerCase() === lowerCity) {
      return value;
    }
  }
  
  return cityName;
};

/**
 * Get the Arabic translations for city filter dropdown
 */
export const getCityOptions = (isArabic: boolean): Array<{ value: string; label: string }> => {
  const cities = [
    'Cairo',
    'Alexandria', 
    'Giza',
    '6th of October City',
    'New Cairo',
    'Sheikh Zayed',
    'Hurghada',
    'Sharm El Sheikh',
    'Mansoura',
    'Tanta',
    'Port Said',
    'Suez',
    'Ismailia',
    'Luxor',
    'Aswan',
  ];
  
  return cities.map(city => ({
    value: city,
    label: isArabic ? (cityTranslations[city] || city) : city,
  }));
};
