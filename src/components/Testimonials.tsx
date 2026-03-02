import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah K.',
    location: 'Cairo',
    rating: 5,
    text: {
      en: 'Finally found a safe and verified roommate through Sakanak. The verification process gave me peace of mind as a female looking for shared housing.',
      ar: 'أخيراً وجدت شريكة سكن آمنة وموثقة عبر سكنك. عملية التحقق أعطتني راحة البال كفتاة تبحث عن سكن مشترك.',
    },
    initials: 'SK',
  },
  {
    name: 'Mohamed A.',
    location: 'Alexandria',
    rating: 5,
    text: {
      en: 'Listed my room and found a great tenant within a week. The payment protection made the whole process smooth and secure.',
      ar: 'عرضت غرفتي ووجدت مستأجراً رائعاً خلال أسبوع. حماية الدفع جعلت العملية سلسة وآمنة.',
    },
    initials: 'MA',
  },
  {
    name: 'Nour H.',
    location: 'Giza',
    rating: 5,
    text: {
      en: 'The smart matching feature is amazing! Got matched with someone who shares my lifestyle preferences. Best roommate experience ever.',
      ar: 'ميزة المطابقة الذكية مذهلة! تم مطابقتي مع شخص يشاركني تفضيلات نمط حياتي. أفضل تجربة شريك سكن على الإطلاق.',
    },
    initials: 'NH',
  },
];

const Testimonials: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="section-container">
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="testimonial-card relative animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-primary/15 absolute top-6 right-6 md:top-8 md:right-8" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-8 leading-relaxed relative z-10">
                "{testimonial.text[language]}"
              </p>

              {/* User */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
                  <span className="font-bold text-primary">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
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
