import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Settings,
  Trash2,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ERPConnection {
  id: string;
  erp_type: string;
  connection_name: string;
  status: "active" | "inactive" | "error" | "pending";
  status_message: string | null;
  last_sync_at: string | null;
  next_sync_at: string | null;
  sync_config: {
    modules: string[];
    frequency_hours: number;
    auto_sync: boolean;
  };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ERPInfo {
  name: string;
  description: string;
  logo: string;
  color: string;
}

interface ERPConnectionCardProps {
  connection: ERPConnection;
  erpInfo: ERPInfo;
  onDelete: () => void;
  isDeleting: boolean;
}

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle2,
    label: "Ativo",
    variant: "default" as const,
    color: "text-green-500"
  },
  inactive: {
    icon: Clock,
    label: "Inativo",
    variant: "secondary" as const,
    color: "text-gray-500"
  },
  error: {
    icon: XCircle,
    label: "Erro",
    variant: "destructive" as const,
    color: "text-red-500"
  },
  pending: {
    icon: AlertCircle,
    label: "Pendente",
    variant: "outline" as const,
    color: "text-yellow-500"
  }
};

const MODULE_LABELS: Record<string, string> = {
  nfe: "NF-e",
  nfse: "NFS-e",
  produtos: "Produtos",
  financeiro: "Financeiro",
  empresa: "Empresa"
};

export function ERPConnectionCard({ 
  connection, 
  erpInfo, 
  onDelete,
  isDeleting 
}: ERPConnectionCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const statusConfig = STATUS_CONFIG[connection.status];
  const StatusIcon = statusConfig.icon;

  const handleDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Status indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          connection.status === 'active' ? 'bg-green-500' :
          connection.status === 'error' ? 'bg-red-500' :
          connection.status === 'pending' ? 'bg-yellow-500' :
          'bg-gray-300'
        }`} />
        
        <CardHeader className="pt-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${erpInfo?.color || 'bg-gray-500'} flex items-center justify-center text-xl`}>
                {erpInfo?.logo || '📦'}
              </div>
              <div>
                <CardTitle className="text-base">{connection.connection_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{erpInfo?.name || connection.erp_type}</p>
              </div>
            </div>
            <Badge variant={statusConfig.variant} className="gap-1">
              <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status message */}
          {connection.status_message && connection.status !== 'active' && (
            <div className={`text-sm p-2 rounded-md ${
              connection.status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {connection.status_message}
            </div>
          )}

          {/* Modules */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Módulos sincronizados:</p>
            <div className="flex flex-wrap gap-1">
              {connection.sync_config.modules.map(module => (
                <Badge key={module} variant="outline" className="text-xs">
                  {MODULE_LABELS[module] || module}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sync info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Última sincronização</p>
              <p className="font-medium">
                {connection.last_sync_at 
                  ? formatDistanceToNow(new Date(connection.last_sync_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })
                  : "Nunca"
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Frequência</p>
              <p className="font-medium">
                A cada {connection.sync_config.frequency_hours}h
                {connection.sync_config.auto_sync && " (auto)"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 gap-2" disabled>
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </Button>
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive gap-2"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover integração?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá desconectar o {erpInfo?.name || connection.erp_type} do TribuTalks. 
              Os dados já sincronizados serão mantidos, mas não haverá mais atualizações automáticas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
