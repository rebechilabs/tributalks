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
    <DashboardLayout title="Simpronto">
      <div className="container mx-auto px-4 py-6">
        <FeatureGate feature="comparativo_regimes">
          {!result ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Simpronto</h1>
                <p className="text-muted-foreground">
                  Compare 5 regimes tributários em minutos, incluindo as novas opções do Simples Nacional 2027.
                  Descubra qual é o mais econômico para o seu negócio.
                </p>
              </div>
              
              {/* Wizard */}
              <SimprontoWizard 
                onSubmit={handleSubmit} 
                isLoading={saveSimulation.isPending}
              />
            </>
          ) : (
            <>
              {/* Resultados */}
              <SimprontoResults 
                result={result} 
                input={currentInput!}
                onReset={handleReset} 
              />
            </>
          )}
        </FeatureGate>
      </div>
    </DashboardLayout>
  );
}
