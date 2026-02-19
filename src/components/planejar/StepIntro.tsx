import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface CompanyData {
  regime_tributario?: string | null;
  setor?: string | null;
  faturamento_anual?: number | null;
  num_funcionarios?: number | null;
  uf_sede?: string | null;
  municipio_sede?: string | null;
  exporta_produtos?: boolean | null;
  importa_produtos?: boolean | null;
}

interface StepIntroProps {
  company: CompanyData | null;
  missingCount: number;
  onNext: () => void;
  companyId: string | null;
  userId: string | null;
  onFieldUpdated: () => void;
}

const UF_OPTIONS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
];

const SETOR_OPTIONS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'construcao', label: 'Construção' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
];


type EditType = 'select' | 'currency' | 'uf' | 'toggle' | 'text' | 'number';

interface FieldDef {
  key: keyof CompanyData;
  label: string;
  format?: (v: unknown) => string;
  editType: EditType;
  options?: { value: string | number; label: string }[];
}

const FIELDS: FieldDef[] = [
  {
    key: 'regime_tributario', label: 'Regime Tributário', editType: 'select',
    options: REGIME_OPTIONS,
    format: (v) => {
      const map: Record<string, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', lucro_presumido: 'Lucro Presumido', real: 'Lucro Real', lucro_real: 'Lucro Real' };
      return map[String(v)] || String(v);
    }
  },
  {
    key: 'setor', label: 'Setor', editType: 'select',
    options: SETOR_OPTIONS,
    format: (v) => {
      const found = SETOR_OPTIONS.find(o => o.value === String(v));
      return found?.label || String(v).charAt(0).toUpperCase() + String(v).slice(1);
    }
  },
  {
    key: 'faturamento_anual', label: 'Faturamento Anual', editType: 'currency',
    format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}`
  },
  {
    key: 'num_funcionarios', label: 'Funcionários', editType: 'number',
    format: (v) => String(Number(v))
  },
  {
    key: 'uf_sede', label: 'Estado (UF)', editType: 'uf',
    format: (v) => String(v).toUpperCase()
  },
  {
    key: 'municipio_sede', label: 'Município', editType: 'text',
    format: (v) => String(v)
  },
  { key: 'exporta_produtos', label: 'Exportação', editType: 'toggle', format: (v) => v ? 'Sim' : 'Não' },
  { key: 'importa_produtos', label: 'Importação', editType: 'toggle', format: (v) => v ? 'Sim' : 'Não' },
];

export function StepIntro({ company, missingCount, onNext, companyId, userId, onFieldUpdated }: StepIntroProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>('');
  const [saving, setSaving] = useState(false);

  const claraText = missingCount > 0
    ? 'Olá! Sou a Clara, sua assistente tributária. Vou analisar o perfil da sua empresa e encontrar oportunidades de economia fiscal. Antes, preciso lhe fazer algumas perguntas.'
    : 'Olá! Sou a Clara, sua assistente tributária. Seu perfil está completo! Vou analisar suas informações e encontrar as melhores oportunidades de economia fiscal para a sua empresa.';

  const startEdit = (key: string, currentValue: unknown, editType: EditType) => {
    setEditingField(key);
    if (editType === 'toggle') {
      setEditValue(!!currentValue);
    } else if (editType === 'currency') {
      setEditValue(currentValue ? Number(currentValue) : 0);
    } else {
      setEditValue(currentValue ? String(currentValue) : '');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async (key: string) => {
    if (!companyId || !userId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('company_profile')
        .update({ [key]: editValue } as Record<string, unknown>)
        .eq('id', companyId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('Dado atualizado!');
      onFieldUpdated();
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter') handleSave(key);
    if (e.key === 'Escape') cancelEdit();
  };

  const renderEditField = (field: FieldDef) => {
    const { key, editType, options } = field;

    if (editType === 'toggle') {
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={!!editValue}
            onCheckedChange={(checked) => setEditValue(checked)}
          />
          <span className="text-xs text-muted-foreground">{editValue ? 'Sim' : 'Não'}</span>
          <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (editType === 'currency') {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">R$</span>
          <input
            type="number"
            value={editValue as number}
            onChange={(e) => setEditValue(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className="w-28 h-7 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (editType === 'uf') {
      return (
        <div className="flex items-center gap-1.5">
          <select
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className="h-7 px-1.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          >
            <option value="">Selecione</option>
            {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (editType === 'text') {
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className="w-32 h-7 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (editType === 'number') {
      return (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={editValue as number}
            onChange={(e) => setEditValue(Number(e.target.value))}
            onKeyDown={(e) => handleKeyDown(e, key)}
            className="w-20 h-7 px-2 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // select
    return (
      <div className="flex items-center gap-1.5">
        <select
          value={editValue as string}
          onChange={(e) => setEditValue(editType === 'select' && options?.some(o => typeof o.value === 'number') ? Number(e.target.value) : e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, key)}
          className="h-7 px-1.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          autoFocus
        >
          <option value="">Selecione</option>
          {options?.map(o => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => handleSave(key)} disabled={saving} className="p-0.5 rounded hover:bg-emerald-500/20 text-emerald-400">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancelEdit} className="p-0.5 rounded hover:bg-destructive/20 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ClaraMessage message={claraText} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Dados da Empresa</h3>
        </div>
        <div className="divide-y divide-border">
          {FIELDS.map((field) => {
            const { key, label, format } = field;
            const value = company?.[key];
            const filled = value !== null && value !== undefined && value !== '';
            const isEditing = editingField === key;
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 text-sm",
                  !filled && "bg-amber-500/5"
                )}
              >
                <span className="text-muted-foreground">{label}</span>
                {isEditing ? (
                  renderEditField(field)
                ) : filled ? (
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {format ? format(value) : String(value)}
                    {companyId && (
                      <button
                        onClick={() => startEdit(key, value, field.editType)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground opacity-50 hover:opacity-100 transition-opacity"
                        title="Editar"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ) : (
                  <button
                    onClick={onNext}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Completar agora (30s)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        {missingCount > 0
          ? 'Responder perguntas e gerar análise'
          : 'Gerar análise agora'}
      </Button>
    </div>
  );
}
