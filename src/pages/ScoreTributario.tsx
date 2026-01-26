import { useState, useEffect, useCallback } from "react";
import { Building2, Scale, Upload, BarChart3, Shield, FileCheck, Clock, Settings, HelpCircle, Info } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { ScoreCard } from "@/components/score/ScoreCard";
import { ScoreResults } from "@/components/score/ScoreResults";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FeatureGateLimit } from "@/components/FeatureGate";
import { usePlanAccess } from "@/hooks/useFeatureAccess";

interface TaxScoreData {
  id: string;
  score_total: number;
  score_grade: string;
  score_status: string;
  score_conformidade: number;
  score_eficiencia: number;
  score_risco: number;
  score_documentacao: number;
  score_gestao: number;
  resp_situacao_fiscal?: string;
  resp_certidoes?: string;
  resp_obrigacoes?: string;
  resp_controles?: string;
  auto_regime_tributario?: string;
  auto_xmls_importados: number;
  auto_xmls_periodo_inicio?: string;
  auto_xmls_periodo_fim?: string;
  auto_dre_preenchido: boolean;
  auto_creditos_identificados: number;
  economia_potencial: number;
  risco_autuacao: number;
  creditos_nao_aproveitados: number;
  cards_completos: number;
  cards_total: number;
}

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

export default function ScoreTributario() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isNavigator } = usePlanAccess();
  const [scoreData, setScoreData] = useState<TaxScoreData | null>(null);
  const [actions, setActions] = useState<ScoreAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const fetchScoreData = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar score atual
      const { data: score, error: scoreError } = await supabase
        .from('tax_score')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (scoreError) throw scoreError;
      
      if (score) {
        setScoreData(score as TaxScoreData);
      }

      // Buscar ações recomendadas
      const { data: actionsData, error: actionsError } = await supabase
        .from('score_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (actionsError) throw actionsError;
      setActions((actionsData || []) as ScoreAction[]);

    } catch (error) {
      console.error('Error fetching score data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScoreData();
  }, [fetchScoreData]);

  const calculateScore = async () => {
    if (!user) return;

    setCalculating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('calculate-tax-score', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Score calculado!",
        description: `Seu score é ${response.data.score} (${response.data.grade})`,
      });

      await fetchScoreData();
    } catch (error) {
      console.error('Error calculating score:', error);
      toast({
        title: "Erro ao calcular",
        description: "Não foi possível calcular seu score. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const updateManualAnswer = async (field: string, value: string) => {
    if (!user) return;

    try {
      // Verificar se já existe um registro
      const { data: existing } = await supabase
        .from('tax_score')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Atualizar
        await supabase
          .from('tax_score')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Criar novo
        await supabase
          .from('tax_score')
          .insert({ user_id: user.id, [field]: value });
      }

      toast({
        title: "Resposta salva!",
        description: "Recalcule o score para ver o impacto.",
      });

      // Recalcular automaticamente
      await calculateScore();
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar sua resposta.",
        variant: "destructive",
      });
    }
  };

  const progressPercent = scoreData 
    ? (scoreData.cards_completos / scoreData.cards_total) * 100 
    : 0;

  // Formatar período dos XMLs
  const getXmlPeriodo = () => {
    if (!scoreData?.auto_xmls_periodo_inicio || !scoreData?.auto_xmls_periodo_fim) {
      return undefined;
    }
    const inicio = new Date(scoreData.auto_xmls_periodo_inicio).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const fim = new Date(scoreData.auto_xmls_periodo_fim).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    return `${inicio} - ${fim}`;
  };

  // Usuários FREE que já têm score calculado atingiram o limite de 1
  const hasUsedFreeLimit = !isNavigator && scoreData && scoreData.score_total > 0;

  if (loading) {
    return (
      <DashboardLayout title="Score Tributário">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Score Tributário">
      <FeatureGateLimit feature="score_tributario" usageCount={hasUsedFreeLimit ? 1 : 0}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Score Tributário</h1>
            <p className="text-muted-foreground">
              Avalie a saúde fiscal da sua empresa em 5 dimensões
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Como funciona?
          </Button>
        </div>

        {/* Card Principal do Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Gauge */}
              <div className="flex-shrink-0">
                <ScoreGauge
                  score={scoreData?.score_total || 0}
                  grade={scoreData?.score_grade || 'E'}
                  status={scoreData?.score_status || 'pending'}
                  size="lg"
                />
              </div>

              {/* Progresso e Dimensões */}
              <div className="flex-1 w-full space-y-6">
                {/* Barra de Progresso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Diagnóstico completo</span>
                    <span className="text-sm text-muted-foreground">
                      {scoreData?.cards_completos || 0} de {scoreData?.cards_total || 8} itens
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  {progressPercent < 100 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete os itens abaixo para um diagnóstico mais preciso
                    </p>
                  )}
                </div>

                {/* Dimensões */}
                {scoreData && scoreData.score_total > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Conformidade', value: scoreData.score_conformidade, color: 'bg-blue-500' },
                      { label: 'Eficiência', value: scoreData.score_eficiencia, color: 'bg-green-500' },
                      { label: 'Risco', value: scoreData.score_risco, color: 'bg-red-500' },
                      { label: 'Documentação', value: scoreData.score_documentacao, color: 'bg-purple-500' },
                      { label: 'Gestão', value: scoreData.score_gestao, color: 'bg-orange-500' },
                    ].map((dim) => (
                      <div key={dim.label} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{dim.label}</div>
                        <div className="text-lg font-bold">{dim.value}</div>
                        <div className="h-1 rounded-full bg-muted mt-1">
                          <div 
                            className={`h-full rounded-full ${dim.color}`} 
                            style={{ width: `${dim.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão de Calcular */}
                {(!scoreData || scoreData.score_total === 0) && (
                  <Button 
                    onClick={calculateScore} 
                    disabled={calculating}
                    className="w-full sm:w-auto"
                  >
                    {calculating ? 'Calculando...' : 'Calcular meu Score'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta inicial */}
        {!scoreData && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Responda as perguntas abaixo e clique em "Calcular meu Score" para obter seu diagnóstico fiscal completo.
            </AlertDescription>
          </Alert>
        )}

        {/* Grid de Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Diagnóstico Fiscal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Dados da Empresa (Automático) */}
            <ScoreCard
              title="Dados da Empresa"
              icon={Building2}
              status={profile?.empresa || profile?.cnae ? 'complete' : 'incomplete'}
              helpText="Informações do cadastro da sua empresa"
              autoData={{
                value: profile?.empresa || 'Não informado',
                subtitle: profile?.cnae ? `CNAE: ${profile.cnae}` : profile?.setor || undefined,
                linkText: 'Editar cadastro',
                linkTo: '/perfil',
              }}
            />

            {/* Card 2: Regime Tributário (Automático) */}
            <ScoreCard
              title="Regime Tributário"
              icon={Scale}
              status={profile?.regime ? 'complete' : 'incomplete'}
              helpText="O regime tributário impacta diretamente sua carga de impostos"
              autoData={profile?.regime ? {
                value: profile.regime === 'SIMPLES' ? 'Simples Nacional' 
                     : profile.regime === 'PRESUMIDO' ? 'Lucro Presumido'
                     : profile.regime === 'REAL' ? 'Lucro Real'
                     : profile.regime,
                linkText: 'Verificar melhor regime',
                linkTo: '/calculadora/comparativo-regimes',
              } : {
                value: 'Não informado',
                linkText: 'Informar regime',
                linkTo: '/perfil',
              }}
            />

            {/* Card 3: XMLs Importados (Automático) */}
            <ScoreCard
              title="XMLs Importados"
              icon={Upload}
              status={
                (scoreData?.auto_xmls_importados || 0) > 100 ? 'complete'
                : (scoreData?.auto_xmls_importados || 0) > 0 ? 'warning'
                : 'incomplete'
              }
              helpText="Notas fiscais importadas para análise de créditos"
              autoData={{
                value: `${scoreData?.auto_xmls_importados || 0} notas`,
                subtitle: getXmlPeriodo(),
                linkText: 'Importar mais',
                linkTo: '/dashboard/importar-xml',
              }}
            />

            {/* Card 4: DRE Preenchido (Automático) */}
            <ScoreCard
              title="DRE Inteligente"
              icon={BarChart3}
              status={scoreData?.auto_dre_preenchido ? 'complete' : 'incomplete'}
              helpText="O DRE permite análise de margens e carga tributária"
              autoData={{
                value: scoreData?.auto_dre_preenchido ? 'Preenchido' : 'Não preenchido',
                subtitle: scoreData?.auto_dre_preenchido ? 'Análise disponível' : undefined,
                linkText: scoreData?.auto_dre_preenchido ? 'Ver DRE' : 'Preencher DRE',
                linkTo: '/dashboard/dre',
              }}
            />

            {/* Card 5: Situação Fiscal (Manual) */}
            <ScoreCard
              title="Situação Fiscal"
              icon={Shield}
              status={
                !scoreData?.resp_situacao_fiscal ? 'incomplete'
                : scoreData.resp_situacao_fiscal === 'sem_pendencias' ? 'complete'
                : scoreData.resp_situacao_fiscal === 'nao_sei' ? 'warning'
                : 'warning'
              }
              helpText="Pendências com a Receita Federal ou Estadual"
              question={{
                text: 'Sua empresa tem alguma pendência com a Receita Federal ou Estadual?',
                options: [
                  { value: 'sem_pendencias', label: 'Não, está tudo ok' },
                  { value: 'com_pendencias', label: 'Sim, tenho algumas pendências' },
                  { value: 'notificacao', label: 'Sim, recebi notificação ou multa' },
                  { value: 'nao_sei', label: 'Não sei' },
                ],
                currentValue: scoreData?.resp_situacao_fiscal,
                onAnswer: (value) => updateManualAnswer('resp_situacao_fiscal', value),
                hint: 'Se você emite notas normalmente e não recebeu carta da Receita, provavelmente está ok',
              }}
            />

            {/* Card 6: Certidões (Manual) */}
            <ScoreCard
              title="Certidões Negativas"
              icon={FileCheck}
              status={
                !scoreData?.resp_certidoes ? 'incomplete'
                : scoreData.resp_certidoes === 'sim' ? 'complete'
                : scoreData.resp_certidoes === 'nao_sei' ? 'warning'
                : 'warning'
              }
              helpText="Documento que bancos pedem para conceder crédito"
              question={{
                text: 'Você consegue emitir Certidão Negativa de Débitos (CND)?',
                options: [
                  { value: 'sim', label: 'Sim, consigo emitir' },
                  { value: 'parcelado', label: 'Consigo, mas mostra débitos parcelados' },
                  { value: 'nao', label: 'Não consigo, tenho débitos' },
                  { value: 'nao_sei', label: 'Nunca tentei / Não sei' },
                ],
                currentValue: scoreData?.resp_certidoes,
                onAnswer: (value) => updateManualAnswer('resp_certidoes', value),
                hint: 'Acesse o e-CAC da Receita Federal para consultar',
              }}
            />

            {/* Card 7: Obrigações (Manual) */}
            <ScoreCard
              title="Obrigações Acessórias"
              icon={Clock}
              status={
                !scoreData?.resp_obrigacoes ? 'incomplete'
                : scoreData.resp_obrigacoes === 'em_dia' ? 'complete'
                : scoreData.resp_obrigacoes === 'nao_sei' ? 'warning'
                : 'warning'
              }
              helpText="SPED, DCTF, EFD e outras declarações obrigatórias"
              question={{
                text: 'As declarações da empresa são entregues no prazo?',
                options: [
                  { value: 'em_dia', label: 'Sempre no prazo' },
                  { value: 'algumas_atrasadas', label: 'Às vezes atrasa' },
                  { value: 'frequente_atraso', label: 'Frequentemente atrasa' },
                  { value: 'nao_sei', label: 'Meu contador cuida, não sei' },
                ],
                currentValue: scoreData?.resp_obrigacoes,
                onAnswer: (value) => updateManualAnswer('resp_obrigacoes', value),
                hint: 'Pergunte ao contador: "Estamos em dia com obrigações acessórias?"',
              }}
            />

            {/* Card 8: Controles (Manual) */}
            <ScoreCard
              title="Controle de Prazos"
              icon={Settings}
              status={
                !scoreData?.resp_controles ? 'incomplete'
                : scoreData.resp_controles === 'sistema' ? 'complete'
                : scoreData.resp_controles === 'sem_controle' ? 'warning'
                : 'complete'
              }
              helpText="Como você gerencia os prazos dos impostos"
              question={{
                text: 'Como você controla os prazos dos impostos?',
                options: [
                  { value: 'sistema', label: 'Sistema ou calendário automático' },
                  { value: 'contador', label: 'Meu contador me avisa' },
                  { value: 'manual', label: 'Planilha ou lembrete manual' },
                  { value: 'sem_controle', label: 'Não tenho controle específico' },
                ],
                currentValue: scoreData?.resp_controles,
                onAnswer: (value) => updateManualAnswer('resp_controles', value),
              }}
            />
          </div>
        </div>

        {/* Seção de Resultados */}
        {scoreData && scoreData.cards_completos >= 4 && (
          <ScoreResults
            financialImpact={{
              economiaPotencial: scoreData.economia_potencial || 0,
              riscoAutuacao: scoreData.risco_autuacao || 0,
              creditosNaoAproveitados: scoreData.creditos_nao_aproveitados || 0,
            }}
            actions={actions}
            onRecalculate={calculateScore}
            isLoading={calculating}
          />
        )}
      </div>
      </FeatureGateLimit>
    </DashboardLayout>
  );
}
