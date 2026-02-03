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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <VideoDemoSection />
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
    </div>
  );
};

export default Index;
