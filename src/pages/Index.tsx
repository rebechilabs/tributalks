import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ComingSoonSection } from "@/components/landing/ComingSoonSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CredibilitySection } from "@/components/landing/CredibilitySection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ComingSoonSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CredibilitySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
