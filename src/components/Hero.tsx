import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Shield, Users, Home, Search, ArrowRight, BadgeCheck, CheckCircle } from 'lucide-react';
import heroRoomImage from '@/assets/hero-room-cairo.jpg';

const Hero: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-secondary/30 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-muted-foreground/20" />
        <div className="absolute top-40 left-40 w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
        <div className="absolute bottom-32 right-1/3 w-2 h-2 rounded-full bg-muted-foreground/20" />
        <div className="absolute top-1/2 left-20 w-1 h-1 rounded-full bg-muted-foreground/20" />
      </div>

      <div className="section-container relative z-10">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isRTL ? 'lg:grid-flow-dense' : ''}`}>
          {/* Text Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:col-start-2' : ''}`}>
            {/* Verified Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('hero.verifiedBadge')}</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight">
                {t('hero.title.part1')}{' '}
                <span className="text-primary">{t('hero.title.highlight')}</span>
                <br />
                {t('hero.title.part2')}{' '}
                <span className="text-primary">{t('hero.title.highlight2')}</span>{' '}
                {t('hero.title.part3')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 py-6 rounded-full shadow-orange transition-all hover:shadow-xl hover:-translate-y-0.5 gap-2"
              >
                <Search className="w-5 h-5" />
                {t('hero.cta.findRoom')}
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-foreground/20 text-foreground hover:bg-foreground hover:text-background font-bold text-base px-8 py-6 rounded-full transition-all gap-2"
              >
                <Home className="w-5 h-5" />
                {t('hero.cta.listRoom')}
              </Button>
            </div>

            {/* Stats Badges */}
            <div className={`flex flex-wrap gap-6 pt-2 ${isRTL ? 'justify-end' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sakanak-success" />
                <span className="text-sm text-muted-foreground">{t('hero.stats.verified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('hero.stats.members')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('hero.stats.listings')}</span>
              </div>
            </div>
          </div>

          {/* Room Card */}
          <div className={`relative ${isRTL ? 'lg:col-start-1' : ''}`}>
            {/* 100% Verified Badge */}
            <div className="absolute -top-2 right-4 md:right-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background shadow-lg border border-border">
              <CheckCircle className="w-4 h-4 text-sakanak-success" />
              <span className="text-sm font-medium text-foreground">{t('hero.badge.verified100')}</span>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
              {/* Room Image */}
              <div className="aspect-[4/5] md:aspect-[4/4] overflow-hidden">
                <img
                  src={heroRoomImage}
                  alt="Modern room in Cairo"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Room Info Card Overlay */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{t('hero.card.title')}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('hero.card.price')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-sakanak-success">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          {t('room.verified')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
