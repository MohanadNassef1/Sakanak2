import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, ArrowLeft, CheckCircle, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RoomCard from '@/components/rooms/RoomCard';
import { SITE_URL } from '@/lib/seoData';

export interface FAQItem {
  q: string;
  a: string;
}

export interface SEOLandingTemplateProps {
  /** URL slug, e.g. "female-roommates-egypt" */
  slug: string;
  /** Browse CTA link, e.g. "/rooms?gender=females_only" */
  browseHref: string;
  /** Visible H1 (use the most-searched keyword phrase) */
  h1: { en: string; ar: string };
  /** Page title for <title> + og:title */
  title: { en: string; ar: string };
  /** Meta description (≤160 chars) */
  description: { en: string; ar: string };
  /** Comma-separated keywords for meta keywords */
  keywords: string;
  /** Subtitle shown under H1 */
  intro: { en: string; ar: string };
  /** Long-form bilingual body — render as paragraphs */
  body: { en: string[]; ar: string[] };
  /** FAQ section */
  faqs: { en: FAQItem[]; ar: FAQItem[] };
  /** Filter to apply when fetching the listing grid */
  roomFilter: (q: any) => any;
}

const SEOLandingTemplate: React.FC<SEOLandingTemplateProps> = ({
  slug,
  browseHref,
  h1,
  title,
  description,
  keywords,
  intro,
  body,
  faqs,
  roomFilter,
}) => {
  const { isRTL } = useLanguage();

  const { data: rooms } = useQuery({
    queryKey: ['seo-landing-rooms', slug],
    queryFn: async () => {
      let q = supabase
        .from('public_rooms')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);
      q = roomFilter(q);
      const { data } = await q;
      return data ?? [];
    },
  });

  const lang = isRTL ? 'ar' : 'en';
  const faqList = faqs[lang];

  // JSON-LD: WebPage + FAQPage + BreadcrumbList
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title.en,
      description: description.en,
      url: `${SITE_URL}/${slug}`,
      inLanguage: ['en', 'ar'],
      isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'Sakanak' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.en.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: title.en, item: `${SITE_URL}/${slug}` },
      ],
    },
  ];

  return (
    <MainLayout>
      <SEOHead
        title={title[lang]}
        description={description[lang]}
        keywords={keywords}
        canonicalPath={`/${slug}`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/8 to-background pt-24 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? 'مصر — القاهرة، الجيزة، الإسكندرية' : 'Egypt — Cairo, Giza, Alexandria'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{h1[lang]}</h1>
            <p className="text-lg text-muted-foreground">{intro[lang]}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full">
                <Link to={browseHref}>
                  {isRTL ? 'تصفح الإعلانات' : 'Browse Listings'}
                  {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/list-room">{isRTL ? 'اعرض غرفتك' : 'List Your Room'}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Long-form body copy */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl prose prose-neutral dark:prose-invert">
          {body[lang].map((p, i) => (
            <p key={i} className="text-base md:text-lg text-foreground/85 leading-relaxed mb-4">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Listings grid */}
      {rooms && rooms.length > 0 && (
        <section className="py-12 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {isRTL ? 'إعلانات متاحة الآن' : 'Available Listings Right Now'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room: any) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to={browseHref}>{isRTL ? 'عرض كل الإعلانات' : 'View All Listings'}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {isRTL ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqList.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border rounded-xl px-5">
                <AccordionTrigger className="text-left hover:no-underline py-5 font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 bg-primary/5">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground/80">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {isRTL ? 'مستخدمون موثقون فقط' : 'Verified users only'}
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {isRTL ? 'بدون سماسرة' : 'No brokers'}
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {isRTL ? 'مجاني في البيتا' : 'Free during Beta'}
          </span>
        </div>
      </section>
    </MainLayout>
  );
};

export default SEOLandingTemplate;
