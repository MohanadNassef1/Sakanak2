import React, { useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage, LanguageProvider } from '@/contexts/LanguageContext';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { LOCATION_PAGES, CITY_AREAS, getOrganizationSchema, SITE_URL } from '@/lib/seoData';
import { Button } from '@/components/ui/button';
import { Search, Users, GraduationCap, MapPin, Home, ArrowRight, ArrowLeft, CheckCircle, Building2 } from 'lucide-react';

const LocationLandingContent: React.FC = () => {
  const location = useLocation();
  const slug = location.pathname.replace('/', '');
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const config = useMemo(() => LOCATION_PAGES.find(p => p.slug === slug), [slug]);

  if (!config) {
    navigate('/rooms', { replace: true });
    return null;
  }

  const title = isRTL ? config.titleAr : config.titleEn;
  const description = isRTL ? config.descriptionAr : config.descriptionEn;
  const h1 = isRTL ? config.h1Ar : config.h1En;

  const icon = config.type === 'rooms' ? Home : config.type === 'roommates' ? Users : GraduationCap;
  const Icon = icon;

  const ctaPath = config.type === 'rooms' || config.type === 'students' ? `/rooms?city=${encodeURIComponent(config.cityEn)}` : '/auth';
  const ctaText = isRTL
    ? config.type === 'roommates' ? 'تصفح شركاء السكن' : 'تصفح الغرف'
    : config.type === 'roommates' ? 'Browse Roommates' : 'Browse Rooms';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.titleEn,
    description: config.descriptionEn,
    url: `${SITE_URL}/${config.slug}`,
    inLanguage: ['en', 'ar'],
    isPartOf: { '@type': 'WebSite', url: SITE_URL },
    about: {
      '@type': 'Place',
      name: config.cityEn,
      address: { '@type': 'PostalAddress', addressLocality: config.cityEn, addressCountry: 'EG' },
    },
  };

  const cityAreaData = CITY_AREAS[config.cityEn];
  const areas = cityAreaData?.en || [];
  const areasAr = cityAreaData?.ar || [];

  // Related pages
  const relatedPages = LOCATION_PAGES.filter(p => p.slug !== config.slug);

  return (
    <MainLayout>
      <SEOHead
        title={title}
        description={description}
        keywords={config.keywords}
        canonicalPath={`/${config.slug}`}
        jsonLd={[jsonLd, getOrganizationSchema()]}
      />

      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-primary/8 to-background pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {config.cityEn} • {config.cityAr}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {isRTL ? config.h1Ar : config.h1En}
            </h1>
            {/* Show alternate language subtitle */}
            <p className="text-lg text-muted-foreground" dir={isRTL ? 'ltr' : 'rtl'}>
              {isRTL ? config.h1En : config.h1Ar}
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate(ctaPath)}
              >
                <Icon className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {ctaText}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full"
                onClick={() => navigate('/list-room')}
              >
                <Home className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'اعرض سكنك' : 'List Your Place'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sakanak */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            {isRTL ? `ليه سكنك أفضل منصة للسكن في ${config.cityAr}؟` : `Why Sakanak is the Best Platform for Housing in ${config.cityEn}`}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: CheckCircle,
                titleEn: 'Verified Users Only',
                titleAr: 'مستخدمين موثقين فقط',
                descEn: 'All users go through ID verification for a safer experience.',
                descAr: 'كل المستخدمين بيتحققوا عبر إثبات الهوية لتجربة أمنة.',
              },
              {
                icon: Building2,
                titleEn: 'No Brokers, No Fees',
                titleAr: 'بدون سمسار، بدون عمولة',
                descEn: 'Connect directly with landlords and roommates. Zero broker fees.',
                descAr: 'تواصل مباشرة مع أصحاب الشقق وشركاء السكن. بدون أي رسوم سمسرة.',
              },
              {
                icon: Search,
                titleEn: 'Smart Matching',
                titleAr: 'توافق ذكي',
                descEn: 'Our platform matches you with compatible roommates based on your preferences.',
                descAr: 'المنصة بتساعدك تلاقي شريك سكن متوافق معاك بناءً على تفضيلاتك.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-3 p-6 rounded-2xl bg-background border border-border">
                <item.icon className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">{isRTL ? item.titleAr : item.titleEn}</h3>
                <p className="text-muted-foreground text-sm">{isRTL ? item.descAr : item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular areas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
            {isRTL
              ? `مناطق شائعة في ${config.cityAr}`
              : `Popular Areas in ${config.cityEn}`}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
            {areas.map((area, i) => (
              <Link
                key={area}
                to={`/rooms?city=${encodeURIComponent(config.cityEn)}`}
                className="px-5 py-2.5 rounded-full border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-all text-foreground font-medium text-sm"
              >
                <MapPin className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                {isRTL ? areasAr[i] : area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ-style content for SEO */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-10">
            {isRTL ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
          </h2>

          <div className="space-y-6">
            {config.type === 'rooms' && (
              <>
                <FaqItem
                  q={isRTL ? `إزاي ألاقي غرفة للايجار في ${config.cityAr}؟` : `How to find a room for rent in ${config.cityEn}?`}
                  a={isRTL
                    ? `سجل على سكنك، تصفح الغرف المتاحة في ${config.cityAr}، استخدم الفلاتر لتحديد الميزانية والمنطقة، واحجز معاينة مباشرة.`
                    : `Sign up on Sakanak, browse available rooms in ${config.cityEn}, use filters to set your budget and area, and book a viewing directly.`}
                />
                <FaqItem
                  q={isRTL ? 'هل في رسوم سمسرة؟' : 'Are there any broker fees?'}
                  a={isRTL
                    ? 'لا، سكنك منصة بدون سماسرة. بتتواصل مع صاحب الشقة أو الغرفة مباشرة.'
                    : 'No, Sakanak is a broker-free platform. You connect directly with the room or apartment owner.'}
                />
              </>
            )}
            {config.type === 'roommates' && (
              <>
                <FaqItem
                  q={isRTL ? `إزاي ألاقي شريك سكن في ${config.cityAr}؟` : `How to find a roommate in ${config.cityEn}?`}
                  a={isRTL
                    ? `سجل على سكنك وأكمل بياناتك. هتقدر تتصفح شركاء سكن موثقين في ${config.cityAr} متوافقين مع تفضيلاتك.`
                    : `Sign up on Sakanak and complete your profile. You'll be able to browse verified roommates in ${config.cityEn} matched to your preferences.`}
                />
              </>
            )}
            {config.type === 'students' && (
              <>
                <FaqItem
                  q={isRTL ? 'هل سكنك مناسب للطلاب؟' : 'Is Sakanak suitable for students?'}
                  a={isRTL
                    ? 'أيوا! سكنك فيها قسم خاص للسكن الطلابي. تقدر تلاقي غرف بأسعار مناسبة بالقرب من جامعتك.'
                    : 'Yes! Sakanak has a dedicated student housing section. You can find affordable rooms near your university.'}
                />
              </>
            )}
            <FaqItem
              q={isRTL ? 'هل المستخدمين موثقين؟' : 'Are users verified?'}
              a={isRTL
                ? 'أيوا، كل المستخدمين لازم يعدوا بعملية توثيق الهوية قبل ما يقدروا يشوفوا شركاء السكن أو يحجزوا معاينات.'
                : 'Yes, all users must go through ID verification before they can view roommates or book viewings.'}
            />
          </div>
        </div>
      </section>

      {/* Related pages for internal linking */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            {isRTL ? 'صفحات مشابهة' : 'Related Pages'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {relatedPages.map(page => (
              <Link
                key={page.slug}
                to={`/${page.slug}`}
                className="p-4 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                  {isRTL ? page.h1Ar : page.h1En}
                </p>
                <p className="text-xs text-muted-foreground mt-1" dir={isRTL ? 'ltr' : 'rtl'}>
                  {isRTL ? page.h1En : page.h1Ar}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isRTL ? 'ابدأ دلوقتي على سكنك' : 'Get Started on Sakanak Today'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'سجل مجاناً وابدأ تصفح الغرف وشركاء السكن الموثقين في مصر.'
              : 'Sign up for free and start browsing verified rooms and roommates across Egypt.'}
          </p>
          <Button size="lg" className="rounded-full px-10 py-6 text-lg" onClick={() => navigate('/auth')}>
            {isRTL ? 'سجل مجاناً' : 'Sign Up Free'}
            {isRTL ? <ArrowLeft className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <div className="p-5 rounded-xl border border-border bg-background">
    <h3 className="font-semibold text-foreground mb-2">{q}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
  </div>
);

const LocationLanding: React.FC = () => (
  <LanguageProvider>
    <LocationLandingContent />
  </LanguageProvider>
);

export default LocationLanding;
