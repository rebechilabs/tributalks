import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Award, Users } from "lucide-react";
import { useScoreBenchmark } from "@/hooks/useScoreBenchmark";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ScoreBenchmarkCard() {
  const { benchmark, evolution, loading } = useScoreBenchmark();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!benchmark && !evolution) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Sua Posição no Mercado
        </CardTitle>
        <CardDescription>
          Compare seu Score com empresas do mesmo setor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benchmark Comparison */}
        {benchmark && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Setor: {benchmark.sectorName}
                </span>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Média: {benchmark.avgScore} pts
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Você está melhor que</span>
                <span className="font-bold text-primary">
                  {benchmark.userPercentile}% das empresas
                </span>
              </div>
              <div className="relative">
                <Progress value={benchmark.userPercentile} className="h-3" />
                <div 
                  className="absolute top-0 h-3 w-0.5 bg-foreground/50"
                  style={{ left: `${(benchmark.avgScore / 100) * 100}%` }}
                  title={`Média do setor: ${benchmark.avgScore}`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>Média</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Evolution Stats */}
        {evolution && evolution.previousScore !== null && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Evolução</span>
              {evolution.changeDirection === "up" && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{evolution.changeAmount} pts
                </Badge>
              )}
              {evolution.changeDirection === "down" && (
                <Badge variant="destructive" className="gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -{evolution.changeAmount} pts
                </Badge>
              )}
              {evolution.changeDirection === "stable" && (
                <Badge variant="secondary" className="gap-1">
                  <Minus className="h-3 w-3" />
                  Estável
                </Badge>
              )}
            </div>

            {evolution.firstScoreDate && evolution.totalChange !== 0 && (
              <div className="text-sm text-muted-foreground">
                Desde {format(evolution.firstScoreDate, "MMM 'de' yyyy", { locale: ptBR })}:{" "}
                <span className={evolution.totalChange > 0 ? "text-primary font-medium" : "text-destructive font-medium"}>
                  {evolution.totalChange > 0 ? "+" : ""}{evolution.totalChange} pts
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
