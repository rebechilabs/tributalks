import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, ArrowRight, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExpiringBenefit {
  id: string;
  name: string;
  futuro_reforma: string;
  months_until_expiry: number;
  economia_mensal: number;
}

export function ExpiringBenefitsAlert() {
  const { user } = useAuth();
  const [expiringBenefits, setExpiringBenefits] = useState<ExpiringBenefit[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchExpiringBenefits = async () => {
      try {
        // Get user's active opportunities with reform impact
        const { data: opportunities, error } = await supabase
          .from("company_opportunities")
          .select(`
            id,
            economia_mensal_min,
            economia_mensal_max,
            tax_opportunities:opportunity_id (
              name,
              futuro_reforma,
              validade_ate
            )
          `)
          .eq("user_id", user.id)
          .in("status", ["nova", "analisando", "implementando", "implementada"]);

        if (error) throw error;

        const now = new Date();
        const criticalBenefits: ExpiringBenefit[] = [];

        // Key dates
        const transitionDates = {
          cbs_start: new Date("2026-01-01"),
          icms_ibs_transition: new Date("2027-01-01"),
          full_transition: new Date("2033-01-01"),
        };

        for (const opp of opportunities || []) {
          const taxOpp = opp.tax_opportunities as any;
          if (!taxOpp || taxOpp.futuro_reforma === "mantido") continue;

          let expiryDate: Date | null = null;

          if (taxOpp.validade_ate) {
            expiryDate = new Date(taxOpp.validade_ate);
          } else if (taxOpp.futuro_reforma === "extinto") {
            expiryDate = transitionDates.cbs_start;
          } else if (taxOpp.futuro_reforma === "substituido" || taxOpp.futuro_reforma === "reduzido") {
            expiryDate = transitionDates.icms_ibs_transition;
          } else if (taxOpp.futuro_reforma === "em_analise") {
            expiryDate = transitionDates.full_transition;
          }

          if (!expiryDate) continue;

          const monthsUntilExpiry = Math.floor(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );

          // Only show critical (< 12 months)
          if (monthsUntilExpiry <= 12) {
            criticalBenefits.push({
              id: opp.id,
              name: taxOpp.name,
              futuro_reforma: taxOpp.futuro_reforma,
              months_until_expiry: monthsUntilExpiry,
              economia_mensal: ((opp.economia_mensal_min || 0) + (opp.economia_mensal_max || 0)) / 2,
            });
          }
        }

        // Sort by urgency (months until expiry)
        criticalBenefits.sort((a, b) => a.months_until_expiry - b.months_until_expiry);

        setExpiringBenefits(criticalBenefits.slice(0, 3)); // Show top 3
      } catch (error) {
        console.error("Error fetching expiring benefits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringBenefits();
  }, [user]);

  if (loading || dismissed || expiringBenefits.length === 0) {
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

  const totalImpact = expiringBenefits.reduce((sum, b) => sum + b.economia_mensal * 12, 0);

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
        {expiringBenefits.length} benefício{expiringBenefits.length > 1 ? "s" : ""} em risco com a Reforma
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="space-y-2 mb-4">
          {expiringBenefits.map((benefit) => (
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
