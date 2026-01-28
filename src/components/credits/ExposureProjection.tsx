import { useState, useEffect } from 'react';
import { 
  TrendingDown, AlertTriangle, DollarSign, HelpCircle, 
  ArrowRight, Loader2, FileQuestion, Wallet, CreditCard,
  Scale, ClipboardCheck, Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface ExposureArea {
  id: string;
  title: string;
  description: string;
  exposureLevel: 'low' | 'medium' | 'high' | 'critical';
  exposureRange: { min: number; max: number };
  mainFactors: string[];
  dataQuality: 'A' | 'B' | 'C';
  uncertaintyFactor: string;
  helpText: {
    meaning: string;
    importance: string;
    nextStep: string;
  };
  relatedTool?: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

const exposureLevelConfig = {
  low: { 
    label: 'Baixa', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    progressColor: 'bg-green-500'
  },
  medium: { 
    label: 'Moderada', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    progressColor: 'bg-yellow-500'
  },
  high: { 
    label: 'Alta', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    progressColor: 'bg-orange-500'
  },
  critical: { 
    label: 'Crítica', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    progressColor: 'bg-red-500'
  }
};

const dataQualityLabels = {
  A: { label: 'Dado Completo', description: 'Baseado em XMLs e histórico real' },
  B: { label: 'Dado Parcial', description: 'Baseado em estimativas do perfil' },
  C: { label: 'Dado Limitado', description: 'Projeção com alta incerteza' }
};

export function ExposureProjection() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exposureAreas, setExposureAreas] = useState<ExposureArea[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (user) {
      analyzeExposure();
    }
  }, [user]);

  const analyzeExposure = async () => {
    try {
      // Fetch user data to determine exposure
      const [xmlsResult, dreResult, profileResult, creditsResult] = await Promise.all([
        supabase.from('xml_imports').select('id').eq('user_id', user?.id).limit(1),
        supabase.from('company_dre').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('company_profile').select('*').eq('user_id', user?.id).single(),
        supabase.from('identified_credits').select('potential_recovery').eq('user_id', user?.id)
      ]);

      const hasXmls = (xmlsResult.data?.length || 0) > 0;
      const hasDre = !!dreResult.data?.[0];
      const profile = profileResult.data;
      const totalCredits = creditsResult.data?.reduce((sum, c) => sum + (c.potential_recovery || 0), 0) || 0;

      setHasData(hasXmls || hasDre || !!profile);

      // Build exposure areas based on available data
      const areas: ExposureArea[] = [];

      // 1. Exposição a Imposto Incorreto
      const faturamento = profile?.faturamento_anual || profile?.faturamento_mensal_medio * 12 || 500000;
      const exposicaoImpostoMin = faturamento * 0.01;
      const exposicaoImpostoMax = faturamento * 0.03;
      
      areas.push({
        id: 'imposto_incorreto',
        title: 'Imposto Calculado Incorretamente',
        description: 'Risco de pagar tributo a mais ou a menos por erro de classificação NCM/NBS ou alíquota.',
        exposureLevel: hasXmls ? 'medium' : 'high',
        exposureRange: { min: exposicaoImpostoMin, max: exposicaoImpostoMax },
        mainFactors: [
          'Classificação NCM/NBS dos produtos',
          'Alíquotas do novo regime (CBS/IBS)',
          'Operações interestaduais'
        ],
        dataQuality: hasXmls ? 'A' : 'C',
        uncertaintyFactor: 'Alíquotas definitivas ainda em definição para alguns setores',
        helpText: {
          meaning: 'Este valor representa quanto você pode pagar incorretamente em tributos durante a transição.',
          importance: 'Erros de classificação e alíquota podem resultar em autuações ou pagamento excessivo.',
          nextStep: 'Revise a classificação NCM/NBS dos seus principais produtos com seu contador.'
        },
        relatedTool: {
          label: 'Calculadora RTC',
          href: '/dashboard/calculadora-rtc',
          icon: Calculator
        }
      });

      // 2. Exposição a Perda de Créditos
      const creditosEmRisco = totalCredits > 0 ? totalCredits * 0.15 : faturamento * 0.005;
      
      areas.push({
        id: 'perda_creditos',
        title: 'Créditos em Risco de Perda',
        description: 'Créditos acumulados que podem expirar ou ser perdidos durante a transição.',
        exposureLevel: totalCredits > 50000 ? 'high' : totalCredits > 10000 ? 'medium' : 'low',
        exposureRange: { min: creditosEmRisco * 0.5, max: creditosEmRisco * 1.5 },
        mainFactors: [
          'Créditos de PIS/COFINS acumulados',
          'Créditos de ICMS do regime atual',
          'Prazos de transição (2026-2032)'
        ],
        dataQuality: hasXmls ? 'A' : 'C',
        uncertaintyFactor: 'Regras de transição de créditos ainda sendo regulamentadas',
        helpText: {
          meaning: 'Créditos tributários acumulados que podem não ser aproveitados no novo sistema.',
          importance: 'A reforma altera regras de creditamento. Créditos antigos têm prazo para uso.',
          nextStep: 'Mapeie todos os créditos acumulados e defina estratégia de uso até 2032.'
        },
        relatedTool: {
          label: 'Radar de Créditos',
          href: '/dashboard/radar-creditos',
          icon: CreditCard
        }
      });

      // 3. Exposição de Caixa (Split Payment)
      const impactoSplit = faturamento * 0.265 * 0.08; // ~8% do tributo retido impacta capital de giro
      
      areas.push({
        id: 'pressao_caixa',
        title: 'Pressão no Fluxo de Caixa',
        description: 'Impacto do Split Payment no capital de giro e necessidade de financiamento.',
        exposureLevel: faturamento > 5000000 ? 'high' : faturamento > 1000000 ? 'medium' : 'low',
        exposureRange: { min: impactoSplit * 0.7, max: impactoSplit * 1.3 },
        mainFactors: [
          'Volume de vendas B2B vs B2C',
          'Prazo médio de recebimento',
          'Margem de lucro operacional'
        ],
        dataQuality: hasDre ? 'B' : 'C',
        uncertaintyFactor: 'Modelo final de Split Payment ainda em discussão',
        helpText: {
          meaning: 'Quanto de capital de giro você pode precisar a mais por causa do Split Payment.',
          importance: 'Com o Split, parte do tributo sai direto do seu caixa. Isso reduz o capital disponível.',
          nextStep: 'Simule cenários de Split Payment e avalie necessidade de linha de crédito.'
        },
        relatedTool: {
          label: 'Simulador Split Payment',
          href: '/dashboard/split-payment',
          icon: Wallet
        }
      });

      // 4. Exposição por Incerteza Regulatória
      const incertezaRegulatoriaMin = faturamento * 0.005;
      const incertezaRegulatoriaMax = faturamento * 0.02;
      
      areas.push({
        id: 'incerteza_regulatoria',
        title: 'Incerteza Regulatória',
        description: 'Custos potenciais de adaptação a mudanças ainda não definidas na legislação.',
        exposureLevel: 'medium',
        exposureRange: { min: incertezaRegulatoriaMin, max: incertezaRegulatoriaMax },
        mainFactors: [
          'Regulamentação de setores específicos',
          'Mudanças nos prazos de transição',
          'Interpretações da Receita Federal'
        ],
        dataQuality: 'C',
        uncertaintyFactor: 'Legislação complementar ainda sendo publicada',
        helpText: {
          meaning: 'Custos imprevisíveis que podem surgir de mudanças regulatórias durante a transição.',
          importance: 'A reforma está em implementação. Novas regras podem surgir até 2033.',
          nextStep: 'Acompanhe o cronograma da reforma e avalie sua prontidão operacional.'
        },
        relatedTool: {
          label: 'Checklist de Prontidão',
          href: '/dashboard/checklist-reforma',
          icon: ClipboardCheck
        }
      });

      // 5. Exposição por Regime Inadequado
      if (profile?.regime_tributario) {
        const exposicaoRegimeMin = faturamento * 0.01;
        const exposicaoRegimeMax = faturamento * 0.05;
        
        areas.push({
          id: 'regime_inadequado',
          title: 'Regime Tributário Subótimo',
          description: 'Potencial economia não realizada por estar no regime tributário menos vantajoso.',
          exposureLevel: 'medium',
          exposureRange: { min: exposicaoRegimeMin, max: exposicaoRegimeMax },
          mainFactors: [
            'Comparação Simples vs Lucro Presumido vs Real',
            'Fator R e composição de receitas',
            'Créditos disponíveis em cada regime'
          ],
          dataQuality: hasDre ? 'B' : 'C',
          uncertaintyFactor: 'Benefícios de cada regime mudam com a reforma',
          helpText: {
            meaning: 'Quanto você pode economizar escolhendo o regime tributário mais adequado ao seu perfil.',
            importance: 'Com a reforma, a vantagem relativa de cada regime muda. Reavalie anualmente.',
            nextStep: 'Compare os cenários de regime tributário com dados do seu DRE.'
          },
          relatedTool: {
            label: 'Comparativo de Regimes',
            href: '/dashboard/comparativo-regimes',
            icon: Scale
          }
        });
      }

      setExposureAreas(areas);
    } catch (error) {
      console.error('Error analyzing exposure:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTotalExposure = () => {
    const min = exposureAreas.reduce((sum, area) => sum + area.exposureRange.min, 0);
    const max = exposureAreas.reduce((sum, area) => sum + area.exposureRange.max, 0);
    return { min, max };
  };

  const getExposureLevelValue = (level: string) => {
    switch (level) {
      case 'low': return 25;
      case 'medium': return 50;
      case 'high': return 75;
      case 'critical': return 100;
      default: return 50;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalExposure = getTotalExposure();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <TrendingDown className="h-6 w-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Exposição Projetada</h2>
          <p className="text-sm text-muted-foreground">
            Cenários de risco tributário durante a transição da Reforma
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Projeção de cenários, não valores definitivos</p>
              <p className="text-amber-700 mt-1">
                Os valores apresentados são estimativas baseadas nos dados disponíveis e podem variar. 
                Consulte seu contador para análise específica da sua situação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Exposure Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Exposição Total Projetada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalExposure.min)}
            </span>
            <span className="text-lg text-muted-foreground">a</span>
            <span className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalExposure.max)}
            </span>
            <span className="text-sm text-muted-foreground">/ano</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Soma das exposições identificadas em {exposureAreas.length} áreas de risco. 
            Este valor tende a variar com base na completude dos dados e mudanças regulatórias.
          </p>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">Dados limitados para projeção</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para uma projeção mais precisa, importe seus XMLs e preencha seu DRE.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/dashboard/importar-xml">Importar XMLs</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard/dre">Preencher DRE</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exposure Areas */}
      <div className="space-y-4">
        {exposureAreas.map((area) => {
          const levelConfig = exposureLevelConfig[area.exposureLevel];
          const qualityInfo = dataQualityLabels[area.dataQuality];

          return (
            <Card key={area.id} className={`border-l-4 ${levelConfig.borderColor}`}>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{area.title}</h3>
                        <TooltipProvider>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button className="text-muted-foreground hover:text-foreground transition-colors">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-sm p-4 space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-primary mb-1">O que isso significa:</p>
                                <p className="text-xs">{area.helpText.meaning}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-primary mb-1">Por que importa:</p>
                                <p className="text-xs">{area.helpText.importance}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-primary mb-1">Próximo passo:</p>
                                <p className="text-xs">{area.helpText.nextStep}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${levelConfig.bgColor} ${levelConfig.color}`}>
                        {levelConfig.label}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help">
                              Dado {area.dataQuality}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{qualityInfo.label}</p>
                            <p className="text-xs text-muted-foreground">{qualityInfo.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Exposure Range */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Exposição estimada</span>
                        <span className="font-medium">
                          {formatCurrency(area.exposureRange.min)} — {formatCurrency(area.exposureRange.max)}
                        </span>
                      </div>
                      <Progress 
                        value={getExposureLevelValue(area.exposureLevel)} 
                        className={`h-2 [&>div]:${levelConfig.progressColor}`}
                      />
                    </div>
                  </div>

                  {/* Main Factors */}
                  <div className="flex flex-wrap gap-2">
                    {area.mainFactors.map((factor, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>

                  {/* Uncertainty */}
                  <p className="text-xs text-muted-foreground italic">
                    ⚠ Principal incerteza: {area.uncertaintyFactor}
                  </p>

                  {/* Related Tool CTA */}
                  {area.relatedTool && (
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <Link to={area.relatedTool.href} className="gap-2">
                        <area.relatedTool.icon className="h-4 w-4" />
                        {area.relatedTool.label}
                        <ArrowRight className="h-3 w-3 ml-auto" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-3">O que fazer com essa informação?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              Priorize as áreas de exposição Alta e Crítica
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              Use as ferramentas sugeridas para reduzir incerteza
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              Reavalie mensalmente à medida que a legislação evolui
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              Compartilhe este diagnóstico com seu contador para ações específicas
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
