import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ConnectHeroSectionProps {
  onScrollToForm: () => void;
}

export function ConnectHeroSection({ onScrollToForm }: ConnectHeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1510851896000-498520af2236?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Liderar é solitário. Até você encontrar a sala certa.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10">
            Não é só networking. É o conselho de negócios que todo líder
            gostaria de ter — mas nunca teve.
          </p>

          <Button
            size="lg"
            onClick={onScrollToForm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base md:text-lg group"
          >
            Aplique para uma Cadeira Exclusiva
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
