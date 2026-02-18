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
  items: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; minPlan: UserPlan }[];
}

const ALL_MODULES: ModuleInfo[] = [
  {
    title: 'ENTENDER',
    items: [
      { label: 'DRE Inteligente', href: '/dashboard/entender/dre', icon: BarChart3, minPlan: 'STARTER' },
      { label: 'Score Tributário', href: '/dashboard/entender/score', icon: Trophy, minPlan: 'STARTER' },
      { label: 'Comparativo de Regimes Tributários', href: '/dashboard/entender/comparativo', icon: Scale, minPlan: 'STARTER' },
    ],
  },
  {
    title: 'PRECIFICAR',
    items: [
      { label: 'Margem Ativa', href: '/dashboard/precificacao/margem', icon: Target, minPlan: 'PROFESSIONAL' },
      { label: 'Split Payment', href: '/dashboard/precificacao/split', icon: Wallet, minPlan: 'PROFESSIONAL' },
      { label: 'PriceGuard', href: '/dashboard/precificacao/priceguard', icon: Shield, minPlan: 'PROFESSIONAL' },
    ],
  },
  {
    title: 'RECUPERAR',
    items: [
      { label: 'Radar de Créditos', href: '/dashboard/recuperar/radar', icon: FileText, minPlan: 'NAVIGATOR' },
    ],
  },
  {
    title: 'PLANEJAR',
    items: [
      { label: 'Oportunidades Tributárias', href: '/dashboard/planejar/oportunidades', icon: Lightbulb, minPlan: 'NAVIGATOR' },
      { label: 'Planejamento Tributário', href: '/dashboard/planejar/planejamento', icon: Route, minPlan: 'NAVIGATOR' },
    ],
  },
  {
    title: 'COMANDAR',
    items: [
      { label: 'NEXUS', href: '/dashboard/comandar/nexus', icon: LayoutDashboard, minPlan: 'PROFESSIONAL' },
      { label: 'Valuation', href: '/dashboard/comandar/valuation', icon: TrendingUp, minPlan: 'PROFESSIONAL' },
      { label: 'Relatórios PDF', href: '/dashboard/comandar/relatorios', icon: FileText, minPlan: 'PROFESSIONAL' },
    ],
  },
  {
    title: 'PIT',
    items: [
      { label: 'Timeline 2026-2033', href: '/dashboard/timeline-reforma', icon: MapPin, minPlan: 'STARTER' },
      { label: 'Checklist de Prontidão', href: '/dashboard/checklist-reforma', icon: ClipboardCheck, minPlan: 'NAVIGATOR' },
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
                <div className="px-4 py-2 bg-muted/50">
                  <h3 className="text-xs font-bold tracking-wider text-muted-foreground">{mod.title}</h3>
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
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{PLAN_LABELS[item.minPlan]}+</span>
                              </div>
                            </div>
                          ) : (
                            <Link
                              to={item.href}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm flex-1">{item.label}</span>
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
