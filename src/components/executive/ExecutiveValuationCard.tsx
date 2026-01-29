import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  AlertCircle,
  FileText,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";

export interface ValuationData {
  valuationMin: number;
  valuationMax: number;
  multiploBase: number;
  ajusteCompliance: number; // multiplier (e.g., 1.15 for +15%)
  ajustePercentual: number; // percentage (e.g., 15 for +15%)
  potencialMelhoria: number; // additional value if score improves to A
  sectorName: string;
  scoreGrade: string | null;
  scoreTotal: number | null;
  hasData: boolean;
  missingData: ('ebitda' | 'score' | 'sector')[];
}

interface ExecutiveValuationCardProps {
  data: ValuationData | null;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(1).replace('.', ',')}B`;
  }
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

function getGradeColor(grade: string | null): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'text-success';
    case 'B':
      return 'text-primary';
    case 'C':
      return 'text-warning';
    case 'D':
    case 'E':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function getComplianceLabel(percentual: number): { text: string; color: string } {
  if (percentual >= 10) return { text: 'Premium', color: 'text-success' };
  if (percentual >= 0) return { text: 'Neutro', color: 'text-muted-foreground' };
  if (percentual >= -15) return { text: 'Desconto', color: 'text-warning' };
  return { text: 'Severo', color: 'text-destructive' };
}

export function ExecutiveValuationCard({ data, loading }: ExecutiveValuationCardProps) {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No data available - show CTA to fill required data
  if (!data || !data.hasData) {
    const missingItems = data?.missingData || ['ebitda', 'score', 'sector'];
    
    return (
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Estimativa de Valuation
            <Badge variant="outline" className="ml-2 text-xs">
              Professional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Dados insuficientes para estimativa
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Para calcular o valuation da sua empresa, precisamos de algumas informações adicionais.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {missingItems.includes('ebitda') && (
                <Badge variant="secondary" className="gap-1">
                  <FileText className="w-3 h-3" />
                  DRE com EBITDA
                </Badge>
              )}
              {missingItems.includes('score') && (
                <Badge variant="secondary" className="gap-1">
                  <Target className="w-3 h-3" />
                  Score Tributário
                </Badge>
              )}
              {missingItems.includes('sector') && (
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  Setor/CNAE
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {missingItems.includes('ebitda') && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/dre">Preencher DRE</Link>
                </Button>
              )}
              {missingItems.includes('score') && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/score">Fazer Score</Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const complianceLabel = getComplianceLabel(data.ajustePercentual);
  const gradeColor = getGradeColor(data.scoreGrade);
  const targetGrade = data.scoreGrade === 'A+' || data.scoreGrade === 'A' ? null : 'A';

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            Estimativa de Valuation da Empresa
          </CardTitle>
          <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
            EXCLUSIVO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Valuation Range */}
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valuation Atual</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(data.valuationMin)} — {formatCurrency(data.valuationMax)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Setor: {data.sectorName}
            </p>
          </div>

          {/* Multiplier Applied */}
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Múltiplo Aplicado</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {data.multiploBase.toFixed(1)}x <span className="text-lg font-normal text-muted-foreground">EBITDA</span>
            </div>
            <p className={`text-sm mt-1 ${complianceLabel.color}`}>
              {data.ajustePercentual >= 0 ? '+' : ''}{data.ajustePercentual.toFixed(0)}% compliance 
              <span className={`ml-1 ${gradeColor}`}>({data.scoreGrade || '—'})</span>
            </p>
          </div>
        </div>

        {/* Potential Improvement */}
        {targetGrade && data.potencialMelhoria > 0 && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  Potencial de Valorização
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Se seu score subir de <span className={gradeColor}>{data.scoreGrade}</span> ({data.scoreTotal}) para <span className="text-success font-medium">{targetGrade}</span> (900+):
                </p>
                <div className="text-xl font-bold text-success">
                  +{formatCurrency(data.potencialMelhoria * 0.8)} a +{formatCurrency(data.potencialMelhoria * 1.2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Estimativa indicativa baseada em múltiplos de mercado e compliance tributário. 
            Não constitui avaliação formal. Para transações de M&A, consulte especialistas certificados.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button variant="default" size="sm" asChild className="gap-2">
            <Link to="/dashboard/score">
              <Target className="w-4 h-4" />
              Melhorar meu Score
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Incluir no relatório PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
