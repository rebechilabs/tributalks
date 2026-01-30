import { TrendingUp, ArrowUp, ArrowDown, Target, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const complianceImpact = [
  { grade: "A+/A", adjustment: "+15%", color: "bg-success", label: "Due Diligence limpa" },
  { grade: "B", adjustment: "+5%", color: "bg-primary", label: "Risco baixo" },
  { grade: "C", adjustment: "0%", color: "bg-muted", label: "Neutro" },
  { grade: "D", adjustment: "-15%", color: "bg-warning", label: "Passivos ocultos" },
  { grade: "E", adjustment: "-30%", color: "bg-destructive", label: "Alto risco" },
];

export function ValuationImpactSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 md:mb-16">
            <Badge variant="outline" className="mb-3 md:mb-4 text-primary border-primary text-xs md:text-sm">
              Exclusivo TribuTalks
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-2">
              Compliance Tributário = 
              <span className="text-primary"> Valuation</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Em processos de M&A, empresas com score A+ valem até <strong className="text-success">15% mais</strong> do que empresas com passivos tributários ocultos.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left - Visual Chart */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-2xl border border-border p-4 md:p-8">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Impacto do Score no Valuation
                </h3>
                
                {/* Impact Bars */}
                <div className="space-y-3 md:space-y-4">
                  {complianceImpact.map((item, index) => (
                    <div key={item.grade} className="flex items-center gap-2 md:gap-4">
                      <div className="w-10 md:w-16 text-center">
                        <span className="text-sm md:text-lg font-bold text-foreground">{item.grade}</span>
                      </div>
                      <div className="flex-1 relative h-8 md:h-10">
                        {/* Background bar */}
                        <div className="absolute inset-0 bg-muted rounded-lg" />
                        {/* Value bar */}
                        <div 
                          className={`absolute left-1/2 h-full ${item.color} rounded-lg transition-all duration-500 flex items-center justify-center`}
                          style={{ 
                            width: item.adjustment.startsWith('+') 
                              ? `${parseInt(item.adjustment) * 2}%` 
                              : item.adjustment.startsWith('-')
                              ? `${Math.abs(parseInt(item.adjustment)) * 2}%`
                              : '4px',
                            transform: item.adjustment.startsWith('-') 
                              ? 'translateX(-100%)' 
                              : item.adjustment === '0%' 
                              ? 'translateX(-50%)' 
                              : 'none',
                            animationDelay: `${index * 100}ms`
                          }}
                        >
                          <span className="text-[10px] md:text-xs font-bold text-white px-1 md:px-2">
                            {item.adjustment}
                          </span>
                        </div>
                        {/* Center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                      </div>
                      <div className="w-20 md:w-32 text-right">
                        <span className="text-[10px] md:text-sm text-muted-foreground">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                    <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-success" />
                    <span className="text-muted-foreground">Prêmio</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                    <ArrowDown className="w-3 h-3 md:w-4 md:h-4 text-destructive" />
                    <span className="text-muted-foreground">Desconto</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div className="space-y-4 md:space-y-6">
                <div className="flex gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-success/10 h-fit flex-shrink-0">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">
                      Due Diligence mais rápida
                    </h4>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Empresas com compliance organizado fecham transações até 40% mais rápido.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-primary/10 h-fit flex-shrink-0">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">
                      Menor risco percebido
                    </h4>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Passivos ocultos são o principal motivo de desvalorização. Score A elimina essa objeção.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl bg-warning/10 h-fit flex-shrink-0">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">
                      Múltiplo de EBITDA maior
                    </h4>
                    <p className="text-xs md:text-base text-muted-foreground">
                      Investidores aplicam múltiplos maiores em empresas com governança tributária sólida.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-primary/10 rounded-xl p-4 md:p-6 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">
                  Descubra quanto vale sua empresa
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  O Painel Executivo do plano Professional inclui estimativa de valuation 
                  baseada no seu EBITDA, setor e score.
                </p>
                <Button asChild className="gap-2 text-sm md:text-base">
                  <Link to="/#planos">
                    Ver plano Professional
                    <ArrowUp className="w-3.5 h-3.5 md:w-4 md:h-4 rotate-45" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
