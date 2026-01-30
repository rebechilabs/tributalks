import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentAnalysisResults } from "@/components/documents/DocumentAnalysisResults";
import { FeatureGate } from "@/components/FeatureGate";
import { Scale, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ClauseAnalysis {
  clausula: string;
  tipo: "positivo" | "atencao" | "melhoria";
  descricao: string;
  sugestao?: string;
}

export interface DocumentSuggestion {
  titulo: string;
  descricao: string;
  motivo: string;
}

export interface LegalAnalysisResult {
  tipoDocumento: string;
  resumoGeral: string;
  pontosPositivos: ClauseAnalysis[];
  pontosAtencao: ClauseAnalysis[];
  sugestoesMelhorias: ClauseAnalysis[];
  documentoSugerido?: DocumentSuggestion;
  avaliacaoGeral: {
    nota: number;
    classificacao: "Excelente" | "Bom" | "Regular" | "Requer Atenção";
  };
}

export default function AnalisadorDocumentos() {
  const [analysisResult, setAnalysisResult] = useState<LegalAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <DashboardLayout>
      <FeatureGate feature="document_analyzer">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Analisador de Documentos
                </h1>
                <p className="text-muted-foreground text-sm">
                  Análise jurídica inteligente de contratos e documentos legais
                </p>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <Alert className="mb-6 border-warning/30 bg-warning/5">
            <ShieldCheck className="w-4 h-4 text-warning" />
            <AlertDescription className="text-sm">
              <strong>Aviso Importante:</strong> Esta ferramenta oferece orientação geral baseada em IA 
              e não substitui a consulta a um advogado. Para questões jurídicas complexas ou decisões 
              legais importantes, recomendamos sempre buscar assessoria profissional qualificada.
            </AlertDescription>
          </Alert>

          {/* Beta Notice */}
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Análise Jurídica com IA:</strong> Nossa IA analisa cláusulas contratuais, 
              identifica pontos de atenção, sugere melhorias e recomenda documentos mais adequados 
              para sua situação.
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <DocumentUploader
                onAnalysisComplete={setAnalysisResult}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />

              {/* Instructions */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Documentos Suportados
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Contratos de Prestação de Serviços
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Contratos Sociais e Estatutos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Contratos de Trabalho
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Acordos de Sócios e Acionistas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Termos de Confidencialidade (NDA)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Contratos de Locação
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">→</span>
                    <span>Formato PDF (texto legível)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Results Section */}
            <DocumentAnalysisResults
              result={analysisResult}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
