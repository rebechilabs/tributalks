import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  Users, 
  Calculator, 
  Send, 
  Clock,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { EnterpriseModal } from '@/components/landing/EnterpriseModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  tips: string[];
}

interface CreditImplementationWorkflowProps {
  totalRecoverable: number;
  creditsCount: number;
  onGenerateReport?: () => void;
}

export function CreditImplementationWorkflow({ 
  totalRecoverable, 
  creditsCount,
  onGenerateReport 
}: CreditImplementationWorkflowProps) {
  const { profile } = useAuth();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [enterpriseModalOpen, setEnterpriseModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const steps: WorkflowStep[] = [
    {
      id: 'review',
      title: 'Revisar Créditos Identificados',
      description: 'Analise os créditos identificados, verifique os valores e priorize os de alta confiança.',
      icon: FileText,
      tips: [
        'Créditos de alta confiança têm maior probabilidade de aprovação',
        'Verifique se os XMLs originais estão disponíveis para comprovação',
        'Agrupe créditos por tributo para facilitar a análise'
      ]
    },
    {
      id: 'report',
      title: 'Gerar Relatório para Contador',
      description: 'Exporte um relatório PDF detalhado com todas as informações necessárias.',
      icon: Calculator,
      action: {
        label: 'Gerar Relatório PDF',
        onClick: onGenerateReport
      },
      tips: [
        'O relatório inclui base legal para cada tipo de crédito',
        'Compartilhe com seu contador ou advogado tributarista',
        'Mantenha uma cópia para seus registros'
      ]
    },
    {
      id: 'validate',
      title: 'Validar com Profissional',
      description: 'Seu contador ou advogado tributarista deve validar os créditos antes do pedido formal.',
      icon: Users,
      tips: [
        'O contador verificará se sua empresa está elegível',
        'Ele analisará o regime tributário e as operações',
        'Pode haver créditos adicionais que o sistema não identificou'
      ]
    },
    {
      id: 'prepare',
      title: 'Preparar Documentação',
      description: 'Organize XMLs, SPEDs e documentos comprobatórios para o processo.',
      icon: FileText,
      tips: [
        'Reúna todos os XMLs das notas fiscais envolvidas',
        'Organize por período e tipo de tributo',
        'Verifique se há documentos adicionais exigidos'
      ]
    },
    {
      id: 'submit',
      title: 'Protocolar Pedido',
      description: 'Seu contador submeterá o pedido de restituição/compensação junto à Receita.',
      icon: Send,
      tips: [
        'PER/DCOMP é o sistema para pedidos de restituição',
        'ICMS deve ser solicitado na SEFAZ estadual',
        'Acompanhe o protocolo e prazos de resposta'
      ]
    },
    {
      id: 'monitor',
      title: 'Acompanhar Processo',
      description: 'Monitore o andamento e responda a eventuais intimações.',
      icon: Clock,
      tips: [
        'O prazo médio de análise é de 60-120 dias',
        'Mantenha a documentação acessível para consultas',
        'Use o TribuTalks para monitorar novos créditos continuamente'
      ]
    }
  ];

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Como Recuperar Seus Créditos
            </CardTitle>
            <CardDescription>
              Guia passo a passo para transformar os {creditsCount} créditos identificados em dinheiro
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {formatCurrency(totalRecoverable)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Workflow</span>
            <span className="font-medium">{completedSteps.length} de {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <div 
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                isCompleted 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'bg-card border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleStep(step.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {index + 1}. {step.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>

                    {step.action && (
                      <Button 
                        size="sm" 
                        variant={isCompleted ? 'outline' : 'default'}
                        onClick={step.action.onClick}
                        className="flex-shrink-0"
                      >
                        {step.action.label}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>

                  {/* Tips */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Dicas
                    </p>
                    <ul className="text-sm space-y-1">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Contact Team CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dúvidas sobre recuperação?</p>
                  <p className="text-sm text-muted-foreground">
                    Nosso time está esperando seu contato
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setEnterpriseModalOpen(true)}>
                <Phone className="h-4 w-4 mr-2" />
                Fale com o nosso time!
              </Button>
            </div>
          </CardContent>
        </Card>

        <EnterpriseModal open={enterpriseModalOpen} onOpenChange={setEnterpriseModalOpen} />


      </CardContent>
    </Card>
  );
}
