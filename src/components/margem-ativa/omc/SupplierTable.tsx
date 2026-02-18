import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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

interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onSelectSupplier: (supplier: Supplier) => void;
  selectedId?: string;
}

export function SupplierTable({ suppliers, loading, onSelectSupplier, selectedId }: SupplierTableProps) {
  const navigate = useNavigate();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    const clean = cnpj.replace(/\D/g, '');
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      simples: 'Simples',
      presumido: 'Presumido',
      real: 'Lucro Real',
      mei: 'MEI',
      desconhecido: 'Desconhecido'
    };
    return labels[regime] || regime;
  };

  const getRegimeColor = (regime: string) => {
    const colors: Record<string, string> = {
      simples: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      presumido: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      real: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      mei: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      desconhecido: 'bg-muted text-muted-foreground'
    };
    return colors[regime] || 'bg-muted text-muted-foreground';
  };

  const getClassificacaoLabel = (classificacao: string) => {
    const labels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      manter: { label: 'Manter', variant: 'secondary' },
      renegociar: { label: 'Renegociar', variant: 'default' },
      substituir: { label: 'Substituir', variant: 'destructive' },
      pendente: { label: 'Pendente', variant: 'outline' }
    };
    return labels[classificacao] || { label: classificacao, variant: 'outline' as const };
  };

  const calculateGap = (supplier: Supplier) => {
    // Gap = valor que poderia ter como crédito se fosse Lucro Real (26.5%) menos o crédito atual
    const creditoMaximo = supplier.total_compras_12m * 0.265;
    const creditoAtual = supplier.total_compras_12m * (supplier.aliquota_credito_estimada / 100);
    return creditoMaximo - creditoAtual;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="text-6xl mb-6">🧾</div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Vamos ativar sua Margem Ativa!
        </h3>
        <p className="text-sm text-muted-foreground mb-2 max-w-lg">
          Para analisar seus fornecedores e calcular o impacto da Reforma Tributária na sua margem, 
          precisamos das suas <strong className="text-foreground">notas fiscais de compra em formato XML</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg">
          É simples: importe os XMLs uma vez e tudo aparece automaticamente aqui. 🎯
        </p>

        <label
          htmlFor="xml-upload-margem"
          className="cursor-pointer group flex flex-col items-center justify-center w-full max-w-md py-10 px-6 border-2 border-dashed border-yellow-500/40 rounded-2xl hover:border-yellow-400 hover:bg-yellow-500/5 transition-all duration-200"
        >
          <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">⬆️</span>
          <span className="text-base font-semibold text-yellow-400 mb-1">
            Clique aqui para importar seus XMLs
          </span>
          <span className="text-xs text-muted-foreground">
            ou arraste os arquivos direto aqui
          </span>
          <span className="text-xs text-muted-foreground/60 mt-3">
            Aceita arquivos .xml de NF-e de compra
          </span>
          <input
            id="xml-upload-margem"
            type="file"
            accept=".xml"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                navigate('/dashboard/importar-xml');
              }
            }}
          />
        </label>

        <div className="flex items-start gap-2 mt-6 max-w-md bg-muted/50 rounded-xl px-4 py-3 text-left">
          <span className="text-lg mt-0.5">💡</span>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground/80">Dica:</strong> Quanto mais notas você importar, mais precisa fica a análise de fornecedores e o cálculo do impacto na sua margem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Regime</TableHead>
            <TableHead className="text-right">Compras 12m</TableHead>
            <TableHead className="text-right">Gap Crédito</TableHead>
            <TableHead className="text-center">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => {
            const gap = calculateGap(supplier);
            const classificacao = getClassificacaoLabel(supplier.classificacao);
            
            return (
              <TableRow 
                key={supplier.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedId === supplier.id && "bg-primary/5"
                )}
                onClick={() => onSelectSupplier(supplier)}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {supplier.razao_social || 'Não identificado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCNPJ(supplier.cnpj)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn("text-xs px-2 py-1 rounded-full", getRegimeColor(supplier.regime_tributario))}>
                    {getRegimeLabel(supplier.regime_tributario)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(supplier.total_compras_12m)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-medium",
                    gap > 0 ? "text-destructive" : "text-success"
                  )}>
                    {formatCurrency(gap)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={classificacao.variant}>
                    {classificacao.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
