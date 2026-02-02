import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Brain,
  Sparkles,
  Download,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  rating: string;
  message_content: string;
  response_content: string;
  feedback_text: string | null;
  context_screen: string | null;
  model_used: string | null;
  created_at: string;
}

interface ConversationItem {
  id: string;
  session_id: string;
  role: string;
  content: string;
  screen_context: string | null;
  tools_used: string[] | null;
  created_at: string;
}

interface MemoryItem {
  id: string;
  memory_type: string;
  category: string;
  content: string;
  importance: number;
  source_screen: string | null;
  created_at: string;
}

interface TrainingStats {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  totalConversations: number;
  totalMemories: number;
  feedbackRate: number;
}

export default function AdminTrainingData() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Buscar dados
  const fetchData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Estatísticas em paralelo
      const [
        totalFeedbackResult,
        positiveFeedbackResult,
        negativeFeedbackResult,
        totalConversationsResult,
        totalMemoriesResult,
        feedbackListResult,
        conversationsListResult,
        memoriesListResult,
      ] = await Promise.all([
        supabase.from("clara_feedback").select("id", { count: "exact", head: true }),
        supabase.from("clara_feedback").select("id", { count: "exact", head: true }).eq("rating", "positive"),
        supabase.from("clara_feedback").select("id", { count: "exact", head: true }).eq("rating", "negative"),
        supabase.from("clara_conversations").select("id", { count: "exact", head: true }),
        supabase.from("clara_memory").select("id", { count: "exact", head: true }),
        supabase.from("clara_feedback").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("clara_conversations").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("clara_memory").select("*").order("importance", { ascending: false }).order("created_at", { ascending: false }).limit(100),
      ]);

      const total = totalFeedbackResult.count || 0;
      const positive = positiveFeedbackResult.count || 0;
      const conversations = totalConversationsResult.count || 0;

      setStats({
        totalFeedback: total,
        positiveFeedback: positive,
        negativeFeedback: negativeFeedbackResult.count || 0,
        totalConversations: conversations,
        totalMemories: totalMemoriesResult.count || 0,
        feedbackRate: conversations > 0 ? (total / conversations) * 100 : 0,
      });

      setFeedback((feedbackListResult.data || []) as FeedbackItem[]);
      setConversations((conversationsListResult.data || []) as ConversationItem[]);
      setMemories((memoriesListResult.data || []) as MemoryItem[]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados de treinamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Exportar dados para JSONL (formato fine-tuning)
  const exportTrainingData = () => {
    // Formata dados no padrão OpenAI fine-tuning
    const trainingLines = feedback
      .filter(f => f.rating === "positive") // Só exporta feedbacks positivos
      .map(f => ({
        messages: [
          { role: "user", content: f.message_content },
          { role: "assistant", content: f.response_content }
        ]
      }));

    const jsonl = trainingLines.map(line => JSON.stringify(line)).join("\n");
    
    const blob = new Blob([jsonl], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tributalks-training-${format(new Date(), "yyyy-MM-dd")}.jsonl`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`${trainingLines.length} exemplos exportados para fine-tuning`);
  };

  // Exportar feedback negativo para análise
  const exportNegativeFeedback = () => {
    const negativeData = feedback
      .filter(f => f.rating === "negative")
      .map(f => ({
        pergunta: f.message_content,
        resposta: f.response_content,
        feedback_usuario: f.feedback_text,
        tela: f.context_screen,
        modelo: f.model_used,
        data: f.created_at,
      }));

    const csv = [
      ["Pergunta", "Resposta", "Feedback do Usuário", "Tela", "Modelo", "Data"].join(";"),
      ...negativeData.map(row => [
        `"${row.pergunta.replace(/"/g, '""')}"`,
        `"${row.resposta.substring(0, 500).replace(/"/g, '""')}"`,
        `"${(row.feedback_usuario || "").replace(/"/g, '""')}"`,
        row.tela || "",
        row.modelo || "",
        row.data
      ].join(";"))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tributalks-feedback-negativo-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`${negativeData.length} feedbacks negativos exportados para análise`);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Training Data Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Dados coletados para fine-tuning da Clara AI
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={exportNegativeFeedback}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Exportar Negativos
            </Button>
            <Button size="sm" onClick={exportTrainingData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar JSONL
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              Feedback ({stats?.totalFeedback || 0})
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Conversas ({stats?.totalConversations || 0})
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Memórias ({stats?.totalMemories || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Feedback</p>
                      <p className="text-2xl font-bold">{stats?.totalFeedback || 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Positivos</p>
                      <p className="text-2xl font-bold text-primary">{stats?.positiveFeedback || 0}</p>
                    </div>
                    <ThumbsUp className="w-8 h-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Negativos</p>
                      <p className="text-2xl font-bold text-destructive">{stats?.negativeFeedback || 0}</p>
                    </div>
                    <ThumbsDown className="w-8 h-8 text-destructive/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversas</p>
                      <p className="text-2xl font-bold">{stats?.totalConversations || 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa Feedback</p>
                      <p className="text-2xl font-bold">{(stats?.feedbackRate || 0).toFixed(1)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Readiness Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Prontidão para Fine-Tuning
                </CardTitle>
                <CardDescription>
                  Status dos dados coletados para treinamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {(stats?.positiveFeedback || 0) >= 100 ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">Exemplos Positivos</p>
                        <p className="text-sm text-muted-foreground">
                          Mínimo 100 para fine-tuning inicial
                        </p>
                      </div>
                    </div>
                    <Badge variant={(stats?.positiveFeedback || 0) >= 100 ? "default" : "secondary"}>
                      {stats?.positiveFeedback || 0}/100
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {(stats?.negativeFeedback || 0) >= 20 ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">Exemplos Negativos para Análise</p>
                        <p className="text-sm text-muted-foreground">
                          Feedback para identificar padrões de erro
                        </p>
                      </div>
                    </div>
                    <Badge variant={(stats?.negativeFeedback || 0) >= 20 ? "default" : "secondary"}>
                      {stats?.negativeFeedback || 0}/20
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {(stats?.totalMemories || 0) >= 50 ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium">Memórias de Contexto</p>
                        <p className="text-sm text-muted-foreground">
                          Dados proprietários sobre empresas
                        </p>
                      </div>
                    </div>
                    <Badge variant={(stats?.totalMemories || 0) >= 50 ? "default" : "secondary"}>
                      {stats?.totalMemories || 0}/50
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks Coletados</CardTitle>
                <CardDescription>
                  Avaliações 👍👎 das respostas da Clara
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rating</TableHead>
                        <TableHead className="w-[300px]">Pergunta</TableHead>
                        <TableHead className="w-[300px]">Resposta (preview)</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Tela</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.rating === "positive" ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Bom
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Ruim
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="truncate text-sm" title={item.message_content}>
                              {item.message_content}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="truncate text-sm text-muted-foreground" title={item.response_content}>
                              {item.response_content.substring(0, 100)}...
                            </p>
                          </TableCell>
                          <TableCell>
                            {item.feedback_text ? (
                              <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={item.feedback_text}>
                                {item.feedback_text}
                              </p>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.context_screen || "chat"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Conversas</CardTitle>
                <CardDescription>
                  Todas as interações com a Clara AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Role</TableHead>
                        <TableHead>Conteúdo</TableHead>
                        <TableHead>Tela</TableHead>
                        <TableHead>Tools</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversations.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant={item.role === "user" ? "secondary" : "default"}>
                              {item.role === "user" ? "Usuário" : "Clara"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[400px]">
                            <p className="text-sm line-clamp-2" title={item.content}>
                              {item.content}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.screen_context || "chat"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.tools_used && item.tools_used.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {item.tools_used.map((tool, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Memórias Extraídas</CardTitle>
                <CardDescription>
                  Contextos importantes que a Clara lembra entre sessões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead className="w-[100px]">Categoria</TableHead>
                        <TableHead>Conteúdo</TableHead>
                        <TableHead className="w-[80px]">Importância</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memories.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="outline">{item.memory_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[400px]">
                            <p className="text-sm line-clamp-2" title={item.content}>
                              {item.content}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <div 
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${item.importance * 10}%` }}
                              />
                              <span className="text-xs text-muted-foreground">{item.importance}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.source_screen || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
