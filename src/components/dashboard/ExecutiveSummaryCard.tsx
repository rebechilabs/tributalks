import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, Trophy, ArrowRight, Lock, 
  TrendingUp, ShieldCheck, ShieldAlert, ShieldX,
  Lightbulb, FileDown, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ThermometerData, ScoreAction } from "@/hooks/useDashboardData";

interface ExecutiveSummaryCardProps {
  thermometerData: ThermometerData | null;
  scoreActions: ScoreAction[];
  loading?: boolean;
  userPlan: string;
}

// Mapeamento de planos para acesso ao Painel Executivo
const PLAN_HIERARCHY: Record<string, number> = {
  'STARTER': 0,
  'NAVIGATOR': 1,
  'PROFESSIONAL': 2,
  'ENTERPRISE': 3,
};

const LEGACY_PLAN_MAP: Record<string, string> = {
  'BASICO': 'NAVIGATOR',
  'PROFISSIONAL': 'PROFESSIONAL',
  'PREMIUM': 'ENTERPRISE',
  'STARTER': 'STARTER',
  'NAVIGATOR': 'NAVIGATOR',
  'PROFESSIONAL': 'PROFESSIONAL',
  'ENTERPRISE': 'ENTERPRISE',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getScoreColor(grade: string | null): { border: string; bg: string; text: string; semaforo: 'verde' | 'amarelo' | 'vermelho' } {
  if (!grade) return { border: 'border-muted', bg: 'bg-muted', text: 'text-muted-foreground', semaforo: 'amarelo' };
  
  const gradeUpper = grade.toUpperCase();
  if (['A+', 'A', 'B'].includes(gradeUpper)) {
    return { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600', semaforo: 'verde' };
  }
  if (gradeUpper === 'C') {
    return { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600', semaforo: 'amarelo' };
  }
  return { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-600', semaforo: 'vermelho' };
}

function getRiskColor(nivel: 'baixo' | 'medio' | 'alto' | null): { bg: string; text: string; icon: typeof ShieldCheck } {
  if (!nivel) return { bg: 'bg-muted', text: 'text-muted-foreground', icon: ShieldAlert };
  
  switch (nivel) {
    case 'baixo':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: ShieldCheck };
    case 'medio':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: ShieldAlert };
    case 'alto':
      return { bg: 'bg-red-500/10', text: 'text-red-600', icon: ShieldX };
  }
}

function getRiskLabel(nivel: 'baixo' | 'medio' | 'alto' | null): string {
  if (!nivel) return 'Não avaliado';
  const labels: Record<string, string> = {
    'baixo': 'Baixo',
    'medio': 'Médio',
    'alto': 'Alto',
  };
  return labels[nivel] || nivel;
}

export function ExecutiveSummaryCard({ thermometerData, scoreActions, loading, userPlan }: ExecutiveSummaryCardProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const normalizedPlan = LEGACY_PLAN_MAP[userPlan] || 'STARTER';
  const canAccessExecutive = (PLAN_HIERARCHY[normalizedPlan] || 0) >= PLAN_HIERARCHY['PROFESSIONAL'];
  
  const scoreColors = getScoreColor(thermometerData?.scoreGrade || null);
  const riskColors = getRiskColor(thermometerData?.riscoNivel || null);
  const RiskIcon = riskColors.icon;

  // Generate PDF handler
  const handleGeneratePdf = async () => {
    if (!canAccessExecutive) {
      toast.error('Disponível para planos Professional e superiores');
      return;
    }

    setPdfLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-executive-report', {
        body: { reportType: 'monthly' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else if (data?.html) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.html);
          printWindow.document.close();
          printWindow.print();
        }
      }

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Estado de loading
  if (loading) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estado sem dados - CTA para iniciar jornada
  const hasAnyData = thermometerData && (
    thermometerData.hasScoreData || 
    thermometerData.hasDreData || 
    thermometerData.hasCreditsData
  );

  if (!hasAnyData) {
    return (
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Resumo Executivo</h3>
                <p className="text-sm text-muted-foreground">
                  Complete o Score Tributário para visualizar sua situação
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/dashboard/score-tributario">
                Iniciar Diagnóstico
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2 transition-all", scoreColors.border)}>
      <CardContent className="pt-6">
        {/* Header with Semaphore */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full animate-pulse",
              scoreColors.semaforo === 'verde' ? 'bg-emerald-500' :
              scoreColors.semaforo === 'amarelo' ? 'bg-amber-500' :
              'bg-red-500'
            )} />
            <h3 className="font-semibold text-foreground">Resumo Executivo</h3>
          </div>
          {canAccessExecutive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGeneratePdf}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Baixar PDF
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Caixa em Jogo */}
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Caixa em Jogo</span>
            {thermometerData?.caixaPotencialMin && thermometerData?.caixaPotencialMax ? (
              <span className="text-lg font-bold text-foreground mt-1">
                {formatCurrency(thermometerData.caixaPotencialMin)} - {formatCurrency(thermometerData.caixaPotencialMax)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground mt-1">
                <Link to="/dashboard/score-tributario" className="text-primary hover:underline">
                  Completar análise →
                </Link>
              </span>
            )}
          </div>

          {/* Nível de Risco */}
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-muted/50 to-transparent">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2", riskColors.bg)}>
              <RiskIcon className={cn("w-6 h-6", riskColors.text)} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Risco</span>
            {thermometerData?.riscoNivel ? (
              <span className={cn("text-lg font-bold mt-1", riskColors.text)}>
                {getRiskLabel(thermometerData.riscoNivel)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground mt-1">
                <Link to="/dashboard/score-tributario" className="text-primary hover:underline">
                  Avaliar risco →
                </Link>
              </span>
            )}
          </div>

          {/* Score Tributário */}
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-muted/50 to-transparent">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2", scoreColors.bg)}>
              <Trophy className={cn("w-6 h-6", scoreColors.text)} />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Score</span>
            {thermometerData?.scoreGrade ? (
              <div className="flex items-baseline gap-1 mt-1">
                <span className={cn("text-2xl font-bold", scoreColors.text)}>
                  {thermometerData.scoreGrade}
                </span>
                {thermometerData.scoreTotal && (
                  <span className="text-sm text-muted-foreground">
                    ({thermometerData.scoreTotal} pts)
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground mt-1">
                <Link to="/dashboard/score-tributario" className="text-primary hover:underline">
                  Calcular score →
                </Link>
              </span>
            )}
          </div>
        </div>

        {/* Ações Recomendadas */}
        {scoreActions.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Ações Recomendadas</span>
            </div>
            <div className="space-y-2">
              {scoreActions.map((action, index) => (
                <Link 
                  key={action.id}
                  to={action.link_to || '/dashboard/score-tributario'}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{action.action_title}</p>
                    {action.economia_estimada && action.economia_estimada > 0 && (
                      <p className="text-xs text-emerald-600">
                        Economia estimada: {formatCurrency(action.economia_estimada)}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA para Painel Executivo */}
        <div className="pt-4 border-t border-border">
          {canAccessExecutive ? (
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/executivo">
                Ver Painel Executivo Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Upgrade para Professional
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
