import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock,
  FileText,
  Package,
  DollarSign,
  Building2,
  History
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SyncLog {
  id: string;
  connection_id: string;
  sync_type: string;
  status: string;
  records_synced: number;
  started_at: string;
  completed_at: string | null;
}

interface ERPConnection {
  id: string;
  erp_type: string;
  connection_name: string;
}

interface ERPSyncLogsProps {
  logs: SyncLog[];
  connections: ERPConnection[];
}

const SYNC_TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  nfe: { icon: FileText, label: "NF-e" },
  nfse: { icon: FileText, label: "NFS-e" },
  produtos: { icon: Package, label: "Produtos" },
  financeiro: { icon: DollarSign, label: "Financeiro" },
  empresa: { icon: Building2, label: "Empresa" },
  full: { icon: History, label: "Completa" }
};

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  running: { icon: Loader2, label: "Em andamento", color: "text-blue-500" },
  success: { icon: CheckCircle2, label: "Sucesso", color: "text-green-500" },
  error: { icon: XCircle, label: "Erro", color: "text-red-500" },
  cancelled: { icon: Clock, label: "Cancelado", color: "text-gray-500" }
};

export function ERPSyncLogs({ logs, connections }: ERPSyncLogsProps) {
  const getConnectionName = (connectionId: string) => {
    const conn = connections.find(c => c.id === connectionId);
    return conn?.connection_name || "Desconhecido";
  };

  if (logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma sincronização realizada</h3>
          <p className="text-muted-foreground">
            As sincronizações aparecerão aqui após conectar um ERP
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" />
          Histórico de Sincronizações
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {logs.map((log) => {
              const syncTypeConfig = SYNC_TYPE_CONFIG[log.sync_type] || SYNC_TYPE_CONFIG.full;
              const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.running;
              const SyncIcon = syncTypeConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <SyncIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {getConnectionName(log.connection_id)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {syncTypeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {log.completed_at && ` • ${log.records_synced} registro${log.records_synced !== 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.color} ${log.status === 'running' ? 'animate-spin' : ''}`} />
                    <span className={`text-xs ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
