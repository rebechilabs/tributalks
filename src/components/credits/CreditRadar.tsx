import { useState, useMemo } from 'react';
import { Target, CheckCircle, AlertTriangle, AlertCircle, FileText, Download, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useXmlCreditsSummary, useXmlCreditItems } from '@/hooks/useXmlCredits';
import { CreditPdfReport } from './CreditPdfReport';
import { MonophasicAlert, extractMonophasicProducts } from './MonophasicAlert';

export function CreditRadar() {
  const { data: summary, isLoading: loadingSummary } = useXmlCreditsSummary();
  const { data: creditItems, isLoading: loadingItems } = useXmlCreditItems(100);
  const [filterTax, setFilterTax] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  // Filtra itens pelo tipo de tributo
  const filteredItems = useMemo(() => {
    if (!creditItems) return [];
    
    return creditItems.filter(item => {
      if (filterTax === 'all') return true;
      if (filterTax === 'pis') return item.pis > 0 || item.cofins > 0;
      if (filterTax === 'icms') return item.icms > 0;
      if (filterTax === 'ipi') return item.ipi > 0;
      return true;
    });
  }, [creditItems, filterTax]);

  // Extrai produtos monofásicos (simulado - baseado em NCMs conhecidos)
  const monophasicProducts = useMemo(() => {
    // Por enquanto retorna array vazio - futuramente será implementado
    return [];
  }, []);

  const taxBreakdown = [
    { 
      name: 'PIS/COFINS', 
      original: summary?.totalPisCofins || 0,
      recoverable: summary?.pisCofinsRecuperavel || 0,
      color: 'bg-blue-500'
    },
    { 
      name: 'ICMS', 
      original: summary?.totalIcms || 0,
      recoverable: summary?.icmsRecuperavel || 0,
      color: 'bg-emerald-500'
    },
    { 
      name: 'ICMS-ST', 
      original: summary?.totalIcmsSt || 0,
      recoverable: summary?.icmsStRecuperavel || 0,
      color: 'bg-amber-500'
    },
    { 
      name: 'IPI', 
      original: summary?.totalIpi || 0,
      recoverable: summary?.ipiRecuperavel || 0,
      color: 'bg-purple-500'
    },
  ];

  const totalRecuperavel = summary?.totalRecuperavel || 0;

  if (loadingSummary || loadingItems) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasData = summary && summary.totalXmls > 0;

  return (
    <div className="space-y-6">
      {/* Monophasic Alert - destaque no topo */}
      <MonophasicAlert products={monophasicProducts} totalRecovery={0} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Radar de Créditos</h2>
            <p className="text-sm text-muted-foreground">
              Créditos tributários potencialmente recuperáveis
            </p>
          </div>
          {hasData && (
            <Badge variant="secondary" className="ml-2">
              {summary.totalXmls} XMLs analisados
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowPdfModal(true)} disabled={!hasData}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Disclaimer Legal */}
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Importante</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Os créditos identificados são <strong>estimativas</strong> baseadas na análise automatizada dos seus documentos fiscais. 
          A recuperação efetiva deve ser validada e executada por um contador ou advogado tributarista de sua confiança. 
          O TribuTalks não se responsabiliza por decisões tomadas sem a devida assessoria profissional.
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
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Potencial Recuperável
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalRecuperavel)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimativa conservadora
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  PIS/COFINS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {formatCurrency(summary.pisCofinsRecuperavel)}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  de {formatCurrency(summary.totalPisCofins)} identificados
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  ICMS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {formatCurrency(summary.icmsRecuperavel)}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  de {formatCurrency(summary.totalIcms)} identificados
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  XMLs Analisados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold">
                  {summary.totalXmls.toLocaleString('pt-BR')}
                </span>
                <span className="text-sm text-muted-foreground ml-2">documentos</span>
              </CardContent>
            </Card>
          </div>

          {/* Tax Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Breakdown por Tributo
                <Badge variant="outline" className="text-xs font-normal">
                  Estimativas de Crédito
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taxBreakdown.map((tax) => (
                <div key={tax.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{tax.name}</span>
                    <div className="text-right">
                      <span className="text-emerald-600 font-medium">
                        {formatCurrency(tax.recoverable)}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        (de {formatCurrency(tax.original)})
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tax.color} transition-all duration-500`}
                      style={{ 
                        width: `${totalRecuperavel > 0 ? (tax.recoverable / totalRecuperavel) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Credits Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Notas Fiscais Analisadas</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterTax} onValueChange={setFilterTax}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tributo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pis">PIS/COFINS</SelectItem>
                      <SelectItem value="icms">ICMS</SelectItem>
                      <SelectItem value="ipi">IPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma nota fiscal encontrada com esse filtro.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NF-e</TableHead>
                        <TableHead>Emitente</TableHead>
                        <TableHead className="text-right">Valor NF</TableHead>
                        <TableHead className="text-right">PIS/COFINS</TableHead>
                        <TableHead className="text-right">ICMS</TableHead>
                        <TableHead className="text-right">IPI</TableHead>
                        <TableHead className="text-right">Total Tributos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.slice(0, 50).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{item.documentNumber || '-'}</span>
                              <p className="text-xs text-muted-foreground">
                                {item.issueDate ? new Date(item.issueDate).toLocaleDateString('pt-BR') : '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-sm truncate max-w-[200px] block">
                                {item.issuerName || '-'}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {formatCNPJ(item.issuerCnpj)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.documentTotal)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-blue-600">
                            {formatCurrency(item.pis + item.cofins)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-emerald-600">
                            {formatCurrency(item.icms)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-purple-600">
                            {formatCurrency(item.ipi)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatCurrency(item.totalTax)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredItems.length > 50 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Mostrando 50 de {filteredItems.length} notas fiscais
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Quer recuperar esses créditos?</h3>
                  <p className="text-sm text-muted-foreground">
                    Gere um relatório detalhado para enviar ao seu contador e iniciar o processo de recuperação.
                  </p>
                </div>
                <Button size="lg" onClick={() => setShowPdfModal(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório para Contador
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* PDF Modal - converte para o formato esperado */}
      {showPdfModal && summary && (
        <CreditPdfReport 
          credits={[]} 
          summary={{
            total_potential: summary.totalRecuperavel,
            pis_cofins_potential: summary.pisCofinsRecuperavel,
            icms_potential: summary.icmsRecuperavel,
            icms_st_potential: summary.icmsStRecuperavel,
            ipi_potential: summary.ipiRecuperavel,
            high_confidence_total: summary.totalRecuperavel * 0.4,
            medium_confidence_total: summary.totalRecuperavel * 0.4,
            low_confidence_total: summary.totalRecuperavel * 0.2,
            total_xmls_analyzed: summary.totalXmls,
            credits_found_count: summary.totalXmls,
          }}
          onClose={() => setShowPdfModal(false)} 
        />
      )}
    </div>
  );
}
