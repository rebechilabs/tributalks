import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { ROICaseStudySection } from "@/components/landing/ROICaseStudySection";
import { BenefitsCtaSection } from "@/components/landing/BenefitsCtaSection";
import { JourneysSection } from "@/components/landing/JourneysSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ROICalculatorSection } from "@/components/landing/ROICalculatorSection";
import { MarginProtectionSection } from "@/components/landing/MarginProtectionSection";
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
        <ROICaseStudySection />
        <BenefitsCtaSection />
        <SocialProofSection />
        <CredibilitySection />
        <HowItWorksSection />
        <ROICalculatorSection />
        <MarginProtectionSection />
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
