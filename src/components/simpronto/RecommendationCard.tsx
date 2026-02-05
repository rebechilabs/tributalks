import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";
import { SimprontoResult, RegimeType } from "@/types/simpronto";
import { NOMES_REGIMES, formatarMoeda } from "@/utils/simprontoCalculations";

interface RecommendationCardProps {
  result: SimprontoResult;
}

export function RecommendationCard({ result }: RecommendationCardProps) {
  const regimeRecomendado = result.regimes.find(r => r.tipo === result.recomendado);
  const is2027 = result.recomendado.includes('2027');
  
  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Regime Recomendado
          </CardTitle>
          {is2027 && (
            <Badge variant="outline" className="border-primary text-primary">
              Reforma 2027
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regime recomendado */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">O regime mais econômico para você é:</p>
          <p className="text-2xl font-bold text-primary">
            {NOMES_REGIMES[result.recomendado]}
          </p>
        </div>
        
        {/* Economia estimada */}
        {result.economia_vs_segundo > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Economia estimada por ano</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatarMoeda(result.economia_vs_segundo)}
              </p>
              <p className="text-xs text-muted-foreground">
                em comparação com a segunda melhor opção
              </p>
            </div>
          </div>
        )}
        
        {/* Imposto do regime recomendado */}
        {regimeRecomendado && (
          <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Imposto Anual Estimado</p>
              <p className="text-lg font-semibold">{formatarMoeda(regimeRecomendado.imposto_anual)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
              <p className="text-lg font-semibold">{regimeRecomendado.aliquota_efetiva.toFixed(1)}%</p>
            </div>
          </div>
        )}
        
        {/* Justificativa */}
        <div className="space-y-2 pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.justificativa}
          </p>
        </div>
        
        {/* Disclaimer */}
        {is2027 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mt-4">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {result.disclaimer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
