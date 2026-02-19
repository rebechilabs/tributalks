import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';

interface QuestionField {
  key: string;
  label: string;
  claraText: string;
  type: 'grid' | 'currency' | 'uf' | 'textarea' | 'number' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
  condition?: (answers: Record<string, string | number>, existing: Record<string, unknown> | null) => boolean;
}

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
  {
    key: 'setor',
    label: 'Setor',
    claraText: 'Em qual setor a sua empresa atua?',
    type: 'grid',
    options: [
      { value: 'comercio', label: 'Comércio' },
      { value: 'industria', label: 'Indústria' },
      { value: 'servicos', label: 'Serviços' },
      { value: 'tecnologia', label: 'Tecnologia' },
      { value: 'saude', label: 'Saúde' },
      { value: 'educacao', label: 'Educação' },
      { value: 'agro', label: 'Agronegócio' },
      { value: 'construcao', label: 'Construção' },
    ],
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
  // --- Exploratory: Sócios ---
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
  // --- End exploratory ---
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

// Layer 2 — Exploratory questions based on company profile
const EXPLORATORY_FIELDS: QuestionField[] = [
  {
    key: 'folha_acima_28pct',
    label: 'Fator R',
    claraText: 'Sua folha de pagamento representa mais de 28% do faturamento? Isso pode mudar seu enquadramento no Simples.',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return regime === 'simples' && (setor === 'servicos' || setor === 'tecnologia');
    },
  },
  {
    key: 'tem_st_icms',
    label: 'Substituição Tributária',
    claraText: 'Seus produtos têm substituição tributária de ICMS? Isso pode gerar créditos não aproveitados.',
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei' },
    ],
    condition: (answers, existing) => {
      const regime = (answers.regime_tributario ?? existing?.regime_tributario ?? '') as string;
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return regime === 'simples' && (setor === 'comercio' || setor === 'industria');
    },
  },
  {
    key: 'creditos_pis_cofins_pendentes',
    label: 'Créditos PIS/COFINS',
    claraText: 'Você tem créditos de PIS/COFINS não aproveitados nos últimos 5 anos?',
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
    claraText: 'Você faz planejamento de JCP (Juros sobre Capital Próprio)? Pode reduzir significativamente o IRPJ.',
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
    type: 'grid',
    options: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'nao_sei', label: 'Não sei o que é' },
    ],
    condition: (answers, existing) => {
      const setor = (answers.setor ?? existing?.setor ?? '') as string;
      return setor === 'construcao';
    },
  },
  {
    key: 'conhece_imunidade_issqn',
    label: 'Imunidade ISSQN',
    claraText: 'Você conhece a imunidade do ISSQN para serviços hospitalares? Pode gerar economia significativa.',
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
    claraText: 'Você conhece o Programa Especial de Parcelamento (PEP) do ICMS em SP? Pode reduzir multas e juros.',
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
  onComplete: (answers: Record<string, string | number>) => void;
  existingProfile?: Record<string, unknown> | null;
  claraIntroMessage?: string;
}

export function StepQuestions({ missingFields, onComplete, existingProfile = null, claraIntroMessage }: StepQuestionsProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currencyInput, setCurrencyInput] = useState('');
  const [textareaInput, setTextareaInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // Filter exploratory fields: max 4 that match the current profile
  const applicableExploratory = useMemo(() => {
    return EXPLORATORY_FIELDS.filter(f => {
      if (!f.condition) return true;
      return f.condition(answers, existingProfile);
    }).slice(0, 4);
  }, [answers, existingProfile]);

  const ALL_FIELDS = [...REQUIRED_FIELDS, ...applicableExploratory, ...COMPLEMENTARY_FIELDS];

  // Dynamically compute visible questions based on answers so far
  const questions = useMemo(() => {
    return ALL_FIELDS.filter(f => {
      if (!missingFields.includes(f.key)) return false;
      if (f.condition && !f.condition(answers, existingProfile)) return false;
      return true;
    });
  }, [missingFields, answers, existingProfile]);

  const current = questions[currentIdx];
  if (!current) return null;

  const progress = ((currentIdx) / questions.length) * 100;

  const selectAnswer = (value: string | number) => {
    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);

    // Recalculate questions with new answers to determine next
    const nextQuestions = ALL_FIELDS.filter(f => {
      if (!missingFields.includes(f.key)) return false;
      if (f.condition && !f.condition(newAnswers, existingProfile)) return false;
      return true;
    });

    // Find current question's position in new list and advance
    const currentPosInNew = nextQuestions.findIndex(q => q.key === current.key);
    if (currentPosInNew < nextQuestions.length - 1) {
      setCurrentIdx(currentPosInNew + 1);
      setCurrencyInput('');
      setTextareaInput('');
      setNumberInput('');
      setTextInput('');
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

      <ClaraMessage message={current.claraText} key={current.key} />

      {current.type === 'grid' && current.options && (
        <div className="grid grid-cols-2 gap-2">
          {current.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => selectAnswer(current.key === 'num_funcionarios' ? parseInt(opt.value) : opt.value)}
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

      {current.type === 'currency' && (
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

      {current.type === 'uf' && (
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

      {current.type === 'textarea' && (
        <div className="space-y-3">
          <textarea
            value={textareaInput}
            onChange={e => setTextareaInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextareaSubmit(); } }}
            placeholder={current.placeholder || ''}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            autoFocus
          />
          <Button onClick={handleTextareaSubmit} className="w-full" disabled={!textareaInput.trim()}>
            Confirmar
          </Button>
        </div>
      )}

      {current.type === 'number' && (
        <div className="space-y-3">
          <input
            type="number"
            inputMode="numeric"
            value={numberInput}
            onChange={e => setNumberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNumberSubmit()}
            placeholder={current.placeholder || '0'}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
          />
          <Button onClick={handleNumberSubmit} className="w-full" disabled={!numberInput}>
            Confirmar
          </Button>
        </div>
      )}

      {current.type === 'text' && (
        <div className="space-y-3">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder={current.placeholder || ''}
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
