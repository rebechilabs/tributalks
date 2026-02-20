import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PrefillField {
  key: string;
  label: string;
  value: any;
  source: 'profile' | 'dre' | 'credits' | 'memory' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  editable?: boolean;
}

export interface MissingField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'ncm';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface SmartPrefillConfig {
  tool: 'rtc' | 'score' | 'dre' | 'priceguard' | 'omc';
}

interface SmartPrefillResult {
  preFilled: PrefillField[];
  missing: MissingField[];
  loading: boolean;
  userName: string | null;
  hasEnoughData: boolean;
  refresh: () => Promise<void>;
}

export function useSmartPrefill({ tool }: SmartPrefillConfig): SmartPrefillResult {
  const { user } = useAuth();
  const [preFilled, setPreFilled] = useState<PrefillField[]>([]);
  const [missing, setMissing] = useState<MissingField[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Buscar dados em paralelo
      const [profileRes, companyRes, dreRes, creditsRes] = await Promise.all([
        supabase.from('profiles').select('nome, email').eq('user_id', user.id).single(),
        supabase.from('company_profile').select('*').eq('user_id', user.id).single(),
        supabase.from('company_dre').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('identified_credits').select('ncm_code, product_description').eq('user_id', user.id).limit(10),
      ]);

      const profile = profileRes.data;
      const company = companyRes.data;
      const dre = dreRes.data;
      const credits = creditsRes.data || [];

      setUserName(profile?.nome || null);

      // Montar campos pré-preenchidos baseado na ferramenta
      const filled: PrefillField[] = [];
      const missingFields: MissingField[] = [];

      if (tool === 'rtc') {
        // Para calculadora RTC
        if (company?.uf_sede) {
          filled.push({
            key: 'uf',
            label: 'Estado',
            value: company.uf_sede,
            source: 'profile',
            confidence: 'high',
          });
        } else {
          missingFields.push({
            key: 'uf',
            label: 'Qual estado da operação?',
            type: 'select',
            required: true,
            options: [
              { value: 'SP', label: 'São Paulo' },
              { value: 'RJ', label: 'Rio de Janeiro' },
              { value: 'MG', label: 'Minas Gerais' },
              { value: 'RS', label: 'Rio Grande do Sul' },
              { value: 'PR', label: 'Paraná' },
              { value: 'SC', label: 'Santa Catarina' },
              { value: 'BA', label: 'Bahia' },
              { value: 'GO', label: 'Goiás' },
              // ... outros estados
            ],
          });
        }

        if (company?.municipio_sede) {
          filled.push({
            key: 'municipio',
            label: 'Município',
            value: company.municipio_sede,
            source: 'profile',
            confidence: 'high',
          });
        }

        // NCMs dos créditos identificados
        if (credits.length > 0) {
          const uniqueNcms = [...new Set(credits.map(c => c.ncm_code).filter(Boolean))];
          if (uniqueNcms.length > 0) {
            filled.push({
              key: 'ncms_sugeridos',
              label: 'NCMs identificados',
              value: uniqueNcms.slice(0, 5),
              source: 'credits',
              confidence: 'medium',
            });
          }
        }

        // Sempre precisa do NCM para simular
        if (credits.length === 0) {
          missingFields.push({
            key: 'ncm',
            label: 'Qual NCM deseja simular?',
            type: 'ncm',
            required: true,
            placeholder: 'Digite o código NCM ou nome do produto',
          });
        }
      }

      if (tool === 'score' || tool === 'dre') {
        // Regime tributário
        if (company?.regime_tributario) {
          filled.push({
            key: 'regime',
            label: 'Regime Tributário',
            value: company.regime_tributario,
            source: 'profile',
            confidence: 'high',
          });
        } else if (dre?.input_regime_tributario) {
          filled.push({
            key: 'regime',
            label: 'Regime Tributário (DRE)',
            value: dre.input_regime_tributario,
            source: 'dre',
            confidence: 'medium',
          });
        } else {
          missingFields.push({
            key: 'regime',
            label: 'Qual seu regime tributário?',
            type: 'select',
            required: true,
            options: [
              { value: 'simples', label: 'Simples Nacional' },
              { value: 'presumido', label: 'Lucro Presumido' },
              { value: 'real', label: 'Lucro Real' },
            ],
          });
        }

        // Faturamento
        if (company?.faturamento_mensal_medio) {
          filled.push({
            key: 'faturamento',
            label: 'Faturamento Mensal',
            value: company.faturamento_mensal_medio,
            source: 'profile',
            confidence: 'high',
          });
        } else if (dre?.calc_receita_bruta) {
          filled.push({
            key: 'faturamento',
            label: 'Receita (DRE)',
            value: dre.calc_receita_bruta,
            source: 'dre',
            confidence: 'medium',
          });
        } else {
          missingFields.push({
            key: 'faturamento',
            label: 'Qual seu faturamento mensal médio?',
            type: 'number',
            required: true,
            placeholder: 'Ex: 150000',
          });
        }

        // Setor
        if (company?.setor) {
          filled.push({
            key: 'setor',
            label: 'Setor',
            value: company.setor,
            source: 'profile',
            confidence: 'high',
          });
        }
      }

      if (tool === 'priceguard' || tool === 'omc') {
        // NCMs para simulação de margem
        if (credits.length > 0) {
          const ncmsComDescricao = credits
            .filter(c => c.ncm_code && c.product_description)
            .slice(0, 5)
            .map(c => ({ ncm: c.ncm_code, descricao: c.product_description }));
          
          if (ncmsComDescricao.length > 0) {
            filled.push({
              key: 'produtos',
              label: 'Produtos identificados',
              value: ncmsComDescricao,
              source: 'credits',
              confidence: 'medium',
            });
          }
        }

        // Margem atual (do DRE)
        if (dre?.calc_margem_bruta) {
          filled.push({
            key: 'margem_atual',
            label: 'Margem Bruta Atual',
            value: `${(dre.calc_margem_bruta * 100).toFixed(1)}%`,
            source: 'dre',
            confidence: 'high',
          });
        }
      }

      setPreFilled(filled);
      setMissing(missingFields);
    } catch (error) {
      console.error('Erro ao buscar dados para prefill:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tool]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasEnoughData = preFilled.length >= 2;

  return {
    preFilled,
    missing,
    loading,
    userName,
    hasEnoughData,
    refresh: fetchData,
  };
}
