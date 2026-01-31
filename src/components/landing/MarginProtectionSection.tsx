import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight, CheckCircle2, TrendingUp, BadgeCheck, Calculator } from "lucide-react";
import { Link } from "react-router-dom";

export function MarginProtectionSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <Badge variant="default" className="mb-3 md:mb-4 text-xs md:text-sm gap-1">
            <Shield className="w-3 h-3" />
            Suíte Margem Ativa 2026
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 px-2">
            Proteja sua margem
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>na <span className="text-primary">transição tributária</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Simule o impacto da CBS/IBS no seu preço de venda e saiba exatamente 
            quanto ajustar para manter seu EBITDA.
          </p>
        </div>

        {/* Visual Flow */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
            {/* Step 1: Regime Atual */}
            <Card className="border-border bg-muted/30">
              <CardContent className="p-5 md:p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Regime Atual</h3>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">R$ 100,00</p>
                <p className="text-sm text-muted-foreground">PIS/COFINS 9,25%</p>
                <p className="text-sm text-muted-foreground">ICMS 18%</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Margem atual</p>
                  <p className="font-semibold text-foreground">18%</p>
                </div>
              </CardContent>
            </Card>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <ArrowRight className="w-8 h-8 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  Reforma 2027+
                </Badge>
              </div>
            </div>
            <div className="flex md:hidden items-center justify-center py-2">
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-border" />
                <ArrowRight className="w-5 h-5 text-primary rotate-90 md:rotate-0" />
                <div className="h-px w-8 bg-border" />
              </div>
            </div>

            {/* Step 2: 2027+ */}
            <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-bl-lg">
                CBS/IBS
              </div>
              <CardContent className="p-5 md:p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-primary mb-2">2027+ (Reforma)</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-1">R$ 108,50</p>
                <p className="text-sm text-muted-foreground">CBS 8,8%</p>
                <p className="text-sm text-muted-foreground">IBS 17,7%</p>
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs text-muted-foreground">Margem protegida</p>
                  <p className="font-semibold text-success flex items-center justify-center gap-1">
                    18% <CheckCircle2 className="w-4 h-4" />
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variation indicator */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm text-muted-foreground">Variação necessária:</span>
              <span className="font-bold text-primary text-lg">+8,5%</span>
              <span className="text-sm text-muted-foreground">para manter margem</span>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Alíquotas Reais</p>
                <p className="text-xs text-muted-foreground">Da Receita Federal por NCM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">OMC-AI</p>
                <p className="text-xs text-muted-foreground">Identifica vazamento em fornecedores</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">PriceGuard</p>
                <p className="text-xs text-muted-foreground">Protege seu EBITDA na transição</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/cadastro">
            <Button size="lg" className="gap-2">
              <Shield className="w-4 h-4" />
              Conhecer Suíte Margem Ativa
            </Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">Exclusivo Plano Professional</Badge>
          </p>
        </div>
      </div>
    </section>
  );
}
