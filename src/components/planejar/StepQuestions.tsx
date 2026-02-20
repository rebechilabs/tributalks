import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';
import {
  MACRO_SEGMENTS,
  MACRO_TO_SECTORS,
  OPERATION_TAGS,
  SECTOR_DEFAULT_TAGS,
  SECTOR_QUESTIONS,
  inferMacroFromSector,
} from '@/data/sectorQuestionBank';

interface QuestionField {
  key: string;
  label: string;
  claraText: string;
  type: 'grid' | 'currency' | 'uf' | 'textarea' | 'number' | 'text' | 'multi_toggle' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  roiHint?: string;
  condition?: (answers: Record<string, string | number | string[]>, existing: Record<string, unknown> | null) => boolean;
  /** For multi_toggle: compute default values based on current answers */
  getDefaults?: (answers: Record<string, string | number | string[]>, existing: Record<string, unknown> | null) => string[];
}

// ── Layer 1: Required fields ──

const REQUIRED_FIELDS: QuestionField[] = [
  {
    key: 'regime_tributario',
    label: 'Regime Tributário',
    claraText: 'Qual é o regime tributário da sua empresa?',
    type: 'grid',
    options: [
      { value: 'simples', label: 'Simples Nacional' },
      { value: 'presumido', label: 'Lucro Presumido' },
      { value: 'lucro_real', label: 'Lucro Real' },
    ],
  },
  // Step 1: Macro segment
  {
    key: 'segmento',
    label: 'Macro-segmento',
    claraText: 'Em qual macro-segmento a sua empresa atua?',
    type: 'grid',
    options: MACRO_SEGMENTS.map(m => ({ value: m.value, label: m.label })),
  },
  // Step 2: Detailed sector (depends on macro)
  {
    key: 'setor',
    label: 'Setor',
    claraText: 'Em qual setor específico a sua empresa atua?',
    type: 'grid',
    options: [], // dynamically populated
    condition: (answers, existing) => {
      const macro = (answers.segmento ?? existing?.segmento ?? '') as string;
      return !!macro;
    },
  },
  {
    key: 'faturamento_anual',
    label: 'Faturamento Anual',
    claraText: 'Qual é o faturamento anual aproximado da sua empresa?',
    type: 'currency',
  },
  {
    key: 'num_funcionarios',
    label: 'Funcionários',
    claraText: 'Quantos funcionários sua empresa possui?',
    type: 'number',
    placeholder: 'Ex: 12',
  },
  {
    key: 'uf_sede',
    label: 'Estado',
    claraText: 'Em qual estado fica a sede da sua empresa?',
    type: 'uf',
  },
  {
    key: 'municipio_sede',
    label: 'Município',
    claraText: 'Em qual município fica a sede da sua empresa?',
    type: 'text',
    placeholder: 'Ex: São Paulo',
  },
  // Operation tags (multi-toggle, after sector selection)
  {
    key: 'tags_operacao',
    label: 'Tags de Operação',
    claraText: 'Quais dessas características se aplicam à sua operação? (selecione todas que se aplicam)',
    type: 'multi_toggle',
    options: OPERATION_TAGS.map(t => ({ value: t.value, label: t.label })),
    condition: (answers, existing) => {
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return !!setor;
    },
    getDefaults: (answers, existing) => {
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return SECTOR_DEFAULT_TAGS[setor] || [];
    },
  },
  // Sócios
  {
    key: 'num_socios',
    label: 'Sócios',
    claraText: 'Quantos sócios a empresa possui?',
    type: 'grid',
    options: [
      { value: '1', label: '1 (só eu)' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4+', label: '4 ou mais' },
    ],
  },
  {
    key: 'socios_outras_empresas',
    label: 'Sócios c/ outras empresas',
    claraText: 'Algum dos sócios possui participação em outras empresas?',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
  },
  {
    key: 'tem_holding',
    label: 'Holding',
    claraText: 'Os sócios já possuem uma holding para organizar as participações societárias?',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei o que é isso' },
    ],
    condition: (answers, existing) => {
      const socios = (answers.num_socios ?? existing?.num_socios ?? '1') as string;
      const outras = (answers.socios_outras_empresas ?? existing?.socios_outras_empresas ?? '') as string;
      return socios !== '1' && outras === 'sim';
    },
  },
  {
    key: 'distribuicao_lucros',
    label: 'Distribuição de lucros',
    claraText: 'Como a empresa distribui os lucros entre os sócios hoje?',
    type: 'grid',
    options: [
      { value: 'pro_labore', label: 'Pró-labore fixo' },
      { value: 'dividendos', label: 'Dividendos periódicos' },
      { value: 'misto', label: 'Mistura dos dois' },
      { value: 'nao_distribui', label: 'Não distribuímos ainda' },
    ],
    condition: (answers, existing) => {
      const socios = (answers.num_socios ?? existing?.num_socios ?? '1') as string;
      return socios !== '1';
    },
  },
  {
    key: 'desafio_principal',
    label: 'Desafio',
    claraText: 'Qual é o maior desafio tributário que você enfrenta hoje?',
    type: 'grid',
    options: [
      { value: 'pago_muito_imposto', label: 'Pago muito imposto' },
      { value: 'regime_errado', label: 'Não sei se estou no regime certo' },
      { value: 'medo_fiscalizacao', label: 'Medo de fiscalização' },
      { value: 'obrigacoes_acessorias', label: 'Dificuldade com obrigações acessórias' },
      { value: 'falta_planejamento', label: 'Falta de planejamento tributário' },
      { value: 'nao_sei_quanto_pago', label: 'Não sei quanto pago de imposto' },
    ],
  },
  {
    key: 'descricao_operacao',
    label: 'Operação',
    claraText: 'Me conta um pouco como funciona a operação da sua empresa. O que você vende, como entrega, quem são seus clientes?',
    type: 'textarea',
    placeholder: 'Ex: Vendemos roupas pela internet, entregamos via Correios e transportadoras. Nossos clientes são pessoas físicas, maioria do Sudeste...',
  },
  {
    key: 'nivel_declaracao',
    label: 'Declaração',
    claraText: 'Sua empresa declara 100% do faturamento? Essa informação é confidencial e nos ajuda a calibrar a análise.',
    type: 'grid',
    options: [
      { value: '100', label: 'Sim, 100%' },
      { value: '80', label: 'Quase tudo (acima de 80%)' },
      { value: '50', label: 'Parcialmente (50-80%)' },
      { value: 'prefiro_nao_responder', label: 'Prefiro não responder' },
    ],
  },
];

// ── Layer 2: Regime-based exploratory (fallback for sectors without specific questions) ──

const REGIME_EXPLORATORY_FIELDS: QuestionField[] = [
  {
    key: 'folha_acima_28pct',
    label: 'Fator R',
    claraText: 'Sua folha de pagamento representa mais de 28% do faturamento?',
    roiHint: 'Destrava Fator R',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return regime === 'simples' && (setor === 'servicos' || setor === 'tecnologia' || setor === 'servicos_profissionais' || setor === 'tecnologia_saas');
    },
  },
  {
    key: 'tem_st_icms',
    label: 'Substituição Tributária',
    claraText: 'Seus produtos têm substituição tributária de ICMS?',
    roiHint: 'Destrava exclusão ICMS-ST',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return regime === 'simples' && ['comercio', 'industria', 'varejo_fisico', 'ecommerce', 'distribuicao_atacado', 'industria_alimentos_bebidas', 'industria_metal_mecanica'].includes(setor);
    },
  },
  {
    key: 'creditos_pis_cofins_pendentes',
    label: 'Créditos PIS/COFINS',
    claraText: 'Você tem créditos de PIS/COFINS não aproveitados nos últimos 5 anos?',
    roiHint: 'Destrava recuperação de créditos',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'presumido';
    },
  },
  {
    key: 'usa_jcp',
    label: 'JCP',
    claraText: 'Você distribui JCP (Juros sobre Capital Próprio) aos sócios?',
    roiHint: 'Destrava planejamento JCP',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei o que é' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'lucro_real';
    },
  },
  {
    key: 'creditos_icms_exportacao',
    label: 'Créditos ICMS Exportação',
    claraText: 'Você acumula créditos de ICMS de exportação sem aproveitamento?',
    roiHint: 'Destrava transferência de créditos',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const exporta = answers.exporta_produtos ?? existing?.exporta_produtos;
      return exporta === true || exporta === 'true' || exporta === 'sim';
    },
  },
  {
    key: 'usa_ret',
    label: 'RET',
    claraText: 'Você usa o RET (Regime Especial de Tributação) para suas incorporações?',
    roiHint: 'Destrava redução de alíquota',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei o que é' },
    ],
    condition: (answers, existing) => {
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return setor === 'construcao' || setor === 'construcao_incorporacao' || setor === 'imobiliario';
    },
  },
  {
    key: 'conhece_imunidade_issqn',
    label: 'Imunidade ISSQN',
    claraText: 'Seus serviços são de natureza hospitalar?',
    roiHint: 'Destrava imunidade ISSQN',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim, já aproveitamos' },
      { value: 'nao', label: 'Não conheço' },
      { value: 'nao_sei', label: 'Não sei se se aplica' },
    ],
    condition: (answers, existing) => {
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return setor === 'saude';
    },
  },
  {
    key: 'conhece_pep_sp',
    label: 'PEP/SP',
    claraText: 'Você tem débitos de ICMS em aberto?',
    roiHint: 'Destrava PEP-SP',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const uf = (answers.uf_sede ?? existing?.uf_sede ?? '') as string;
      return uf === 'SP';
    },
  },
  {
    key: 'folha_faixa',
    label: 'Faixa de Folha',
    claraText: 'Qual é a faixa da sua folha de pagamento em relação ao faturamento?',
    roiHint: 'Destrava Fator R e enquadramento',
    type: 'grid',
    options: [
      { value: 'lt_10', label: 'Abaixo de 10%' },
      { value: '10_a_20', label: '10% a 20%' },
      { value: '20_a_28', label: '20% a 28%' },
      { value: 'gt_28', label: 'Acima de 28%' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'simples';
    },
  },
  // Triagem clínica
  {
    key: 'margem_liquida_faixa',
    label: 'Margem Líquida',
    claraText: 'Qual é a faixa de margem líquida da sua empresa?',
    roiHint: 'Direciona Presumido x Real',
    type: 'grid',
    options: [
      { value: 'lt_5', label: 'Abaixo de 5%' },
      { value: '5_a_10', label: '5% a 10%' },
      { value: '10_a_20', label: '10% a 20%' },
      { value: 'gt_20', label: 'Acima de 20%' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'presumido' || regime === 'lucro_presumido' || regime === 'lucro_real';
    },
  },
  {
    key: 'mix_b2b_faixa',
    label: 'Mix B2B / B2C',
    claraText: 'Seu mix de vendas é mais B2B (empresas) ou B2C (consumidor final)?',
    roiHint: 'Direciona impacto de crédito/repasse',
    type: 'grid',
    options: [
      { value: 'b2c_70', label: 'Mais B2C (>70%)' },
      { value: 'equilibrado', label: 'Equilibrado' },
      { value: 'b2b_70', label: 'Mais B2B (>70%)' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'presumido' || regime === 'lucro_presumido';
    },
  },
  {
    key: 'alto_volume_compras_nfe',
    label: 'Volume de Compras NF-e',
    claraText: 'Sua empresa tem alto volume de compras com nota fiscal eletrônica?',
    roiHint: 'Direciona viabilidade Lucro Real',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      return regime === 'presumido' || regime === 'lucro_presumido';
    },
  },
];

// Complementary questions for retry when zero opportunities found
const COMPLEMENTARY_FIELDS: QuestionField[] = [
  {
    key: 'exporta_produtos',
    label: 'Exportação',
    claraText: 'Sua empresa exporta produtos ou serviços?',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    key: 'importa_produtos',
    label: 'Importação',
    claraText: 'Sua empresa importa produtos ou insumos?',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    key: 'tem_estoque',
    label: 'Estoque',
    claraText: 'Sua empresa trabalha com estoque de produtos?',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    key: 'tem_ecommerce',
    label: 'E-commerce',
    claraText: 'Sua empresa vende online (e-commerce ou marketplace)?',
    type: 'grid',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    key: 'descricao_atividade',
    label: 'Atividade Principal',
    claraText: 'Descreva brevemente a atividade principal da sua empresa.',
    type: 'textarea',
    placeholder: 'Ex: Comércio varejista de eletrônicos, com loja física e online...',
  },
];

const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

interface StepQuestionsProps {
  missingFields: string[];
  onComplete: (answers: Record<string, string | number | string[]>) => void;
  existingProfile?: Record<string, unknown> | null;
  claraIntroMessage?: string;
}

/**
 * Build sector-specific exploratory questions as QuestionField[]
 */
function buildSectorExploratoryFields(
  answers: Record<string, string | number | string[]>,
  existingProfile: Record<string, unknown> | null
): QuestionField[] {
  const setor = (answers.setor ?? existingProfile?.setor ?? '') as string;
  const sectorQs = SECTOR_QUESTIONS[setor];

  if (!sectorQs || sectorQs.length === 0) return [];

  return sectorQs.slice(0, 4).map(sq => {
    const field: QuestionField = {
      key: sq.key,
      label: sq.text.slice(0, 30),
      claraText: sq.text,
      roiHint: sq.roi,
      type: sq.type === 'select' ? 'select' : 'grid',
      options: sq.type === 'select' && sq.options
        ? sq.options.map(o => ({ value: o, label: o }))
        : [
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' },
          ],
    };
    return field;
  });
}

export function StepQuestions({ missingFields, onComplete, existingProfile = null, claraIntroMessage }: StepQuestionsProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [currencyInput, setCurrencyInput] = useState('');
  const [textareaInput, setTextareaInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [multiToggleSelection, setMultiToggleSelection] = useState<string[]>([]);
  const [multiToggleInitialized, setMultiToggleInitialized] = useState(false);

  // Build sector-specific exploratory fields dynamically
  const sectorExploratoryFields = useMemo(() =>
    buildSectorExploratoryFields(answers, existingProfile),
    [answers, existingProfile]
  );

  // Use sector questions if available, else fall back to regime-based
  const exploratoryFields = useMemo(() => {
    if (sectorExploratoryFields.length > 0) return sectorExploratoryFields;
    return REGIME_EXPLORATORY_FIELDS.filter(f => {
      if (!f.condition) return true;
      return f.condition(answers, existingProfile);
    }).slice(0, 4);
  }, [sectorExploratoryFields, answers, existingProfile]);

  const ALL_FIELDS = [...REQUIRED_FIELDS, ...exploratoryFields, ...COMPLEMENTARY_FIELDS];

  // Dynamically compute visible questions based on answers so far
  const questions = useMemo(() => {
    return ALL_FIELDS.filter(f => {
      if (!missingFields.includes(f.key)) return false;
      if (f.condition && !f.condition(answers, existingProfile)) return false;
      return true;
    });
  }, [missingFields, answers, existingProfile, ALL_FIELDS]);

  // Dynamically populate sector options based on selected macro
  const currentQuestion = useMemo(() => {
    const q = questions[currentIdx];
    if (!q) return null;

    if (q.key === 'setor') {
      const macro = (answers.segmento ?? existingProfile?.segmento ?? '') as string;
      const sectors = MACRO_TO_SECTORS[macro] || [];
      return {
        ...q,
        options: sectors.map(s => ({ value: s.value, label: s.label })),
      };
    }
    return q;
  }, [questions, currentIdx, answers, existingProfile]);

  // Initialize multi-toggle defaults when reaching a multi_toggle question
  const multiToggleQuestionKey = currentQuestion?.type === 'multi_toggle' ? currentQuestion.key : null;
  const multiToggleGetDefaults = currentQuestion?.type === 'multi_toggle' ? currentQuestion.getDefaults : undefined;

  useEffect(() => {
    if (multiToggleQuestionKey && !multiToggleInitialized && multiToggleGetDefaults) {
      const defaults = multiToggleGetDefaults(answers, existingProfile);
      setMultiToggleSelection(defaults);
      setMultiToggleInitialized(true);
    }
  }, [multiToggleQuestionKey, multiToggleInitialized, multiToggleGetDefaults, answers, existingProfile]);

  // If no questions apply, auto-complete with current answers (only once)
  const autoCompletedRef = useRef(false);
  useEffect(() => {
    if (questions.length === 0 && !autoCompletedRef.current) {
      autoCompletedRef.current = true;
      onComplete(answers);
    }
  }, [questions.length]);

  if (!currentQuestion) return null;

  const progress = ((currentIdx) / questions.length) * 100;

  const selectAnswer = (value: string | number | string[]) => {
    const newAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(newAnswers);

    // Recalculate questions with new answers to determine next
    const newSectorExploratory = buildSectorExploratoryFields(newAnswers, existingProfile);
    const newExploratory = newSectorExploratory.length > 0
      ? newSectorExploratory
      : REGIME_EXPLORATORY_FIELDS.filter(f => !f.condition || f.condition(newAnswers, existingProfile)).slice(0, 4);
    const allFields = [...REQUIRED_FIELDS, ...newExploratory, ...COMPLEMENTARY_FIELDS];
    const nextQuestions = allFields.filter(f => {
      if (!missingFields.includes(f.key)) return false;
      if (f.condition && !f.condition(newAnswers, existingProfile)) return false;
      return true;
    });

    const currentPosInNew = nextQuestions.findIndex(q => q.key === currentQuestion.key);
    if (currentPosInNew < nextQuestions.length - 1) {
      setCurrentIdx(currentPosInNew + 1);
      setCurrencyInput('');
      setTextareaInput('');
      setNumberInput('');
      setTextInput('');
      setMultiToggleInitialized(false);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleCurrencySubmit = () => {
    const raw = currencyInput.replace(/\D/g, '');
    const num = parseInt(raw, 10);
    if (num > 0) selectAnswer(num);
  };

  const handleTextareaSubmit = () => {
    if (textareaInput.trim().length > 0) selectAnswer(textareaInput.trim());
  };

  const handleNumberSubmit = () => {
    const num = parseInt(numberInput, 10);
    if (!isNaN(num) && num >= 0) selectAnswer(num);
  };

  const handleTextSubmit = () => {
    if (textInput.trim().length > 0) selectAnswer(textInput.trim());
  };

  const formatCurrencyInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) { setCurrencyInput(''); return; }
    const num = parseInt(digits, 10);
    setCurrencyInput(num.toLocaleString('pt-BR'));
  };

  const toggleTag = (tag: string) => {
    setMultiToggleSelection(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleMultiToggleSubmit = () => {
    selectAnswer(multiToggleSelection);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {claraIntroMessage && currentIdx === 0 && (
        <ClaraMessage message={claraIntroMessage} />
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pergunta {currentIdx + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <ClaraMessage message={currentQuestion.claraText} key={currentQuestion.key} />

      {currentQuestion.roiHint && (
        <div className="flex items-center gap-1.5 -mt-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
            🔓 Destrava: {currentQuestion.roiHint.replace('Destrava ', '')}
          </span>
        </div>
      )}

      {currentQuestion.type === 'grid' && currentQuestion.options && (
        <div className={cn(
          "grid gap-2",
          (currentQuestion.options.length <= 3) ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"
        )}>
          {currentQuestion.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => selectAnswer(currentQuestion.key === 'num_funcionarios' ? parseInt(opt.value) : opt.value)}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                "border-border bg-card hover:border-primary hover:bg-primary/5 text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'select' && currentQuestion.options && (
        <div className="grid grid-cols-1 gap-2">
          {currentQuestion.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => selectAnswer(opt.value)}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                "border-border bg-card hover:border-primary hover:bg-primary/5 text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'multi_toggle' && currentQuestion.options && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleTag(opt.value)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                  multiToggleSelection.includes(opt.value)
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card hover:border-muted-foreground text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button onClick={handleMultiToggleSubmit} className="w-full">
            Confirmar
          </Button>
        </div>
      )}

      {currentQuestion.type === 'currency' && (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={currencyInput}
              onChange={e => formatCurrencyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCurrencySubmit()}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <Button onClick={handleCurrencySubmit} className="w-full" disabled={!currencyInput}>
            Confirmar
          </Button>
        </div>
      )}

      {currentQuestion.type === 'uf' && (
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
          {UFS.map(uf => (
            <button
              key={uf}
              onClick={() => selectAnswer(uf)}
              className={cn(
                "px-2 py-2 rounded-md border text-xs font-semibold transition-all",
                "border-border bg-card hover:border-primary hover:bg-primary/5 text-foreground"
              )}
            >
              {uf}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'textarea' && (
        <div className="space-y-3">
          <textarea
            value={textareaInput}
            onChange={e => setTextareaInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextareaSubmit(); } }}
            placeholder={currentQuestion.placeholder || ''}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            autoFocus
          />
          <Button onClick={handleTextareaSubmit} className="w-full" disabled={!textareaInput.trim()}>
            Confirmar
          </Button>
        </div>
      )}

      {currentQuestion.type === 'number' && (
        <div className="space-y-3">
          <input
            type="number"
            inputMode="numeric"
            value={numberInput}
            onChange={e => setNumberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNumberSubmit()}
            placeholder={currentQuestion.placeholder || '0'}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
          <Button onClick={handleNumberSubmit} className="w-full" disabled={!numberInput}>
            Confirmar
          </Button>
        </div>
      )}

      {currentQuestion.type === 'text' && (
        <div className="space-y-3">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder={currentQuestion.placeholder || ''}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
          <Button onClick={handleTextSubmit} className="w-full" disabled={!textInput.trim()}>
            Confirmar
          </Button>
        </div>
      )}
    </div>
  );
}
