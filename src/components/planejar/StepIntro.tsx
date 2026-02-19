import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClaraMessage } from './ClaraMessage';
import { cn } from '@/lib/utils';

interface CompanyData {
  regime_tributario?: string | null;
  setor?: string | null;
  faturamento_anual?: number | null;
  num_funcionarios?: number | null;
  uf_sede?: string | null;
  exporta_produtos?: boolean | null;
  importa_produtos?: boolean | null;
}

interface StepIntroProps {
  company: CompanyData | null;
  missingCount: number;
  onNext: () => void;
}

const FIELDS: { key: keyof CompanyData; label: string; format?: (v: unknown) => string }[] = [
  { key: 'regime_tributario', label: 'Regime Tributário', format: (v) => {
    const map: Record<string, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', lucro_presumido: 'Lucro Presumido', real: 'Lucro Real', lucro_real: 'Lucro Real' };
    return map[String(v)] || String(v);
  }},
  { key: 'setor', label: 'Setor', format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
  { key: 'faturamento_anual', label: 'Faturamento Anual', format: (v) => `R$ ${Number(v).toLocaleString('pt-BR')}` },
  { key: 'num_funcionarios', label: 'Funcionários', format: (v) => String(v) },
  { key: 'uf_sede', label: 'Estado (UF)', format: (v) => String(v).toUpperCase() },
  { key: 'exporta_produtos', label: 'Exportação', format: (v) => v ? 'Sim' : 'Não' },
  { key: 'importa_produtos', label: 'Importação', format: (v) => v ? 'Sim' : 'Não' },
];

export function StepIntro({ company, missingCount, onNext }: StepIntroProps) {
  const claraText = missingCount > 0
    ? `Olá! Sou a Clara, sua assistente tributária. Vou analisar o perfil da sua empresa e encontrar oportunidades de economia fiscal. Antes, preciso confirmar ${missingCount} dado${missingCount > 1 ? 's' : ''} que ${missingCount > 1 ? 'estão faltando' : 'está faltando'}.`
    : 'Olá! Sou a Clara, sua assistente tributária. Seu perfil está completo! Vou analisar suas informações e encontrar as melhores oportunidades de economia fiscal para a sua empresa.';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <ClaraMessage message={claraText} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Dados da Empresa</h3>
        </div>
        <div className="divide-y divide-border">
          {FIELDS.map(({ key, label, format }) => {
            const value = company?.[key];
            const filled = value !== null && value !== undefined && value !== '';
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 text-sm",
                  !filled && "bg-amber-500/5"
                )}
              >
                <span className="text-muted-foreground">{label}</span>
                {filled ? (
                  <span className="flex items-center gap-1.5 text-foreground font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {format ? format(value) : String(value)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Não informado
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={onNext} className="w-full" size="lg">
        {missingCount > 0
          ? `Responder ${missingCount} pergunta${missingCount > 1 ? 's' : ''} e gerar análise`
          : 'Gerar análise agora'}
      </Button>
    </div>
  );
}
