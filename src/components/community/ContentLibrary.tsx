import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Download, ExternalLink, Lock } from "lucide-react";
import { CONFIG } from "@/config/site";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "video" | "checklist";
  url?: string;
  circleUrl?: string;
  isNew?: boolean;
  comingSoon?: boolean;
}

const contentItems: ContentItem[] = [
  {
    id: "1",
    title: "Guia Completo da Reforma Tributária 2026",
    description: "Tudo o que CEOs e CFOs precisam saber sobre o CBS, IBS e Split Payment.",
    type: "guide",
    url: "/documento-comercial",
    circleUrl: `${CONFIG.CIRCLE_COMMUNITY}/c/biblioteca`,
    isNew: true,
  },
  {
    id: "2",
    title: "Checklist: Preparação para o Split Payment",
    description: "15 itens essenciais para adequar seu fluxo de caixa antes de 2026.",
    type: "checklist",
    url: "/checklist-reforma",
    circleUrl: `${CONFIG.CIRCLE_COMMUNITY}/c/biblioteca`,
  },
  {
    id: "3",
    title: "Template: Apresentação para Diretoria",
    description: "Slides prontos para apresentar o impacto da reforma ao conselho.",
    type: "template",
    circleUrl: `${CONFIG.CIRCLE_COMMUNITY}/c/biblioteca`,
    comingSoon: true,
  },
];

const typeConfig = {
  guide: { icon: FileText, label: "Guia", color: "bg-primary/10 text-primary" },
  template: { icon: Download, label: "Template", color: "bg-secondary/10 text-secondary" },
  video: { icon: Video, label: "Vídeo", color: "bg-accent/10 text-accent-foreground" },
  checklist: { icon: FileText, label: "Checklist", color: "bg-muted text-muted-foreground" },
};

interface ContentLibraryProps {
  isProfessional?: boolean;
}

export const ContentLibrary = ({ isProfessional = false }: ContentLibraryProps) => {
  const getItemUrl = (item: ContentItem) => {
    if (item.comingSoon) return undefined;
    // Professional+ users are redirected to Circle
    if (isProfessional && item.circleUrl) return item.circleUrl;
    return item.url;
  };

  const isExternal = (url?: string) => url?.startsWith("http");

  return (
    <div className="space-y-4">
      {isProfessional && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Professional+:</strong> Seus conteúdos exclusivos estão disponíveis no Circle, 
            onde você também pode interagir com outros membros.
          </p>
        </div>
      )}
      {contentItems.map((item) => {
        const config = typeConfig[item.type];
        const Icon = config.icon;
        const itemUrl = getItemUrl(item);

        return (
          <Card key={item.id} className={item.comingSoon ? "opacity-60" : ""}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                    {item.isNew && (
                      <Badge variant="default" className="text-xs">Novo</Badge>
                    )}
                    {item.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Em breve</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
                <div className="shrink-0">
                  {item.comingSoon ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Lock className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={itemUrl} target={isExternal(itemUrl) ? "_blank" : undefined} rel={isExternal(itemUrl) ? "noopener noreferrer" : undefined}>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
