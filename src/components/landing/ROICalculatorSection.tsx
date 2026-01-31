import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

export function ROICalculatorSection() {
  const [faturamento, setFaturamento] = useState([10]); // em milhões

  const faturamentoValue = faturamento[0];
  // Economia conservadora: 1.8% do faturamento anual
  const economiaEstimada = faturamentoValue * 1000000 * 0.018;
  // Investimento Professional: R$ 2.997 * 12
  const investimentoAnual = 2997 * 12;
  const roi = Math.round(economiaEstimada / investimentoAnual);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-10 border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calculator className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">
                Calcule Seu ROI Estimado
              </h3>
            </div>

            <div className="space-y-6">
              {/* Slider */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm text-muted-foreground">
                    Faturamento anual:
                  </label>
                  <span className="text-2xl font-bold text-foreground">
                    R$ {faturamentoValue}M
                  </span>
                </div>
                <Slider
                  value={faturamento}
                  onValueChange={setFaturamento}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>R$ 1M</span>
                  <span>R$ 100M</span>
                </div>
              </div>

              {/* Results */}
              <div className="border-t border-border pt-6">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                    {formatCurrency(economiaEstimada)}/ano
                  </div>
                  <div className="text-muted-foreground mb-4">
                    Economia estimada (conservador: 1.8% do faturamento)
                  </div>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-muted-foreground">
                      Investimento TribuTalks Pro:{" "}
                      <span className="text-foreground font-medium">
                        R$ {investimentoAnual.toLocaleString("pt-BR")}/ano
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary mt-2">
                      ROI de {roi}x
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-center text-muted-foreground">
                * Estimativa baseada em resultados médios de clientes. 
                O retorno real pode variar conforme perfil da empresa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
