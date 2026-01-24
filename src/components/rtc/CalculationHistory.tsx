import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, RefreshCw, Eye, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaxCalculation {
  id: string;
  created_at: string;
  municipio_nome: string | null;
  uf: string | null;
  items_count: number | null;
  total_cbs: number | null;
  total_ibs_uf: number | null;
  total_ibs_mun: number | null;
  total_is: number | null;
  total_geral: number | null;
  has_simulated_data: boolean | null;
  input_data: any;
  result_data: any;
}

interface CalculationHistoryProps {
  onLoadCalculation: (inputData: any) => void;
}

export function CalculationHistory({ onLoadCalculation }: CalculationHistoryProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<TaxCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCalculations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setCalculations(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("tax_calculations")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setCalculations((prev) => prev.filter((c) => c.id !== deleteId));
      toast({
        title: "Sucesso",
        description: "Cálculo excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cálculo.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number | null) =>
    value
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value)
      : "-";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando histórico...</span>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum cálculo realizado ainda
          </h3>
          <p className="text-muted-foreground mb-4">
            Faça seu primeiro cálculo de tributos para vê-lo aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cálculo? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Histórico de Cálculos</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchCalculations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Município/UF</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-right">Total CBS</TableHead>
                  <TableHead className="text-right">Total IBS</TableHead>
                  <TableHead className="text-right">Total Geral</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(calc.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                      {calc.has_simulated_data && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs border-yellow-500 text-yellow-500"
                        >
                          Simulado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {calc.municipio_nome || "-"} / {calc.uf || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {calc.items_count || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calc.total_cbs)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        (calc.total_ibs_uf || 0) + (calc.total_ibs_mun || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(calc.total_geral)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLoadCalculation(calc.input_data)}
                          title="Refazer cálculo"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(calc.id)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
