import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SimprontoWizard, SimprontoResults } from "@/components/simpronto";
import { SimprontoInput, SimprontoResult } from "@/types/simpronto";
import { calcularSimpronto } from "@/utils/simprontoCalculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HelpButton } from "@/components/common/HelpButton";
import { Trash2, Calculator } from "lucide-react";

export default function SimprontoPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<SimprontoResult | null>(null);
  const [currentInput, setCurrentInput] = useState<SimprontoInput | null>(null);

  // Mutation para salvar simulação
  const saveSimulation = useMutation({
    mutationFn: async ({ input, result }: { input: SimprontoInput; result: SimprontoResult }) => {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('simpronto_simulations')
        .insert({
          user_id: user.id,
          faturamento_anual: input.faturamento_anual,
          folha_pagamento: input.folha_pagamento,
          cnae_principal: input.cnae_principal || null,
          compras_insumos: input.compras_insumos,
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
      // Não mostra erro ao usuário, apenas loga
    },
  });

  // Handler de submit do wizard
  const handleSubmit = (input: SimprontoInput) => {
    // Calcular resultado
    const resultado = calcularSimpronto(input);
    
    // Salvar no state
    setCurrentInput(input);
    setResult(resultado);
    
    // Salvar no banco (async, não bloqueia UI)
    saveSimulation.mutate({ input, result: resultado });
    
    toast.success('Simulação concluída!');
  };

  // Reset para nova simulação
  const handleReset = () => {
    setResult(null);
    setCurrentInput(null);
  };

  return (
    <DashboardLayout title="Comparativo de Regimes">
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="simpronto">
          {/* Header */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Comparativo de Regimes Tributários</h1>
                  <p className="text-muted-foreground">
                    Compare Simples Nacional, Lucro Presumido, Lucro Real e as novas opções do Simples 2027 (Por Dentro e Por Fora).
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

          {!result ? (
            <SimprontoWizard 
              onSubmit={handleSubmit} 
              isLoading={saveSimulation.isPending}
            />
          ) : (
            <SimprontoResults 
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
