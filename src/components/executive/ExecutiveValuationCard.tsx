import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  AlertCircle,
  FileText,
  Target,
  Calculator,
  BarChart3,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import { ValuationData, ValuationMethodResult } from "@/hooks/useExecutiveData";

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

interface MethodCardProps {
  result: ValuationMethodResult;
  icon: React.ReactNode;
  description: string;
  multipleLabel: string;
  compliancePercentual: number;
  scoreGrade: string | null;
  baseValue: number | null;
  baseLabel: string;
}

function MethodCard({ 
  result, 
  icon, 
  description, 
  multipleLabel,
  compliancePercentual,
  scoreGrade,
  baseValue,
  baseLabel
}: MethodCardProps) {
  const complianceLabel = getComplianceLabel(compliancePercentual);
  const gradeColor = getGradeColor(scoreGrade);
  const hasValue = result.valuationMin > 0 && result.valuationMax > 0;

  if (!hasValue) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium text-muted-foreground">{result.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Dados insuficientes para este método
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Value Range */}
      <div className="p-4 rounded-lg bg-background/50 border border-border">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-muted-foreground">Valuation Estimado</span>
        </div>
        <div className="text-2xl font-bold text-foreground">
          {formatCurrency(result.valuationMin)} — {formatCurrency(result.valuationMax)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Multiple/Rate */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">{multipleLabel}</div>
          <div className="text-lg font-semibold text-foreground">
            {result.multiple.toFixed(1)}x
          </div>
        </div>

        {/* Base Value */}
        {baseValue && baseValue > 0 && (
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">{baseLabel}</div>
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(baseValue)}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Adjustment */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ajuste Compliance</span>
          <span className={`text-sm font-medium ${complianceLabel.color}`}>
            {compliancePercentual >= 0 ? '+' : ''}{compliancePercentual.toFixed(0)}%
            <span className={`ml-1 ${gradeColor}`}>({scoreGrade || '—'})</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ExecutiveValuationCard({ data, loading }: ExecutiveValuationCardProps) {
  const [activeTab, setActiveTab] = useState('ebitda');

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
                  <Link to="/dashboard/entender/dre">Preencher DRE</Link>
                </Button>
              )}
              {missingItems.includes('score') && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/entender/score">Fazer Score</Link>
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
            3 MÉTODOS
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Setor: {data.sectorName}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Tabs for Methods */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ebitda" className="gap-1 text-xs sm:text-sm">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">EBITDA</span>
              <span className="sm:hidden">EBITDA</span>
            </TabsTrigger>
            <TabsTrigger value="dcf" className="gap-1 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">DCF</span>
              <span className="sm:hidden">DCF</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1 text-xs sm:text-sm">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Receita</span>
              <span className="sm:hidden">Receita</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ebitda" className="mt-4">
            <MethodCard
              result={data.ebitda}
              icon={<Calculator className="w-4 h-4 text-primary" />}
              description="Baseado no múltiplo de EBITDA do setor ajustado por compliance"
              multipleLabel="Múltiplo Aplicado"
              compliancePercentual={data.ajustePercentual}
              scoreGrade={data.scoreGrade}
              baseValue={data.ebitdaAnual}
              baseLabel="EBITDA Anual"
            />
          </TabsContent>

          <TabsContent value="dcf" className="mt-4">
            <MethodCard
              result={data.dcf}
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              description="Valor presente dos fluxos de caixa projetados para 5 anos + perpetuidade"
              multipleLabel="Taxa de Desconto"
              compliancePercentual={data.ajustePercentual}
              scoreGrade={data.scoreGrade}
              baseValue={data.lucroLiquido}
              baseLabel="Lucro Anual"
            />
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <MethodCard
              result={data.revenue}
              icon={<DollarSign className="w-4 h-4 text-primary" />}
              description="Baseado no múltiplo de receita típico do setor"
              multipleLabel="Múltiplo Aplicado"
              compliancePercentual={data.ajustePercentual}
              scoreGrade={data.scoreGrade}
              baseValue={data.receitaAnual}
              baseLabel="Receita Anual"
            />
          </TabsContent>
        </Tabs>

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
            Estimativa indicativa baseada em múltiplos de mercado, fluxo de caixa descontado e compliance tributário. 
            Não constitui avaliação formal. Para transações de M&A, consulte especialistas certificados.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button variant="default" size="sm" asChild className="gap-2">
            <Link to="/dashboard/entender/score">
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