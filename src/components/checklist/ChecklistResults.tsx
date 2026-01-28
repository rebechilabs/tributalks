import { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  Download,
  RefreshCw,
  TrendingUp,
  Shield,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  checklistBlocks, 
  riskLevelLabels,
  ChecklistResponse 
} from "@/data/checklistReformaItems";
import { ChecklistResults as ChecklistResultsType } from "./ChecklistWizard";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";

interface ChecklistResultsProps {
  results: ChecklistResultsType;
  onRestart: () => void;
  onDownloadPdf: () => void;
}

export function ChecklistResults({ 
  results, 
  onRestart, 
  onDownloadPdf 
}: ChecklistResultsProps) {
  const riskConfig = riskLevelLabels[results.riskLevel];

  // Calculate block-level summaries
  const blockSummaries = checklistBlocks.map(block => {
    const blockResponses = block.items.map(item => results.responses[item.key]);
    const simCount = blockResponses.filter(r => r === 'sim').length;
    const parcialCount = blockResponses.filter(r => r === 'parcial').length;
    const naoCount = blockResponses.filter(r => r === 'nao').length;
    const naoSeiCount = blockResponses.filter(r => r === 'nao_sei').length;
    
    const score = Math.round(
      ((simCount * 100) + (parcialCount * 50)) / block.items.length
    );

    return {
      title: block.title,
      score,
      simCount,
      parcialCount,
      naoCount,
      naoSeiCount,
      total: block.items.length
    };
  });

  // Generate recommendations based on low-scoring blocks
  const recommendations = blockSummaries
    .filter(b => b.score < 60)
    .map(b => {
      if (b.title === "Sistemas e Tecnologia") {
        return "Agende uma reunião com seu fornecedor de ERP para verificar o roadmap de atualizações para a reforma.";
      }
      if (b.title === "Gestão de Créditos") {
        return "Considere realizar uma auditoria de créditos tributários para identificar valores a recuperar antes da transição.";
      }
      if (b.title === "Fluxo de Caixa e Split Payment") {
        return "Projete cenários de fluxo de caixa considerando a retenção do Split Payment.";
      }
      if (b.title === "Governança e Responsabilidades") {
        return "Defina formalmente um responsável interno para coordenar a adaptação à reforma.";
      }
      return `Revise os pontos pendentes em "${b.title}" com prioridade.`;
    });

  const scoreColor = results.readinessScore >= 80 
    ? 'text-green-600' 
    : results.readinessScore >= 60 
      ? 'text-yellow-600' 
      : results.readinessScore >= 40 
        ? 'text-orange-600' 
        : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Resultado do Checklist de Prontidão</h2>
            
            <div className="flex items-center justify-center gap-8 py-6">
              {/* Score Circle */}
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${results.readinessScore * 3.52} 352`}
                    className={scoreColor}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor}`}>
                    {results.readinessScore}%
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-1">Nível de Risco</p>
                <p className={`text-2xl font-bold ${riskConfig.color}`}>
                  {riskConfig.label}
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  {riskConfig.description}
                </p>
              </div>
            </div>

            {/* Response Summary */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xl font-bold">{results.simCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Sim</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xl font-bold">{results.parcialCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Parcial</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xl font-bold">{results.naoCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Não</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                  <HelpCircle className="h-4 w-4" />
                  <span className="text-xl font-bold">{results.naoSeiCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Não sei</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block-by-Block Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Análise por Área
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockSummaries.map((block, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{block.title}</span>
                <span className={`text-sm font-bold ${
                  block.score >= 80 ? 'text-green-600' :
                  block.score >= 60 ? 'text-yellow-600' :
                  block.score >= 40 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {block.score}%
                </span>
              </div>
              <Progress value={block.score} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="text-green-600">✓ {block.simCount}</span>
                <span className="text-yellow-600">◐ {block.parcialCount}</span>
                <span className="text-red-600">✗ {block.naoCount}</span>
                <span className="text-gray-600">? {block.naoSeiCount}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Risks */}
      {results.topRisks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Principais Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {results.topRisks.map((risk, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-orange-900">{risk.blockTitle}</p>
                    <p className="text-orange-700">{risk.itemQuestion}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
              Próximos Passos Sugeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2 text-sm text-blue-900">
                  <span className="text-blue-600">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onDownloadPdf} className="gap-2">
          <Download className="h-4 w-4" />
          Baixar Relatório PDF
        </Button>
        <Button variant="outline" onClick={onRestart} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refazer Checklist
        </Button>
      </div>

      {/* Disclaimer */}
      <TaxDisclaimer />
    </div>
  );
}
