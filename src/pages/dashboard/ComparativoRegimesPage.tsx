import { useState } from "react";
import { MotivationalBanner } from "@/components/common/MotivationalBanner";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { ComparativoRegimesWizard, ComparativoRegimesResults } from "@/components/comparativo-regimes";
import { ComparativoRegimesInput, ComparativoRegimesResult } from "@/types/comparativoRegimes";
import { calcularComparativoRegimes } from "@/utils/comparativoRegimesCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpButton } from "@/components/common/HelpButton";
import { Trash2, Calculator } from "lucide-react";

export default function ComparativoRegimesPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<ComparativoRegimesResult | null>(null);
  const [currentInput, setCurrentInput] = useState<ComparativoRegimesInput | null>(null);

  const saveSimulation = useMutation({
    mutationFn: async ({ input, result }: { input: ComparativoRegimesInput; result: ComparativoRegimesResult }) => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('simpronto_simulations')
        .insert({
          user_id: user.id,
          faturamento_anual: input.faturamento_anual,
          folha_pagamento: input.folha_pagamento,
          cnae_principal: input.cnae_principal || null,
          compras_insumos: input.compras_insumos,
          despesas_operacionais: input.despesas_operacionais || 0,
          margem_lucro: input.margem_lucro,
          perfil_clientes: input.perfil_clientes,
          resultados: result as any,
          regime_recomendado: result.recomendado,
          economia_estimada: result.economia_vs_segundo,
        });
      
      if (error) throw error;
    },
    onError: (error) => {
      console.error('Erro ao salvar simulação:', error);
    },
  });

  const handleSubmit = (input: ComparativoRegimesInput) => {
    const resultado = calcularComparativoRegimes(input);
    setCurrentInput(input);
    setResult(resultado);
    saveSimulation.mutate({ input, result: resultado });
    toast.success('Simulação concluída!');
  };

  const handleReset = () => {
    setResult(null);
    setCurrentInput(null);
  };

  return (
    <DashboardLayout title="Comparativo de Regimes">
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="comparativo_regimes">
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Comparativo de Regimes Tributários</h1>
                  <p className="text-muted-foreground">
                    Compare Simples Nacional, Lucro Presumido, Lucro Real e as novas opções de IBS/CBS 2027 (Por Dentro e Por Fora).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Zerar Cálculo
                </Button>
                <HelpButton toolSlug="comparativo-regimes" size="default" />
              </div>
            </div>
          </div>

          <MotivationalBanner
            id="comparativo"
            icon="⚖️"
            text="Informe seus dados e veja lado a lado qual regime tributário gera mais economia: Simples Nacional, Lucro Presumido, Lucro Real e as novas opções IBS/CBS 2027."
          />

          {!result ? (
            <ComparativoRegimesWizard 
              onSubmit={handleSubmit} 
              isLoading={saveSimulation.isPending}
            />
          ) : (
            <ComparativoRegimesResults 
              result={result} 
              input={currentInput!}
              onReset={handleReset} 
            />
          )}
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
