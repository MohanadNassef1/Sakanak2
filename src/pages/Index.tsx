import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const savedRedirect = localStorage.getItem('sakanak_redirect_after_auth');
      if (savedRedirect) {
        localStorage.removeItem('sakanak_redirect_after_auth');
        navigate(savedRedirect, { replace: true });
      }
    }
  }, [user, navigate]);

  return (
      <MainLayout>
        <SEOHead
          title="سكن طلاب، سكن طالبات، سكن مغتربين وشريك سكن (روميت) في مصر | Sakanak"
          description="سكنك — منصة سكن طلاب وسكن طالبات وسكن مغتربين موثوقة في القاهرة، مدينة نصر، الإسكندرية وأسيوط. لاقي شريك سكن (روميت) من غير سمسرة. Egypt's #1 student housing & roommate finder."
          keywords="سكن طلاب, سكن طالبات, سكن مغتربين, سكن طلاب مدينة نصر, سكن طالبات مدينة نصر, سكن طلاب أسيوط, سكن طلاب الإسكندرية, سكن طالبات الإسكندرية, روميت, شريك سكن, شريك سكن في القاهرة, سكن طلاب جامعة القاهرة, سكن طالبات جامعة القاهرة, المدينة الجامعية, سكن آمن للمغتربات, سكن بنات, سكن شباب, سكن مشترك, شقق شيرنج, روميت بنات, روميت شباب, سكن طلاب القاهرة, سكن طالبات القاهرة, Sakanak, سكنك, sakanakeg, student housing Egypt, student housing Cairo, roommate finder Egypt, roommate Cairo, find roommate Cairo, shared apartment Cairo, إيجار بدون سمسار"
          canonicalPath="/"
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Sakanak - سكنك",
              alternateName: ["Sakanak", "سكنك", "sakanakeg"],
              url: "https://sakanakeg.com",
              description:
                "Sakanak is Egypt's #1 roommate finder platform. Find rooms for rent, apartments to share, and trusted roommates in Cairo, Giza and across Egypt.",
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
  );
};

export default Index;
