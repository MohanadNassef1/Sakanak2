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
  'شقق للايجار للشباب',
  'شقق مشاركة',
  'شريك سكن',
  'شريك سكن في القاهرة',
  'شريك سكن في الجيزة',
  'البحث عن شريك سكن',
  'مشاركة شقة',
  'غرفة في شقة',
  'سكن مشترك',
  'سكن طلاب',
  'سكن شباب',
  'سكن في القاهرة',
  'سكن في الجيزة',
  'غرفة للايجار في القاهرة',
  'غرفة للايجار في الجيزة',
  'سكنك',
  'إيجار بدون سمسار',
];

export const ENGLISH_KEYWORDS = [
  'roommate Egypt',
  'roommate Cairo',
  'find roommate Cairo',
  'rooms for rent Cairo',
  'rooms for rent Egypt',
  'shared apartment Cairo',
  'apartment share Egypt',
  'room for rent Cairo',
  'room for rent Giza',
  'student housing Cairo',
  'student housing Egypt',
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

export const LOCATION_PAGES: LocationPageConfig[] = [
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
];
