import { 
  Scale, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  FileText,
  Star,
  TrendingUp,
  Shield,
  FileCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { LegalAnalysisResult, ClauseAnalysis } from "@/pages/AnalisadorDocumentos";

interface DocumentAnalysisResultsProps {
  result: LegalAnalysisResult | null;
  isAnalyzing: boolean;
}

function ClauseCard({ clause, type }: { clause: ClauseAnalysis; type: "positivo" | "atencao" | "melhoria" }) {
  const config = {
    positivo: {
      icon: CheckCircle2,
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      iconColor: "text-success",
      badgeVariant: "default" as const,
    },
    atencao: {
      icon: AlertTriangle,
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      iconColor: "text-warning",
      badgeVariant: "secondary" as const,
    },
    melhoria: {
      icon: Lightbulb,
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      iconColor: "text-primary",
      badgeVariant: "outline" as const,
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = config[type];

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm mb-1">
            {clause.clausula}
          </p>
          <p className="text-sm text-muted-foreground">
            {clause.descricao}
          </p>
          {clause.sugestao && (
            <div className="mt-2 p-2 bg-background/50 rounded border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Sugestão:</strong> {clause.sugestao}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingBadge({ nota, classificacao }: { nota: number; classificacao: string }) {
  const getColor = () => {
    if (nota >= 8) return "bg-success text-success-foreground";
    if (nota >= 6) return "bg-primary text-primary-foreground";
    if (nota >= 4) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`px-4 py-2 rounded-lg ${getColor()} font-bold text-lg`}>
        {nota}/10
      </div>
      <div>
        <p className="font-medium text-foreground">{classificacao}</p>
        <p className="text-xs text-muted-foreground">Avaliação Geral</p>
      </div>
    </div>
  );
}

export function DocumentAnalysisResults({ result, isAnalyzing }: DocumentAnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="font-medium text-foreground mb-2">Analisando documento...</h3>
            <p className="text-sm text-muted-foreground text-center">
              Verificando cláusulas, identificando riscos e preparando recomendações
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Scale className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-2">Nenhum documento analisado</h3>
            <p className="text-sm text-muted-foreground">
              Faça upload de um contrato para receber uma análise jurídica completa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Análise do Documento
            </CardTitle>
            <Badge variant="outline">{result.tipoDocumento}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Rating */}
            <div className="flex items-center justify-between">
              <RatingBadge 
                nota={result.avaliacaoGeral.nota} 
                classificacao={result.avaliacaoGeral.classificacao} 
              />
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4" />
                  Nota baseada em segurança jurídica
                </div>
              </div>
            </div>

            <Separator />

            {/* Summary */}
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.resumoGeral}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-lg font-bold text-success">{result.pontosPositivos.length}</p>
                <p className="text-xs text-muted-foreground">Pontos Positivos</p>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-1" />
                <p className="text-lg font-bold text-warning">{result.pontosAtencao.length}</p>
                <p className="text-xs text-muted-foreground">Atenção</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <Lightbulb className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-primary">{result.sugestoesMelhorias.length}</p>
                <p className="text-xs text-muted-foreground">Melhorias</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positive Points */}
      {result.pontosPositivos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              Pontos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.pontosPositivos.map((clause, i) => (
              <ClauseCard key={i} clause={clause} type="positivo" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attention Points */}
      {result.pontosAtencao.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.pontosAtencao.map((clause, i) => (
              <ClauseCard key={i} clause={clause} type="atencao" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Improvement Suggestions */}
      {result.sugestoesMelhorias.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              Sugestões de Melhoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.sugestoesMelhorias.map((clause, i) => (
              <ClauseCard key={i} clause={clause} type="melhoria" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Suggestion */}
      {result.documentoSugerido && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Documento Recomendado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                {result.documentoSugerido.titulo}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.documentoSugerido.descricao}
              </p>
              <div className="p-3 bg-background rounded-lg border border-border mt-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Por que recomendamos:</strong> {result.documentoSugerido.motivo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Disclaimer Footer */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong>Lembrete:</strong> Esta análise é uma orientação baseada em inteligência artificial 
            e não substitui o parecer de um advogado. Para decisões jurídicas importantes, 
            consulte sempre um profissional qualificado.
          </p>
        </div>
      </div>
    </div>
  );
}
