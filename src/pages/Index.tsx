import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { VideoDemoSection } from "@/components/landing/VideoDemoSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { MarginProtectionSection } from "@/components/landing/MarginProtectionSection";
import { ROICalculatorSection } from "@/components/landing/ROICalculatorSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoComplete = () => {
    // Scrolla para a seção de pricing
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <VideoDemoSection onOpenDemo={() => setShowDemo(true)} />
        <HowItWorksSection />
        <PricingSection />
        <IntegrationsSection />
        <MarginProtectionSection />
        <ROICalculatorSection />
        <SocialProofSection />
        <CredibilitySection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
      
      <InteractiveDemo
        open={showDemo}
        onOpenChange={setShowDemo}
        onComplete={handleDemoComplete}
      />
    </div>
  );
};

export default Index;
