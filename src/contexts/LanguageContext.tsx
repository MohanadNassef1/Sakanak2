import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.findRoom': 'Find a Room',
    'nav.listRoom': 'List Your Room',
    'nav.findRoommate': 'Find a Roommate',
    'nav.howItWorks': 'How It Works',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    
    // Hero
    'hero.title.part1': 'Find Your Perfect',
    'hero.title.highlight': 'Room',
    'hero.title.part2': 'or',
    'hero.title.highlight2': 'Roommate',
    'hero.title.part3': 'in Egypt',
    'hero.subtitle': 'Sakanak connects verified users to safe, compatible living spaces. No brokers, no scams - just trusted connections.',
    'hero.cta.findRoom': 'Find a Room',
    'hero.cta.listRoom': 'List Your Room',
    'hero.badge.verified': 'Verified Users Only',
    'hero.badge.secure': 'Secure Payments',
    'hero.badge.support': '24/7 Support',
    
    // Room Card
    'room.featured': 'Featured',
    'room.perMonth': '/month',
    'room.verified': 'Verified',
    
    // Testimonials
    'testimonials.title': 'What Our Users Say',
    'testimonials.subtitle': 'Real stories from people who found their perfect match on Sakanak',
    
    // Features
    'features.title': 'Why Choose Sakanak?',
    'features.verified.title': 'Verified Users',
    'features.verified.desc': 'All users go through ID verification for your safety',
    'features.matching.title': 'Smart Matching',
    'features.matching.desc': 'Our algorithm finds compatible roommates based on your preferences',
    'features.secure.title': 'Secure Payments',
    'features.secure.desc': 'Protected escrow payments - your money is safe until you move in',
    'features.gender.title': 'Gender-Safe',
    'features.gender.desc': 'Strict gender filtering ensures comfortable living arrangements',
    
    // How It Works
    'howItWorks.title': 'How It Works',
    'howItWorks.step1.title': 'Create Profile',
    'howItWorks.step1.desc': 'Sign up and verify your identity',
    'howItWorks.step2.title': 'Browse Listings',
    'howItWorks.step2.desc': 'Find rooms or roommates that match your preferences',
    'howItWorks.step3.title': 'Connect Safely',
    'howItWorks.step3.desc': 'Chat with verified users through our secure platform',
    'howItWorks.step4.title': 'Move In',
    'howItWorks.step4.desc': 'Complete secure payment and start your new chapter',
    
    // CTA Section
    'cta.title': 'Ready to Find Your Perfect Place?',
    'cta.subtitle': 'Join thousands of verified users already on Sakanak',
    'cta.button': 'Get Started Free',
    
    // Footer
    'footer.description': 'The trusted platform for finding rooms and roommates in Egypt.',
    'footer.quickLinks': 'Quick Links',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.contact': 'Contact Us',
    'footer.faq': 'FAQ',
    'footer.safety': 'Safety Tips',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.refund': 'Refund Policy',
    'footer.rights': 'All rights reserved.',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.findRoom': 'ابحث عن غرفة',
    'nav.listRoom': 'اعرض غرفتك',
    'nav.findRoommate': 'ابحث عن شريك سكن',
    'nav.howItWorks': 'كيف يعمل',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    
    // Hero
    'hero.title.part1': 'اعثر على',
    'hero.title.highlight': 'الغرفة',
    'hero.title.part2': 'أو',
    'hero.title.highlight2': 'شريك السكن',
    'hero.title.part3': 'المثالي في مصر',
    'hero.subtitle': 'سكنك يربط المستخدمين الموثقين بأماكن سكن آمنة ومتوافقة. بدون سماسرة، بدون احتيال - فقط اتصالات موثوقة.',
    'hero.cta.findRoom': 'ابحث عن غرفة',
    'hero.cta.listRoom': 'اعرض غرفتك',
    'hero.badge.verified': 'مستخدمون موثقون فقط',
    'hero.badge.secure': 'دفع آمن',
    'hero.badge.support': 'دعم على مدار الساعة',
    
    // Room Card
    'room.featured': 'مميز',
    'room.perMonth': '/شهرياً',
    'room.verified': 'موثق',
    
    // Testimonials
    'testimonials.title': 'ماذا يقول مستخدمونا',
    'testimonials.subtitle': 'قصص حقيقية من أشخاص وجدوا شريك السكن المثالي على سكنك',
    
    // Features
    'features.title': 'لماذا تختار سكنك؟',
    'features.verified.title': 'مستخدمون موثقون',
    'features.verified.desc': 'جميع المستخدمين يخضعون للتحقق من الهوية لسلامتك',
    'features.matching.title': 'مطابقة ذكية',
    'features.matching.desc': 'خوارزميتنا تجد شركاء سكن متوافقين بناءً على تفضيلاتك',
    'features.secure.title': 'دفع آمن',
    'features.secure.desc': 'مدفوعات محمية - أموالك آمنة حتى تنتقل',
    'features.gender.title': 'أمان جنسي',
    'features.gender.desc': 'فلترة صارمة للجنس تضمن ترتيبات سكن مريحة',
    
    // How It Works
    'howItWorks.title': 'كيف يعمل',
    'howItWorks.step1.title': 'أنشئ ملفك',
    'howItWorks.step1.desc': 'سجل وتحقق من هويتك',
    'howItWorks.step2.title': 'تصفح القوائم',
    'howItWorks.step2.desc': 'ابحث عن غرف أو شركاء سكن يناسبون تفضيلاتك',
    'howItWorks.step3.title': 'تواصل بأمان',
    'howItWorks.step3.desc': 'تحدث مع مستخدمين موثقين عبر منصتنا الآمنة',
    'howItWorks.step4.title': 'انتقل',
    'howItWorks.step4.desc': 'أكمل الدفع الآمن وابدأ فصلك الجديد',
    
    // CTA Section
    'cta.title': 'مستعد للعثور على مكانك المثالي؟',
    'cta.subtitle': 'انضم إلى آلاف المستخدمين الموثقين على سكنك',
    'cta.button': 'ابدأ مجاناً',
    
    // Footer
    'footer.description': 'المنصة الموثوقة للعثور على غرف وشركاء سكن في مصر.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.support': 'الدعم',
    'footer.legal': 'قانوني',
    'footer.contact': 'اتصل بنا',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.safety': 'نصائح السلامة',
    'footer.terms': 'الشروط والأحكام',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.refund': 'سياسة الاسترداد',
    'footer.rights': 'جميع الحقوق محفوظة.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
