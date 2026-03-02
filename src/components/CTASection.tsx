import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // Hide CTA for signed-in users
  if (user) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[100px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div className="section-container relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background leading-tight animate-fade-in">
            {t('cta.title')}
          </h2>
          <p className="text-lg md:text-xl text-background/60 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            {t('cta.subtitle')}
          </p>
          <div className="pt-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-10 py-7 rounded-2xl shadow-orange transition-all hover:shadow-xl hover:-translate-y-1 group"
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
