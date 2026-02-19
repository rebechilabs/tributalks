import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';

interface QuestionField {
  key: string;
  label: string;
  claraText: string;
  type: 'grid' | 'currency' | 'uf' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
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
    type: 'grid',
    options: [
      { value: '5', label: '0 – 9' },
      { value: '25', label: '10 – 49' },
      { value: '75', label: '50 – 99' },
      { value: '250', label: '100 – 499' },
      { value: '500', label: '500+' },
    ],
  },
  {
    key: 'uf_sede',
    label: 'Estado',
    claraText: 'Em qual estado fica a sede da sua empresa?',
    type: 'uf',
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

const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

interface StepQuestionsProps {
  missingFields: string[];
  onComplete: (answers: Record<string, string | number>) => void;
}

export function StepQuestions({ missingFields, onComplete }: StepQuestionsProps) {
  const questions = REQUIRED_FIELDS.filter(f => missingFields.includes(f.key));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currencyInput, setCurrencyInput] = useState('');
  const [textareaInput, setTextareaInput] = useState('');

  const current = questions[currentIdx];
  if (!current) return null;

  const progress = ((currentIdx) / questions.length) * 100;

  const selectAnswer = (value: string | number) => {
    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setCurrencyInput('');
      setTextareaInput('');
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

  const formatCurrencyInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) { setCurrencyInput(''); return; }
    const num = parseInt(digits, 10);
    setCurrencyInput(num.toLocaleString('pt-BR'));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
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
    </div>
  );
}
