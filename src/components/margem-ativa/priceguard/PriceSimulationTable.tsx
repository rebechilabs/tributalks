import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceSimulation {
  id: string;
  sku_code: string | null;
  product_name: string;
  ncm_code: string | null;
  preco_atual: number;
  preco_2026_necessario: number | null;
  variacao_preco_percent: number | null;
  gap_competitivo_percent: number | null;
}

interface PriceSimulationTableProps {
  simulations: PriceSimulation[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function PriceSimulationTable({ simulations, loading, onDelete, onRefresh }: PriceSimulationTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta simulação?')) {
      await onDelete(id);
      onRefresh();
    }
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

  if (simulations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma simulação encontrada.</p>
        <p className="text-sm mt-2">Clique em "Nova Simulação" para calcular o preço de um produto.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>NCM</TableHead>
            <TableHead className="text-right">Preço Atual</TableHead>
            <TableHead className="text-right">Preço 2026</TableHead>
            <TableHead className="text-right">Variação</TableHead>
            <TableHead className="text-center">Gap</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {simulations.map((sim) => {
            const hasGap = (sim.gap_competitivo_percent || 0) > 5;
            
            return (
              <TableRow key={sim.id}>
                <TableCell className="font-mono text-sm">
                  {sim.sku_code || '-'}
                </TableCell>
                <TableCell className="font-medium">
                  {sim.product_name}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {sim.ncm_code || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sim.preco_atual)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {sim.preco_2026_necessario 
                    ? formatCurrency(sim.preco_2026_necessario) 
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-medium",
                    (sim.variacao_preco_percent || 0) >= 0 ? "text-warning" : "text-success"
                  )}>
                    {formatPercent(sim.variacao_preco_percent)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {hasGap ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {formatPercent(sim.gap_competitivo_percent)}
                    </Badge>
                  ) : sim.gap_competitivo_percent ? (
                    <span className="text-sm text-muted-foreground">
                      {formatPercent(sim.gap_competitivo_percent)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(sim.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
