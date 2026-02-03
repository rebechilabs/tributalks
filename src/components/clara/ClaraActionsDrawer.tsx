import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronRight, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useClaraAutonomousActions, AutonomousAction } from "@/hooks/clara";
import { ClaraAgentBadge } from "./ClaraAgentBadge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClaraActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  analyze_credits: "Analisar créditos fiscais",
  generate_compliance_alert: "Gerar alerta de compliance",
  notify_gap: "Notificar divergência fiscal",
  generate_margin_alert: "Alertar sobre margem",
  recalculate_projections: "Recalcular projeções",
  send_deadline_reminder: "Enviar lembrete de prazo",
  alert_benefit_expiration: "Alertar expiração de benefício",
};

const PRIORITY_COLORS = {
  low: "text-muted-foreground",
  medium: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-destructive",
};

function ActionItem({ 
  action, 
  onApprove, 
  onReject, 
  isExecuting 
}: { 
  action: AutonomousAction; 
  onApprove: (id: string) => void; 
  onReject: (id: string) => void;
  isExecuting: boolean;
}) {
  const label = ACTION_LABELS[action.action_type] || action.action_type;
  const timeAgo = formatDistanceToNow(new Date(action.created_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <ClaraAgentBadge agentType={action.agent_type} size="sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{label}</p>
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[action.priority]}`}
            >
              {action.priority === 'urgent' ? 'Urgente' : 
               action.priority === 'high' ? 'Alta' : 
               action.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5">
            {action.trigger_event.replace(/_/g, ' ')} • {timeAgo}
          </p>
          
          {action.status === 'pending' && action.requires_approval && (
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                className="h-7 text-xs flex-1"
                onClick={() => onApprove(action.id)}
                disabled={isExecuting}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-7 text-xs flex-1"
                onClick={() => onReject(action.id)}
                disabled={isExecuting}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
          
          {action.status === 'approved' && (
            <Badge variant="outline" className="mt-2 bg-primary/10 text-primary animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Executando...
            </Badge>
          )}
          
          {action.status === 'executed' && (
            <Badge variant="outline" className="mt-2 text-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Concluída
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ClaraActionsDrawer({ isOpen, onClose }: ClaraActionsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const { 
    actions, 
    pendingCount, 
    executingIds, 
    approveAction, 
    rejectAction 
  } = useClaraAutonomousActions();

  const pendingActions = actions.filter(a => a.status === 'pending');
  const executedActions = actions.filter(a => ['executed', 'failed', 'rejected'].includes(a.status));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 md:w-96 bg-background border-l shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Ações da Clara</h2>
                    {pendingCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1 mt-3 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === 'pending' 
                        ? 'bg-background shadow-sm font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Clock className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                    Pendentes ({pendingActions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === 'history' 
                        ? 'bg-background shadow-sm font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Histórico ({executedActions.length})
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeTab === 'pending' ? (
                      pendingActions.length === 0 ? (
                        <motion.div
                          key="empty-pending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <Bot className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma ação pendente
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            A Clara está monitorando sua operação
                          </p>
                        </motion.div>
                      ) : (
                        pendingActions.map(action => (
                          <ActionItem
                            key={action.id}
                            action={action}
                            onApprove={approveAction}
                            onReject={rejectAction}
                            isExecuting={executingIds.has(action.id)}
                          />
                        ))
                      )
                    ) : (
                      executedActions.length === 0 ? (
                        <motion.div
                          key="empty-history"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Nenhuma ação no histórico
                          </p>
                        </motion.div>
                      ) : (
                        executedActions.slice(0, 20).map(action => (
                          <ActionItem
                            key={action.id}
                            action={action}
                            onApprove={() => {}}
                            onReject={() => {}}
                            isExecuting={false}
                          />
                        ))
                      )
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
              
              {/* Footer */}
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  A Clara detecta oportunidades automaticamente e sugere ações
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
