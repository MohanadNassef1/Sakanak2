import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Search, MessageCircle, Home } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    titleKey: 'howItWorks.step1.title',
    descKey: 'howItWorks.step1.desc',
    step: '01',
  },
  {
    icon: Search,
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.desc',
    step: '02',
  },
  {
    icon: MessageCircle,
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.desc',
    step: '03',
  },
  {
    icon: Home,
    titleKey: 'howItWorks.step4.title',
    descKey: 'howItWorks.step4.desc',
    step: '04',
  },
];

const HowItWorks: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="section-container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-border" />
          
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
            {steps.map((step, index) => (
              <div
                key={step.titleKey}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number */}
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-card shadow-lg flex items-center justify-center mb-6 relative z-10 border border-border">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {t(step.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
