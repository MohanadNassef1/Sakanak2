import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import MainLayout from "@/components/MainLayout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import { Info, X } from "lucide-react";

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
                ? "موقع Sakanak متاح الآن مجاناً لفترة محدودة! لا توجد عمولات أو رسوم حجز."
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
        {/* 2. ضفنا البانر هنا عشان يظهر أول حاجة تحت النافبار */}
        <BetaBanner />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </MainLayout>
    </LanguageProvider>
  );
};

export default Index;
