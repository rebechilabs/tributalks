import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Zap, AlertTriangle, Loader2 } from "lucide-react";
import { AutonomousAction } from "@/hooks/clara";
import { ClaraAgentBadge } from "./ClaraAgentBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClaraAutonomousActionCardProps {
  action: AutonomousAction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isExecuting?: boolean;
}

const PRIORITY_CONFIG = {
  low: { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted" },
  medium: { icon: Zap, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  high: { icon: AlertTriangle, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  urgent: { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
};

const ACTION_LABELS: Record<string, string> = {
  analyze_credits: "Analisar créditos fiscais",
  generate_compliance_alert: "Gerar alerta de compliance",
  notify_gap: "Notificar divergência fiscal",
  generate_margin_alert: "Alertar sobre margem",
  recalculate_projections: "Recalcular projeções",
  send_deadline_reminder: "Enviar lembrete de prazo",
  alert_benefit_expiration: "Alertar expiração de benefício",
};

export function ClaraAutonomousActionCard({
  action,
  onApprove,
  onReject,
  isExecuting = false,
}: ClaraAutonomousActionCardProps) {
  const priorityConfig = PRIORITY_CONFIG[action.priority];
  const PriorityIcon = priorityConfig.icon;
  
  const actionLabel = ACTION_LABELS[action.action_type] || action.action_type;
  const timeAgo = formatDistanceToNow(new Date(action.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });
  
  const showExecutingState = isExecuting || action.status === 'approved';
  
  return (
    <Card className="border-l-4 transition-all" style={{ 
      borderLeftColor: action.priority === 'urgent' ? 'hsl(var(--destructive))' : 
                       action.priority === 'high' ? 'hsl(var(--warning))' : 
                       'hsl(var(--primary))' 
    }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <ClaraAgentBadge agentType={action.agent_type} size="sm" />
          <Badge 
            variant="outline" 
            className={`${priorityConfig.bgColor} ${priorityConfig.color} border-0`}
          >
            <PriorityIcon className="h-3 w-3 mr-1" />
            {action.priority === 'urgent' ? 'Urgente' : 
             action.priority === 'high' ? 'Alta' : 
             action.priority === 'medium' ? 'Média' : 'Baixa'}
          </Badge>
        </div>
        <CardTitle className="text-base mt-2">{actionLabel}</CardTitle>
        <CardDescription className="text-xs">
          Disparado por: {action.trigger_event.replace(/_/g, ' ')} • {timeAgo}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          {action.action_type === 'analyze_credits' && 
            "A Clara detectou novos XMLs e quer analisar automaticamente os créditos fiscais disponíveis."}
          {action.action_type === 'generate_compliance_alert' && 
            "O Score Tributário está abaixo do ideal. A Clara quer criar um alerta de compliance."}
          {action.action_type === 'generate_margin_alert' && 
            "A Clara detectou uma queda significativa na margem e quer gerar um alerta."}
          {action.action_type === 'send_deadline_reminder' && 
            "Um prazo importante está se aproximando. A Clara quer enviar um lembrete."}
          {action.action_type === 'notify_gap' && 
            "Foi detectada uma divergência entre DCTF e documentos fiscais."}
          {action.action_type === 'recalculate_projections' && 
            "O DRE foi atualizado e a Clara quer recalcular as projeções."}
          {action.action_type === 'alert_benefit_expiration' && 
            "Um benefício fiscal está próximo do vencimento."}
        </p>
      </CardContent>
      
      {action.requires_approval && action.status === 'pending' && !isExecuting && (
        <CardFooter className="pt-2 gap-2">
          <Button 
            size="sm" 
            onClick={() => onApprove(action.id)}
            className="flex-1"
            disabled={isExecuting}
          >
            <Check className="h-4 w-4 mr-1" />
            Aprovar
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onReject(action.id)}
            className="flex-1"
            disabled={isExecuting}
          >
            <X className="h-4 w-4 mr-1" />
            Rejeitar
          </Button>
        </CardFooter>
      )}
      
      {showExecutingState && action.status !== 'executed' && action.status !== 'failed' && (
        <CardFooter className="pt-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-0 animate-pulse">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Executando...
          </Badge>
        </CardFooter>
      )}
      
      {action.status === 'executed' && (
        <CardFooter className="pt-2">
          <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-0">
            <Check className="h-3 w-3 mr-1" />
            Executada com sucesso
          </Badge>
        </CardFooter>
      )}
      
      {action.status === 'failed' && (
        <CardFooter className="pt-2 flex-col items-start gap-1">
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">
            <X className="h-3 w-3 mr-1" />
            Falha na execução
          </Badge>
          {action.result && (
            <p className="text-xs text-muted-foreground">
              {(action.result as { message?: string }).message}
            </p>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
