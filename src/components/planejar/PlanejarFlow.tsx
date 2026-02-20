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

const REQUIRED_KEYS = ['regime_tributario', 'segmento', 'setor', 'faturamento_anual', 'num_funcionarios', 'uf_sede', 'municipio_sede', 'tags_operacao'] as const;
const QUALITATIVE_KEYS = ['desafio_principal', 'descricao_operacao', 'nivel_declaracao', 'num_socios', 'socios_outras_empresas', 'distribuicao_lucros'] as const;
const EXPLORATORY_KEYS = ['folha_acima_28pct', 'folha_faixa', 'tem_st_icms', 'creditos_pis_cofins_pendentes', 'usa_jcp', 'creditos_icms_exportacao', 'usa_ret', 'conhece_imunidade_issqn', 'conhece_pep_sp', 'margem_liquida_faixa', 'mix_b2b_faixa', 'alto_volume_compras_nfe'] as const;
const COMPLEMENTARY_KEYS = ['exporta_produtos', 'importa_produtos', 'tem_estoque', 'tem_ecommerce', 'descricao_atividade'] as const;

type Step = 'intro' | 'questions' | 'processing' | 'complementary' | 'results';

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
  if (!profile) return [...REQUIRED_KEYS, ...QUALITATIVE_KEYS, ...EXPLORATORY_KEYS];
  const missing = REQUIRED_KEYS.filter(k => {
    const v = profile[k];
    if (k === 'tags_operacao') {
      return !Array.isArray(v) || v.length === 0;
    }
    return v === null || v === undefined || v === '';
  });
  const missingQualitative = QUALITATIVE_KEYS.filter(k => {
    const v = profile[k];
    return v === null || v === undefined || v === '';
  });
  const missingExploratory = EXPLORATORY_KEYS.filter(k => {
    const v = profile[k];
    return v === null || v === undefined || v === '';
  });
  return [...missing, ...missingQualitative, ...missingExploratory];
}

function getComplementaryFields(profile: Record<string, unknown> | null): string[] {
  if (!profile) return [...COMPLEMENTARY_KEYS];
  return COMPLEMENTARY_KEYS.filter(k => {
    const v = profile[k];
    return v === null || v === undefined || v === '';
  });
}

function sortOpportunities(opps: OpportunityData[]): OpportunityData[] {
  const riskOrder: Record<string, number> = { baixo: 0, medio: 1, alto: 2 };
  const compOrder: Record<string, number> = { muito_baixa: 0, baixa: 1, media: 2, alta: 3, muito_alta: 4 };
  return [...opps].sort((a, b) => {
    const scoreA = a.match_score ?? 0;
    const scoreB = b.match_score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const ra = riskOrder[a.risco_fiscal || 'medio'] ?? 1;
    const rb = riskOrder[b.risco_fiscal || 'medio'] ?? 1;
    if (ra !== rb) return ra - rb;
    const ca = compOrder[a.complexidade || 'media'] ?? 2;
    const cb = compOrder[b.complexidade || 'media'] ?? 2;
    return ca - cb;
  });
}

function getFallbackOpps(regime: string): OpportunityData[] {
  const normalizedRegime = regime.includes('real') ? 'lucro_real' : regime.includes('presumido') ? 'presumido' : 'simples';
  return FALLBACK_BY_REGIME[normalizedRegime] || FALLBACK_BY_REGIME.simples;
}

/**
 * Frontend injection: Regime review opportunity for Simples >= R$2M
 */
function injectRegimeReview(opps: OpportunityData[], profile: Record<string, unknown> | null): OpportunityData[] {
  if (!profile) return opps;
  const regime = String(profile.regime_tributario || '');
  const faturamento = Number(profile.faturamento_anual || 0);

  if (regime === 'simples' && faturamento >= 2000000) {
    // Check if already present from backend
    const alreadyHas = opps.some(o => o.id === 'regime-review' || o.name?.toLowerCase().includes('revisão de regime'));
    if (!alreadyHas) {
      const isUrgent = faturamento >= 3600000;
      opps.unshift({
        id: 'regime-review',
        name: 'Revisão de Regime Tributário',
        description: 'Seu faturamento indica que o Simples Nacional pode não ser o regime mais vantajoso. Uma simulação comparativa pode revelar economia expressiva.',
        economia_anual_min: 0,
        economia_anual_max: 0,
        impact_label: 'alto',
        impact_basis: 'proxy',
        complexidade: 'baixa',
        alto_impacto: true,
        urgency: isUrgent ? 'alta' : undefined,
        futuro_reforma: 'reforma_2027',
        descricao_reforma: 'A Reforma Tributária altera alíquotas efetivas por regime a partir de 2027. A janela ideal para mudança é início de 2026.',
        match_reasons: ['Faturamento acima de R$ 2M no Simples merece simulação comparativa'],
        match_score: isUrgent ? 95 : 80,
      });
    }
  }
  return opps;
}

export function PlanejarFlow() {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const [step, setStep] = useState<Step>('intro');
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [totalMin, setTotalMin] = useState(0);
  const [totalMax, setTotalMax] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isRetry, setIsRetry] = useState(false);
  const visualDone = useRef(false);
  const dataDone = useRef(false);
  const dataResult = useRef<{ opps: OpportunityData[]; min: number; max: number; count: number } | null>(null);

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

  const convertAnswerFields = (answers: Record<string, string | number | string[]>): Record<string, unknown> => {
    const BOOL_KEYS = ['exporta_produtos', 'importa_produtos', 'tem_estoque', 'tem_ecommerce', 'alto_volume_compras_nfe'];
    const converted: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(answers)) {
      if (k === 'tags_operacao') {
        // Already an array
        converted[k] = v;
      } else if (BOOL_KEYS.includes(k)) {
        converted[k] = String(v) === 'true';
      } else {
        converted[k] = v;
      }
    }
    return converted;
  };

  const saveAnswers = useCallback(async (answers: Record<string, string | number | string[]>) => {
    if (companyProfile?.id && user?.id) {
      const converted = convertAnswerFields(answers);
      await supabase
        .from('company_profile')
        .update(converted)
        .eq('id', companyProfile.id as string)
        .eq('user_id', user.id);
      refetch();
    }
  }, [companyProfile?.id, user?.id, refetch]);

  const handleQuestionsComplete = useCallback(async (answers: Record<string, string | number | string[]>) => {
    setStep('processing');
    await saveAnswers(answers);
  }, [saveAnswers]);

  const handleComplementaryComplete = useCallback(async (answers: Record<string, string | number | string[]>) => {
    await saveAnswers(answers);
    setIsRetry(true);
    setStep('processing');
  }, [saveAnswers]);

  const finalizeResults = useCallback(() => {
    if (dataResult.current) {
      let { opps } = dataResult.current;
      const { min, max, count } = dataResult.current;

      // Frontend regime review injection
      opps = injectRegimeReview(opps, companyProfile);

      // If zero results and not yet retried, go to complementary questions
      if (opps.length === 0 && count === 0 && !isRetry) {
        const complementary = getComplementaryFields(companyProfile);
        if (complementary.length > 0) {
          setStep('complementary');
          return;
        }
      }

      // If still zero after retry (or no complementary fields), use fallback
      if (opps.length === 0) {
        const regime = String(companyProfile?.regime_tributario || 'simples');
        setOpportunities(getFallbackOpps(regime));
        setTotalMin(0);
        setTotalMax(0);
        setTotalCount(0);
      } else {
        setOpportunities(opps);
        setTotalMin(min);
        setTotalMax(max);
        setTotalCount(count);
      }
      setStep('results');
    }
  }, [isRetry, companyProfile]);

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

        const sorted = sortOpportunities(data.opportunities || []);

        dataResult.current = {
          opps: sorted.slice(0, 3),
          min: data.economia_anual_min || 0,
          max: data.economia_anual_max || 0,
          count: data.total_opportunities || 0,
        };
      } catch {
        // Fallback on error
        const regime = String(companyProfile?.regime_tributario || 'simples');
        dataResult.current = {
          opps: getFallbackOpps(regime),
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

  const complementaryFields = getComplementaryFields(companyProfile);

  return (
    <div className="max-w-xl mx-auto">
      {step === 'intro' && (
        <StepIntro
          company={companyProfile as Record<string, unknown> | null}
          missingCount={missingFields.length}
          onNext={handleIntroNext}
          companyId={(companyProfile?.id as string) ?? null}
          userId={user?.id ?? null}
          onFieldUpdated={refetch}
        />
      )}
      {step === 'questions' && (
        <StepQuestions
          missingFields={missingFields}
          onComplete={handleQuestionsComplete}
          existingProfile={companyProfile}
        />
      )}
      {step === 'processing' && (
        <StepProcessing onVisualComplete={onVisualComplete} />
      )}
      {step === 'complementary' && (
        <StepQuestions
          missingFields={complementaryFields}
          onComplete={handleComplementaryComplete}
          existingProfile={companyProfile}
          claraIntroMessage="Preciso de mais alguns dados para encontrar as oportunidades certas para você."
        />
      )}
      {step === 'results' && (
        <StepResults
          opportunities={opportunities}
          totalMin={totalMin}
          totalMax={totalMax}
          totalCount={totalCount}
          companyProfile={companyProfile}
          onRefine={() => {
            setStep('questions');
            setIsRetry(false);
          }}
        />
      )}
    </div>
  );
}
