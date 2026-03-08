/**
 * Centralized SEO data: keywords, structured data, and location page configs
 */

export const SITE_URL = 'https://sakanakeg.com';
export const SITE_NAME = 'Sakanak';
export const SITE_NAME_AR = 'سكنك';

// ─── Master keyword lists ────────────────────────────────────────
export const ARABIC_KEYWORDS = [
  'شقق للايجار',
  'غرف للايجار',
  'شقق للايجار في القاهرة',
  'شقق للايجار في الجيزة',
  'شقق للايجار في الاسكندرية',
  'شقق للايجار في المنصورة',
  'شقق للايجار للشباب',
  'شقق مشاركة',
  'شريك سكن',
  'شريك سكن في القاهرة',
  'شريك سكن في الجيزة',
  'شريك سكن في الاسكندرية',
  'البحث عن شريك سكن',
  'مشاركة شقة',
  'غرفة في شقة',
  'سكن مشترك',
  'سكن طلاب',
  'سكن شباب',
  'سكن في القاهرة',
  'سكن في الجيزة',
  'سكن في الاسكندرية',
  'سكن في المنصورة',
  'غرفة للايجار في القاهرة',
  'غرفة للايجار في الجيزة',
  'غرفة للايجار في الاسكندرية',
  'سكنك',
  'إيجار بدون سمسار',
];

export const ENGLISH_KEYWORDS = [
  'roommate Egypt',
  'roommate Cairo',
  'roommate Alexandria',
  'find roommate Cairo',
  'rooms for rent Cairo',
  'rooms for rent Egypt',
  'rooms for rent Alexandria',
  'rooms for rent Mansoura',
  'shared apartment Cairo',
  'apartment share Egypt',
  'room for rent Cairo',
  'room for rent Giza',
  'room for rent Alexandria',
  'student housing Cairo',
  'student housing Egypt',
  'student housing Alexandria',
  'flat share Cairo',
  'find roommate Egypt',
  'Sakanak',
  'rent room without broker',
  'furnished rooms Cairo',
  'accommodation Egypt',
];

export const ALL_KEYWORDS = [...ENGLISH_KEYWORDS, ...ARABIC_KEYWORDS].join(', ');

// ─── JSON-LD templates ───────────────────────────────────────────
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sakanak - سكنك',
    alternateName: ['Sakanak', 'سكنك', 'sakanakeg'],
    url: SITE_URL,
    description: 'Find rooms for rent, apartments to share, and trusted roommates in Cairo, Giza and across Egypt.',
    inLanguage: ['en', 'ar'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/rooms?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sakanak',
    alternateName: 'سكنك',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    sameAs: [
      'https://www.instagram.com/sakanakeg',
      'https://www.tiktok.com/@sakanakeg',
      'https://www.facebook.com/sakanakeg',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@sakanakeg.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Arabic'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Egypt',
    },
  };
}

export function getRentalListingSchema(city?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: city
      ? `Rooms for Rent in ${city} | غرف للايجار في ${city === 'Cairo' ? 'القاهرة' : 'الجيزة'}`
      : 'Browse Rooms for Rent in Egypt',
    description: city
      ? `Find verified rooms for rent and shared apartments in ${city}, Egypt. No brokers.`
      : 'Browse verified rooms for rent across Egypt. Find shared apartments, student housing & furnished rooms.',
    url: city ? `${SITE_URL}/rooms/${city.toLowerCase()}` : `${SITE_URL}/rooms`,
    isPartOf: { '@type': 'WebSite', url: SITE_URL },
    about: {
      '@type': 'Thing',
      name: 'Room Rental',
      description: 'Rental rooms, shared apartments, and student housing in Egypt',
    },
  };
}

// ─── Location SEO page configs ───────────────────────────────────
export interface LocationPageConfig {
  slug: string;
  cityEn: string;
  cityAr: string;
  type: 'rooms' | 'roommates' | 'students';
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  h1En: string;
  h1Ar: string;
  keywords: string;
}

// ─── Area data per city ──────────────────────────────────────────
export const CITY_AREAS: Record<string, { en: string[]; ar: string[] }> = {
  Cairo: {
    en: ['Nasr City', 'Heliopolis', 'Maadi', 'Dokki', 'Mohandessin', 'New Cairo', 'Zamalek', 'Downtown'],
    ar: ['مدينة نصر', 'مصر الجديدة', 'المعادي', 'الدقي', 'المهندسين', 'القاهرة الجديدة', 'الزمالك', 'وسط البلد'],
  },
  Giza: {
    en: ['6th of October', 'Sheikh Zayed', 'Faisal', 'Haram', 'Mohandessin', 'Dokki', 'Imbaba'],
    ar: ['أكتوبر', 'الشيخ زايد', 'فيصل', 'الهرم', 'المهندسين', 'الدقي', 'إمبابة'],
  },
  Alexandria: {
    en: ['Smouha', 'Sidi Bishr', 'Miami', 'Mandara', 'Gleem', 'Stanley', 'Sporting', 'Louran'],
    ar: ['سموحة', 'سيدي بشر', 'ميامي', 'المندرة', 'جليم', 'ستانلي', 'سبورتنج', 'لوران'],
  },
  Mansoura: {
    en: ['Toreel', 'Hay El Gameaa', 'El Mashaya', 'Downtown Mansoura', 'Sandoub'],
    ar: ['التوريل', 'حي الجامعة', 'المشاية', 'وسط المنصورة', 'صندوب'],
  },
  Tanta: {
    en: ['Hay Awal', 'Hay Thani', 'Downtown Tanta', 'Near Tanta University'],
    ar: ['الحي الأول', 'الحي الثاني', 'وسط طنطا', 'بالقرب من جامعة طنطا'],
  },
  Zagazig: {
    en: ['Hay El Gameaa', 'Downtown Zagazig', 'Ahya', 'Nakhas'],
    ar: ['حي الجامعة', 'وسط الزقازيق', 'أحياء', 'النخاس'],
  },
  Assiut: {
    en: ['Downtown Assiut', 'Hay El Gameaa', 'El Walideya', 'Nazlet Abdellah'],
    ar: ['وسط أسيوط', 'حي الجامعة', 'الوليدية', 'نزلة عبدالله'],
  },
  'Port Said': {
    en: ['El Arab', 'El Sharq', 'El Manakh', 'El Zohour'],
    ar: ['العرب', 'الشرق', 'المناخ', 'الزهور'],
  },
  Ismailia: {
    en: ['Hay Awal', 'Hay Thani', 'Hay Thaleth', 'El Sheikh Zayed'],
    ar: ['الحي الأول', 'الحي الثاني', 'الحي الثالث', 'الشيخ زايد'],
  },
  Suez: {
    en: ['El Arbaeen', 'Attaka', 'Faisal', 'El Ganayen'],
    ar: ['الأربعين', 'عتاقة', 'فيصل', 'الجناين'],
  },
};

export const LOCATION_PAGES: LocationPageConfig[] = [
  // ── Cairo ──
  {
    slug: 'rooms-cairo',
    cityEn: 'Cairo',
    cityAr: 'القاهرة',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Cairo | غرف للايجار في القاهرة - Sakanak',
    titleAr: 'غرف للايجار في القاهرة | Rooms for Rent in Cairo - سكنك',
    descriptionEn: 'Find verified rooms for rent in Cairo. Shared apartments, furnished rooms, and student housing in Nasr City, Heliopolis, Maadi, Dokki & more. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في القاهرة. شقق مشاركة، غرف مفروشة، وسكن طلاب في مدينة نصر، مصر الجديدة، المعادي، الدقي وغيرها. بدون سمسار.',
    h1En: 'Rooms for Rent in Cairo',
    h1Ar: 'غرف للايجار في القاهرة',
    keywords: 'rooms for rent Cairo, شقق للايجار في القاهرة, غرف للايجار في القاهرة, shared apartment Cairo, سكن في القاهرة, furnished rooms Cairo, student housing Cairo, سكن مشترك القاهرة',
  },
  {
    slug: 'roommates-cairo',
    cityEn: 'Cairo',
    cityAr: 'القاهرة',
    type: 'roommates',
    titleEn: 'Find Roommates in Cairo | شريك سكن في القاهرة - Sakanak',
    titleAr: 'شريك سكن في القاهرة | Find Roommates in Cairo - سكنك',
    descriptionEn: 'Find verified and trusted roommates in Cairo. Browse compatible people to share an apartment with in Nasr City, Maadi, Heliopolis & more areas.',
    descriptionAr: 'اعثر على شريك سكن موثق في القاهرة. تصفح الأشخاص المناسبين لمشاركة شقة في مدينة نصر، المعادي، مصر الجديدة وغيرها.',
    h1En: 'Find Roommates in Cairo',
    h1Ar: 'شريك سكن في القاهرة',
    keywords: 'roommate Cairo, شريك سكن في القاهرة, find roommate Cairo, البحث عن شريك سكن, مشاركة شقة في القاهرة, flat share Cairo',
  },
  {
    slug: 'student-housing-cairo',
    cityEn: 'Cairo',
    cityAr: 'القاهرة',
    type: 'students',
    titleEn: 'Student Housing in Cairo | سكن طلاب في القاهرة - Sakanak',
    titleAr: 'سكن طلاب في القاهرة | Student Housing in Cairo - سكنك',
    descriptionEn: 'Find affordable student housing in Cairo near AUC, Cairo University, Ain Shams & more. Verified rooms and trusted roommates for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في القاهرة بالقرب من الجامعة الأمريكية، جامعة القاهرة، عين شمس وغيرها. غرف موثقة وشركاء سكن موثوقين.',
    h1En: 'Student Housing in Cairo',
    h1Ar: 'سكن طلاب في القاهرة',
    keywords: 'student housing Cairo, سكن طلاب في القاهرة, student rooms Cairo, سكن جامعي القاهرة, AUC housing, Cairo University housing, student accommodation Egypt',
  },
  // ── Giza ──
  {
    slug: 'rooms-giza',
    cityEn: 'Giza',
    cityAr: 'الجيزة',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Giza | غرف للايجار في الجيزة - Sakanak',
    titleAr: 'غرف للايجار في الجيزة | Rooms for Rent in Giza - سكنك',
    descriptionEn: 'Find verified rooms for rent in Giza. Shared apartments and furnished rooms in 6th of October, Sheikh Zayed, Faisal, Haram & more. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في الجيزة. شقق مشاركة وغرف مفروشة في أكتوبر، الشيخ زايد، فيصل، الهرم وغيرها. بدون سمسار.',
    h1En: 'Rooms for Rent in Giza',
    h1Ar: 'غرف للايجار في الجيزة',
    keywords: 'rooms for rent Giza, شقق للايجار في الجيزة, غرف للايجار في الجيزة, shared apartment Giza, سكن في الجيزة, 6th October rooms, Sheikh Zayed rooms',
  },
  {
    slug: 'roommates-giza',
    cityEn: 'Giza',
    cityAr: 'الجيزة',
    type: 'roommates',
    titleEn: 'Find Roommates in Giza | شريك سكن في الجيزة - Sakanak',
    titleAr: 'شريك سكن في الجيزة | Find Roommates in Giza - سكنك',
    descriptionEn: 'Find verified roommates in Giza. Share apartments in 6th of October, Sheikh Zayed, Faisal & more. Trusted, no-broker roommate matching.',
    descriptionAr: 'اعثر على شريك سكن موثق في الجيزة. شارك شقة في أكتوبر، الشيخ زايد، فيصل وغيرها. بدون سمسار.',
    h1En: 'Find Roommates in Giza',
    h1Ar: 'شريك سكن في الجيزة',
    keywords: 'roommate Giza, شريك سكن في الجيزة, find roommate Giza, مشاركة شقة في الجيزة, flat share Giza',
  },
  // ── Alexandria ──
  {
    slug: 'rooms-alexandria',
    cityEn: 'Alexandria',
    cityAr: 'الاسكندرية',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Alexandria | غرف للايجار في الاسكندرية - Sakanak',
    titleAr: 'غرف للايجار في الاسكندرية | Rooms for Rent in Alexandria - سكنك',
    descriptionEn: 'Find verified rooms for rent in Alexandria. Shared apartments and furnished rooms in Smouha, Sidi Bishr, Miami, Gleem & more. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في الاسكندرية. شقق مشاركة وغرف مفروشة في سموحة، سيدي بشر، ميامي، جليم وغيرها. بدون سمسار.',
    h1En: 'Rooms for Rent in Alexandria',
    h1Ar: 'غرف للايجار في الاسكندرية',
    keywords: 'rooms for rent Alexandria, شقق للايجار في الاسكندرية, غرف للايجار في الاسكندرية, shared apartment Alexandria, سكن في الاسكندرية, furnished rooms Alexandria',
  },
  {
    slug: 'roommates-alexandria',
    cityEn: 'Alexandria',
    cityAr: 'الاسكندرية',
    type: 'roommates',
    titleEn: 'Find Roommates in Alexandria | شريك سكن في الاسكندرية - Sakanak',
    titleAr: 'شريك سكن في الاسكندرية | Find Roommates in Alexandria - سكنك',
    descriptionEn: 'Find verified roommates in Alexandria. Share apartments in Smouha, Sidi Bishr, Gleem & more. Trusted, no-broker roommate matching.',
    descriptionAr: 'اعثر على شريك سكن موثق في الاسكندرية. شارك شقة في سموحة، سيدي بشر، جليم وغيرها. بدون سمسار.',
    h1En: 'Find Roommates in Alexandria',
    h1Ar: 'شريك سكن في الاسكندرية',
    keywords: 'roommate Alexandria, شريك سكن في الاسكندرية, find roommate Alexandria, مشاركة شقة في الاسكندرية, flat share Alexandria',
  },
  {
    slug: 'student-housing-alexandria',
    cityEn: 'Alexandria',
    cityAr: 'الاسكندرية',
    type: 'students',
    titleEn: 'Student Housing in Alexandria | سكن طلاب في الاسكندرية - Sakanak',
    titleAr: 'سكن طلاب في الاسكندرية | Student Housing in Alexandria - سكنك',
    descriptionEn: 'Find affordable student housing in Alexandria near Alexandria University, Arab Academy & more. Verified rooms for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في الاسكندرية بالقرب من جامعة الاسكندرية، الأكاديمية العربية وغيرها. غرف موثقة للطلاب.',
    h1En: 'Student Housing in Alexandria',
    h1Ar: 'سكن طلاب في الاسكندرية',
    keywords: 'student housing Alexandria, سكن طلاب في الاسكندرية, student rooms Alexandria, سكن جامعي الاسكندرية, Alexandria University housing',
  },
  // ── Mansoura ──
  {
    slug: 'rooms-mansoura',
    cityEn: 'Mansoura',
    cityAr: 'المنصورة',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Mansoura | غرف للايجار في المنصورة - Sakanak',
    titleAr: 'غرف للايجار في المنصورة | Rooms for Rent in Mansoura - سكنك',
    descriptionEn: 'Find verified rooms for rent in Mansoura. Shared apartments near Mansoura University, Toreel, Hay El Gameaa & more. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في المنصورة. شقق مشاركة بالقرب من جامعة المنصورة، التوريل، حي الجامعة وغيرها. بدون سمسار.',
    h1En: 'Rooms for Rent in Mansoura',
    h1Ar: 'غرف للايجار في المنصورة',
    keywords: 'rooms for rent Mansoura, شقق للايجار في المنصورة, غرف للايجار في المنصورة, student housing Mansoura, سكن طلاب المنصورة, Mansoura University housing',
  },
  {
    slug: 'roommates-mansoura',
    cityEn: 'Mansoura',
    cityAr: 'المنصورة',
    type: 'roommates',
    titleEn: 'Find Roommates in Mansoura | شريك سكن في المنصورة - Sakanak',
    titleAr: 'شريك سكن في المنصورة | Find Roommates in Mansoura - سكنك',
    descriptionEn: 'Find verified roommates in Mansoura. Share apartments near Mansoura University and across the city. No-broker matching.',
    descriptionAr: 'اعثر على شريك سكن موثق في المنصورة. شارك شقة بالقرب من جامعة المنصورة وفي أنحاء المدينة. بدون سمسار.',
    h1En: 'Find Roommates in Mansoura',
    h1Ar: 'شريك سكن في المنصورة',
    keywords: 'roommate Mansoura, شريك سكن في المنصورة, find roommate Mansoura, مشاركة شقة في المنصورة',
  },
  {
    slug: 'student-housing-mansoura',
    cityEn: 'Mansoura',
    cityAr: 'المنصورة',
    type: 'students',
    titleEn: 'Student Housing in Mansoura | سكن طلاب في المنصورة - Sakanak',
    titleAr: 'سكن طلاب في المنصورة | Student Housing in Mansoura - سكنك',
    descriptionEn: 'Find affordable student housing in Mansoura near Mansoura University. Verified rooms and trusted roommates for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في المنصورة بالقرب من جامعة المنصورة. غرف موثقة وشركاء سكن موثوقين للطلاب.',
    h1En: 'Student Housing in Mansoura',
    h1Ar: 'سكن طلاب في المنصورة',
    keywords: 'student housing Mansoura, سكن طلاب في المنصورة, student rooms Mansoura, سكن جامعي المنصورة, Mansoura University housing',
  },
  // ── Tanta ──
  {
    slug: 'rooms-tanta',
    cityEn: 'Tanta',
    cityAr: 'طنطا',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Tanta | غرف للايجار في طنطا - Sakanak',
    titleAr: 'غرف للايجار في طنطا | Rooms for Rent in Tanta - سكنك',
    descriptionEn: 'Find verified rooms for rent in Tanta. Shared apartments near Tanta University & across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في طنطا. شقق مشاركة بالقرب من جامعة طنطا وفي أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Tanta',
    h1Ar: 'غرف للايجار في طنطا',
    keywords: 'rooms for rent Tanta, شقق للايجار في طنطا, غرف للايجار في طنطا, student housing Tanta, سكن طلاب طنطا',
  },
  {
    slug: 'student-housing-tanta',
    cityEn: 'Tanta',
    cityAr: 'طنطا',
    type: 'students',
    titleEn: 'Student Housing in Tanta | سكن طلاب في طنطا - Sakanak',
    titleAr: 'سكن طلاب في طنطا | Student Housing in Tanta - سكنك',
    descriptionEn: 'Find affordable student housing in Tanta near Tanta University. Verified rooms for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في طنطا بالقرب من جامعة طنطا. غرف موثقة للطلاب.',
    h1En: 'Student Housing in Tanta',
    h1Ar: 'سكن طلاب في طنطا',
    keywords: 'student housing Tanta, سكن طلاب في طنطا, Tanta University housing, سكن جامعي طنطا',
  },
  // ── Zagazig ──
  {
    slug: 'rooms-zagazig',
    cityEn: 'Zagazig',
    cityAr: 'الزقازيق',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Zagazig | غرف للايجار في الزقازيق - Sakanak',
    titleAr: 'غرف للايجار في الزقازيق | Rooms for Rent in Zagazig - سكنك',
    descriptionEn: 'Find verified rooms for rent in Zagazig. Shared apartments near Zagazig University & across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في الزقازيق. شقق مشاركة بالقرب من جامعة الزقازيق وفي أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Zagazig',
    h1Ar: 'غرف للايجار في الزقازيق',
    keywords: 'rooms for rent Zagazig, شقق للايجار في الزقازيق, غرف للايجار في الزقازيق, student housing Zagazig, سكن طلاب الزقازيق',
  },
  {
    slug: 'student-housing-zagazig',
    cityEn: 'Zagazig',
    cityAr: 'الزقازيق',
    type: 'students',
    titleEn: 'Student Housing in Zagazig | سكن طلاب في الزقازيق - Sakanak',
    titleAr: 'سكن طلاب في الزقازيق | Student Housing in Zagazig - سكنك',
    descriptionEn: 'Find affordable student housing in Zagazig near Zagazig University. Verified rooms for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في الزقازيق بالقرب من جامعة الزقازيق. غرف موثقة للطلاب.',
    h1En: 'Student Housing in Zagazig',
    h1Ar: 'سكن طلاب في الزقازيق',
    keywords: 'student housing Zagazig, سكن طلاب في الزقازيق, Zagazig University housing, سكن جامعي الزقازيق',
  },
  // ── Assiut ──
  {
    slug: 'rooms-assiut',
    cityEn: 'Assiut',
    cityAr: 'أسيوط',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Assiut | غرف للايجار في أسيوط - Sakanak',
    titleAr: 'غرف للايجار في أسيوط | Rooms for Rent in Assiut - سكنك',
    descriptionEn: 'Find verified rooms for rent in Assiut. Shared apartments near Assiut University & across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في أسيوط. شقق مشاركة بالقرب من جامعة أسيوط وفي أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Assiut',
    h1Ar: 'غرف للايجار في أسيوط',
    keywords: 'rooms for rent Assiut, شقق للايجار في أسيوط, غرف للايجار في أسيوط, student housing Assiut, سكن طلاب أسيوط',
  },
  {
    slug: 'student-housing-assiut',
    cityEn: 'Assiut',
    cityAr: 'أسيوط',
    type: 'students',
    titleEn: 'Student Housing in Assiut | سكن طلاب في أسيوط - Sakanak',
    titleAr: 'سكن طلاب في أسيوط | Student Housing in Assiut - سكنك',
    descriptionEn: 'Find affordable student housing in Assiut near Assiut University. Verified rooms for students.',
    descriptionAr: 'اعثر على سكن طلاب بأسعار معقولة في أسيوط بالقرب من جامعة أسيوط. غرف موثقة للطلاب.',
    h1En: 'Student Housing in Assiut',
    h1Ar: 'سكن طلاب في أسيوط',
    keywords: 'student housing Assiut, سكن طلاب في أسيوط, Assiut University housing, سكن جامعي أسيوط',
  },
  // ── Port Said ──
  {
    slug: 'rooms-port-said',
    cityEn: 'Port Said',
    cityAr: 'بورسعيد',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Port Said | غرف للايجار في بورسعيد - Sakanak',
    titleAr: 'غرف للايجار في بورسعيد | Rooms for Rent in Port Said - سكنك',
    descriptionEn: 'Find verified rooms for rent in Port Said. Shared apartments and furnished rooms across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في بورسعيد. شقق مشاركة وغرف مفروشة في أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Port Said',
    h1Ar: 'غرف للايجار في بورسعيد',
    keywords: 'rooms for rent Port Said, شقق للايجار في بورسعيد, غرف للايجار في بورسعيد, سكن في بورسعيد',
  },
  // ── Ismailia ──
  {
    slug: 'rooms-ismailia',
    cityEn: 'Ismailia',
    cityAr: 'الإسماعيلية',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Ismailia | غرف للايجار في الإسماعيلية - Sakanak',
    titleAr: 'غرف للايجار في الإسماعيلية | Rooms for Rent in Ismailia - سكنك',
    descriptionEn: 'Find verified rooms for rent in Ismailia. Shared apartments and furnished rooms near Suez Canal University & across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في الإسماعيلية. شقق مشاركة وغرف مفروشة بالقرب من جامعة قناة السويس وفي أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Ismailia',
    h1Ar: 'غرف للايجار في الإسماعيلية',
    keywords: 'rooms for rent Ismailia, شقق للايجار في الإسماعيلية, غرف للايجار في الإسماعيلية, سكن في الإسماعيلية, Suez Canal University housing',
  },
  // ── Suez ──
  {
    slug: 'rooms-suez',
    cityEn: 'Suez',
    cityAr: 'السويس',
    type: 'rooms',
    titleEn: 'Rooms for Rent in Suez | غرف للايجار في السويس - Sakanak',
    titleAr: 'غرف للايجار في السويس | Rooms for Rent in Suez - سكنك',
    descriptionEn: 'Find verified rooms for rent in Suez. Shared apartments and furnished rooms across the city. No brokers.',
    descriptionAr: 'اعثر على غرف للايجار في السويس. شقق مشاركة وغرف مفروشة في أنحاء المدينة. بدون سمسار.',
    h1En: 'Rooms for Rent in Suez',
    h1Ar: 'غرف للايجار في السويس',
    keywords: 'rooms for rent Suez, شقق للايجار في السويس, غرف للايجار في السويس, سكن في السويس',
  },
];
