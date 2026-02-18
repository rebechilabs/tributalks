import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { NewHeroSection } from "@/components/landing/NewHeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { RTCCalculatorSection } from "@/components/landing/RTCCalculatorSection";
import { ClaraSection } from "@/components/landing/ClaraSection";
import { NewPricingSection } from "@/components/landing/NewPricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { FAQSection } from "@/components/landing/FAQSection";
import { NewFooter } from "@/components/landing/NewFooter";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoComplete = () => {
    const pricingSection = document.getElementById("planos");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header />
      <main>
        <NewHeroSection />
        <ProblemSection />
        <DemoSection onOpenDemo={() => setShowDemo(true)} />
        <RTCCalculatorSection />
        <ClaraSection />
        <NewPricingSection />
        <TestimonialsSection />
        <SecuritySection />
        <FAQSection />
      </main>
      <NewFooter />
      
      <InteractiveDemo
        open={showDemo}
        onOpenChange={setShowDemo}
        onComplete={handleDemoComplete}
      />
    </div>
  );
};

export default Index;
