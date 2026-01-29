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
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              Exclusivo TribuTalks
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compliance Tributário = 
              <span className="text-primary"> Valuation</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em processos de M&A, empresas com score A+ valem até <strong className="text-success">15% mais</strong> do que empresas com passivos tributários ocultos.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Visual Chart */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-2xl border border-border p-6 md:p-8">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Impacto do Score no Valuation
                </h3>
                
                {/* Impact Bars */}
                <div className="space-y-4">
                  {complianceImpact.map((item, index) => (
                    <div key={item.grade} className="flex items-center gap-4">
                      <div className="w-16 text-center">
                        <span className="text-lg font-bold text-foreground">{item.grade}</span>
                      </div>
                      <div className="flex-1 relative h-10">
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
                          <span className="text-xs font-bold text-white px-2">
                            {item.adjustment}
                          </span>
                        </div>
                        {/* Center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                      </div>
                      <div className="w-32 text-right">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUp className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Prêmio no valuation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowDown className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">Desconto no valuation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-success/10 h-fit">
                    <Target className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Due Diligence mais rápida
                    </h4>
                    <p className="text-muted-foreground">
                      Empresas com compliance tributário organizado fecham transações até 40% mais rápido. 
                      Menos tempo = menos custo de M&A.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 h-fit">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Menor risco percebido
                    </h4>
                    <p className="text-muted-foreground">
                      Passivos tributários ocultos são o principal motivo de desvalorização em negociações. 
                      Score A elimina essa objeção.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-warning/10 h-fit">
                    <TrendingUp className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Múltiplo de EBITDA maior
                    </h4>
                    <p className="text-muted-foreground">
                      Investidores aplicam múltiplos maiores em empresas com governança tributária sólida. 
                      O mesmo EBITDA vale mais.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">
                  Descubra quanto vale sua empresa
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  O Painel Executivo do plano Professional inclui estimativa de valuation 
                  baseada no seu EBITDA, setor e score de compliance.
                </p>
                <Button asChild className="gap-2">
                  <Link to="/#planos">
                    Ver plano Professional
                    <ArrowUp className="w-4 h-4 rotate-45" />
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
