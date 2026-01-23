const steps = [
  {
    number: "1",
    title: "Crie sua conta e complete seu perfil tributário",
    description: "(2 minutos)",
  },
  {
    number: "2",
    title: "Acesse as calculadoras com seus dados já preenchidos",
    description: "",
  },
  {
    number: "3",
    title: "Simule cenários e tire dúvidas com o TribuBot",
    description: "",
  },
  {
    number: "4",
    title: "Tome decisões com números reais, não achismo",
    description: "",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simples assim
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex items-start gap-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">
                  {step.number}
                </span>
              </div>

              {/* Step Content */}
              <div className="pt-2">
                <p className="text-lg text-foreground">
                  {step.title}
                  {step.description && (
                    <span className="text-muted-foreground"> {step.description}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
