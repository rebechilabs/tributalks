import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Send, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Newspaper,
  Link as LinkIcon,
  FileText,
  ShieldAlert
} from "lucide-react";
import { Navigate } from "react-router-dom";

interface ProcessedNews {
  id: string;
  titulo_original: string;
  resumo_executivo: string;
  relevancia: string;
  categoria: string;
  setores_afetados: string[];
  regimes_afetados: string[];
}

export default function AdminNoticias() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [fonte, setFonte] = useState("");
  const [fonteUrl, setFonteUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [processedNews, setProcessedNews] = useState<ProcessedNews[] | null>(null);
  const [fetchStatus, setFetchStatus] = useState<{
    modo: string;
    message: string;
    fontes_disponiveis?: { nome: string; url: string }[];
  } | null>(null);

  // Verificar se usuário é admin via tabela user_roles
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

  const handleProcessar = async () => {
    if (!fonte || !titulo || !conteudo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsProcessing(true);
    setProcessedNews(null);

    try {
      const { data, error } = await supabase.functions.invoke("process-news", {
        body: {
          noticias: [
            {
              fonte,
              fonte_url: fonteUrl || undefined,
              titulo,
              conteudo,
            },
          ],
        },
      });

      if (error) throw error;

      if (data.success && data.noticias) {
        setProcessedNews(data.noticias);
        toast.success(`${data.processadas} notícia(s) processada(s) com sucesso!`);
        
        // Limpar formulário
        setFonte("");
        setFonteUrl("");
        setTitulo("");
        setConteudo("");
      } else {
        toast.error(data.message || data.error || "Erro ao processar notícia");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao processar notícia. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificarFontes = async () => {
    setIsFetching(true);
    setFetchStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-news");

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setFetchStatus(data);

      if (data.modo === "automatico") {
        toast.success(`Busca automática: ${data.noticias_processadas || 0} notícias processadas`);
      } else {
        toast.info("Modo manual ativo. Configure o Firecrawl para busca automática.");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao verificar fontes. Tente novamente.");
    } finally {
      setIsFetching(false);
    }
  };

  const getRelevanciaColor = (relevancia: string) => {
    switch (relevancia) {
      case "ALTA":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "MEDIA":
        return "bg-warning/10 text-warning border-warning/20";
      case "BAIXA":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin - Notícias Tributárias</h1>
            <p className="text-muted-foreground mt-1">
              Insira e processe notícias tributárias com IA
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleVerificarFontes}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Fontes
          </Button>
        </div>

        {/* Status do Fetch */}
        {fetchStatus && (
          <Card className={fetchStatus.modo === "automatico" ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {fetchStatus.modo === "automatico" ? (
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {fetchStatus.modo === "automatico" ? "Modo Automático" : "Modo Manual"}
                  </p>
                  <p className="text-sm text-muted-foreground">{fetchStatus.message}</p>
                  
                  {fetchStatus.fontes_disponiveis && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Fontes disponíveis:</p>
                      <div className="flex flex-wrap gap-2">
                        {fetchStatus.fontes_disponiveis.map((f) => (
                          <a
                            key={f.nome}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-background rounded border hover:border-primary transition-colors"
                          >
                            {f.nome}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Inserção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Inserir Nova Notícia
            </CardTitle>
            <CardDescription>
              Preencha os dados da notícia e a IA irá classificar e enriquecer automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fonte">Fonte *</Label>
                <Input
                  id="fonte"
                  placeholder="Ex: Receita Federal"
                  value={fonte}
                  onChange={(e) => setFonte(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonte_url" className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  URL da Fonte (opcional)
                </Label>
                <Input
                  id="fonte_url"
                  placeholder="https://..."
                  value={fonteUrl}
                  onChange={(e) => setFonteUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Título completo da notícia"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Conteúdo *
              </Label>
              <Textarea
                id="conteudo"
                placeholder="Cole aqui o conteúdo completo da notícia..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={10}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {conteudo.length} caracteres
              </p>
            </div>

            <Button
              onClick={handleProcessar}
              disabled={isProcessing || !fonte || !titulo || !conteudo}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Processar e Publicar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Processamento */}
        {processedNews && processedNews.length > 0 && (
          <Card className="border-success/50 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                Notícia Processada com Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedNews.map((news) => (
                <div key={news.id} className="space-y-3">
                  <div>
                    <h3 className="font-semibold">{news.titulo_original}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {news.resumo_executivo}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getRelevanciaColor(news.relevancia)}>
                      {news.relevancia}
                    </Badge>
                    <Badge variant="outline">{news.categoria}</Badge>
                  </div>

                  {news.setores_afetados && news.setores_afetados.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Setores:</p>
                      <div className="flex flex-wrap gap-1">
                        {news.setores_afetados.map((setor) => (
                          <Badge key={setor} variant="secondary" className="text-xs">
                            {setor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {news.regimes_afetados && news.regimes_afetados.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Regimes:</p>
                      <div className="flex flex-wrap gap-1">
                        {news.regimes_afetados.map((regime) => (
                          <Badge key={regime} variant="secondary" className="text-xs">
                            {regime}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
