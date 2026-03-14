import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import MainLayout from "@/components/MainLayout";
import SEOHead from "@/components/SEOHead";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import { Info, X } from "lucide-react";
import RoomFinderChat from "@/components/rooms/RoomFinderChat";

// 1. عملنا مكون صغير هنا عشان نقدر نستخدم فيه اللغة
const BetaBanner = () => {
  const { isRTL } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 w-full">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 md:mt-0 shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-primary block md:inline md:mx-1">
              {isRTL ? "نسخة تجريبية:" : "Beta Version:"}
            </span>
            <span className="text-foreground/80">
              {isRTL
                ? "موقع سكنك شغال دلوقتي ببلاش لفترة محدودة! مفيش سمسرة ولا أي مصاريف حجز.. جرب بنفسك."
                : "Sakanak is now live in Beta! Zero commission and free booking for a limited time."}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout>
        <SEOHead
          title="Sakanak – Find Your Perfect Room or Roommate in Egypt | Cairo, Giza & More"
          description="Find rooms for rent, shared apartments, and trusted roommates in Cairo, Giza, and across Egypt. Sakanak makes finding a room or roommate simple and safe."
          keywords="Sakanak, سكنك, sakanakeg, sknk, saknk, sakan, سكن, سكن في مصر, سكن في القاهرة, سكن في الجيزة, سكن في الشيخ زايد, سكن في اكتوبر, سكن فالقاهرة, سكن فالجيزة, سكن فالشيخ زايد, rooms for rent Egypt, rooms for rent Cairo, roommate Egypt, roommate Cairo, find roommate Cairo, shared apartment Cairo, apartment share Egypt, room for rent Giza, student housing Cairo, flat share Cairo, rent room without broker, شقق للايجار, غرف للايجار, شقق للايجار في القاهرة, شقق للايجار في الجيزة, شقق للايجار للشباب, شقق مشاركة, شريك سكن, شريك سكن في القاهرة, سكن مشترك, سكن طلاب, سكن شباب, غرفة للايجار في القاهرة, إيجار بدون سمسار, سكنك مصر"
          canonicalPath="/"
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sakanak - سكنك",
              alternateName: ["Sakanak", "سكنك", "sakanakeg"],
              url: "https://sakanakeg.com",
              description:
                "Find rooms for rent, apartments to share, and trusted roommates in Cairo, Giza and across Egypt.",
              inLanguage: ["en", "ar"],
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: "https://sakanakeg.com/rooms?q={search_term_string}" },
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        <BetaBanner />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection />
        <RoomFinderChat />
      </MainLayout>
    </LanguageProvider>
  );
};

export default Index;
