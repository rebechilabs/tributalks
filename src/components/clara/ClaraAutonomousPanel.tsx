import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Sparkles } from "lucide-react";
import { useClaraAutonomousActions } from "@/hooks/clara";
import { ClaraAutonomousActionCard } from "./ClaraAutonomousActionCard";

interface ClaraAutonomousPanelProps {
  maxHeight?: string;
  onActionCountChange?: (count: number) => void;
}

export function ClaraAutonomousPanel({ 
  maxHeight = "400px",
  onActionCountChange 
}: ClaraAutonomousPanelProps) {
  const {
    actions,
    pendingCount,
    loading,
    fetchActions,
    approveAction,
    rejectAction,
  } = useClaraAutonomousActions();

  useEffect(() => {
    fetchActions(['pending', 'approved', 'executed']);
  }, [fetchActions]);

  useEffect(() => {
    onActionCountChange?.(pendingCount);
  }, [pendingCount, onActionCountChange]);

  const pendingActions = actions.filter(a => a.status === 'pending');
  const recentExecuted = actions.filter(a => a.status === 'executed').slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Bot className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          Carregando ações autônomas...
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
          <p className="font-medium">Nenhuma ação autônoma</p>
          <p className="text-sm">A Clara está monitorando sua operação</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Ações Autônomas
            </CardTitle>
            <CardDescription>
              A Clara detectou oportunidades de ação
            </CardDescription>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="space-y-3">
            {pendingActions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Aguardando Aprovação
                </p>
                <div className="space-y-2">
                  {pendingActions.map(action => (
                    <ClaraAutonomousActionCard
                      key={action.id}
                      action={action}
                      onApprove={approveAction}
                      onReject={rejectAction}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {recentExecuted.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Executadas Recentemente
                </p>
                <div className="space-y-2 opacity-75">
                  {recentExecuted.map(action => (
                    <ClaraAutonomousActionCard
                      key={action.id}
                      action={action}
                      onApprove={() => {}}
                      onReject={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
