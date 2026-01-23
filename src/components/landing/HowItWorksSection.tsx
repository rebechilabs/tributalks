import { UserPlus, ClipboardCheck, BotMessageSquare, Target } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Crie sua conta gratuita",
  },
  {
    number: "2",
    icon: ClipboardCheck,
    title: "Complete seu perfil em 2min",
  },
  {
    number: "3",
    icon: BotMessageSquare,
    title: "Simule e tire dúvidas com IA",
  },
  {
    number: "4",
    icon: Target,
    title: "Tome decisões com confiança",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Como funciona
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line - Desktop Only */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-border" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center animate-fade-in-up relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number Circle */}
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 relative z-10">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {step.number}
                  </span>
                </div>

                {/* Step Title */}
                <p className="text-foreground font-medium">{step.title}</p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden text-primary text-2xl my-2">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
