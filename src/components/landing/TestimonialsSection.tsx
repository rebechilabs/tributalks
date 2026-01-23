import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Descobri em 5 minutos que estou no regime errado. Potencial de economia: R$47k/ano.",
    author: "Carlos Mendes",
    role: "CEO",
    company: "Logística Norte",
  },
  {
    quote: "Finalmente entendi quanto o Split Payment vai impactar meu caixa. Informação clara e direta.",
    author: "Fernanda Lima",
    role: "CFO",
    company: "TechSul",
  },
  {
    quote: "Simples, direto e útil. Exatamente o que um empresário precisa para tomar decisões.",
    author: "Ricardo Alves",
    role: "Diretor",
    company: "Indústria ABC",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Quem Testou Está Dizendo
          </h2>
          <p className="text-lg text-muted-foreground">
            Resultados reais de empresas reais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="relative bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Quote className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Quote Text */}
              <blockquote className="text-foreground text-lg leading-relaxed mb-6 pt-4">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
