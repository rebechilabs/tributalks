import { useState } from 'react';
import { Target, AlertTriangle, FileText, Download, TrendingUp, Sparkles, ListChecks, Scale, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useXmlCreditsSummary } from '@/hooks/useXmlCredits';
import { useIdentifiedCredits, useIdentifiedCreditsSummary } from '@/hooks/useIdentifiedCredits';
import { useReanalyzeCredits } from '@/hooks/useReanalyzeCredits';
import { CreditPdfReport } from './CreditPdfReport';
import { MonophasicAlert } from './MonophasicAlert';
import { IdentifiedCreditsTable } from './IdentifiedCreditsTable';
import { CreditImplementationWorkflow } from './CreditImplementationWorkflow';

export function CreditRadar() {
  const { data: xmlSummary, isLoading: loadingXmlSummary } = useXmlCreditsSummary();
  const { data: identifiedCredits, isLoading: loadingCredits } = useIdentifiedCredits(100);
  const { data: creditsSummary, isLoading: loadingSummary } = useIdentifiedCreditsSummary();
  const { reanalyze, isAnalyzing, progress } = useReanalyzeCredits();
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState('credits');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Use identified credits summary if available, otherwise fall back to XML estimates
  const hasIdentifiedCredits = creditsSummary && creditsSummary.total_credits_count > 0;
  const totalRecuperavel = hasIdentifiedCredits 
    ? creditsSummary.total_potential 
    : (xmlSummary?.totalRecuperavel || 0);
  
  const summaryData = hasIdentifiedCredits ? {
    pisCofins: creditsSummary.pis_cofins_potential,
    icms: creditsSummary.icms_potential,
    icmsSt: creditsSummary.icms_st_potential,
    ipi: creditsSummary.ipi_potential,
    highConfidence: creditsSummary.high_confidence_total,
    mediumConfidence: creditsSummary.medium_confidence_total,
    lowConfidence: creditsSummary.low_confidence_total,
    totalCredits: creditsSummary.total_credits_count,
  } : {
    pisCofins: xmlSummary?.pisCofinsRecuperavel || 0,
    icms: xmlSummary?.icmsRecuperavel || 0,
    icmsSt: xmlSummary?.icmsStRecuperavel || 0,
    ipi: xmlSummary?.ipiRecuperavel || 0,
    highConfidence: (xmlSummary?.totalRecuperavel || 0) * 0.4,
    mediumConfidence: (xmlSummary?.totalRecuperavel || 0) * 0.4,
    lowConfidence: (xmlSummary?.totalRecuperavel || 0) * 0.2,
    totalCredits: xmlSummary?.totalXmls || 0,
  };

  const isLoading = loadingXmlSummary || loadingCredits || loadingSummary;
  const hasData = (xmlSummary && xmlSummary.totalXmls > 0) || hasIdentifiedCredits;

  const taxBreakdown = [
    { name: 'PIS/COFINS', value: summaryData.pisCofins, color: 'bg-chart-1' },
    { name: 'ICMS', value: summaryData.icms, color: 'bg-chart-2' },
    { name: 'ICMS-ST', value: summaryData.icmsSt, color: 'bg-chart-3' },
    { name: 'IPI', value: summaryData.ipi, color: 'bg-chart-4' },
  ];

  const confidenceBreakdown = [
    { label: 'Alta Confiança', value: summaryData.highConfidence, variant: 'default' as const },
    { label: 'Média Confiança', value: summaryData.mediumConfidence, variant: 'secondary' as const },
    { label: 'Baixa Confiança', value: summaryData.lowConfidence, variant: 'outline' as const },
  ];

  const handleAskClara = () => {
    // Trigger Clara with credit recovery context
    const event = new CustomEvent('open-clara', { 
      detail: { 
        message: 'Como faço para recuperar os créditos tributários identificados no Radar?' 
      } 
    });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monophasic Alert */}
      <MonophasicAlert products={[]} totalRecovery={0} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Radar de Créditos</h2>
            <p className="text-sm text-muted-foreground">
              {hasIdentifiedCredits 
                ? 'Créditos identificados pelo motor de regras' 
                : 'Estimativas de créditos recuperáveis'}
            </p>
          </div>
          {hasIdentifiedCredits && (
            <Badge variant="default" className="ml-2">
              <Scale className="h-3 w-3 mr-1" />
              {summaryData.totalCredits} créditos com base legal
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={reanalyze} 
            disabled={isAnalyzing || !xmlSummary?.totalXmls}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? 'Analisando...' : 'Identificar Créditos'}
          </Button>
          <Button onClick={() => setShowPdfModal(true)} disabled={!hasData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analisando XMLs com motor de regras...</span>
                <span>{progress.current} de {progress.total}</span>
              </div>
              <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Os créditos identificados são <strong>estimativas</strong> baseadas na análise automatizada dos seus documentos fiscais. 
          A recuperação efetiva deve ser validada e executada por um contador ou advogado tributarista de sua confiança.
        </AlertDescription>
      </Alert>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum XML processado</h3>
            <p className="text-muted-foreground mb-4">
              Importe XMLs de notas fiscais para identificar créditos tributários automaticamente.
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard/recuperar/radar">Importar XMLs</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Recuperável
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(totalRecuperavel)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasIdentifiedCredits ? 'Baseado em regras fiscais' : 'Estimativa conservadora'}
                </p>
              </CardContent>
            </Card>

            {confidenceBreakdown.map((conf) => (
              <Card key={conf.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {conf.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">
                    {formatCurrency(conf.value)}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalRecuperavel > 0 
                      ? `${Math.round((conf.value / totalRecuperavel) * 100)}% do total`
                      : '0% do total'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tax Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Breakdown por Tributo
                {hasIdentifiedCredits && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Identificados por regra
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taxBreakdown.map((tax) => (
                <div key={tax.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tax.name}</span>
                    <span className="text-primary font-medium">
                      {formatCurrency(tax.value)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tax.color} transition-all duration-500`}
                      style={{ 
                        width: `${totalRecuperavel > 0 ? (tax.value / totalRecuperavel) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="credits" className="gap-2">
                <FileText className="h-4 w-4" />
                Créditos Identificados
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-2">
                <ListChecks className="h-4 w-4" />
                Como Recuperar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="credits">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {hasIdentifiedCredits 
                      ? 'Créditos Identificados pelo Motor de Regras'
                      : 'Notas Fiscais Analisadas'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasIdentifiedCredits && identifiedCredits ? (
                    <IdentifiedCreditsTable credits={identifiedCredits} maxItems={50} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Os créditos serão detalhados após processamento pelo motor de regras.</p>
                      <p className="text-sm mt-2">
                        Por enquanto, você pode ver as estimativas nos cards acima.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow">
              <CreditImplementationWorkflow
                totalRecoverable={totalRecuperavel}
                creditsCount={summaryData.totalCredits}
                onAskClara={handleAskClara}
                onGenerateReport={() => setShowPdfModal(true)}
              />
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Dúvidas sobre recuperação?</h3>
                    <p className="text-sm text-muted-foreground">
                      A Clara pode explicar cada crédito e o processo de recuperação.
                    </p>
                  </div>
                </div>
                <Button onClick={handleAskClara}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Perguntar à Clara
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <CreditPdfReport 
          credits={identifiedCredits?.map(c => ({
            id: c.id,
            nfe_key: c.nfe_key,
            nfe_number: c.nfe_number,
            nfe_date: c.nfe_date,
            supplier_cnpj: c.supplier_cnpj,
            supplier_name: c.supplier_name,
            original_tax_value: c.original_tax_value,
            potential_recovery: c.potential_recovery,
            ncm_code: c.ncm_code,
            product_description: c.product_description,
            cfop: c.cfop,
            cst: c.cst,
            confidence_score: c.confidence_score,
            confidence_level: c.confidence_level,
            status: c.status,
            created_at: c.created_at,
            credit_rules: c.rule ? {
              tax_type: c.rule.tax_type,
              rule_name: c.rule.rule_name,
              legal_basis: c.rule.legal_basis,
            } : undefined,
          })) || []} 
          summary={{
            total_potential: totalRecuperavel,
            pis_cofins_potential: summaryData.pisCofins,
            icms_potential: summaryData.icms,
            icms_st_potential: summaryData.icmsSt,
            ipi_potential: summaryData.ipi,
            high_confidence_total: summaryData.highConfidence,
            medium_confidence_total: summaryData.mediumConfidence,
            low_confidence_total: summaryData.lowConfidence,
            total_xmls_analyzed: xmlSummary?.totalXmls || 0,
            credits_found_count: summaryData.totalCredits,
          }}
          onClose={() => setShowPdfModal(false)} 
        />
      )}
    </div>
  );
}
