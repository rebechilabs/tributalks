import { useRef } from "react";
import {
  ConnectHeader,
  ConnectHeroSection,
  ConnectFormSection,
  ConnectSolutionSection,
  ConnectPillarsSection,
  ConnectFoundersSection,
  ConnectCTASection,
  ConnectFooter,
} from "@/components/connect";

export default function Connect() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // TODO: Substituir pela URL real do Typeform
  const typeformUrl = "https://form.typeform.com/to/hJER83zj";

  return (
    <div className="min-h-screen bg-black">
      <ConnectHeader />
      <ConnectHeroSection onScrollToForm={scrollToForm} />
      <ConnectFormSection ref={formRef} typeformUrl={typeformUrl} />
      <ConnectSolutionSection />
      <ConnectPillarsSection />
      <ConnectFoundersSection />
      <ConnectCTASection onScrollToForm={scrollToForm} />
      <ConnectFooter />
    </div>
  );
}
