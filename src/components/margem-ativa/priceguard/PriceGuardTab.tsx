import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Tag, TrendingUp, AlertTriangle } from "lucide-react";
import { PriceGuardForm } from "./PriceGuardForm";
import { PriceSimulationTable } from "./PriceSimulationTable";
import { usePriceGuard } from "@/hooks/usePriceGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PriceGuardTab() {
  const [showForm, setShowForm] = useState(false);
  const { simulations, loading, refetch, saveSimulation, deleteSimulation } = usePriceGuard();

  // Calculate summary metrics
  const totalSkus = simulations.length;
  const variacaoMedia = simulations.length > 0
    ? simulations.reduce((sum, s) => sum + (s.variacao_preco_percent || 0), 0) / simulations.length
    : 0;
  const skusEmRisco = simulations.filter(s => (s.gap_competitivo_percent || 0) > 5).length;

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const handleSaveSimulation = async (data: any) => {
    await saveSimulation(data);
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SKUs Simulados</p>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold">{totalSkus}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Variação Média</p>
                {loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold text-warning">{formatPercent(variacaoMedia)}</p>
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
                <p className="text-sm text-muted-foreground">SKUs em Risco</p>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-xl font-bold text-destructive">{skusEmRisco}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Simulador de Preços 2026</CardTitle>
              <CardDescription>
                Calcule o preço de venda necessário para manter sua margem após a Reforma
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Importar NCMs
              </Button>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Simulação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Simulação de Preço</DialogTitle>
                  </DialogHeader>
                  <PriceGuardForm 
                    onSubmit={handleSaveSimulation}
                    onCancel={() => setShowForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PriceSimulationTable 
            simulations={simulations}
            loading={loading}
            onDelete={deleteSimulation}
            onRefresh={refetch}
          />

          {simulations.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar Tabela de Preços 2026
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
