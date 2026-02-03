import { useState, useEffect, useMemo } from 'react';
import { Target, CheckCircle, AlertTriangle, AlertCircle, FileText, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreditPdfReport } from './CreditPdfReport';
import { MonophasicAlert, extractMonophasicProducts } from './MonophasicAlert';
interface IdentifiedCredit {
  id: string;
  nfe_key: string;
  nfe_number: string;
  nfe_date: string;
  supplier_cnpj: string;
  supplier_name: string;
  original_tax_value: number;
  potential_recovery: number;
  ncm_code: string;
  product_description: string;
  cfop: string;
  cst: string;
  confidence_score: number;
  confidence_level: string;
  status: string;
  created_at: string;
  credit_rules?: {
    tax_type: string;
    rule_name: string;
    legal_basis: string;
  };
}

interface CreditSummary {
  total_potential: number;
  pis_cofins_potential: number;
  icms_potential: number;
  icms_st_potential: number;
  ipi_potential: number;
  high_confidence_total: number;
  medium_confidence_total: number;
  low_confidence_total: number;
  total_xmls_analyzed: number;
  credits_found_count: number;
}

export function CreditRadar() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<IdentifiedCredit[]>([]);
  const [summary, setSummary] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTax, setFilterTax] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCredits();
      fetchSummary();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('identified_credits')
        .select(`
          *,
          credit_rules (
            tax_type,
            rule_name,
            legal_basis
          )
        `)
        .order('potential_recovery', { ascending: false })
        .limit(100);

      if (error) throw error;
      setCredits(data || []);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Erro ao carregar créditos identificados');
    }
  };

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_analysis_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getConfidenceBadge = (level: string) => {
    const variants: Record<string, string> = {
      high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    const labels: Record<string, string> = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variants[level] || variants.medium}`}>
        {getConfidenceIcon(level)}
        {labels[level] || 'Média'}
      </span>
    );
  };

  const filteredCredits = credits.filter(credit => {
    if (filterTax !== 'all') {
      const taxType = credit.credit_rules?.tax_type || '';
      if (!taxType.toLowerCase().includes(filterTax.toLowerCase())) return false;
    }
    if (filterConfidence !== 'all' && credit.confidence_level !== filterConfidence) {
      return false;
    }
    return true;
  });

  // Extract monophasic products from credits
  const monophasicProducts = useMemo(() => {
    return extractMonophasicProducts(credits);
  }, [credits]);

  const monophasicTotalRecovery = useMemo(() => {
    return monophasicProducts.reduce((sum, p) => sum + p.totalPisCofinsPaid, 0);
  }, [monophasicProducts]);
  const taxBreakdown = [
    { 
      name: 'PIS/COFINS', 
      value: summary?.pis_cofins_potential || 0,
      color: 'bg-blue-500'
    },
    { 
      name: 'ICMS', 
      value: summary?.icms_potential || 0,
      color: 'bg-emerald-500'
    },
    { 
      name: 'ICMS-ST', 
      value: summary?.icms_st_potential || 0,
      color: 'bg-amber-500'
    },
    { 
      name: 'IPI', 
      value: summary?.ipi_potential || 0,
      color: 'bg-purple-500'
    },
  ];

  const totalByTax = taxBreakdown.reduce((sum, t) => sum + t.value, 0) || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monophasic Alert - destaque no topo */}
      <MonophasicAlert products={monophasicProducts} totalRecovery={monophasicTotalRecovery} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Radar de Créditos</h2>
            <p className="text-sm text-muted-foreground">
              Créditos tributários recuperáveis identificados
            </p>
          </div>
          {credits.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {credits.length} créditos
            </Badge>
          )}
        </div>
        <Button onClick={() => setShowPdfModal(true)} disabled={credits.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recuperável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(summary?.total_potential || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Alta Confiança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {formatCurrency(summary?.high_confidence_total || 0)}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Média Confiança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {formatCurrency(summary?.medium_confidence_total || 0)}
            </span>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              XMLs Analisados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {summary?.total_xmls_analyzed || 0}
            </span>
            <span className="text-sm text-muted-foreground ml-2">documentos</span>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown por Tributo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxBreakdown.map((tax) => (
            <div key={tax.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{tax.name}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(tax.value)} ({((tax.value / totalByTax) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${tax.color} transition-all duration-500`}
                  style={{ width: `${(tax.value / totalByTax) * 100}%` }}
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
            <CardTitle className="text-lg">Créditos Identificados</CardTitle>
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
              <Select value={filterConfidence} onValueChange={setFilterConfidence}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Confiança" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCredits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum crédito identificado ainda.</p>
              <p className="text-sm mt-2">
                Importe XMLs de notas fiscais para análise automática.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NF-e</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Tributo</TableHead>
                    <TableHead className="text-right">Valor Original</TableHead>
                    <TableHead className="text-right">Potencial</TableHead>
                    <TableHead>Confiança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{credit.nfe_number || '-'}</span>
                          <p className="text-xs text-muted-foreground">
                            {credit.nfe_date ? new Date(credit.nfe_date).toLocaleDateString('pt-BR') : '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium text-sm">{credit.supplier_name || '-'}</span>
                          <p className="text-xs text-muted-foreground">
                            {formatCNPJ(credit.supplier_cnpj)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {credit.credit_rules?.tax_type || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(credit.original_tax_value)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-emerald-600">
                        {formatCurrency(credit.potential_recovery)}
                      </TableCell>
                      <TableCell>
                        {getConfidenceBadge(credit.confidence_level)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA Section */}
      {credits.length > 0 && (
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
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <CreditPdfReport 
          credits={filteredCredits} 
          summary={summary}
          onClose={() => setShowPdfModal(false)} 
        />
      )}
    </div>
  );
}
