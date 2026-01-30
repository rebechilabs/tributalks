import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, FileText, Search, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SupplierAnalysisCardProps {
  supplier: Supplier;
  onClose: () => void;
}

export function SupplierAnalysisCard({ supplier, onClose }: SupplierAnalysisCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      simples: 'Simples Nacional',
      presumido: 'Lucro Presumido',
      real: 'Lucro Real',
      mei: 'MEI',
      desconhecido: 'Desconhecido'
    };
    return labels[regime] || regime;
  };

  const getConfiancaLabel = (confianca: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      high: { label: 'Alta certeza', color: 'text-success' },
      medium: { label: 'Média certeza', color: 'text-warning' },
      low: { label: 'Baixa certeza', color: 'text-destructive' }
    };
    return labels[confianca] || { label: confianca, color: 'text-muted-foreground' };
  };

  // Cálculos
  const aliquotaMaxima = 26.5; // CBS/IBS máximo (Lucro Real)
  const creditoAtual = supplier.total_compras_12m * (supplier.aliquota_credito_estimada / 100);
  const creditoMaximo = supplier.total_compras_12m * (aliquotaMaxima / 100);
  const gapCredito = creditoMaximo - creditoAtual;
  const custoEfetivoAtual = supplier.total_compras_12m - creditoAtual;
  const custoEfetivoLucroReal = supplier.total_compras_12m - creditoMaximo;
  
  // Preço de indiferença: quanto o fornecedor Lucro Real poderia cobrar
  // para ter o mesmo custo efetivo que o atual
  const precoIndiferenca = custoEfetivoAtual / (1 - aliquotaMaxima / 100);
  const variacaoPreco = ((precoIndiferenca / supplier.total_compras_12m) - 1) * 100;

  const confianca = getConfiancaLabel(supplier.regime_confianca);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {supplier.razao_social || 'Fornecedor não identificado'}
              <Badge variant="outline" className="text-xs">
                {getRegimeLabel(supplier.regime_tributario)}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              CNPJ: {formatCNPJ(supplier.cnpj)} • 
              <span className={cn("ml-1", confianca.color)}>
                {confianca.label}
              </span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Situação Atual */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Situação Atual
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço Nominal Total</span>
                <span className="font-medium">{formatCurrency(supplier.total_compras_12m)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crédito de IBS/CBS Estimado</span>
                <span className="font-medium">
                  {formatCurrency(creditoAtual)} 
                  <span className="text-muted-foreground ml-1">({formatPercent(supplier.aliquota_credito_estimada)})</span>
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Custo Efetivo Líquido</span>
                <span>{formatCurrency(custoEfetivoAtual)}</span>
              </div>
            </div>
          </div>

          {/* Se fosse Lucro Real */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Se Fosse Lucro Real (26,5%)
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Preço Nominal Total</span>
                <span className="font-medium">{formatCurrency(supplier.total_compras_12m)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Crédito Máximo de IBS/CBS</span>
                <span className="font-medium text-success">
                  {formatCurrency(creditoMaximo)} 
                  <span className="text-muted-foreground ml-1">({formatPercent(aliquotaMaxima)})</span>
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Custo Efetivo Líquido</span>
                <span className="text-success">{formatCurrency(custoEfetivoLucroReal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gap de Crédito */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">GAP de Crédito (vazamento de margem)</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(gapCredito)}<span className="text-sm font-normal">/ano</span>
              </p>
            </div>
          </div>
        </div>

        {/* Preço de Indiferença */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Preço de Indiferença
          </h4>
          <p className="text-sm text-muted-foreground">
            Para continuar competitivo, um fornecedor do <strong>Lucro Real</strong> poderia cobrar 
            até <strong className="text-primary">{formatCurrency(precoIndiferenca)}</strong> 
            ({variacaoPreco > 0 ? '+' : ''}{variacaoPreco.toFixed(1)}%) e você ainda teria o mesmo custo efetivo.
          </p>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1 min-w-[200px]">
            <FileText className="w-4 h-4 mr-2" />
            Gerar Script de Renegociação
          </Button>
          <Button variant="default" className="flex-1 min-w-[200px]">
            <Search className="w-4 h-4 mr-2" />
            Buscar Alternativas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
