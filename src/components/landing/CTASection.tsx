import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CONFIG } from "@/config/site";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4 md:mb-6 px-4">
            Transforme a Reforma Tributária
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>em vantagem competitiva
          </h2>

          <p className="text-base md:text-lg text-primary-foreground/80 mb-6 md:mb-8 px-4">
            Enquanto seus concorrentes vão descobrir o impacto tarde demais, 
            você já estará 3 passos à frente.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            disabled
            className="bg-primary-foreground/50 text-primary font-semibold px-8 py-6 text-lg cursor-not-allowed opacity-80"
          >
            Em breve
          </Button>

          {/* Guarantee Text */}
          <p className="text-xs md:text-sm text-primary-foreground/80 mt-4 md:mt-6">
            Em breve disponível.
          </p>
        </div>
      </div>
    </section>
  );
}
