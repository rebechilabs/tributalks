import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, ShoppingCart, AlertTriangle, TrendingDown } from "lucide-react";
import { SupplierTable } from "./SupplierTable";
import { SupplierAnalysisCard } from "./SupplierAnalysisCard";
import { useSupplierAnalysis } from "@/hooks/useSupplierAnalysis";
import { Skeleton } from "@/components/ui/skeleton";

interface Supplier {
  id: string;
  cnpj: string;
  razao_social: string | null;
  regime_tributario: string;
  regime_confianca: string;
  total_compras_12m: number;
  qtd_notas_12m: number;
  aliquota_credito_estimada: number;
  custo_efetivo_score: number;
  classificacao: string;
}

export function OMCTab() {
  const [regimeFilter, setRegimeFilter] = useState("all");
  const [gapFilter, setGapFilter] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const { suppliers, loading, refetch, analyzing } = useSupplierAnalysis();

  // Calculate summary metrics
  const totalCompras = suppliers.reduce((sum, s) => sum + (s.total_compras_12m || 0), 0);
  const fornecedoresCriticos = suppliers.filter(s => s.classificacao === 'substituir').length;
  const gapTotal = suppliers.reduce((sum, s) => {
    const creditoPerda = (s.total_compras_12m || 0) * ((26.5 - (s.aliquota_credito_estimada || 0)) / 100);
    return sum + creditoPerda;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => {
    if (regimeFilter !== "all" && s.regime_tributario !== regimeFilter) return false;
    if (gapFilter === "critical" && s.classificacao !== 'substituir') return false;
    if (gapFilter === "renegotiate" && s.classificacao !== 'renegociar') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Compras 12m</p>
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-xl font-bold">{formatCurrency(totalCompras)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fornecedores Críticos</p>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold text-destructive">{fornecedoresCriticos}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gap de Crédito Anual</p>
                {loading ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <p className="text-xl font-bold text-warning">{formatCurrency(gapTotal)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Análise de Fornecedores</CardTitle>
              <CardDescription>
                Identifique fornecedores que drenam margem por falta de crédito IBS/CBS
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetch}
                disabled={loading || analyzing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                {analyzing ? 'Analisando...' : 'Atualizar'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={regimeFilter} onValueChange={setRegimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Regime tributário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os regimes</SelectItem>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                <SelectItem value="real">Lucro Real</SelectItem>
                <SelectItem value="mei">MEI</SelectItem>
                <SelectItem value="desconhecido">Desconhecido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gapFilter} onValueChange={setGapFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="critical">Substituir (crítico)</SelectItem>
                <SelectItem value="renegotiate">Renegociar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Supplier Table */}
          <SupplierTable 
            suppliers={filteredSuppliers}
            loading={loading}
            onSelectSupplier={setSelectedSupplier}
            selectedId={selectedSupplier?.id}
          />
        </CardContent>
      </Card>

      {/* Selected Supplier Detail */}
      {selectedSupplier && (
        <SupplierAnalysisCard 
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </div>
  );
}
