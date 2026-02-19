import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/contexts/CompanyContext';
import { StepIntro } from './StepIntro';
import { StepQuestions } from './StepQuestions';
import { StepProcessing } from './StepProcessing';
import { StepResults } from './StepResults';
import type { OpportunityData } from './OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';

const REQUIRED_KEYS = ['regime_tributario', 'setor', 'faturamento_anual', 'num_funcionarios', 'uf_sede'] as const;

type Step = 'intro' | 'questions' | 'processing' | 'results';

// Fallback opportunities by regime
const FALLBACK_BY_REGIME: Record<string, OpportunityData[]> = {
  simples: [
    { name: 'Revisão de Enquadramento no Simples', description: 'Verifique se o Simples Nacional ainda é o regime mais vantajoso.', economia_anual_min: 5000, economia_anual_max: 30000, complexidade: 'baixa', alto_impacto: false, is_fallback: true },
    { name: 'Exclusão de ICMS-ST', description: 'Produtos com substituição tributária podem gerar créditos.', economia_anual_min: 3000, economia_anual_max: 20000, complexidade: 'media', alto_impacto: false, is_fallback: true },
    { name: 'Fator R – Anexo III vs V', description: 'Empresas de serviços podem reduzir a alíquota via folha de pagamento.', economia_anual_min: 4000, economia_anual_max: 25000, complexidade: 'baixa', alto_impacto: false, is_fallback: true },
  ],
  presumido: [
    { name: 'Revisão de Alíquota Presumida', description: 'Verifique se a presunção de lucro está correta para a sua atividade.', economia_anual_min: 8000, economia_anual_max: 60000, complexidade: 'media', alto_impacto: true, is_fallback: true },
    { name: 'Créditos de PIS/COFINS', description: 'Identifique créditos não aproveitados sobre insumos e despesas.', economia_anual_min: 5000, economia_anual_max: 40000, complexidade: 'media', alto_impacto: false, is_fallback: true },
    { name: 'Planejamento de Pró-labore', description: 'Otimize a distribuição entre pró-labore e dividendos.', economia_anual_min: 3000, economia_anual_max: 20000, complexidade: 'baixa', alto_impacto: false, is_fallback: true },
  ],
  lucro_real: [
    { name: 'Créditos de PIS/COFINS', description: 'Maximize créditos sobre insumos, fretes e despesas operacionais.', economia_anual_min: 15000, economia_anual_max: 120000, complexidade: 'media', alto_impacto: true, is_fallback: true },
    { name: 'Incentivos Fiscais de P&D (Lei do Bem)', description: 'Deduza até 60% dos gastos com inovação do IRPJ/CSLL.', economia_anual_min: 20000, economia_anual_max: 200000, complexidade: 'alta', alto_impacto: true, is_fallback: true },
    { name: 'Revisão de IRPJ/CSLL', description: 'Identifique despesas dedutíveis não contabilizadas.', economia_anual_min: 10000, economia_anual_max: 80000, complexidade: 'media', alto_impacto: false, is_fallback: true },
  ],
};

function getMissingFields(profile: Record<string, unknown> | null): string[] {
  if (!profile) return [...REQUIRED_KEYS];
  return REQUIRED_KEYS.filter(k => {
    const v = profile[k];
    return v === null || v === undefined || v === '';
  });
}

export function PlanejarFlow() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [step, setStep] = useState<Step>('intro');
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [totalMin, setTotalMin] = useState(0);
  const [totalMax, setTotalMax] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const visualDone = useRef(false);
  const dataDone = useRef(false);
  const dataResult = useRef<{ opps: OpportunityData[]; min: number; max: number; count: number } | null>(null);

  // Fetch full company profile
  const { data: companyProfile, isLoading, refetch } = useQuery({
    queryKey: ['company-profile-planejar', currentCompany?.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      let query = supabase.from('company_profile').select('*');
      if (currentCompany?.id) {
        query = query.eq('id', currentCompany.id);
      } else {
        query = query.eq('user_id', user.id);
      }
      const { data } = await query.maybeSingle();
      return data as Record<string, unknown> | null;
    },
    enabled: !!user?.id,
  });

  const missingFields = getMissingFields(companyProfile);

  const handleIntroNext = useCallback(() => {
    if (missingFields.length > 0) {
      setStep('questions');
    } else {
      setStep('processing');
    }
  }, [missingFields.length]);

  const handleQuestionsComplete = useCallback(async (answers: Record<string, string | number>) => {
    // Save answers to company_profile
    if (companyProfile?.id && user?.id) {
      await supabase
        .from('company_profile')
        .update(answers as Record<string, unknown>)
        .eq('id', companyProfile.id as string)
        .eq('user_id', user.id);
      refetch();
    }
    setStep('processing');
  }, [companyProfile?.id, user?.id, refetch]);

  const finalizeResults = useCallback(() => {
    if (dataResult.current) {
      setOpportunities(dataResult.current.opps);
      setTotalMin(dataResult.current.min);
      setTotalMax(dataResult.current.max);
      setTotalCount(dataResult.current.count);
      setStep('results');
    }
  }, []);

  const onVisualComplete = useCallback(() => {
    visualDone.current = true;
    if (dataDone.current) finalizeResults();
  }, [finalizeResults]);

  // Call match-opportunities when entering processing step
  useEffect(() => {
    if (step !== 'processing') return;

    visualDone.current = false;
    dataDone.current = false;
    dataResult.current = null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('match-opportunities', {
          body: { user_id: user?.id, company_id: currentCompany?.id },
        });

        clearTimeout(timeout);

        if (error || !data?.success) throw new Error('Edge function failed');

        // Rank: alto_impacto first, then complexidade (baixa < media < alta), then economia desc
        const compOrder: Record<string, number> = { muito_baixa: 0, baixa: 1, media: 2, alta: 3, muito_alta: 4 };
        const sorted = [...(data.opportunities || [])].sort((a: OpportunityData, b: OpportunityData) => {
          if (a.alto_impacto && !b.alto_impacto) return -1;
          if (!a.alto_impacto && b.alto_impacto) return 1;
          const ca = compOrder[a.complexidade || 'media'] ?? 2;
          const cb = compOrder[b.complexidade || 'media'] ?? 2;
          if (ca !== cb) return ca - cb;
          return (b.economia_anual_max || 0) - (a.economia_anual_max || 0);
        });

        dataResult.current = {
          opps: sorted.slice(0, 3),
          min: data.economia_anual_min || 0,
          max: data.economia_anual_max || 0,
          count: data.total_opportunities || 0,
        };
      } catch {
        // Fallback
        const regime = String(companyProfile?.regime_tributario || 'simples');
        const normalizedRegime = regime.includes('real') ? 'lucro_real' : regime.includes('presumido') ? 'presumido' : 'simples';
        dataResult.current = {
          opps: FALLBACK_BY_REGIME[normalizedRegime] || FALLBACK_BY_REGIME.simples,
          min: 0,
          max: 0,
          count: 0,
        };
      } finally {
        clearTimeout(timeout);
        dataDone.current = true;
        if (visualDone.current) finalizeResults();
      }
    })();

    return () => { clearTimeout(timeout); controller.abort(); };
  }, [step, user?.id, currentCompany?.id, companyProfile?.regime_tributario, finalizeResults]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {step === 'intro' && (
        <StepIntro
          company={companyProfile as Record<string, unknown> | null}
          missingCount={missingFields.length}
          onNext={handleIntroNext}
        />
      )}
      {step === 'questions' && (
        <StepQuestions
          missingFields={missingFields}
          onComplete={handleQuestionsComplete}
        />
      )}
      {step === 'processing' && (
        <StepProcessing onVisualComplete={onVisualComplete} />
      )}
      {step === 'results' && (
        <StepResults
          opportunities={opportunities}
          totalMin={totalMin}
          totalMax={totalMax}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}
