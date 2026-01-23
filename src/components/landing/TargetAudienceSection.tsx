import { Check, X } from "lucide-react";

export function TargetAudienceSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Para Quem É
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For whom it IS */}
            <div className="bg-success/5 border border-success/20 rounded-2xl p-8 text-left">
              <h3 className="text-lg font-semibold text-success mb-6 flex items-center gap-2">
                <Check className="w-5 h-5" />
                É para você se:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Faturamento acima de R$1 milhão por mês</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Lucro Presumido ou Lucro Real</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Empresário ou CFO que toma decisões tributárias</span>
                </li>
              </ul>
            </div>

            {/* For whom it's NOT */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 text-left">
              <h3 className="text-lg font-semibold text-destructive mb-6 flex items-center gap-2">
                <X className="w-5 h-5" />
                Não é para você se:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">MEI ou Microempresa</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Simples Nacional com faturamento baixo</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Busca apenas informação básica</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
