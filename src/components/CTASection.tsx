import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight } from 'lucide-react';
import { trackCustomEvent } from '@/lib/fbPixel';

const CTASection: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();

  // Hide CTA for signed-in users
  if (user) {
    return null;
  }

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
            {isRTL ? 'دور على روميت أو غرفة للإيجار في مصر دلوقتي' : 'Find a Roommate or Room for Rent in Egypt Today'}
          </h2>
          <p className="text-lg md:text-xl text-background/70">
            {isRTL
              ? 'انضم لآلاف المصريين والمغتربين اللي لقوا غرفتهم أو روميتهم المثالي في القاهرة والجيزة والإسكندرية عبر سكنك. سجّل مجاناً دلوقتي!'
              : 'Join thousands of Egyptians and expats who found their perfect room or roommate in Cairo, Giza and Alexandria on Sakanak. Sign up free today!'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl shadow-orange transition-all hover:shadow-xl hover:-translate-y-0.5 group"
              asChild
            >
              <Link to="/rooms" onClick={() => trackCustomEvent('ClickFindRoom', { source: 'cta_section' })}>
                <Search className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تصفح الغرف' : 'Browse Rooms'}
                <ArrowRight className={`w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 mr-2 ml-0 group-hover:-translate-x-1' : ''}`} />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 font-bold text-lg px-8 py-6 rounded-xl transition-all border-0"
              asChild
            >
              <Link to="/how-it-works" onClick={() => trackCustomEvent('ClickHowItWorks', { source: 'cta_section' })}>
                {isRTL ? 'اعرف إزاي سكنك بيشتغل' : 'How Sakanak Works'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
