import { motion } from "framer-motion";
import { forwardRef, useEffect } from "react";

interface ConnectFormSectionProps {
  typeformUrl?: string;
}

export const ConnectFormSection = forwardRef<HTMLDivElement, ConnectFormSectionProps>(
  ({ typeformUrl = "https://form.typeform.com/to/PLACEHOLDER" }, ref) => {
    useEffect(() => {
      // Load Typeform embed script
      const script = document.createElement("script");
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[src="//embed.typeform.com/next/embed.js"]');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }, []);

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
              className="bg-card border border-border rounded-2xl overflow-hidden"
              style={{ minHeight: "500px" }}
            >
              <div
                data-tf-live={typeformUrl.split("/to/")[1] || "PLACEHOLDER"}
                style={{ width: "100%", height: "500px" }}
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
