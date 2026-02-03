import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background">
            {t('cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-background/70">
            {t('cta.subtitle')}
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl shadow-orange transition-all hover:shadow-xl hover:-translate-y-0.5 group"
            >
              {t('cta.button')}
              <ArrowRight className={`w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 mr-2 ml-0 group-hover:-translate-x-1' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
