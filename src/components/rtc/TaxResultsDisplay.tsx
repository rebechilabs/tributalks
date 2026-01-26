import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertTriangle, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { WARNING_MESSAGES } from "./rtcConstants";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";

interface TaxResultsDisplayProps {
  results: {
    data: any;
    totals: {
      cbs: number;
      ibsUf: number;
      ibsMun: number;
      is: number;
      total: number;
    };
    warning: number | null;
    timestamp: string;
  };
  onNewCalculation: () => void;
}

const COLORS = {
  cbs: "hsl(210, 100%, 50%)",
  ibsUf: "hsl(140, 70%, 45%)",
  ibsMun: "hsl(45, 100%, 50%)",
  is: "hsl(0, 70%, 50%)",
};

export function TaxResultsDisplay({
  results,
  onNewCalculation,
}: TaxResultsDisplayProps) {
  const { totals, warning, data } = results;

  const chartData = useMemo(() => {
    const items = [];
    if (totals.cbs > 0) items.push({ name: "CBS", value: totals.cbs, color: COLORS.cbs });
    if (totals.ibsUf > 0) items.push({ name: "IBS Estadual", value: totals.ibsUf, color: COLORS.ibsUf });
    if (totals.ibsMun > 0) items.push({ name: "IBS Municipal", value: totals.ibsMun, color: COLORS.ibsMun });
    if (totals.is > 0) items.push({ name: "Imposto Seletivo", value: totals.is, color: COLORS.is });
    return items;
  }, [totals]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warning Alert */}
      {warning && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Atenção:</strong>{" "}
            {WARNING_MESSAGES[warning] ||
              "Este cálculo utiliza dados simulados. As alíquotas oficiais ainda não foram definidas em lei."}
          </AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-200">
          Cálculo realizado com sucesso e salvo no seu histórico.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Resumo dos Tributos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Values */}
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.cbs }}
                  />
                  <span className="text-muted-foreground">CBS</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(totals.cbs)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.ibsUf }}
                  />
                  <span className="text-muted-foreground">IBS Estadual</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(totals.ibsUf)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.ibsMun }}
                  />
                  <span className="text-muted-foreground">IBS Municipal</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(totals.ibsMun)}
                </span>
              </div>

              {totals.is > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.is }}
                    />
                    <span className="text-muted-foreground">Imposto Seletivo</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(totals.is)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-bold text-foreground">
                  TOTAL DE TRIBUTOS
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details per Item */}
      {data?.itens && data.itens.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Detalhamento por Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead className="text-right">Base Cálculo</TableHead>
                    <TableHead className="text-right">CBS</TableHead>
                    <TableHead className="text-right">IBS UF</TableHead>
                    <TableHead className="text-right">IBS Mun</TableHead>
                    <TableHead className="text-right">IS</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.itens.map((item: any, index: number) => {
                    const tributos = item.tributosCalculados || {};
                    const cbs = tributos.cbs?.valor || 0;
                    const ibsUf = tributos.ibsUf?.valor || 0;
                    const ibsMun = tributos.ibsMun?.valor || 0;
                    const is = tributos.is?.valor || 0;
                    const itemTotal = cbs + ibsUf + ibsMun + is;

                    return (
                      <TableRow key={index}>
                        <TableCell>{item.numero || index + 1}</TableCell>
                        <TableCell className="font-mono">{item.ncm}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.baseCalculo || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cbs)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(ibsUf)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(ibsMun)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(is)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(itemTotal)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Memory of Calculation */}
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="memoria">
                <AccordionTrigger className="text-muted-foreground">
                  Memória de Cálculo
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {data.itens.map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-background rounded-lg">
                        <p className="font-medium mb-1">
                          Item {item.numero || index + 1} - NCM {item.ncm}
                        </p>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {item.memoriaCalculo ||
                            JSON.stringify(item.tributosCalculados, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onNewCalculation} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Novo Cálculo
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF (em breve)
        </Button>
      </div>

      {/* Professional Disclaimer */}
      <TaxDisclaimer />
    </div>
  );
}
