import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { WorkflowRunner } from "@/components/workflows/WorkflowRunner";
import { Route, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  toolPath: string;
  duration: string;
  status: 'pending' | 'current' | 'completed';
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  estimatedTime: string;
  steps: WorkflowStep[];
  icon: string;
  popular?: boolean;
}

export const workflows: Workflow[] = [
  {
    id: "diagnostico-completo",
    title: "Diagnóstico Tributário Completo",
    description: "Análise completa da saúde fiscal da empresa: XMLs, créditos, DRE e oportunidades em um único fluxo.",
    targetAudience: "Empresas que querem uma visão 360° da sua situação tributária",
    estimatedTime: "45-60 min",
    icon: "Target",
    popular: true,
    steps: [
      {
        id: "1",
        title: "Importar XMLs",
        description: "Upload das notas fiscais dos últimos 12-24 meses",
        tool: "Importador de XMLs",
        toolPath: "/dashboard/importar-xml",
        duration: "10-15 min",
        status: "pending",
      },
      {
        id: "2",
        title: "Análise de Créditos",
        description: "Identificação automática de créditos não aproveitados",
        tool: "Radar de Créditos",
        toolPath: "/dashboard/radar-creditos",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "3",
        title: "DRE Inteligente",
        description: "Preenchimento do demonstrativo de resultados",
        tool: "DRE Inteligente",
        toolPath: "/dashboard/dre",
        duration: "15-20 min",
        status: "pending",
      },
      {
        id: "4",
        title: "Score Tributário",
        description: "Cálculo da nota de saúde fiscal",
        tool: "Score Tributário",
        toolPath: "/dashboard/score-tributario",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "5",
        title: "Oportunidades",
        description: "Matching com benefícios fiscais disponíveis",
        tool: "Oportunidades Fiscais",
        toolPath: "/dashboard/oportunidades",
        duration: "10 min",
        status: "pending",
      },
    ],
  },
  {
    id: "preparacao-reforma",
    title: "Preparação para a Reforma",
    description: "Entenda como a Reforma Tributária impactará sua empresa e prepare-se para 2026.",
    targetAudience: "Empresas preocupadas com as mudanças do sistema CBS/IBS",
    estimatedTime: "30-40 min",
    icon: "MapPin",
    steps: [
      {
        id: "1",
        title: "Timeline da Reforma",
        description: "Visualize os prazos e marcos importantes",
        tool: "Timeline 2026-2033",
        toolPath: "/dashboard/timeline-reforma",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "2",
        title: "Simulação de Alíquotas",
        description: "Calcule os novos impostos CBS/IBS para seus produtos",
        tool: "Calculadora RTC",
        toolPath: "/calculadora/rtc",
        duration: "15-20 min",
        status: "pending",
      },
      {
        id: "3",
        title: "Comparativo de Regimes",
        description: "Compare Simples, Presumido e Real no novo cenário",
        tool: "Comparativo de Regimes",
        toolPath: "/calculadora/comparativo-regimes",
        duration: "10 min",
        status: "pending",
      },
      {
        id: "4",
        title: "Notícias e Atualizações",
        description: "Acompanhe as últimas novidades da legislação",
        tool: "Feed de Notícias",
        toolPath: "/noticias",
        duration: "5 min",
        status: "pending",
      },
    ],
  },
  {
    id: "analise-contratos",
    title: "Análise de Contratos Societários",
    description: "Upload de documentos societários para identificação de oportunidades fiscais.",
    targetAudience: "Contadores e consultores tributários",
    estimatedTime: "15-20 min",
    icon: "FileSearch",
    steps: [
      {
        id: "1",
        title: "Upload do Contrato Social",
        description: "Envie o PDF do contrato ou alteração consolidada",
        tool: "Analisador de Documentos",
        toolPath: "/dashboard/analisador-documentos",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "2",
        title: "Revisão de Dados",
        description: "Valide os dados extraídos pela IA",
        tool: "Analisador de Documentos",
        toolPath: "/dashboard/analisador-documentos",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "3",
        title: "Oportunidades Identificadas",
        description: "Veja as oportunidades compatíveis com o perfil",
        tool: "Oportunidades Fiscais",
        toolPath: "/dashboard/oportunidades",
        duration: "5-10 min",
        status: "pending",
      },
    ],
  },
  {
    id: "simulacao-precos",
    title: "Simulação de Preços",
    description: "Calcule o impacto do Split Payment nos seus preços de venda.",
    targetAudience: "Empresas de varejo e e-commerce",
    estimatedTime: "20-25 min",
    icon: "Wallet",
    steps: [
      {
        id: "1",
        title: "Score Tributário",
        description: "Avalie sua situação fiscal atual",
        tool: "Score Tributário",
        toolPath: "/dashboard/score-tributario",
        duration: "5 min",
        status: "pending",
      },
      {
        id: "2",
        title: "Simulador Split Payment",
        description: "Calcule a retenção na fonte por produto",
        tool: "Split Payment",
        toolPath: "/calculadora/split-payment",
        duration: "10 min",
        status: "pending",
      },
      {
        id: "3",
        title: "Calculadora RTC",
        description: "Simule diferentes cenários de alíquotas",
        tool: "Calculadora RTC",
        toolPath: "/calculadora/rtc",
        duration: "10 min",
        status: "pending",
      },
    ],
  },
];

export default function WorkflowsGuiados() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  return (
    <DashboardLayout>
      <FeatureGate feature="workflows">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Route className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Workflows Guiados
                </h1>
                <p className="text-muted-foreground text-sm">
                  Sequências passo a passo para atingir objetivos específicos
                </p>
              </div>
            </div>
          </div>

          {/* Beta Notice */}
          <Alert className="mb-6 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Funcionalidade em Beta:</strong> Os Workflows combinam múltiplas ferramentas 
              em uma sequência lógica para guiar você até o resultado desejado.
            </AlertDescription>
          </Alert>

          {/* Main Content */}
          {selectedWorkflow ? (
            <WorkflowRunner 
              workflow={selectedWorkflow} 
              onBack={() => setSelectedWorkflow(null)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflows.map((workflow, index) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  index={index}
                  onStart={() => setSelectedWorkflow(workflow)}
                />
              ))}
            </div>
          )}
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
