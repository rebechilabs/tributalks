import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2, 
  RefreshCw, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Plug,
  History,
  Loader2,
  Plus
} from "lucide-react";
import { ERPConnectionWizard } from "@/components/integrations/ERPConnectionWizard";
import { ERPConnectionCard } from "@/components/integrations/ERPConnectionCard";
import { ERPSyncLogs } from "@/components/integrations/ERPSyncLogs";

// ERP metadata
const ERP_INFO: Record<string, { 
  name: string; 
  description: string; 
  logo: string;
  color: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
}> = {
  omie: {
    name: "Omie ERP",
    description: "O ERP mais usado por PMEs no Brasil. Sincronize NF-e, financeiro, produtos e DRE.",
    logo: "🔵",
    color: "bg-blue-500",
    fields: [
      { key: "app_key", label: "App Key", type: "text", placeholder: "Sua App Key do Omie" },
      { key: "app_secret", label: "App Secret", type: "password", placeholder: "Sua App Secret do Omie" }
    ]
  },
  bling: {
    name: "Bling",
    description: "Popular em e-commerce. API moderna com webhooks em tempo real.",
    logo: "🟣",
    color: "bg-purple-500",
    fields: [
      { key: "access_token", label: "Access Token", type: "password", placeholder: "Token de acesso OAuth 2.0" }
    ]
  },
  contaazul: {
    name: "Conta Azul",
    description: "Foco em microempresas. Conexão segura via OAuth 2.0.",
    logo: "🔷",
    color: "bg-cyan-500",
    fields: [] // OAuth flow - no manual fields needed
  },
  tiny: {
    name: "Tiny ERP",
    description: "Forte em e-commerce e marketplaces. Suporta webhooks.",
    logo: "🟢",
    color: "bg-green-500",
    fields: [
      { key: "token", label: "Token API", type: "password", placeholder: "Token de API do Tiny" }
    ]
  },
  sankhya: {
    name: "Sankhya",
    description: "ERP corporativo com API Gateway. Ideal para médias empresas.",
    logo: "🟠",
    color: "bg-orange-500",
    fields: [
      { key: "app_key", label: "App Key", type: "text", placeholder: "App Key Sankhya" },
      { key: "sankhya_id", label: "Sankhya ID (e-mail)", type: "email", placeholder: "seu@email.com" },
      { key: "token", label: "Token de Autorização", type: "password", placeholder: "Token do cliente" }
    ]
  },
  totvs: {
    name: "TOTVS",
    description: "Suite empresarial completa (Protheus, RM, Datasul).",
    logo: "🔴",
    color: "bg-red-500",
    fields: [
      { key: "base_url", label: "URL da API", type: "url", placeholder: "https://sua-empresa.totvs.com.br/api" },
      { key: "username", label: "Usuário", type: "text", placeholder: "Usuário TOTVS" },
      { key: "password", label: "Senha", type: "password", placeholder: "Senha TOTVS" }
    ]
  }
};

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

interface AvailableERP {
  type: string;
  name: string;
  connected: boolean;
}

interface ConnectionsResponse {
  connections: ERPConnection[];
  recent_logs: Array<{
    id: string;
    connection_id: string;
    sync_type: string;
    status: string;
    records_synced: number;
    started_at: string;
    completed_at: string | null;
  }>;
  available_erps: AvailableERP[];
}

export default function Integracoes() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedERP, setSelectedERP] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connections
  const { data, isLoading, error } = useQuery<ConnectionsResponse>({
    queryKey: ["erp-connections"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Não autenticado");

      const response = await supabase.functions.invoke("erp-connection", {
        method: "GET",
      });

      if (response.error) throw response.error;
      return response.data;
    },
  });

  // Delete connection mutation
  const deleteMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await supabase.functions.invoke("erp-connection", {
        method: "DELETE",
        body: { id: connectionId },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
      toast({
        title: "Conexão removida",
        description: "A integração foi desconectada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync connection mutation
  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await supabase.functions.invoke("erp-sync", {
        body: { connection_id: connectionId },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
      toast({
        title: data.success ? "Sincronização concluída" : "Sincronização parcial",
        description: `${data.total_synced} registros sincronizados${data.total_failed > 0 ? `, ${data.total_failed} falharam` : ''}`,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle auto-sync mutation
  const toggleAutoSyncMutation = useMutation({
    mutationFn: async ({ connectionId, enabled }: { connectionId: string; enabled: boolean }) => {
      const { data: connection, error: fetchError } = await supabase
        .from('erp_connections')
        .select('sync_config')
        .eq('id', connectionId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!connection) throw new Error('Connection not found');

      // Parse sync_config as object
      const currentConfig = typeof connection.sync_config === 'object' && connection.sync_config !== null
        ? connection.sync_config as Record<string, unknown>
        : {};

      const updatedConfig = {
        ...currentConfig,
        auto_sync: enabled,
      };

      // Calculate next_sync_at if enabling
      const nextSyncAt = enabled 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: updateError } = await supabase
        .from('erp_connections')
        .update({ 
          sync_config: updatedConfig,
          next_sync_at: nextSyncAt,
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;
      return { enabled };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
      toast({
        title: data.enabled ? "Sincronização automática ativada" : "Sincronização automática desativada",
        description: data.enabled 
          ? "Seus dados serão sincronizados automaticamente a cada 24 horas."
          : "Você precisará sincronizar manualmente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar configuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnectERP = (erpType: string) => {
    setSelectedERP(erpType);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setSelectedERP(null);
    queryClient.invalidateQueries({ queryKey: ["erp-connections"] });
  };

  const connectedERPs = data?.connections || [];
  const availableERPs = data?.available_erps?.filter(erp => !erp.connected) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Plug className="h-6 w-6 text-primary" />
              Integrações com ERPs
            </h1>
            <p className="text-muted-foreground mt-1">
              Conecte seu ERP para alimentar automaticamente todas as ferramentas do TribuTalks
            </p>
          </div>
          
          {connectedERPs.length > 0 && (
            <Button onClick={() => setWizardOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Integração
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>Erro ao carregar integrações: {(error as Error).message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        {!isLoading && !error && (
          <Tabs defaultValue="connections" className="space-y-6">
            <TabsList>
              <TabsTrigger value="connections" className="gap-2">
                <Link2 className="h-4 w-4" />
                Conexões
                {connectedERPs.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{connectedERPs.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="available" className="gap-2">
                <Plug className="h-4 w-4" />
                Disponíveis
                <Badge variant="outline" className="ml-1">{availableERPs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Connected ERPs */}
            <TabsContent value="connections" className="space-y-4">
              {connectedERPs.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Plug className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma integração ativa</h3>
                    <p className="text-muted-foreground mb-4">
                      Conecte seu ERP para sincronizar dados automaticamente
                    </p>
                    <Button onClick={() => setWizardOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Conectar ERP
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {connectedERPs.map((connection) => (
                    <ERPConnectionCard
                      key={connection.id}
                      connection={connection}
                      erpInfo={ERP_INFO[connection.erp_type]}
                      onDelete={() => deleteMutation.mutate(connection.id)}
                      onSync={() => syncMutation.mutate(connection.id)}
                      onToggleAutoSync={(enabled) => toggleAutoSyncMutation.mutate({ connectionId: connection.id, enabled })}
                      isDeleting={deleteMutation.isPending}
                      isSyncing={syncMutation.isPending || toggleAutoSyncMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Available ERPs */}
            <TabsContent value="available" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(ERP_INFO).map(([key, info]) => {
                  const isConnected = connectedERPs.some(c => c.erp_type === key);
                  
                  return (
                    <Card 
                      key={key} 
                      className={`transition-all ${isConnected ? 'opacity-50' : 'hover:border-primary/50 cursor-pointer'}`}
                      onClick={() => !isConnected && handleConnectERP(key)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-xl`}>
                            {info.logo}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {info.name}
                              {isConnected && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Conectado
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                        {!isConnected && (
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            Conectar
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Sync Logs */}
            <TabsContent value="logs">
              <ERPSyncLogs logs={data?.recent_logs || []} connections={connectedERPs} />
            </TabsContent>
          </Tabs>
        )}

        {/* Connection Wizard Modal */}
        {wizardOpen && (
          <ERPConnectionWizard
            open={wizardOpen}
            onClose={handleWizardClose}
            selectedERP={selectedERP}
            erpInfo={ERP_INFO}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
