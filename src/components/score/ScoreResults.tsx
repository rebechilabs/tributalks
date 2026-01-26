import { ArrowRight, TrendingUp, AlertTriangle, Coins, FileText, Mail, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TaxDisclaimer } from "@/components/common/TaxDisclaimer";

interface ScoreAction {
  id: string;
  action_code: string;
  action_title: string;
  action_description: string;
  points_gain: number;
  economia_estimada: number;
  priority: number;
  link_to: string;
  status: string;
}

interface FinancialImpact {
  economiaPotencial: number;
  riscoAutuacao: number;
  creditosNaoAproveitados: number;
}

interface ScoreResultsProps {
  financialImpact: FinancialImpact;
  actions: ScoreAction[];
  onRecalculate: () => void;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const priorityConfig: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  1: { label: 'Alta', variant: 'default' },
  2: { label: 'Média', variant: 'secondary' },
  3: { label: 'Baixa', variant: 'outline' },
  4: { label: 'Opcional', variant: 'outline' },
};

// Mapeamento de ações para dimensões do score
const dimensionConfig: Record<string, { dimension: string; icon: string; color: string; tip: string }> = {
  // Conformidade - regularidade fiscal
  'REGULARIZAR_DEBITOS': { dimension: 'Conformidade', icon: '⚖️', color: 'text-blue-600', tip: 'Quite débitos pendentes para sair do vermelho fiscal' },
  'ATUALIZAR_CERTIDOES': { dimension: 'Conformidade', icon: '⚖️', color: 'text-blue-600', tip: 'Renove certidões negativas antes do vencimento' },
  'RESOLVER_NOTIFICACAO': { dimension: 'Conformidade', icon: '⚖️', color: 'text-blue-600', tip: 'Responda notificações da Receita dentro do prazo' },
  
  // Eficiência - aproveitamento de créditos e economia
  'RECUPERAR_CREDITOS': { dimension: 'Eficiência', icon: '💰', color: 'text-green-600', tip: 'Analise XMLs para identificar créditos não utilizados' },
  'REVISAR_REGIME': { dimension: 'Eficiência', icon: '💰', color: 'text-green-600', tip: 'Compare regimes tributários e escolha o mais vantajoso' },
  'REVISAR_NCM': { dimension: 'Eficiência', icon: '💰', color: 'text-green-600', tip: 'Corrija NCMs para pagar alíquotas corretas' },
  
  // Risco - exposição a autuações
  'CORRIGIR_OBRIGACOES': { dimension: 'Risco', icon: '⚠️', color: 'text-red-600', tip: 'Regularize obrigações acessórias em atraso' },
  'REVISAR_CLASSIFICACAO': { dimension: 'Risco', icon: '⚠️', color: 'text-red-600', tip: 'Verifique CFOPs e CSTs das operações fiscais' },
  'AUDITORIA_FISCAL': { dimension: 'Risco', icon: '⚠️', color: 'text-red-600', tip: 'Faça revisão preventiva dos últimos 5 anos' },
  
  // Documentação - organização documental
  'IMPORTAR_XMLS': { dimension: 'Documentação', icon: '📁', color: 'text-purple-600', tip: 'Importe XMLs dos últimos 12 meses' },
  'PREENCHER_DRE': { dimension: 'Documentação', icon: '📁', color: 'text-purple-600', tip: 'Complete seu DRE para análise financeira' },
  'COMPLETAR_PERFIL': { dimension: 'Documentação', icon: '📁', color: 'text-purple-600', tip: 'Preencha dados da empresa para matching preciso' },
  
  // Gestão - controles internos
  'IMPLEMENTAR_CONTROLES': { dimension: 'Gestão', icon: '📊', color: 'text-orange-600', tip: 'Adote rotinas de conferência fiscal mensal' },
  'TREINAR_EQUIPE': { dimension: 'Gestão', icon: '📊', color: 'text-orange-600', tip: 'Capacite equipe sobre nova legislação' },
  'PREPARAR_REFORMA': { dimension: 'Gestão', icon: '📊', color: 'text-orange-600', tip: 'Inicie adequação aos novos tributos CBS/IBS' },
};

function getDimensionInfo(actionCode: string) {
  return dimensionConfig[actionCode] || { 
    dimension: 'Geral', 
    icon: '🎯', 
    color: 'text-muted-foreground',
    tip: 'Ação para melhorar seu score geral'
  };
}

export function ScoreResults({ 
  financialImpact, 
  actions, 
  onRecalculate,
  isLoading 
}: ScoreResultsProps) {
  return (
    <div className="space-y-6">
      {/* Impacto Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Impacto Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Economia Potencial */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Economia Potencial</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(financialImpact.economiaPotencial)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">ao ano</p>
              {financialImpact.economiaPotencial > 0 && (
                <Link to="/calculadora/comparativo-regimes">
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-green-600">
                    Ver como economizar
                  </Button>
                </Link>
              )}
            </div>

            {/* Créditos Perdidos */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Créditos Perdidos</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(financialImpact.creditosNaoAproveitados)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">a recuperar</p>
              {financialImpact.creditosNaoAproveitados > 0 && (
                <Link to="/dashboard/radar-creditos">
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-yellow-600">
                    Recuperar créditos
                  </Button>
                </Link>
              )}
            </div>

            {/* Risco de Autuação */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">Risco Autuação</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(financialImpact.riscoAutuacao)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">exposição estimada</p>
              {financialImpact.riscoAutuacao > 0 && (
                <Link to="/consultorias">
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-red-600">
                    Mitigar riscos
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Ações para Melhorar seu Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actions.slice(0, 5).map((action, index) => {
                const priorityInfo = priorityConfig[action.priority] || priorityConfig[3];
                const dimensionInfo = getDimensionInfo(action.action_code);
                
                return (
                  <div 
                    key={action.id || action.action_code}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base" title={dimensionInfo.dimension}>
                          {dimensionInfo.icon}
                        </span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {dimensionInfo.dimension}
                        </Badge>
                        <h4 className="font-medium">{action.action_title}</h4>
                        <Badge variant={priorityInfo.variant} className="text-xs">
                          {priorityInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {action.action_description}
                      </p>
                      <p className="text-xs text-primary/80 italic">
                        💡 {dimensionInfo.tip}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-medium text-primary">
                          +{action.points_gain} pontos
                        </span>
                        {action.economia_estimada > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Economia: {formatCurrency(action.economia_estimada)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={action.link_to}>
                      <Button size="sm" variant="outline">
                        Fazer agora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Baixar Relatório PDF
        </Button>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Enviar para Contador
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={onRecalculate}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Recalcular Score
        </Button>
        <Link to="/historico">
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Ver Histórico
          </Button>
        </Link>
      </div>

      {/* Professional Disclaimer */}
      <TaxDisclaimer />
    </div>
  );
}
