import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Scale, Clock, AlertTriangle, CheckCircle2, Copy, FileText, Shield, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OpportunityData } from './OpportunityCard';
import { generateBriefingPdf, generateBriefingText } from './BriefingExport';
import { toast } from 'sonner';

interface CompanyProfile {
  razao_social?: string;
  cnpj_principal?: string;
  regime_tributario?: string;
  setor?: string;
  faturamento_anual?: number;
  uf_sede?: string;
  municipio_sede?: string;
  [key: string]: unknown;
}

interface DossieTributarioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: OpportunityData;
  companyProfile?: CompanyProfile | null;
}

const PLACEHOLDER = 'Em breve — estamos complementando esta informação.';

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

function getUrgencyConfig(opp: OpportunityData) {
  if (opp.futuro_reforma === 'extinta' || opp.status_lc_224_2025 === 'extinta') {
    return { label: 'Urgente — janela curta', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle };
  }
  if (opp.futuro_reforma || opp.status_lc_224_2025) {
    return { label: 'Reforma pode afetar', color: 'bg-amber-500/20 text-amber-400', icon: Clock };
  }
  return { label: 'Sem prazo de urgência', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 };
}

function getRegimeLabel(regime?: string) {
  const map: Record<string, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', lucro_real: 'Lucro Real' };
  return map[regime || ''] || regime || '';
}

export function DossieTributario({ open, onOpenChange, opportunity: opp, companyProfile }: DossieTributarioProps) {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const urgency = getUrgencyConfig(opp);
  const UrgencyIcon = urgency.icon;

  const handleCopyBriefing = async () => {
    const text = generateBriefingText(opp, companyProfile || undefined);
    await navigator.clipboard.writeText(text);
    toast.success('Briefing copiado!');
  };

  const handleExportPdf = () => {
    generateBriefingPdf(opp, companyProfile || undefined);
    toast.success('PDF gerado com sucesso!');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-bold text-foreground">{opp.name}</SheetTitle>
          <SheetDescription className="sr-only">Dossiê tributário detalhado</SheetDescription>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-emerald-400">
              {formatCurrency(opp.economia_anual_min)} — {formatCurrency(opp.economia_anual_max)}
            </span>
            <span className="text-sm text-muted-foreground">/ano</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={cn('text-xs', urgency.color)}>
              <UrgencyIcon className="w-3 h-3 mr-1" />
              {urgency.label}
            </Badge>
            {opp.alto_impacto && (
              <Badge variant="outline" className="text-xs bg-primary/20 text-primary">Alto Impacto</Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="base-legal" className="text-xs">Base Legal</TabsTrigger>
            <TabsTrigger value="implementar" className="text-xs">Implementar</TabsTrigger>
            <TabsTrigger value="especialista" className="text-xs">Especialista</TabsTrigger>
          </TabsList>

          {/* Tab 1 — Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-5 mt-0">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> O que é
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {opp.description || PLACEHOLDER}
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Por que sua empresa se qualifica
              </h3>
              {opp.match_reasons && opp.match_reasons.length > 0 ? (
                <ul className="space-y-1.5">
                  {opp.match_reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {companyProfile?.regime_tributario
                    ? `Como empresa do ${getRegimeLabel(companyProfile.regime_tributario as string)}${companyProfile.setor ? ` no setor de ${companyProfile.setor}` : ''}, esta oportunidade pode se aplicar ao seu perfil.`
                    : PLACEHOLDER}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs', urgency.color)}>
                <UrgencyIcon className="w-3 h-3 mr-1" /> {urgency.label}
              </Badge>
            </div>
          </TabsContent>

          {/* Tab 2 — Base Legal */}
          <TabsContent value="base-legal" className="space-y-5 mt-0">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" /> Fundamentação Legal
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {opp.base_legal || PLACEHOLDER}
              </p>
              {opp.base_legal_resumo && (
                <p className="text-xs text-muted-foreground mt-2 italic">{opp.base_legal_resumo}</p>
              )}
            </div>

            {opp.tributos_afetados && opp.tributos_afetados.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">Tributos Afetados</h4>
                <div className="flex flex-wrap gap-1.5">
                  {opp.tributos_afetados.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {(opp.risco_fiscal || opp.risco_descricao) && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Risco Fiscal
                </h4>
                {opp.risco_fiscal && (
                  <Badge variant="outline" className="text-xs mb-1">{opp.risco_fiscal}</Badge>
                )}
                {opp.risco_descricao && (
                  <p className="text-xs text-muted-foreground">{opp.risco_descricao}</p>
                )}
              </div>
            )}

            {(opp.futuro_reforma || opp.status_lc_224_2025) && (
              <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-violet-400">Impacto da Reforma Tributária</span>
                </div>
                <p className="text-sm text-violet-300/80 leading-relaxed">
                  {opp.descricao_reforma || opp.descricao_lc_224_2025 || 'A Reforma Tributária (EC 132/2023 e LC 214/2024) pode impactar esta oportunidade.'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab 3 — Como Implementar */}
          <TabsContent value="implementar" className="space-y-5 mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Complexidade</span>
                <p className="text-sm font-semibold text-foreground capitalize">{opp.complexidade || '—'}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Tempo de Implementação</span>
                <p className="text-sm font-semibold text-foreground">{opp.tempo_implementacao || PLACEHOLDER.split('—')[0]}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-muted-foreground">Tempo de Retorno</span>
                <p className="text-sm font-semibold text-foreground">{opp.tempo_retorno || PLACEHOLDER.split('—')[0]}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Profissionais Necessários</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={cn("w-4 h-4 rounded border border-border flex items-center justify-center", opp.requer_contador && "bg-primary border-primary")}>
                    {opp.requer_contador && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  Contador / Contabilidade
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={cn("w-4 h-4 rounded border border-border flex items-center justify-center", opp.requer_advogado && "bg-primary border-primary")}>
                    {opp.requer_advogado && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  Advogado Tributarista
                </div>
              </div>
            </div>

            {opp.risco_descricao && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Cuidados
                </h4>
                <p className="text-sm text-muted-foreground">{opp.risco_descricao}</p>
              </div>
            )}
          </TabsContent>

          {/* Tab 4 — Leve para seu Especialista */}
          <TabsContent value="especialista" className="space-y-5 mt-0">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {generateBriefingText(opp, companyProfile || undefined)}
              </pre>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCopyBriefing}>
                <Copy className="w-4 h-4 mr-2" /> Copiar briefing
              </Button>
              <Button className="flex-1" onClick={handleExportPdf}>
                <FileText className="w-4 h-4 mr-2" /> Exportar PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
