import { 
  Building2, 
  MapPin, 
  FileText, 
  Users, 
  TrendingUp,
  CheckCircle2,
  Loader2,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/pages/AnalisadorDocumentos";

interface DocumentAnalysisResultsProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

export function DocumentAnalysisResults({ result, isAnalyzing }: DocumentAnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h3 className="font-medium text-foreground mb-2">Analisando documento...</h3>
          <p className="text-sm text-muted-foreground text-center">
            Extraindo dados e buscando oportunidades fiscais compatíveis
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-foreground mb-2">Nenhum documento analisado</h3>
          <p className="text-sm text-muted-foreground">
            Faça upload de um Contrato Social para identificar oportunidades fiscais
          </p>
        </div>
      </div>
    );
  }

  const { extractedData, matchedOpportunities } = result;

  return (
    <div className="space-y-4">
      {/* Extracted Data Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Dados Extraídos
        </h3>

        <div className="space-y-4">
          {extractedData.razaoSocial && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Razão Social</p>
                <p className="font-medium text-foreground">{extractedData.razaoSocial}</p>
              </div>
            </div>
          )}

          {extractedData.cnpj && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">CNPJ</p>
                <p className="font-medium text-foreground">{extractedData.cnpj}</p>
              </div>
            </div>
          )}

          {extractedData.endereco?.cidade && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Localização</p>
                <p className="font-medium text-foreground">
                  {extractedData.endereco.cidade}, {extractedData.endereco.uf}
                </p>
              </div>
            </div>
          )}

          {extractedData.regimeTributario && (
            <div className="flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Regime Tributário</p>
                <Badge variant="outline">{extractedData.regimeTributario}</Badge>
              </div>
            </div>
          )}

          {extractedData.cnaesPrincipais && extractedData.cnaesPrincipais.length > 0 && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">CNAEs Identificados</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {extractedData.cnaesPrincipais.slice(0, 5).map((cnae) => (
                    <Badge key={cnae} variant="secondary" className="text-xs">
                      {cnae}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {extractedData.socios && extractedData.socios.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Sócios</p>
                <p className="text-sm text-foreground">
                  {extractedData.socios.map(s => s.nome).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matched Opportunities */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Oportunidades Identificadas
          </h3>
          <Badge variant="secondary">{matchedOpportunities.length} encontradas</Badge>
        </div>

        {matchedOpportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma oportunidade identificada com base nos dados extraídos.
            Complete o perfil da empresa para um matching mais preciso.
          </p>
        ) : (
          <div className="space-y-3">
            {matchedOpportunities.slice(0, 8).map((opp) => (
              <div 
                key={opp.id}
                className="p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {opp.nameSimples}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {opp.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Compatibilidade</p>
                    <p className="font-semibold text-primary">{opp.matchScore}%</p>
                  </div>
                </div>
                <Progress value={opp.matchScore} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1">
                  {opp.matchReasons.slice(0, 2).map((reason, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-success" />
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {matchedOpportunities.length > 0 && (
          <Link to="/dashboard/oportunidades" className="block mt-4">
            <Button variant="outline" className="w-full">
              Ver todas as oportunidades no Dashboard
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
