import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentAnalysisResults } from "@/components/documents/DocumentAnalysisResults";
import { FeatureGate } from "@/components/FeatureGate";
import { FileText, Sparkles, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ExtractedData {
  razaoSocial?: string;
  cnpj?: string;
  cnaesPrincipais?: string[];
  cnaesSecundarios?: string[];
  objetoSocial?: string;
  regimeTributario?: string;
  capitalSocial?: number;
  dataConstituicao?: string;
  socios?: { nome: string; participacao?: number }[];
  endereco?: { cidade?: string; uf?: string };
  atividadesIdentificadas?: string[];
}

export interface MatchedOpportunity {
  id: string;
  code: string;
  name: string;
  nameSimples: string;
  category: string;
  matchScore: number;
  matchReasons: string[];
  economiaDescricao?: string;
}

export interface AnalysisResult {
  extractedData: ExtractedData;
  matchedOpportunities: MatchedOpportunity[];
  totalMatches: number;
}

export default function AnalisadorDocumentos() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <DashboardLayout>
      <FeatureGate feature="document_analyzer">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Analisador de Documentos
                </h1>
                <p className="text-muted-foreground text-sm">
                  Upload de contratos sociais para identificação automática de oportunidades
                </p>
              </div>
            </div>
          </div>

          {/* Beta Notice */}
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Funcionalidade em Beta:</strong> O Analisador usa IA para extrair dados 
              de Contratos Sociais e cruzar com nossa base de 57+ oportunidades fiscais.
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
                    Contrato Social ou Estatuto Social
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Alterações contratuais consolidadas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Requerimento de Empresário (MEI/EI)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Formato PDF (texto legível, não escaneado)
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
