// Shared lists for occupation-related fields used at signup and profile editing.

export interface OptionItem {
  value: string;
  labelEn: string;
  labelAr: string;
}

export const UNIVERSITIES: OptionItem[] = [
  { value: 'cairo_university', labelEn: 'Cairo University', labelAr: 'جامعة القاهرة' },
  { value: 'ain_shams', labelEn: 'Ain Shams University', labelAr: 'جامعة عين شمس' },
  { value: 'alexandria', labelEn: 'Alexandria University', labelAr: 'جامعة الإسكندرية' },
  { value: 'auc', labelEn: 'American University in Cairo (AUC)', labelAr: 'الجامعة الأمريكية بالقاهرة' },
  { value: 'guc', labelEn: 'German University in Cairo (GUC)', labelAr: 'الجامعة الألمانية بالقاهرة' },
  { value: 'bue', labelEn: 'British University in Egypt (BUE)', labelAr: 'الجامعة البريطانية في مصر' },
  { value: 'msa', labelEn: 'MSA University', labelAr: 'جامعة أكتوبر للعلوم الحديثة' },
  { value: 'helwan', labelEn: 'Helwan University', labelAr: 'جامعة حلوان' },
  { value: 'mansoura', labelEn: 'Mansoura University', labelAr: 'جامعة المنصورة' },
  { value: 'tanta', labelEn: 'Tanta University', labelAr: 'جامعة طنطا' },
  { value: 'zagazig', labelEn: 'Zagazig University', labelAr: 'جامعة الزقازيق' },
  { value: 'assiut', labelEn: 'Assiut University', labelAr: 'جامعة أسيوط' },
  { value: 'azhar', labelEn: 'Al-Azhar University', labelAr: 'جامعة الأزهر' },
  { value: 'suez_canal', labelEn: 'Suez Canal University', labelAr: 'جامعة قناة السويس' },
  { value: 'nile', labelEn: 'Nile University', labelAr: 'جامعة النيل' },
  { value: 'future', labelEn: 'Future University', labelAr: 'جامعة المستقبل' },
  { value: 'aast', labelEn: 'Arab Academy for Science & Technology (AAST)', labelAr: 'الأكاديمية العربية للعلوم والتكنولوجيا' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export const FACULTIES: OptionItem[] = [
  { value: 'engineering', labelEn: 'Engineering', labelAr: 'هندسة' },
  { value: 'medicine', labelEn: 'Medicine', labelAr: 'طب بشري' },
  { value: 'pharmacy', labelEn: 'Pharmacy', labelAr: 'صيدلة' },
  { value: 'dentistry', labelEn: 'Dentistry', labelAr: 'طب أسنان' },
  { value: 'science', labelEn: 'Science', labelAr: 'علوم' },
  { value: 'computer_science', labelEn: 'Computer Science', labelAr: 'حاسبات ومعلومات' },
  { value: 'commerce', labelEn: 'Commerce / Business', labelAr: 'تجارة / إدارة أعمال' },
  { value: 'economics', labelEn: 'Economics & Political Science', labelAr: 'اقتصاد وعلوم سياسية' },
  { value: 'law', labelEn: 'Law', labelAr: 'حقوق' },
  { value: 'arts', labelEn: 'Arts / Humanities', labelAr: 'آداب' },
  { value: 'languages', labelEn: 'Languages (Al-Alsun)', labelAr: 'الألسن' },
  { value: 'mass_communication', labelEn: 'Mass Communication', labelAr: 'إعلام' },
  { value: 'education', labelEn: 'Education', labelAr: 'تربية' },
  { value: 'agriculture', labelEn: 'Agriculture', labelAr: 'زراعة' },
  { value: 'veterinary', labelEn: 'Veterinary Medicine', labelAr: 'طب بيطري' },
  { value: 'nursing', labelEn: 'Nursing', labelAr: 'تمريض' },
  { value: 'physical_therapy', labelEn: 'Physical Therapy', labelAr: 'علاج طبيعي' },
  { value: 'fine_arts', labelEn: 'Fine Arts', labelAr: 'فنون جميلة' },
  { value: 'applied_arts', labelEn: 'Applied Arts', labelAr: 'فنون تطبيقية' },
  { value: 'tourism', labelEn: 'Tourism & Hotels', labelAr: 'سياحة وفنادق' },
  { value: 'social_work', labelEn: 'Social Work', labelAr: 'خدمة اجتماعية' },
  { value: 'archaeology', labelEn: 'Archaeology', labelAr: 'آثار' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

export const JOB_TITLES: OptionItem[] = [
  { value: 'software_engineer', labelEn: 'Software Engineer / Developer', labelAr: 'مهندس برمجيات / مطور' },
  { value: 'civil_engineer', labelEn: 'Civil Engineer', labelAr: 'مهندس مدني' },
  { value: 'mechanical_engineer', labelEn: 'Mechanical Engineer', labelAr: 'مهندس ميكانيكا' },
  { value: 'electrical_engineer', labelEn: 'Electrical Engineer', labelAr: 'مهندس كهرباء' },
  { value: 'architect', labelEn: 'Architect', labelAr: 'مهندس معماري' },
  { value: 'doctor', labelEn: 'Doctor / Physician', labelAr: 'طبيب' },
  { value: 'dentist', labelEn: 'Dentist', labelAr: 'طبيب أسنان' },
  { value: 'pharmacist', labelEn: 'Pharmacist', labelAr: 'صيدلي' },
  { value: 'nurse', labelEn: 'Nurse', labelAr: 'ممرض/ة' },
  { value: 'teacher', labelEn: 'Teacher', labelAr: 'مدرس' },
  { value: 'professor', labelEn: 'University Professor', labelAr: 'أستاذ جامعي' },
  { value: 'lawyer', labelEn: 'Lawyer', labelAr: 'محامي' },
  { value: 'accountant', labelEn: 'Accountant', labelAr: 'محاسب' },
  { value: 'banker', labelEn: 'Banker', labelAr: 'موظف بنك' },
  { value: 'sales', labelEn: 'Sales / Business Development', labelAr: 'مبيعات / تطوير أعمال' },
  { value: 'marketing', labelEn: 'Marketing Specialist', labelAr: 'متخصص تسويق' },
  { value: 'designer', labelEn: 'Designer (Graphic / UX / UI)', labelAr: 'مصمم (جرافيك / واجهات)' },
  { value: 'data_analyst', labelEn: 'Data Analyst / Scientist', labelAr: 'محلل / عالم بيانات' },
  { value: 'project_manager', labelEn: 'Project Manager', labelAr: 'مدير مشروع' },
  { value: 'product_manager', labelEn: 'Product Manager', labelAr: 'مدير منتج' },
  { value: 'hr', labelEn: 'HR Specialist', labelAr: 'موارد بشرية' },
  { value: 'consultant', labelEn: 'Consultant', labelAr: 'مستشار' },
  { value: 'journalist', labelEn: 'Journalist / Media', labelAr: 'صحفي / إعلامي' },
  { value: 'translator', labelEn: 'Translator', labelAr: 'مترجم' },
  { value: 'researcher', labelEn: 'Researcher', labelAr: 'باحث' },
  { value: 'civil_servant', labelEn: 'Government Employee', labelAr: 'موظف حكومي' },
  { value: 'military', labelEn: 'Military / Police', labelAr: 'عسكري / شرطة' },
  { value: 'chef', labelEn: 'Chef / Cook', labelAr: 'شيف / طاهي' },
  { value: 'driver', labelEn: 'Driver', labelAr: 'سائق' },
  { value: 'freelancer', labelEn: 'Freelancer', labelAr: 'عمل حر' },
  { value: 'business_owner', labelEn: 'Business Owner / Entrepreneur', labelAr: 'صاحب عمل / رائد أعمال' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

const buildLookup = (items: OptionItem[]) =>
  Object.fromEntries(items.map((it) => [it.value, it])) as Record<string, OptionItem>;

const UNI_BY_VALUE = buildLookup(UNIVERSITIES);
const FAC_BY_VALUE = buildLookup(FACULTIES);
const JOB_BY_VALUE = buildLookup(JOB_TITLES);

export const getUniversityLabel = (value: string | null | undefined, isAr: boolean): string => {
  if (!value) return '';
  const item = UNI_BY_VALUE[value];
  if (!item) return value;
  return isAr ? item.labelAr : item.labelEn;
};

export const getFacultyLabel = (value: string | null | undefined, isAr: boolean): string => {
  if (!value) return '';
  const item = FAC_BY_VALUE[value];
  if (!item) return value;
  return isAr ? item.labelAr : item.labelEn;
};

export const getJobTitleLabel = (value: string | null | undefined, isAr: boolean): string => {
  if (!value) return '';
  const item = JOB_BY_VALUE[value];
  if (!item) return value;
  return isAr ? item.labelAr : item.labelEn;
};
