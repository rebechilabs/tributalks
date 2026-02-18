import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X, Star, Info } from "lucide-react";
import { ComparativoRegimesResult, RegimeType } from "@/types/comparativoRegimes";
import { formatarMoeda, formatarPercentual } from "@/utils/comparativoRegimesCalculations";

interface ComparisonTableProps {
  result: ComparativoRegimesResult;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  const { regimes, recomendado } = result;
  
  const regimesOrdenados = [...regimes].sort((a, b) => {
    if (!a.is_elegivel) return 1;
    if (!b.is_elegivel) return -1;
    return a.imposto_anual - b.imposto_anual;
  });
  
  return (
    <TooltipProvider>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Regime</TableHead>
              <TableHead className="text-right font-semibold">Imposto Anual</TableHead>
              <TableHead className="text-right font-semibold">Alíquota</TableHead>
              <TableHead className="text-right font-semibold">
                <div className="flex items-center justify-end gap-1">
                  Créditos
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Créditos tributários gerados que podem ser aproveitados por seus clientes (B2B) ou compensados internamente.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="font-semibold">Vantagem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regimesOrdenados.map((regime) => {
              const isRecomendado = regime.tipo === recomendado;
              const is2027 = regime.tipo.includes('2027');
              
              return (
                <TableRow 
                  key={regime.tipo}
                  className={`
                    ${isRecomendado ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
                    ${!regime.is_elegivel ? 'opacity-50' : ''}
                  `}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isRecomendado && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <div>
                        <span className={`font-medium ${isRecomendado ? 'text-primary' : ''}`}>
                          {regime.nome}
                        </span>
                        {is2027 && (
                          <Badge variant="outline" className="ml-2 text-xs">2027</Badge>
                        )}
                        {!regime.is_elegivel && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Inelegível
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{regime.motivo_inelegibilidade}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {regime.is_elegivel ? (
                      <span className={`font-mono ${isRecomendado ? 'font-bold text-primary' : ''}`}>
                        {formatarMoeda(regime.imposto_anual)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {regime.is_elegivel ? (
                      <span className="font-mono">
                        {formatarPercentual(regime.aliquota_efetiva)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {regime.creditos_gerados > 0 ? (
                      <span className="font-mono text-green-600 dark:text-green-400">
                        {formatarMoeda(regime.creditos_gerados)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">R$ 0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {regime.vantagem}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
