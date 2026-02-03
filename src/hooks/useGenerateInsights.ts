import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Hook que dispara a geração de insights proativos da Clara
 * Executa uma vez por sessão ao carregar o Dashboard
 */
export function useGenerateInsights() {
  const { user } = useAuth();
  const hasGenerated = useRef(false);

  useEffect(() => {
    const generateInsights = async () => {
      if (!user?.id || hasGenerated.current) return;
      
      hasGenerated.current = true;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Chama a Edge Function para gerar insights baseados nos dados atuais
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-clara-insights`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.warn('Insights generation failed:', response.status);
          return;
        }

        const result = await response.json();
        if (result.newInsightsCount > 0) {
          console.log(`Clara gerou ${result.newInsightsCount} novos insights`);
        }
      } catch (error) {
        console.warn('Error generating insights:', error);
      }
    };

    // Delay para não bloquear o carregamento inicial
    const timer = setTimeout(generateInsights, 3000);
    return () => clearTimeout(timer);
  }, [user?.id]);
}
