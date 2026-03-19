import React, { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star } from 'lucide-react';

const allTestimonials = [
  {
    name: 'Sarah K.',
    location: { en: 'Cairo', ar: 'القاهرة' },
    rating: 5,
    text: {
      en: 'Finally found a safe and verified roommate through Sakanak. The verification process gave me peace of mind as a female looking for shared housing.',
      ar: 'أخيراً وجدت شريكة سكن آمنة وموثقة عبر سكنك. عملية التحقق أعطتني راحة البال كفتاة تبحث عن سكن مشترك.',
    },
    initials: 'SK',
  },
  {
    name: 'Mohamed A.',
    location: { en: 'Alexandria', ar: 'الإسكندرية' },
    rating: 5,
    text: {
      en: 'Listed my room and found a great tenant within a week. The payment protection made the whole process smooth and secure.',
      ar: 'عرضت غرفتي ووجدت مستأجراً رائعاً خلال أسبوع. حماية الدفع جعلت العملية سلسة وآمنة.',
    },
    initials: 'MA',
  },
  {
    name: 'Nour H.',
    location: { en: 'Giza', ar: 'الجيزة' },
    rating: 5,
    text: {
      en: 'The smart matching feature is amazing! Got matched with someone who shares my lifestyle preferences. Best roommate experience ever.',
      ar: 'ميزة المطابقة الذكية مذهلة! تم مطابقتي مع شخص يشاركني تفضيلات نمط حياتي. أفضل تجربة شريك سكن على الإطلاق.',
    },
    initials: 'NH',
  },
  {
    name: 'Ahmed R.',
    location: { en: 'Nasr City', ar: 'مدينة نصر' },
    rating: 5,
    text: {
      en: 'Moved to Cairo for work and found a roommate in 3 days through Sakanak. The match score was spot on — we get along perfectly!',
      ar: 'اتنقلت القاهرة عشان الشغل ولقيت شريك سكن في 3 أيام عن طريق سكنك. درجة المطابقة كانت دقيقة — بنتفاهم تمام!',
    },
    initials: 'AR',
  },
  {
    name: 'Fatma S.',
    location: { en: 'Sheikh Zayed', ar: 'الشيخ زايد' },
    rating: 5,
    text: {
      en: 'As a female student, safety was my top priority. Sakanak\'s gender filtering and verified profiles made me feel completely safe finding a roommate.',
      ar: 'كطالبة، الأمان كان أولويتي. فلترة الجنس في سكنك والحسابات الموثقة خلتني حاسة بأمان تام وأنا بدور على شريكة سكن.',
    },
    initials: 'FS',
  },
  {
    name: 'Omar T.',
    location: { en: '6th October', ar: '6 أكتوبر' },
    rating: 5,
    text: {
      en: 'I listed my spare room and got 5 viewing requests in the first week. The booking system is super organized. Highly recommend Sakanak!',
      ar: 'عرضت أوضتي الفاضية وجالي 5 طلبات معاينة في أول أسبوع. نظام الحجز منظم جداً. أنصح بسكنك بشدة!',
    },
    initials: 'OT',
  },
  {
    name: 'Yasmin M.',
    location: { en: 'Heliopolis', ar: 'مصر الجديدة' },
    rating: 5,
    text: {
      en: 'The personality matching is what sets Sakanak apart. My roommate and I have the same sleep schedule, cleanliness standards, and social habits!',
      ar: 'مطابقة الشخصية هي اللي بتميز سكنك. أنا وشريكتي عندنا نفس مواعيد النوم ومعايير النظافة والعادات الاجتماعية!',
    },
    initials: 'YM',
  },
  {
    name: 'Karim D.',
    location: { en: 'Maadi', ar: 'المعادي' },
    rating: 5,
    text: {
      en: 'No more dealing with sketchy brokers! Sakanak is 100% free and I found a verified room in Maadi within days. Game changer.',
      ar: 'خلاص مفيش تعامل مع سماسرة مشبوهين! سكنك مجاني 100% ولقيت أوضة موثقة في المعادي في أيام. تغيير جذري.',
    },
    initials: 'KD',
  },
  {
    name: 'Mariam L.',
    location: { en: 'New Cairo', ar: 'القاهرة الجديدة' },
    rating: 5,
    text: {
      en: 'I was skeptical at first, but Sakanak proved me wrong. The identity verification gave me confidence, and I found the perfect shared apartment near AUC.',
      ar: 'كنت متشككة في الأول، بس سكنك أثبتلي العكس. توثيق الهوية إداني ثقة، ولقيت شقة مشاركة مثالية قريبة من الجامعة الأمريكية.',
    },
    initials: 'ML',
  },
  {
    name: 'Hassan B.',
    location: { en: 'Dokki', ar: 'الدقي' },
    rating: 5,
    text: {
      en: 'What I love about Sakanak is the viewing system. I could visit the room, meet the roommate, and decide without any pressure. Transparent and trustworthy.',
      ar: 'اللي بحبه في سكنك هو نظام المعاينة. قدرت أزور الأوضة، أقابل شريك السكن، وأقرر من غير أي ضغط. شفافية وثقة.',
    },
    initials: 'HB',
  },
  {
    name: 'Dina W.',
    location: { en: 'Smouha', ar: 'سموحة' },
    rating: 5,
    text: {
      en: 'Found a roommate in Alexandria through Sakanak as a university student. The platform is so easy to use and the matching algorithm really works!',
      ar: 'لقيت شريكة سكن في إسكندرية عن طريق سكنك كطالبة جامعية. المنصة سهلة جداً والخوارزمية فعلاً بتشتغل!',
    },
    initials: 'DW',
  },
  {
    name: 'Tamer G.',
    location: { en: 'Mohandessin', ar: 'المهندسين' },
    rating: 5,
    text: {
      en: 'Sakanak saved me from a bad roommate situation. The detailed profiles and compatibility scores helped me find someone who actually fits my lifestyle.',
      ar: 'سكنك أنقذني من موقف سكن سيء. البروفايلات المفصلة ودرجات التوافق ساعدتني ألاقي حد فعلاً مناسب لأسلوب حياتي.',
    },
    initials: 'TG',
  },
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const Testimonials: React.FC = () => {
  const { t, language } = useLanguage();

  // Pick 3 random testimonials on mount (changes each refresh)
  const displayedTestimonials = useMemo(() => shuffleArray(allTestimonials).slice(0, 3), []);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="section-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isRTL ? 'ناس حقيقية، تجارب حقيقية على سكنك' : 'Real People, Real Sakanak Experiences'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'اسمع من مستخدمين سكنك اللي لقوا شريك سكنهم أو غرفتهم المثالية'
              : 'Hear from Sakanak users who found their perfect roommate or room'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {displayedTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.initials}
              className="testimonial-card animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text[language]}"
              </p>

              {/* User */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location[language]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
