import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Brain, Gift, Users } from 'lucide-react';

const features = [
  {
    icon: Shield,
    titleKey: 'features.verified.title',
    descKey: 'features.verified.desc',
  },
  {
    icon: Brain,
    titleKey: 'features.matching.title',
    descKey: 'features.matching.desc',
  },
  {
    icon: Gift,
    titleKey: 'features.secure.title',
    descKey: 'features.secure.desc',
  },
  {
    icon: Users,
    titleKey: 'features.gender.title',
    descKey: 'features.gender.desc',
  },
];

const Features: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="section-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isRTL ? 'ليه سكنك؟' : 'Why Sakanak?'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'سكنك هي المنصة الأولى والوحيدة في مصر المتخصصة في إيجاد شريك السكن المثالي'
              : 'Sakanak is Egypt\'s first and only platform dedicated to finding your perfect roommate'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
