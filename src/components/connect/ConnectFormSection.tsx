import { motion } from "framer-motion";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ExternalLink } from "lucide-react";

interface ConnectFormSectionProps {
  typeformUrl?: string;
}

export const ConnectFormSection = forwardRef<HTMLDivElement, ConnectFormSectionProps>(
  ({ typeformUrl = "https://gtyclpasfkm.typeform.com/to/hJER83zj" }, ref) => {
    const formId = typeformUrl.split("/to/")[1] || "hJER83zj";
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      // Load Typeform embed script
      const script = document.createElement("script");
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;
      
      script.onload = () => {
        // Give Typeform a moment to initialize after script loads
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      };

      script.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };

      document.body.appendChild(script);

      // Timeout fallback - if Typeform doesn't load in 10 seconds, show error
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setHasError(true);
        }
      }, 10000);

      return () => {
        clearTimeout(timeout);
        const existingScript = document.querySelector('script[src="//embed.typeform.com/next/embed.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }, []);

    const handleOpenTypeform = () => {
      window.open(typeformUrl, "_blank", "noopener,noreferrer");
    };

    return (
      <section ref={ref} id="formulario" className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Aplique para uma{" "}
                <span className="text-primary">Cadeira Exclusiva</span>
              </h2>
              <p className="text-muted-foreground">
                Vagas limitadas. Acesso prioritário para os primeiros.
              </p>
            </div>

            {/* Typeform Embed Container */}
            <div
              className="bg-card border border-border rounded-2xl overflow-hidden relative"
              style={{ minHeight: "500px" }}
            >
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10">
                  <LoadingSpinner size="lg" className="text-primary" />
                  <p className="text-primary mt-4 font-medium">Carregando aplicação...</p>
                </div>
              )}

              {/* Error/Fallback State */}
              {hasError && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card z-10 px-6">
                  <p className="text-muted-foreground text-center mb-6">
                    O formulário está demorando para carregar.
                  </p>
                  <Button
                    onClick={handleOpenTypeform}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Aplicar em nova aba
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Typeform Widget */}
              <div
                data-tf-widget={formId}
                data-tf-opacity="100"
                data-tf-iframe-props="title=TribuTalks Connect Application"
                data-tf-transitive-search-params
                data-tf-medium="snippet"
                data-tf-on-ready={() => setIsLoading(false)}
                style={{ 
                  width: "100%", 
                  height: "500px",
                  opacity: isLoading || hasError ? 0 : 1,
                  transition: "opacity 0.3s ease"
                }}
              />
            </div>

            <p className="text-center text-sm text-primary mt-4">
              523 profissionais já na fila.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }
);

ConnectFormSection.displayName = "ConnectFormSection";
