import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Descobri em 5 minutos que estou no regime errado. Potencial de economia: R$47k/ano.",
    author: "Carlos Mendes",
    role: "CEO",
    company: "Logística Norte",
  },
  {
    quote:
      "Finalmente entendi quanto o Split Payment vai impactar meu caixa. Números que ninguém tinha me mostrado.",
    author: "Fernanda Lima",
    role: "CFO",
    company: "TechSul",
  },
  {
    quote:
      "A Clara AI respondeu em 10 segundos uma dúvida que eu ia pagar R$500 pra um consultor.",
    author: "Ricardo Alves",
    role: "Diretor Financeiro",
    company: "Indústria ABC",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            O que nossos usuários dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className="relative bg-secondary rounded-xl p-5 md:p-8 border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="text-primary text-3xl md:text-4xl font-serif mb-2 md:mb-4">"</div>

              {/* Quote Text */}
              <blockquote className="text-foreground text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                {testimonial.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-base md:text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm md:text-base">
                    {testimonial.author}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mt-3 md:mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary fill-primary"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
