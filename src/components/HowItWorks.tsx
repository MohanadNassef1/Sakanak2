import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, Search, Eye, Home } from 'lucide-react';

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
    icon: Eye,
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
    <section className="py-20 md:py-28 bg-background">
      <div className="section-container">
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
            {t('howItWorks.title')}
          </h2>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>

        <div className="relative">
          {/* Connection Line - dashed for more visual interest */}
          <div className="hidden lg:block absolute top-[3.5rem] left-[10%] right-[10%] h-[2px]">
            <div className="w-full h-full border-t-2 border-dashed border-primary/30" />
          </div>
          
          <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
            {steps.map((step, index) => (
              <div
                key={step.titleKey}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number + Icon */}
                <div className="relative inline-flex mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-card shadow-lg flex items-center justify-center relative z-10 border border-border/50 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg ring-4 ring-background z-20">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
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
