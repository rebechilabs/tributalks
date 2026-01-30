import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Tag, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Action {
  id: string;
  type: 'omc' | 'priceguard';
  title: string;
  value: string;
  priority: 'high' | 'medium' | 'low';
  href?: string;
}

// Placeholder actions - will be dynamic from API
const mockActions: Action[] = [
  {
    id: '1',
    type: 'omc',
    title: 'Importar XMLs de compra para análise de fornecedores',
    value: 'Identificar vazamentos',
    priority: 'high',
    href: '/dashboard/analise-notas'
  },
  {
    id: '2',
    type: 'priceguard',
    title: 'Simular preços dos principais SKUs',
    value: 'Calcular ajustes',
    priority: 'high',
  },
  {
    id: '3',
    type: 'omc',
    title: 'Preencher DRE para dados de margem',
    value: 'Refinar cálculos',
    priority: 'medium',
    href: '/dashboard/dre'
  },
];

export function ActionPriorityList() {
  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      high: { variant: 'destructive', label: 'Alta' },
      medium: { variant: 'default', label: 'Média' },
      low: { variant: 'secondary', label: 'Baixa' }
    };
    return styles[priority] || styles.low;
  };

  const getIcon = (type: string) => {
    if (type === 'omc') return ShoppingCart;
    if (type === 'priceguard') return Tag;
    return AlertCircle;
  };

  if (mockActions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma ação pendente.</p>
        <p className="text-sm mt-2">Importe dados para gerar recomendações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mockActions.map((action, index) => {
        const Icon = getIcon(action.type);
        const priorityBadge = getPriorityBadge(action.priority);

        return (
          <div 
            key={action.id}
            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
              {index + 1}
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.value}</p>
            </div>

            <Badge variant={priorityBadge.variant}>
              {priorityBadge.label}
            </Badge>

            {action.href ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to={action.href}>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" disabled>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
