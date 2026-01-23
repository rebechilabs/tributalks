import { UserPlus, Settings, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Complete seu perfil tributário em apenas 2 minutos com informações básicas da sua empresa.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Dados preenchidos",
    description: "Acesse as calculadoras com seus dados já preenchidos automaticamente.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Simule e decida",
    description: "Simule cenários e tome decisões com números reais baseados na sua operação.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground">
            Simples, rápido e direto ao ponto
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line (desktop only) */}
            <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number */}
                <div className="relative mx-auto w-40 h-40 mb-8">
                  <div className="absolute inset-0 rounded-full bg-primary/5" />
                  <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Arrow (mobile only) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-6">
                    <ArrowRight className="w-6 h-6 text-primary/40 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
