import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  DollarSign,
  FileText,
  Search,
  Eye,
  Download,
  RefreshCw,
  PieChart,
  BarChart3,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { formatBrasilia } from "@/lib/dateUtils";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface XmlAnalysis {
  id: string;
  xml_type: string;
  document_number: string;
  document_series: string;
  issue_date: string;
  issuer_name: string;
  issuer_cnpj: string;
  items_count: number;
  document_total: number;
  current_tax_total: number;
  reform_tax_total: number;
  difference_value: number;
  difference_percent: number;
  current_taxes: any;
  reform_taxes: any;
  raw_data: any;
  created_at: string;
}

export default function XMLResultados() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState<XmlAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterResult, setFilterResult] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<XmlAnalysis | null>(null);

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('xml_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as análises",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = 
      a.document_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.issuer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.issuer_cnpj?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || a.xml_type === filterType;
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'economia' && a.difference_value < 0) ||
      (filterResult === 'aumento' && a.difference_value >= 0);

    return matchesSearch && matchesType && matchesResult;
  });

  // Calculate summary
  const totalDocValue = filteredAnalyses.reduce((acc, a) => acc + Number(a.document_total || 0), 0);
  const totalCurrentTax = filteredAnalyses.reduce((acc, a) => acc + Number(a.current_tax_total || 0), 0);
  const totalReformTax = filteredAnalyses.reduce((acc, a) => acc + Number(a.reform_tax_total || 0), 0);
  const totalDifference = totalReformTax - totalCurrentTax;
  const percentDifference = totalCurrentTax > 0 ? ((totalDifference / totalCurrentTax) * 100) : 0;
  const economiaCount = filteredAnalyses.filter(a => a.difference_value < 0).length;
  const aumentoCount = filteredAnalyses.filter(a => a.difference_value >= 0).length;

  // Chart data
  const pieData = [
    { name: 'Economia', value: economiaCount, color: '#22c55e' },
    { name: 'Aumento', value: aumentoCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/importar-xml')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Análise de {filteredAnalyses.length} Notas Fiscais</h1>
              <p className="text-muted-foreground">
                {analyses.length > 0 && `Última importação: ${formatBrasilia(analyses[0].created_at, "dd/MM/yyyy 'às' HH:mm")}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/dashboard/importar-xml')}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Nova Importação
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Analisado</p>
                  <p className="text-xl font-bold">{formatCurrency(totalDocValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tributos Atuais</p>
                  <p className="text-xl font-bold">{formatCurrency(totalCurrentTax)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tributos Reforma</p>
                  <p className="text-xl font-bold">{formatCurrency(totalReformTax)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={totalDifference < 0 ? 'border-green-500/50' : 'border-red-500/50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalDifference < 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {totalDifference < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resultado</p>
                  <p className={`text-xl font-bold ${totalDifference < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalDifference < 0 ? 'Economia' : 'Aumento'} {formatPercent(percentDifference)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        {filteredAnalyses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição dos Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">{economiaCount} com economia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">{aumentoCount} com aumento</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Insights Automáticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {totalDifference < 0 ? (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
                      <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-500">Boa notícia!</p>
                        <p className="text-sm text-muted-foreground">
                          Suas operações terão economia de {formatCurrency(Math.abs(totalDifference))} com a reforma tributária
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-500">Atenção</p>
                        <p className="text-sm text-muted-foreground">
                          Suas operações terão aumento de {formatCurrency(totalDifference)} com a reforma
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Resumo da Análise</p>
                      <p className="text-sm text-muted-foreground">
                        {filteredAnalyses.length} notas analisadas com valor total de {formatCurrency(totalDocValue)}
                      </p>
                    </div>
                  </div>
                  
                  {economiaCount > aumentoCount && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <PieChart className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Maioria com economia</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((economiaCount / filteredAnalyses.length) * 100)}% das suas notas terão redução tributária
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg">Detalhamento por Nota</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nº ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="NFe">NFe</SelectItem>
                    <SelectItem value="NFSe">NFSe</SelectItem>
                    <SelectItem value="CTe">CTe</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="economia">Economia</SelectItem>
                    <SelectItem value="aumento">Aumento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Carregando...</p>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Nenhuma análise encontrada</p>
                <p className="text-muted-foreground">Importe XMLs para ver as análises aqui</p>
                <Button className="mt-4" onClick={() => navigate('/dashboard/importar-xml')}>
                  Importar XMLs
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nº Nota</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Emitente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Atual</TableHead>
                      <TableHead className="text-right">Reforma</TableHead>
                      <TableHead className="text-right">Diferença</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell>
                          <Badge variant="outline">{analysis.xml_type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{analysis.document_number || '-'}</TableCell>
                        <TableCell>
                          {analysis.issue_date 
                            ? formatBrasilia(analysis.issue_date, 'dd/MM/yyyy')
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {analysis.issuer_name || analysis.issuer_cnpj || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(analysis.document_total) || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(analysis.current_tax_total) || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(analysis.reform_tax_total) || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={Number(analysis.difference_value) < 0 ? 'text-green-500' : 'text-red-500'}>
                            {formatPercent(Number(analysis.difference_percent) || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota {selectedAnalysis?.document_number}</DialogTitle>
          </DialogHeader>
          
          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{selectedAnalysis.xml_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Série</p>
                  <p className="font-medium">{selectedAnalysis.document_series || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Emissão</p>
                  <p className="font-medium">
                    {selectedAnalysis.issue_date 
                      ? formatBrasilia(selectedAnalysis.issue_date, "dd/MM/yyyy HH:mm")
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Itens</p>
                  <p className="font-medium">{selectedAnalysis.items_count}</p>
                </div>
              </div>

              {/* Emitter Info */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Emitente</p>
                <p className="font-medium">{selectedAnalysis.issuer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedAnalysis.issuer_cnpj}</p>
              </div>

              {/* Tax Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tributos Atuais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedAnalysis.current_taxes && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>ICMS</span>
                          <span>{formatCurrency(selectedAnalysis.current_taxes.icms || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>PIS</span>
                          <span>{formatCurrency(selectedAnalysis.current_taxes.pis || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>COFINS</span>
                          <span>{formatCurrency(selectedAnalysis.current_taxes.cofins || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IPI</span>
                          <span>{formatCurrency(selectedAnalysis.current_taxes.ipi || 0)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(Number(selectedAnalysis.current_tax_total))}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tributos Reforma</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedAnalysis.reform_taxes && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>CBS</span>
                          <span>{formatCurrency(selectedAnalysis.reform_taxes.cbs || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IBS UF</span>
                          <span>{formatCurrency(selectedAnalysis.reform_taxes.ibsUf || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IBS Mun</span>
                          <span>{formatCurrency(selectedAnalysis.reform_taxes.ibsMun || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IS</span>
                          <span>{formatCurrency(selectedAnalysis.reform_taxes.is || 0)}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(Number(selectedAnalysis.reform_tax_total))}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Difference */}
              <Card className={Number(selectedAnalysis.difference_value) < 0 ? 'border-green-500' : 'border-red-500'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {Number(selectedAnalysis.difference_value) < 0 ? (
                        <TrendingDown className="h-6 w-6 text-green-500" />
                      ) : (
                        <TrendingUp className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">
                          {Number(selectedAnalysis.difference_value) < 0 ? 'Economia' : 'Aumento'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comparado ao sistema atual
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${Number(selectedAnalysis.difference_value) < 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(Math.abs(Number(selectedAnalysis.difference_value)))}
                      </p>
                      <p className={`text-sm ${Number(selectedAnalysis.difference_value) < 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(Number(selectedAnalysis.difference_percent))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}