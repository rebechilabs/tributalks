import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/contexts/CompanyContext";
import { usePlanAccess } from "@/hooks/useFeatureAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  User, Building2, FileText as FileTextIcon, Lock,
  BarChart3, Trophy, Scale, Target, Wallet, Shield,
  Lightbulb, Route, LayoutDashboard, TrendingUp, FileText,
  MapPin, ClipboardCheck
} from "lucide-react";
import { PLAN_LABELS, PLAN_HIERARCHY, type UserPlan } from "@/hooks/useFeatureAccess";
import { LEGACY_PLAN_MAP } from "@/data/menuConfig";

interface ModuleInfo {
  title: string;
  description: string;
  items: { label: string; description: string; href: string; icon: React.ComponentType<{ className?: string }>; minPlan: UserPlan }[];
}

const ALL_MODULES: ModuleInfo[] = [
  {
    title: 'ENTENDER',
    description: 'Diagnóstico completo da saúde tributária da sua empresa. Entenda onde você está antes de tomar qualquer decisão.',
    items: [
      { label: 'DRE Inteligente', description: 'Visualize seu lucro ou prejuízo líquido com análise automática de receitas e despesas.', href: '/dashboard/entender/dre', icon: BarChart3, minPlan: 'STARTER' },
      { label: 'Score Tributário', description: 'Nota de 0 a 100 que avalia sua situação fiscal atual e aponta melhorias.', href: '/dashboard/entender/score', icon: Trophy, minPlan: 'STARTER' },
      { label: 'Comparativo de Regimes Tributários', description: 'Compare Simples, Presumido, Real e os novos regimes IBS/CBS de 2027.', href: '/dashboard/entender/comparativo', icon: Scale, minPlan: 'STARTER' },
    ],
  },
  {
    title: 'PRECIFICAR',
    description: 'Precifique seus produtos e serviços corretamente, considerando o impacto tributário real na sua margem.',
    items: [
      { label: 'Margem Ativa', description: 'Analise a margem real de cada produto por NCM com os impostos embutidos.', href: '/dashboard/precificacao/margem', icon: Target, minPlan: 'PROFESSIONAL' },
      { label: 'Split Payment', description: 'Simule o impacto do split payment obrigatório a partir de 2026 no seu caixa.', href: '/dashboard/precificacao/split', icon: Wallet, minPlan: 'PROFESSIONAL' },
      { label: 'PriceGuard', description: 'Monitore e proteja suas margens contra variações tributárias automáticas.', href: '/dashboard/precificacao/priceguard', icon: Shield, minPlan: 'PROFESSIONAL' },
    ],
  },
  {
    title: 'RECUPERAR',
    description: 'Identifique tributos pagos a mais e recupere créditos fiscais que sua empresa tem direito.',
    items: [
      { label: 'Radar de Créditos', description: 'Analise seus XMLs de notas fiscais e descubra créditos tributários não aproveitados.', href: '/dashboard/recuperar/radar', icon: FileText, minPlan: 'NAVIGATOR' },
    ],
  },
  {
    title: 'PLANEJAR',
    description: 'Planeje o futuro tributário da sua empresa com oportunidades reais de economia.',
    items: [
      { label: 'Oportunidades Tributárias', description: 'Mais de 61 benefícios fiscais mapeados e filtrados para o seu perfil.', href: '/dashboard/planejar/oportunidades', icon: Lightbulb, minPlan: 'NAVIGATOR' },
      { label: 'Planejamento Tributário', description: 'Monte um plano de ação personalizado para otimizar sua carga tributária.', href: '/dashboard/planejar/planejamento', icon: Route, minPlan: 'NAVIGATOR' },
    ],
  },
  {
    title: 'COMANDAR',
    description: 'Visão executiva completa para tomar decisões estratégicas com dados em tempo real.',
    items: [
      { label: 'NEXUS', description: 'Painel de comando com 8 KPIs tributários essenciais em tempo real.', href: '/dashboard/comandar/nexus', icon: LayoutDashboard, minPlan: 'PROFESSIONAL' },
      { label: 'Valuation', description: 'Estime o valor da sua empresa com 3 métodos de avaliação diferentes.', href: '/dashboard/comandar/valuation', icon: TrendingUp, minPlan: 'PROFESSIONAL' },
      { label: 'Relatórios PDF', description: 'Gere relatórios profissionais para apresentar a sócios e investidores.', href: '/dashboard/comandar/relatorios', icon: FileText, minPlan: 'PROFESSIONAL' },
    ],
  },
  {
    title: 'PIT',
    description: 'Prazos Importantes Tributários — acompanhe a Reforma Tributária e prepare sua empresa.',
    items: [
      { label: 'Timeline 2026-2033', description: 'Calendário visual com todos os marcos da transição tributária.', href: '/dashboard/timeline-reforma', icon: MapPin, minPlan: 'STARTER' },
      { label: 'Checklist de Prontidão', description: 'Lista de verificação para garantir que sua empresa está preparada.', href: '/dashboard/checklist-reforma', icon: ClipboardCheck, minPlan: 'NAVIGATOR' },
    ],
  },
];

function formatCurrency(value: number | null) {
  if (!value) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function formatCNPJ(cnpj: string | null) {
  if (!cnpj) return '—';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export default function HomePage() {
  const { profile } = useAuth();
  const { currentCompany } = useCompany();
  const { currentPlan } = usePlanAccess();

  const planLevel = PLAN_HIERARCHY[currentPlan] ?? 0;

  const regimeLabel: Record<string, string> = {
    'SIMPLES': 'Simples Nacional',
    'PRESUMIDO': 'Lucro Presumido',
    'REAL': 'Lucro Real',
    'simples_nacional': 'Simples Nacional',
    'lucro_presumido': 'Lucro Presumido',
    'lucro_real': 'Lucro Real',
  };

  const regime = currentCompany?.regime_tributario || profile?.regime;
  const displayRegime = regime ? (regimeLabel[regime] || regime) : '—';

  return (
    <DashboardLayout title="Home">
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Dados Cadastrais */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Meus Dados
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {PLAN_LABELS[currentPlan]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Nome" value={profile?.nome || '—'} />
              <InfoRow label="Empresa" value={currentCompany?.nome_fantasia || currentCompany?.razao_social || profile?.empresa || '—'} />
              <InfoRow label="CNPJ" value={formatCNPJ(currentCompany?.cnpj_principal || null)} />
              <InfoRow label="Regime Tributário" value={displayRegime} />
              <InfoRow label="Faturamento Anual" value={formatCurrency(currentCompany?.faturamento_anual || null)} />
              <InfoRow label="Funcionários" value={currentCompany?.num_funcionarios?.toString() || '—'} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Resumo dos Módulos */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Módulos da Plataforma</h2>
          <div className="space-y-4">
            {ALL_MODULES.map((mod) => (
              <Card key={mod.title} className="overflow-hidden">
                <div className="px-4 py-3 bg-muted/50">
                  <h3 className="text-xs font-bold tracking-wider text-muted-foreground">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                </div>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {mod.items.map((item) => {
                      const itemLevel = PLAN_HIERARCHY[item.minPlan] ?? 0;
                      const isLocked = planLevel < itemLevel;
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          {isLocked ? (
                            <div className="flex items-center gap-3 px-4 py-3 opacity-50 cursor-not-allowed">
                              <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-muted-foreground">{item.label}</span>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{PLAN_LABELS[item.minPlan]}+</span>
                              </div>
                            </div>
                          ) : (
                            <Link
                              to={item.href}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm">{item.label}</span>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              </div>
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-medium truncate">{value}</p>
    </div>
  );
}
