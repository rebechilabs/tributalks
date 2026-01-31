import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ArrowRight, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ExpiringBenefit } from "@/hooks/useDashboardData";

interface ExpiringBenefitsAlertProps {
  benefits: ExpiringBenefit[];
}

export function ExpiringBenefitsAlert({ benefits }: ExpiringBenefitsAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || benefits.length === 0) {
    return null;
  }

  const getStatusLabel = (futuro: string) => {
    const labels: Record<string, string> = {
      extinto: "Será EXTINTO",
      substituido: "Será SUBSTITUÍDO",
      reduzido: "Será REDUZIDO",
      em_analise: "Em ANÁLISE",
    };
    return labels[futuro] || futuro;
  };

  const getUrgencyColor = (months: number) => {
    if (months <= 3) return "text-destructive";
    if (months <= 6) return "text-orange-500";
    return "text-yellow-500";
  };

  const totalImpact = benefits.reduce((sum, b) => sum + b.economia_mensal * 12, 0);

  return (
    <Alert variant="destructive" className="mb-6 relative border-destructive/50 bg-destructive/10">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>

      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        {benefits.length} benefício{benefits.length > 1 ? "s" : ""} em risco com a Reforma
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="space-y-2 mb-4">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${getUrgencyColor(benefit.months_until_expiry)}`} />
                <span className="font-medium">{benefit.name}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="text-xs">{getStatusLabel(benefit.futuro_reforma)}</span>
                <span className={`font-medium ${getUrgencyColor(benefit.months_until_expiry)}`}>
                  {benefit.months_until_expiry}m
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalImpact > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Impacto potencial: <span className="font-semibold text-foreground">
              R$ {totalImpact.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano
            </span>
          </p>
        )}

        <Button asChild size="sm" variant="outline" className="gap-2">
          <Link to="/dashboard/oportunidades">
            Ver alternativas e plano de ação
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
