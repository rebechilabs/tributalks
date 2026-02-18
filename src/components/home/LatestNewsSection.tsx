import { useLatestNews } from "@/hooks/useLatestNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowRight, Bell, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBrasilia } from "@/lib/dateUtils";
import { usePlanAccess } from "@/hooks/useFeatureAccess";

import { CircleAlert, CircleMinus, CircleCheck, type LucideIcon } from "lucide-react";

const impactConfig: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  ALTA: { icon: CircleAlert, label: "Alto impacto", className: "text-destructive" },
  MEDIA: { icon: CircleMinus, label: "Médio impacto", className: "text-yellow-500" },
  BAIXA: { icon: CircleCheck, label: "Baixo impacto", className: "text-green-500" },
};

const tagColors: Record<string, string> = {
  "IBS/CBS": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "IBS": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "CBS": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Split Payment": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Simples Nacional": "bg-green-500/15 text-green-400 border-green-500/30",
  "Lucro Real": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Lucro Presumido": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "ICMS": "bg-red-500/15 text-red-400 border-red-500/30",
  "PIS/COFINS": "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

const defaultTagColor = "bg-muted text-muted-foreground border-border";

export function LatestNewsSection() {
  const { data: news, isLoading, error } = useLatestNews(5);
  const { isProfessional } = usePlanAccess();

  if (error) return null;

  return (
    <Card className="border-amber-500/30 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Últimas da Reforma Tributária</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe as mudanças que impactam seu negócio
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <>
            <div className="space-y-2">
              {news.map((item) => {
                const impact = impactConfig[item.relevancia] || impactConfig.BAIXA;
                const tags = item.tributos_relacionados || [];
                return (
                  <Link
                    key={item.id}
                    to="/noticias"
                    className="block p-3 rounded-lg border border-border/50 hover:border-amber-500/40 hover:bg-accent/30 transition-all group"
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatBrasilia(item.data_publicacao, "dd MMM yyyy 'às' HH:mm")}
                      {item.fonte && (
                        <>
                          {" · "}
                          {item.fonte_url ? (
                            <a
                              href={item.fonte_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary underline-offset-2 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.fonte}
                            </a>
                          ) : (
                            item.fonte
                          )}
                        </>
                      )}
                    </span>
                    <h4 className="text-sm font-medium line-clamp-1 mt-0.5 group-hover:text-primary transition-colors">
                      {item.titulo_original}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${tagColors[tag] || defaultTagColor}`}
                        >
                          {tag}
                        </span>
                      ))}
                      <span className={`text-xs flex items-center gap-1 ${impact.className}`}>
                        <impact.icon className="w-3 h-3" />
                        {impact.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer links */}
            <div className="pt-3 space-y-2 border-t border-border/50">
              <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                <Link to="/noticias">
                  Ver todas as notícias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="w-full justify-between text-muted-foreground">
                <Link to={isProfessional ? "/noticias" : "/#planos"}>
                  <span className="flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    Configurar alertas por email
                  </span>
                  {!isProfessional && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      Professional
                    </Badge>
                  )}
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
