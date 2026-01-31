import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { JourneysSection } from "@/components/landing/JourneysSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ROICalculatorSection } from "@/components/landing/ROICalculatorSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <JourneysSection />
        <SocialProofSection />
        <CredibilitySection />
        <HowItWorksSection />
        <ROICalculatorSection />
        <IntegrationsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
