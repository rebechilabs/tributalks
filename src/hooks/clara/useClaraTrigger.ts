import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook para disparar triggers de ações autônomas da Clara.
 * Use este hook em componentes que detectam eventos importantes.
 */
export function useClaraTrigger() {
  const { user } = useAuth();

  const trigger = useCallback(async (
    event: string,
    triggerData?: Record<string, unknown>
  ): Promise<boolean> => {
    if (!user?.id) {
      console.warn("[ClaraTrigger] Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase.functions.invoke("trigger-autonomous-actions", {
        body: {
          event,
          user_id: user.id,
          trigger_data: triggerData || {},
        },
      });

      if (error) {
        console.error("[ClaraTrigger] Erro:", error);
        return false;
      }

      console.log(`[ClaraTrigger] Evento ${event} disparado com sucesso`);
      return true;
    } catch (error) {
      console.error("[ClaraTrigger] Erro inesperado:", error);
      return false;
    }
  }, [user?.id]);

  // Triggers pré-definidos para facilitar o uso
  const triggers = {
    xmlImported: (count: number) => 
      trigger("xml_imported", { xml_count: count }),
    
    scoreBelowThreshold: (score: number) => 
      score < 60 && trigger("score_below_60", { score }),
    
    dctfGapDetected: (gap: number) => 
      trigger("dctf_gap_detected", { gap_value: gap }),
    
    marginDrop: (currentMargin: number, previousMargin: number) => {
      const drop = previousMargin - currentMargin;
      return drop >= 5 && trigger("margin_drop_5pp", { 
        current: currentMargin, 
        previous: previousMargin, 
        drop 
      });
    },
    
    dreUpdated: () => 
      trigger("dre_updated"),
    
    deadlineApproaching: (days: number, deadline: string) => 
      days <= 7 && trigger("deadline_7_days", { days, deadline }),
    
    benefitExpiring: (benefitId: string, expiresAt: string) => 
      trigger("benefit_expiring", { benefit_id: benefitId, expires_at: expiresAt }),
  };

  return { trigger, triggers };
}
