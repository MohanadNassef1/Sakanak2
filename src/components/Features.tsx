import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Brain, CreditCard, Users } from 'lucide-react';

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
    icon: CreditCard,
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
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-secondary/50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="section-container relative z-10">
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            {t('features.title')}
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-2 group border border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-lg transition-all duration-500">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
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
