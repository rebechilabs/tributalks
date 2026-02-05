import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  PieChart,
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditByTax {
  tax: string;
  value: number;
  color: string;
}

interface CreditByPeriod {
  year: number;
  value: number;
}

interface CreditRadarMetricsProps {
  totalCredits: number;
  creditsByTax: CreditByTax[];
  creditsByPeriod: CreditByPeriod[];
  recommendedAction?: string;
  onShowClara?: () => void;
}

export function CreditRadarMetrics({
  totalCredits,
  creditsByTax,
  creditsByPeriod,
  recommendedAction = 'Compensação via PER/DCOMP',
  onShowClara,
}: CreditRadarMetricsProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const maxTaxValue = Math.max(...creditsByTax.map(c => c.value), 1);

  return (
    <div className="space-y-6">
      {/* Total Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de créditos identificados</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalCredits)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge variant="outline" className="justify-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                Ação recomendada: {recommendedAction}
              </Badge>
              <Button size="sm" onClick={() => navigate('/dashboard/consultorias')}>
                Iniciar Recuperação
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Tax */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Por Tributo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {creditsByTax.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.tax}</span>
                  <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
                </div>
                <Progress 
                  value={(item.value / maxTaxValue) * 100} 
                  className="h-2"
                  style={{ 
                    '--progress-background': item.color 
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {creditsByPeriod.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="font-medium">{item.year}</span>
                <Badge variant="secondary">{formatCurrency(item.value)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Clara Integration */}
      {onShowClara && (
        <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-violet-500/20">
                <Bot className="h-8 w-8 text-violet-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="font-medium">
                  Encontrei {formatCurrency(totalCredits)} em créditos tributários para a sua empresa!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Isso representa dinheiro que você pagou a mais nos últimos anos. Quer que eu te explique cada crédito encontrado e qual a melhor forma de recuperar esse valor?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={onShowClara}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sim, me explique
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard/consultorias')}>
                  Falar com especialista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
