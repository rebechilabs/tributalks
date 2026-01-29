import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { RTCCalculatorSection } from "@/components/landing/RTCCalculatorSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ComingSoonSection } from "@/components/landing/ComingSoonSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { ValuationImpactSection } from "@/components/landing/ValuationImpactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <RTCCalculatorSection />
        <FeaturesSection />
        <IntegrationsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <ValuationImpactSection />
        <PricingSection />
        <ComingSoonSection />
        <CredibilitySection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
