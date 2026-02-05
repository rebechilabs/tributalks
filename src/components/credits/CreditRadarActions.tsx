import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Banknote, 
  FileEdit, 
  Scale,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  whenToUse: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const actions: ActionItem[] = [
  {
    id: 'perdcomp',
    icon: <RefreshCw className="h-5 w-5" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    title: 'Compensação via PER/DCOMP',
    description: 'Usar os créditos para abater tributos federais futuros (IRPJ, CSLL, PIS, COFINS, etc.)',
    whenToUse: 'Quando a empresa tem tributos a pagar nos próximos meses',
    badge: 'Mais comum',
    badgeVariant: 'default',
  },
  {
    id: 'restituicao',
    icon: <Banknote className="h-5 w-5" />,
    iconBg: 'bg-green-500/10 text-green-500',
    title: 'Pedido de Restituição',
    description: 'Solicitar a devolução dos valores em dinheiro diretamente na conta da empresa',
    whenToUse: 'Quando a empresa não tem débitos suficientes para compensar ou prefere o dinheiro em caixa',
  },
  {
    id: 'retificacao',
    icon: <FileEdit className="h-5 w-5" />,
    iconBg: 'bg-amber-500/10 text-amber-500',
    title: 'Retificação de Obrigações',
    description: 'Corrigir SPEDs, DCTFs e outras declarações para regularizar a situação fiscal',
    whenToUse: 'Quando os créditos dependem de correção de informações já enviadas ao Fisco',
  },
  {
    id: 'judicial',
    icon: <Scale className="h-5 w-5" />,
    iconBg: 'bg-purple-500/10 text-purple-500',
    title: 'Ação Judicial',
    description: 'Ingressar com ação para recuperar créditos que a Receita Federal não reconhece administrativamente',
    whenToUse: 'Quando há teses tributárias favoráveis ou negativa administrativa',
    badge: 'Especialista',
    badgeVariant: 'secondary',
  },
];

interface CreditRadarActionsProps {
  hasCredits?: boolean;
  totalCredits?: number;
}

export function CreditRadarActions({ hasCredits = false, totalCredits = 0 }: CreditRadarActionsProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">O que fazer com os créditos encontrados?</CardTitle>
        </div>
        {hasCredits && totalCredits > 0 && (
          <CardDescription>
            Você tem {formatCurrency(totalCredits)} em créditos identificados. Veja as opções de recuperação:
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${action.iconBg} flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    {action.badge && (
                      <Badge variant={action.badgeVariant || 'default'} className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    📌 {action.whenToUse}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasCredits && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/dashboard/consultorias')}>
              Falar com Especialista
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/clara')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Perguntar à Clara
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
