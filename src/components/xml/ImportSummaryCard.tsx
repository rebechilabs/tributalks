import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  Building2,
  Coins,
  BarChart3,
  FileDown,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface YearStats {
  year: number;
  count: number;
  totalValue: number;
  currentTaxes: number;
  reformTaxes: number;
}

export interface SupplierStats {
  name: string;
  cnpj: string;
  notesCount: number;
  totalValue: number;
}

export interface CreditFound {
  category: string;
  potential: number;
  confidence: 'high' | 'medium' | 'low';
  count: number;
}

export interface ImportError {
  fileName: string;
  errorType: string;
  message: string;
}

export interface ImportSummaryData {
  totalProcessed: number;
  totalErrors: number;
  processingTimeMs: number;
  byYear: YearStats[];
  topSuppliers: SupplierStats[];
  creditsFound: CreditFound[];
  errors: ImportError[];
  totalCreditsValue: number;
}

interface ImportSummaryCardProps {
  data: ImportSummaryData;
  onViewDetails?: () => void;
  onDownloadPdf?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}min ${remainingSeconds}s`;
}

function getConfidenceBadge(confidence: 'high' | 'medium' | 'low') {
  switch (confidence) {
    case 'high':
      return <Badge variant="default" className="bg-green-500/10 text-green-600">Alta</Badge>;
    case 'medium':
      return <Badge variant="default" className="bg-amber-500/10 text-amber-600">Média</Badge>;
    case 'low':
      return <Badge variant="default" className="bg-red-500/10 text-red-600">Baixa</Badge>;
  }
}

export function ImportSummaryCard({ data, onViewDetails, onDownloadPdf }: ImportSummaryCardProps) {
  const navigate = useNavigate();
  
  const totalCurrentTaxes = data.byYear.reduce((acc, y) => acc + y.currentTaxes, 0);
  const totalReformTaxes = data.byYear.reduce((acc, y) => acc + y.reformTaxes, 0);
  const taxDifference = totalReformTaxes - totalCurrentTaxes;
  const isReformBeneficial = taxDifference < 0;

  return (
    <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Importação Concluída</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.totalProcessed} arquivos processados em {formatTime(data.processingTimeMs)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{data.totalProcessed}</span>
            </div>
            {data.totalErrors > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{data.totalErrors}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(data.processingTimeMs)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics by Year */}
        {data.byYear.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Estatísticas por Período</h3>
            </div>
            
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Ano</TableHead>
                    <TableHead className="text-right">Notas</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Tributos Atuais</TableHead>
                    <TableHead className="text-right">Com Reforma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byYear.map((year) => {
                    const diff = year.reformTaxes - year.currentTaxes;
                    const isPositive = diff < 0;
                    
                    return (
                      <TableRow key={year.year}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell className="text-right">{year.count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(year.totalValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(year.currentTaxes)}</TableCell>
                        <TableCell className="text-right">
                          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(year.reformTaxes)}
                            {isPositive ? (
                              <TrendingDown className="inline h-3 w-3 ml-1" />
                            ) : (
                              <TrendingUp className="inline h-3 w-3 ml-1" />
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Total comparison */}
            <div className={`p-3 rounded-lg ${isReformBeneficial ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {isReformBeneficial ? 'Economia potencial com reforma:' : 'Aumento potencial com reforma:'}
                </span>
                <span className={`font-bold ${isReformBeneficial ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(taxDifference))}
                  {isReformBeneficial ? ' ↓' : ' ↑'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Credits Found */}
        {data.creditsFound.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium">Créditos Identificados</h3>
            </div>
            
            <div className="space-y-2">
              {data.creditsFound.map((credit, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{credit.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ({credit.count} oportunidades)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-600">
                      {formatCurrency(credit.potential)}
                    </span>
                    {getConfidenceBadge(credit.confidence)}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-medium">Total Potencial de Recuperação</span>
                <span className="font-bold text-lg text-amber-600">
                  {formatCurrency(data.totalCreditsValue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Suppliers */}
        {data.topSuppliers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Top 5 Fornecedores</h3>
            </div>
            
            <div className="space-y-2">
              {data.topSuppliers.slice(0, 5).map((supplier, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="font-medium truncate max-w-[200px]">{supplier.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{supplier.notesCount} notas</span>
                    <span className="font-medium">{formatCurrency(supplier.totalValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {data.errors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <h3 className="font-medium">Erros Encontrados</h3>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {data.errors.map((error, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded text-sm bg-destructive/5 text-destructive"
                >
                  <span className="truncate">{error.fileName}:</span>
                  <span className="text-muted-foreground">{error.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button 
            onClick={() => navigate('/dashboard/xml-resultados')}
            className="flex-1"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Resultados Detalhados
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {data.creditsFound.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard/radar-creditos')}
            >
              <Coins className="mr-2 h-4 w-4" />
              Radar de Créditos
            </Button>
          )}
          
          {onDownloadPdf && (
            <Button variant="outline" onClick={onDownloadPdf}>
              <FileDown className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
