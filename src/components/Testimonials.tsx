import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star } from 'lucide-react';

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
    <section className="py-16 md:py-24 bg-background">
      <div className="section-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
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
