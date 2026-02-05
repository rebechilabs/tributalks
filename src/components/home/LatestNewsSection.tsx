import { useLatestNews } from "@/hooks/useLatestNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceBrasilia, formatBrasilia } from "@/lib/dateUtils";

const relevanciaConfig: Record<string, { label: string; className: string }> = {
  ALTA: { label: "ALTA", className: "bg-destructive text-destructive-foreground" },
  MEDIA: { label: "MÉDIA", className: "bg-yellow-500 text-white" },
  BAIXA: { label: "BAIXA", className: "bg-muted text-muted-foreground" },
};

export function LatestNewsSection() {
  const { data: news, isLoading, error } = useLatestNews(5);

  if (error) {
    return null; // Silently fail - don't break the home page
  }

  const latestUpdateTime = news?.[0]?.data_publicacao 
    ? formatBrasilia(news[0].data_publicacao, "dd/MM 'às' HH:mm")
    : null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notícias do Dia</CardTitle>
          </div>
          {latestUpdateTime && (
            <span className="text-xs text-muted-foreground">
              Última atualização: {latestUpdateTime}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/50">
                <Skeleton className="h-5 w-14 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <>
            <div className="space-y-2">
              {news.map((item) => {
                const config = relevanciaConfig[item.relevancia] || relevanciaConfig.BAIXA;
                return (
                  <Link
                    key={item.id}
                    to="/noticias"
                    className="flex gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors group"
                  >
                    <Badge className={`${config.className} shrink-0 h-5`}>
                      {config.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {item.titulo_original}
                      </h4>
                      {item.resumo_executivo && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {item.resumo_executivo}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceBrasilia(item.data_publicacao)}
                        </span>
                        {item.fonte && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {item.fonte}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pt-2">
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/noticias" className="flex items-center justify-center gap-2">
                  Ver todas as notícias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma notícia disponível no momento</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
