import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Pill,
  Sparkles,
  Fuel,
  Wine,
  Car,
  Laptop,
  ArrowRightLeft,
  Building2,
  FileText,
  Gift,
  Microscope,
  Globe,
  CheckCircle2,
  Calculator,
  Wrench,
  Shield,
  BookOpen,
  HelpCircle,
  Mail,
  Download,
  CheckSquare,
  XCircle,
  ExternalLink,
  Clock,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityDetail {
  id: string;
  code: string;
  name: string;
  name_simples?: string;
  description?: string;
  description_ceo?: string;
  category: string;
  match_score: number;
  match_reasons: string[];
  economia_anual_min: number;
  economia_anual_max: number;
  economia_mensal_min?: number;
  economia_mensal_max?: number;
  complexidade: string;
  tempo_implementacao?: string;
  risco_fiscal?: string;
  risco_descricao?: string;
  quick_win: boolean;
  alto_impacto: boolean;
  tributos_afetados: string[];
  base_legal?: string;
  base_legal_resumo?: string;
  link_legislacao?: string;
  exemplo_pratico?: string;
  faq?: Array<{ pergunta: string; resposta: string }>;
  passos_implementacao?: string[];
  requer_contador?: boolean;
  requer_advogado?: boolean;
  status_lc_224_2025?: string;
  descricao_lc_224_2025?: string;
  futuro_reforma?: string;
  descricao_reforma?: string;
}

interface OpportunityDetailModalProps {
  opportunity: OpportunityDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData?: {
    faturamento_mensal?: number;
    percentual_produtos?: number;
  };
  onStatusChange?: (id: string, status: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  monofasico: <Pill className="h-6 w-6" />,
  combustiveis: <Fuel className="h-6 w-6" />,
  bebidas: <Wine className="h-6 w-6" />,
  cosmeticos: <Sparkles className="h-6 w-6" />,
  autopecas: <Car className="h-6 w-6" />,
  eletronicos: <Laptop className="h-6 w-6" />,
  segregacao: <ArrowRightLeft className="h-6 w-6" />,
  planejamento: <Building2 className="h-6 w-6" />,
  regime_especial: <FileText className="h-6 w-6" />,
  incentivo: <Gift className="h-6 w-6" />,
  pd: <Microscope className="h-6 w-6" />,
  exportacao: <Globe className="h-6 w-6" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  monofasico: 'PIS/COFINS Monofásico',
  segregacao: 'Segregação de Receitas',
  regime_especial: 'Regime Especial',
  planejamento: 'Planejamento Intercompany',
  incentivo: 'Incentivo Fiscal',
  isencao: 'Isenção',
  credito: 'Crédito Tributário',
  exportacao: 'Exportação',
  pd: 'P&D / Inovação',
};

const REFORMA_STATUS: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  mantido: { icon: '✅', label: 'Mantido com a Reforma', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  extinto: { icon: '🔴', label: 'Extinto Gradualmente', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  substituido: { icon: '🔄', label: 'Substituído pela CBS/IBS', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  em_adaptacao: { icon: '⚠️', label: 'Em Adaptação', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  em_analise: { icon: '🔍', label: 'Em Análise', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200' },
};

const LC_STATUS: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  protegido: { icon: '🛡️', label: 'Protegido da LC 224/2025', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  afetado: { icon: '⚠️', label: 'Afetado pela LC 224/2025', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  critico: { icon: '🚨', label: 'Crítico - Ação Urgente', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  neutro: { icon: '➖', label: 'Sem Alteração 2026', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
};

export function OpportunityDetailModal({
  opportunity,
  open,
  onOpenChange,
  profileData,
  onStatusChange,
}: OpportunityDetailModalProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!opportunity) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryIcon = () => {
    if (opportunity.code?.includes('FARMA') || opportunity.name?.toLowerCase().includes('medicamento')) {
      return <Pill className="h-6 w-6" />;
    }
    if (opportunity.code?.includes('COSM') || opportunity.name?.toLowerCase().includes('cosmético')) {
      return <Sparkles className="h-6 w-6" />;
    }
    if (opportunity.code?.includes('COMB') || opportunity.name?.toLowerCase().includes('combustível')) {
      return <Fuel className="h-6 w-6" />;
    }
    if (opportunity.code?.includes('BEB') || opportunity.name?.toLowerCase().includes('bebida')) {
      return <Wine className="h-6 w-6" />;
    }
    return CATEGORY_ICONS[opportunity.category] || <FileText className="h-6 w-6" />;
  };

  const getRiskInfo = () => {
    switch (opportunity.risco_fiscal) {
      case 'nenhum':
        return { 
          label: 'Nenhum. É seu direito previsto em lei.', 
          color: 'text-primary',
          description: opportunity.risco_descricao || 'A Receita Federal já reconhece esse benefício. Não há risco de autuação quando implementado corretamente.'
        };
      case 'baixo':
        return { 
          label: 'Baixo', 
          color: 'text-primary',
          description: opportunity.risco_descricao || 'Entendimento consolidado nos tribunais. Risco mínimo quando bem documentado.'
        };
      case 'medio':
        return { 
          label: 'Moderado', 
          color: 'text-yellow-600',
          description: opportunity.risco_descricao || 'Pode haver questionamento fiscal. Recomenda-se parecer técnico.'
        };
      case 'alto':
        return { 
          label: 'Alto - Requer cuidado', 
          color: 'text-destructive',
          description: opportunity.risco_descricao || 'Tema controverso. Recomenda-se acompanhamento de advogado tributarista.'
        };
      default:
        return { 
          label: 'Baixo', 
          color: 'text-primary',
          description: 'Risco mínimo quando implementado corretamente.'
        };
    }
  };

  const riskInfo = getRiskInfo();

  const economiaAnualMin = opportunity.economia_anual_min;
  const economiaAnualMax = opportunity.economia_anual_max;
  const economiaMensalMin = opportunity.economia_mensal_min || economiaAnualMin / 12;
  const economiaMensalMax = opportunity.economia_mensal_max || economiaAnualMax / 12;

  // Default implementation steps if not provided
  const defaultSteps = [
    'Análise detalhada do enquadramento da sua empresa',
    'Identificação dos produtos/operações elegíveis',
    'Configuração do sistema fiscal',
    'Revisão e ajuste de declarações',
    'Acompanhamento dos resultados'
  ];

  const implementationSteps = opportunity.passos_implementacao?.length 
    ? opportunity.passos_implementacao 
    : defaultSteps;

  // Default FAQ if not provided
  const defaultFaq = [
    {
      pergunta: 'Preciso de advogado?',
      resposta: opportunity.requer_advogado 
        ? 'Sim, recomendamos acompanhamento de advogado tributarista para esta oportunidade.'
        : 'Não necessariamente. Seu contador pode implementar na maioria dos casos.'
    },
    {
      pergunta: 'Quanto tempo leva para ver resultados?',
      resposta: `Após a implementação (${opportunity.tempo_implementacao || '2-4 semanas'}), você verá o impacto já no próximo período fiscal.`
    },
    {
      pergunta: 'A Receita pode questionar?',
      resposta: opportunity.risco_fiscal === 'nenhum' || opportunity.risco_fiscal === 'baixo'
        ? 'Improvável. É entendimento pacificado e reconhecido pela legislação.'
        : 'Pode haver questionamentos. Recomenda-se documentação robusta e, se necessário, parecer técnico.'
    }
  ];

  const faqItems = opportunity.faq?.length ? opportunity.faq : defaultFaq;

  const handleSendToAccountant = () => {
    toast({
      title: "Em breve",
      description: "Funcionalidade de envio para contador em desenvolvimento.",
    });
  };

  const handleDownloadPdf = () => {
    toast({
      title: "Em breve", 
      description: "Download do resumo em PDF em desenvolvimento.",
    });
  };

  const handleMarkAsImplementing = async () => {
    setIsUpdating(true);
    try {
      onStatusChange?.(opportunity.id, 'implementando');
      toast({
        title: "Status atualizado",
        description: "Oportunidade marcada como 'Implementando'.",
      });
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotInterested = async () => {
    setIsUpdating(true);
    try {
      onStatusChange?.(opportunity.id, 'descartada');
      toast({
        title: "Oportunidade descartada",
        description: "Você pode reativar a qualquer momento.",
      });
      onOpenChange(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-card">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              {getCategoryIcon()}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl leading-tight">
                {opportunity.name_simples || opportunity.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {CATEGORY_LABELS[opportunity.category] || opportunity.category}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {opportunity.quick_win && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="h-3 w-3" />
                    Quick Win
                  </Badge>
                )}
                {opportunity.alto_impacto && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Alto Impacto
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Economia Box */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                ECONOMIA ESTIMADA
              </p>
              <p className="text-2xl font-bold text-primary">
                {economiaAnualMin === economiaAnualMax 
                  ? formatCurrency(economiaAnualMax)
                  : `${formatCurrency(economiaAnualMin)} a ${formatCurrency(economiaAnualMax)}`
                }
                <span className="text-base font-normal text-muted-foreground">/ano</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou {formatCurrency(economiaMensalMin)} a {formatCurrency(economiaMensalMax)}/mês
              </p>
            </div>

            <Separator />

            {/* Entenda em 30 segundos */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Entenda em 30 segundos
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {opportunity.description_ceo || opportunity.description || opportunity.exemplo_pratico || 
                  'Esta oportunidade permite reduzir sua carga tributária de forma legal e segura, gerando economia real para sua empresa.'}
              </p>
            </section>

            <Separator />

            {/* Por que é elegível */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Por que sua empresa é elegível
              </h3>
              <ul className="space-y-2">
                {opportunity.match_reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            {/* Como calculamos */}
            {profileData?.faturamento_mensal && (
              <>
                <section>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Calculator className="h-5 w-5 text-primary" />
                    Como calculamos
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seu faturamento mensal:</span>
                      <span className="font-medium">~{formatCurrency(profileData.faturamento_mensal)}</span>
                    </div>
                    {profileData.percentual_produtos && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base estimada:</span>
                        <span className="font-medium">~{profileData.percentual_produtos}% = {formatCurrency(profileData.faturamento_mensal * profileData.percentual_produtos / 100)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-primary font-medium">
                      <span>Economia mensal:</span>
                      <span>{formatCurrency(economiaMensalMin)} a {formatCurrency(economiaMensalMax)}</span>
                    </div>
                    <div className="flex justify-between text-primary font-medium">
                      <span>Economia anual:</span>
                      <span>{formatCurrency(economiaAnualMin)} a {formatCurrency(economiaAnualMax)}</span>
                    </div>
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* Como implementar */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Wrench className="h-5 w-5 text-primary" />
                Como implementar
              </h3>
              <ol className="space-y-2">
                {implementationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg">
                {opportunity.requer_advogado 
                  ? '⚖️ Recomendamos envolver seu contador e um advogado tributarista.'
                  : `👨‍💼 Seu contador pode fazer isso em ${opportunity.tempo_implementacao || '2-4 semanas'}.`
                }
              </p>
            </section>

            <Separator />

            {/* Risco */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                Risco
              </h3>
              <div className={cn("font-medium mb-2", riskInfo.color)}>
                {riskInfo.label}
              </div>
              <p className="text-muted-foreground text-sm">
                {riskInfo.description}
              </p>
            </section>

            <Separator />

            {/* Base Legal */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Base Legal <span className="text-xs text-muted-foreground font-normal">(para seu contador)</span>
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {opportunity.base_legal_resumo ? (
                  <p>{opportunity.base_legal_resumo}</p>
                ) : opportunity.base_legal ? (
                  <p>{opportunity.base_legal}</p>
                ) : (
                  <p>Consulte seu contador para detalhes da legislação aplicável.</p>
                )}
              </div>
              {opportunity.link_legislacao && (
                <Button variant="link" className="p-0 h-auto mt-2 gap-1" asChild>
                  <a href={opportunity.link_legislacao} target="_blank" rel="noopener noreferrer">
                    Ver legislação completa
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </section>

            <Separator />

            {/* Status 2026 e Reforma Tributária */}
            {(opportunity.futuro_reforma || opportunity.status_lc_224_2025) && (
              <>
                <section>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    Cenário 2026 e Reforma Tributária
                  </h3>
                  <div className="space-y-3">
                    {opportunity.status_lc_224_2025 && LC_STATUS[opportunity.status_lc_224_2025] && (
                      <div className={cn("rounded-lg border p-3", LC_STATUS[opportunity.status_lc_224_2025].bgColor)}>
                        <div className={cn("font-medium flex items-center gap-2 mb-1", LC_STATUS[opportunity.status_lc_224_2025].color)}>
                          <span>{LC_STATUS[opportunity.status_lc_224_2025].icon}</span>
                          {LC_STATUS[opportunity.status_lc_224_2025].label}
                        </div>
                        {opportunity.descricao_lc_224_2025 && (
                          <p className="text-sm text-muted-foreground">{opportunity.descricao_lc_224_2025}</p>
                        )}
                      </div>
                    )}
                    {opportunity.futuro_reforma && REFORMA_STATUS[opportunity.futuro_reforma] && (
                      <div className={cn("rounded-lg border p-3", REFORMA_STATUS[opportunity.futuro_reforma].bgColor)}>
                        <div className={cn("font-medium flex items-center gap-2 mb-1", REFORMA_STATUS[opportunity.futuro_reforma].color)}>
                          <span>{REFORMA_STATUS[opportunity.futuro_reforma].icon}</span>
                          Pós-2027: {REFORMA_STATUS[opportunity.futuro_reforma].label}
                        </div>
                        {opportunity.descricao_reforma && (
                          <p className="text-sm text-muted-foreground">{opportunity.descricao_reforma}</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* FAQ */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {item.pergunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/30 space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSendToAccountant}>
              <Mail className="h-4 w-4" />
              Enviar para Contador
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" />
              Baixar Resumo PDF
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              size="sm" 
              className="gap-2" 
              onClick={handleMarkAsImplementing}
              disabled={isUpdating}
            >
              <CheckSquare className="h-4 w-4" />
              Marcar como "Implementando"
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground" 
              onClick={handleNotInterested}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4" />
              Não tenho interesse
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
