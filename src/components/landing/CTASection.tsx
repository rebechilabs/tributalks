import { Button } from "@/components/ui/button";
import { ArrowRight, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-primary">
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
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary-foreground/10">
              <Navigation className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para navegar pela reforma
            <br />
            com confiança?
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8">
            Saiba onde você está, para onde a reforma vai te levar, e o que fazer em cada etapa.
          </p>

          {/* CTA Button */}
          <Link to="/cadastro">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 py-6 text-lg group"
            >
              Começar minha jornada
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          {/* Guarantee Text */}
          <p className="text-sm text-primary-foreground/80 mt-6">
            Sem cartão. Sem compromisso. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}
