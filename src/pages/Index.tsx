import React from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainLayout from "@/components/MainLayout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <MainLayout>
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
