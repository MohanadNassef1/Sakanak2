import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Shield, CreditCard, Headphones, MapPin, Star, BadgeCheck } from 'lucide-react';
import heroRoomImage from '@/assets/hero-room.jpg';

const Hero: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 hero-gradient overflow-hidden">
      <div className="section-container">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Text Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:col-start-2' : ''}`}>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                {t('hero.title.part1')}{' '}
                <span className="text-primary">{t('hero.title.highlight')}</span>{' '}
                {t('hero.title.part2')}{' '}
                <span className="text-primary">{t('hero.title.highlight2')}</span>{' '}
                {t('hero.title.part3')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8 py-6 rounded-xl shadow-orange transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('hero.cta.findRoom')}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background font-bold text-lg px-8 py-6 rounded-xl transition-all"
              >
                {t('hero.cta.listRoom')}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap gap-4 ${isRTL ? 'justify-end' : ''}`}>
              <div className="trust-badge">
                <Shield className="w-4 h-4 text-primary" />
                <span>{t('hero.badge.verified')}</span>
              </div>
              <div className="trust-badge">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>{t('hero.badge.secure')}</span>
              </div>
              <div className="trust-badge">
                <Headphones className="w-4 h-4 text-primary" />
                <span>{t('hero.badge.support')}</span>
              </div>
            </div>
          </div>

          {/* Room Card */}
          <div className={`relative ${isRTL ? 'lg:col-start-1' : ''}`}>
            <div className="room-card overflow-hidden animate-float">
              {/* Featured Badge */}
              <div className="featured-badge">
                <Star className="w-3 h-3 inline-block mr-1" />
                {t('room.featured')}
              </div>
              
              {/* Room Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={heroRoomImage}
                  alt="Beautiful room in Cairo"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              
              {/* Room Info */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Modern Room in Zamalek</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Cairo, Egypt</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">4,500</span>
                    <span className="text-sm text-muted-foreground"> EGP{t('room.perMonth')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">AM</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">Ahmed M.</span>
                      <div className="verified-badge">
                        <BadgeCheck className="w-3 h-3" />
                        {t('room.verified')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-primary">87%</span>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -z-10 -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
