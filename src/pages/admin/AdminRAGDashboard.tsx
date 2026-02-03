import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  ShieldAlert,
  Brain,
  Database,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock
} from "lucide-react";

interface RAGStats {
  knowledgeTotal: number;
  knowledgeWithEmbeddings: number;
  memoryTotal: number;
  memoryWithEmbeddings: number;
  patternsTotal: number;
  patternsWithEmbeddings: number;
  embeddingsCacheSize: number;
  cacheHitRate: number;
}

interface EmbeddingCacheEntry {
  id: string;
  content_preview: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export default function AdminRAGDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [cacheEntries, setCacheEntries] = useState<EmbeddingCacheEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [populating, setPopulating] = useState<string | null>(null);

  // Verificar se usuário é admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Erro ao verificar role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    if (!authLoading && user) {
      checkAdminRole();
    } else if (!authLoading && !user) {
      setIsAdmin(false);
    }
  }, [user, authLoading]);

  // Buscar estatísticas
  const fetchStats = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);

      // Busca todas as contagens em paralelo
      const [
        knowledgeStats,
        memoryStats,
        patternStats,
        cacheStats,
        recentCache
      ] = await Promise.all([
        // Knowledge base
        Promise.all([
          supabase.from("clara_knowledge_base").select("id", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("clara_knowledge_base").select("id", { count: "exact", head: true }).eq("status", "published").not("embedding", "is", null),
        ]),
        // Memory
        Promise.all([
          supabase.from("clara_memory").select("id", { count: "exact", head: true }),
          supabase.from("clara_memory").select("id", { count: "exact", head: true }).not("embedding", "is", null),
        ]),
        // Patterns
        Promise.all([
          supabase.from("clara_learned_patterns").select("id", { count: "exact", head: true }),
          supabase.from("clara_learned_patterns").select("id", { count: "exact", head: true }).not("embedding", "is", null),
        ]),
        // Cache
        supabase.from("clara_embeddings_cache").select("id", { count: "exact", head: true }),
        // Recent cache entries
        supabase.from("clara_embeddings_cache").select("id, content_preview, model, tokens_used, created_at").order("created_at", { ascending: false }).limit(20),
      ]);

      const knowledgeTotal = knowledgeStats[0].count || 0;
      const knowledgeWithEmbeddings = knowledgeStats[1].count || 0;
      const memoryTotal = memoryStats[0].count || 0;
      const memoryWithEmbeddings = memoryStats[1].count || 0;
      const patternsTotal = patternStats[0].count || 0;
      const patternsWithEmbeddings = patternStats[1].count || 0;

      setStats({
        knowledgeTotal,
        knowledgeWithEmbeddings,
        memoryTotal,
        memoryWithEmbeddings,
        patternsTotal,
        patternsWithEmbeddings,
        embeddingsCacheSize: cacheStats.count || 0,
        cacheHitRate: 0, // TODO: calcular baseado em logs
      });

      setCacheEntries(recentCache.data || []);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  // Popular embeddings
  const populateEmbeddings = async (targetTable: string) => {
    setPopulating(targetTable);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error("Sessão expirada");
        return;
      }

      const response = await supabase.functions.invoke("populate-embeddings", {
        body: { targetTable, batchSize: 10 },
      });

      if (response.error) {
        toast.error(`Erro: ${response.error.message}`);
        return;
      }

      const data = response.data;
      toast.success(`${data.processed} embeddings gerados, ${data.remaining} restantes`);
      
      // Atualiza as estatísticas
      await fetchStats();
    } catch (error) {
      console.error("Erro ao popular embeddings:", error);
      toast.error("Erro ao popular embeddings");
    } finally {
      setPopulating(null);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Acesso Restrito
              </h2>
              <p className="text-muted-foreground">
                Esta área é restrita a administradores do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getProgress = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary" />
              RAG Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitoramento de embeddings e busca semântica
            </p>
          </div>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Knowledge Base</p>
                <Database className="w-5 h-5 text-primary/50" />
              </div>
              <p className="text-2xl font-bold">
                {stats?.knowledgeWithEmbeddings || 0}/{stats?.knowledgeTotal || 0}
              </p>
              <Progress 
                value={getProgress(stats?.knowledgeWithEmbeddings || 0, stats?.knowledgeTotal || 0)} 
                className="mt-2 h-2"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => populateEmbeddings("clara_knowledge_base")}
                disabled={populating === "clara_knowledge_base"}
              >
                {populating === "clara_knowledge_base" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Popular
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Memórias</p>
                <Brain className="w-5 h-5 text-success/50" />
              </div>
              <p className="text-2xl font-bold">
                {stats?.memoryWithEmbeddings || 0}/{stats?.memoryTotal || 0}
              </p>
              <Progress 
                value={getProgress(stats?.memoryWithEmbeddings || 0, stats?.memoryTotal || 0)} 
                className="mt-2 h-2"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => populateEmbeddings("clara_memory")}
                disabled={populating === "clara_memory"}
              >
                {populating === "clara_memory" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Popular
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Padrões</p>
                <TrendingUp className="w-5 h-5 text-warning/50" />
              </div>
              <p className="text-2xl font-bold">
                {stats?.patternsWithEmbeddings || 0}/{stats?.patternsTotal || 0}
              </p>
              <Progress 
                value={getProgress(stats?.patternsWithEmbeddings || 0, stats?.patternsTotal || 0)} 
                className="mt-2 h-2"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => populateEmbeddings("clara_learned_patterns")}
                disabled={populating === "clara_learned_patterns"}
              >
                {populating === "clara_learned_patterns" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Popular
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Cache Embeddings</p>
                <Clock className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-2xl font-bold">{stats?.embeddingsCacheSize || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reutilizações salvas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coverage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cobertura de Embeddings</CardTitle>
            <CardDescription>
              Percentual de registros com vetores semânticos gerados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Knowledge Base</span>
                <Progress 
                  value={getProgress(stats?.knowledgeWithEmbeddings || 0, stats?.knowledgeTotal || 0)} 
                  className="flex-1 h-3"
                />
                <span className="w-16 text-sm font-medium text-right">
                  {getProgress(stats?.knowledgeWithEmbeddings || 0, stats?.knowledgeTotal || 0)}%
                </span>
                {getProgress(stats?.knowledgeWithEmbeddings || 0, stats?.knowledgeTotal || 0) === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Memórias</span>
                <Progress 
                  value={getProgress(stats?.memoryWithEmbeddings || 0, stats?.memoryTotal || 0)} 
                  className="flex-1 h-3"
                />
                <span className="w-16 text-sm font-medium text-right">
                  {getProgress(stats?.memoryWithEmbeddings || 0, stats?.memoryTotal || 0)}%
                </span>
                {getProgress(stats?.memoryWithEmbeddings || 0, stats?.memoryTotal || 0) === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Padrões</span>
                <Progress 
                  value={getProgress(stats?.patternsWithEmbeddings || 0, stats?.patternsTotal || 0)} 
                  className="flex-1 h-3"
                />
                <span className="w-16 text-sm font-medium text-right">
                  {getProgress(stats?.patternsWithEmbeddings || 0, stats?.patternsTotal || 0)}%
                </span>
                {getProgress(stats?.patternsWithEmbeddings || 0, stats?.patternsTotal || 0) === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cache de Embeddings Recentes</CardTitle>
            <CardDescription>
              Últimos embeddings gerados e cacheados para reutilização
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cacheEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum embedding em cache ainda
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conteúdo</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cacheEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="max-w-md truncate">
                        {entry.content_preview || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entry.model || "text-embedding-3-small"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{entry.tokens_used || 0}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
