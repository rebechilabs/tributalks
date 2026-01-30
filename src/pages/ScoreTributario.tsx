import { useState, useEffect, useCallback } from "react";
import { Building2, Scale, Shield, FileCheck, Clock, Settings, Info, DollarSign, Bell, CreditCard, Target, FileSearch, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { HelpButton } from "@/components/common/HelpButton";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScoreGauge } from "@/components/score/ScoreGauge";
import { ScoreCard } from "@/components/score/ScoreCard";
import { ScoreResults } from "@/components/score/ScoreResults";
import { ScorePdfReport } from "@/components/score/ScorePdfReport";
import { ScoreHistoryChart } from "@/components/score/ScoreHistoryChart";
import { ScoreBenchmarkCard } from "@/components/score/ScoreBenchmarkCard";
import { Card, CardContent } from "@/components/ui/card";
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
  // Perguntas estratégicas
  resp_faturamento_faixa?: string;
  resp_recebeu_notificacao?: boolean;
  resp_debitos_abertos?: string;
  resp_conhece_receita_sintonia?: boolean;
  resp_nota_receita_sintonia?: string;
  resp_documentacao_pronta?: boolean;
  resp_tempo_reunir_docs?: string;
  resp_surpresas_tributarias?: boolean;
  resp_preparando_reforma?: boolean;
  resp_conhece_carga_tributaria?: boolean;
  // Perguntas originais mantidas
  resp_situacao_fiscal?: string;
  resp_certidoes?: string;
  resp_obrigacoes?: string;
  resp_controles?: string;
  // Campos calculados
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
  const [showPdfReport, setShowPdfReport] = useState(false);

  const fetchScoreData = useCallback(async () => {
    if (!user) return;

    try {
      const { data: score, error: scoreError } = await supabase
        .from('tax_score')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (scoreError) throw scoreError;
      
      if (score) {
        setScoreData(score as unknown as TaxScoreData);
      }

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

  const handleDownloadPdf = () => {
    if (!scoreData) {
      toast({
        title: "Sem dados",
        description: "Complete o diagnóstico antes de baixar o relatório.",
        variant: "destructive",
      });
      return;
    }
    setShowPdfReport(true);
  };

  const updateManualAnswer = async (field: string, value: string | boolean) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('tax_score')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('tax_score')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('tax_score')
          .insert({ user_id: user.id, [field]: value });
      }

      toast({
        title: "Resposta salva!",
        description: "Recalcule o score para ver o impacto.",
      });

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

  // Calcular cards completos com base nas novas perguntas
  const calculateCardsComplete = () => {
    if (!scoreData) return 0;
    let count = 0;
    if (scoreData.resp_faturamento_faixa) count++;
    if (scoreData.resp_recebeu_notificacao !== undefined) count++;
    if (scoreData.resp_debitos_abertos) count++;
    if (scoreData.resp_obrigacoes) count++;
    if (scoreData.resp_conhece_receita_sintonia !== undefined) count++;
    if (scoreData.resp_documentacao_pronta !== undefined) count++;
    if (scoreData.resp_surpresas_tributarias !== undefined) count++;
    if (scoreData.resp_preparando_reforma !== undefined) count++;
    if (scoreData.resp_conhece_carga_tributaria !== undefined) count++;
    if (scoreData.resp_certidoes) count++;
    if (scoreData.resp_controles) count++;
    return count;
  };

  const TOTAL_CARDS = 11;
  const cardsCompletos = calculateCardsComplete();
  const progressPercent = (cardsCompletos / TOTAL_CARDS) * 100;

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
              Diagnóstico completo da saúde fiscal da sua empresa
            </p>
          </div>
          <HelpButton toolSlug="score-tributario" size="default" className="gap-2" />
        </div>

        {/* Card Principal do Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <ScoreGauge
                  score={scoreData?.score_total || 0}
                  grade={scoreData?.score_grade || 'E'}
                  status={scoreData?.score_status || 'pending'}
                  size="lg"
                />
              </div>

              <div className="flex-1 w-full space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Diagnóstico completo</span>
                    <span className="text-sm text-muted-foreground">
                      {cardsCompletos} de {TOTAL_CARDS} perguntas
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  {progressPercent < 100 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Responda todas as perguntas para um diagnóstico preciso
                    </p>
                  )}
                </div>

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

                {(!scoreData || scoreData.score_total === 0) && (
                  <Button 
                    onClick={calculateScore} 
                    disabled={calculating || cardsCompletos < 4}
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
              Responda as perguntas estratégicas abaixo. Elas ajudam a identificar riscos ocultos e oportunidades de economia.
            </AlertDescription>
          </Alert>
        )}

        {/* SEÇÃO 1: CONTEXTO - Identificar se faz sentido */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Contexto Inicial
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Entender o tamanho e situação da empresa</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* P1: Faturamento */}
            <ScoreCard
              title="Faturamento Anual"
              icon={DollarSign}
              status={scoreData?.resp_faturamento_faixa ? 'complete' : 'incomplete'}
              helpText="Empresas acima de R$1M/ano têm mais oportunidades de otimização"
              question={{
                text: 'Qual o faturamento anual da sua empresa?',
                options: [
                  { value: 'ate_1m', label: 'Até R$ 1 milhão/ano' },
                  { value: '1m_10m', label: 'Entre R$ 1 e 10 milhões/ano' },
                  { value: 'acima_10m', label: 'Acima de R$ 10 milhões/ano' },
                ],
                currentValue: scoreData?.resp_faturamento_faixa,
                onAnswer: (value) => updateManualAnswer('resp_faturamento_faixa', value),
                hint: 'Empresas > R$10M já estão no radar pesado da Receita',
              }}
            />

            {/* P2: Notificação da Receita */}
            <ScoreCard
              title="Notificações da Receita"
              icon={Bell}
              status={
                scoreData?.resp_recebeu_notificacao === undefined ? 'incomplete'
                : scoreData.resp_recebeu_notificacao ? 'warning'
                : 'complete'
              }
              helpText="Receber notificação indica que você já está sendo monitorado"
              question={{
                text: 'Recebeu alguma notificação da Receita nos últimos 2 anos?',
                options: [
                  { value: 'nao', label: 'Não, nenhuma notificação' },
                  { value: 'sim', label: 'Sim, recebi notificação' },
                ],
                currentValue: scoreData?.resp_recebeu_notificacao === undefined 
                  ? undefined 
                  : scoreData.resp_recebeu_notificacao ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_recebeu_notificacao', value === 'sim'),
                hint: 'Se SIM, o Score é urgente - você já está sendo monitorado',
              }}
            />
          </div>
        </div>

        {/* SEÇÃO 2: QUALIFICAÇÃO - Identificar riscos ocultos */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Qualificação de Riscos
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Identificar riscos ocultos na sua operação</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* P3: Débitos em aberto */}
            <ScoreCard
              title="Débitos em Aberto"
              icon={CreditCard}
              status={
                !scoreData?.resp_debitos_abertos ? 'incomplete'
                : scoreData.resp_debitos_abertos === 'nenhum' ? 'complete'
                : 'warning'
              }
              helpText="Débitos = nota baixa automática no Receita Sintonia"
              question={{
                text: 'Sua empresa tem débitos em aberto com a Receita? Mesmo que parcelados?',
                options: [
                  { value: 'nenhum', label: 'Não, nenhum débito' },
                  { value: 'parcelado', label: 'Sim, mas está parcelado' },
                  { value: 'em_aberto', label: 'Sim, tenho débitos em aberto' },
                  { value: 'nao_sei', label: 'Não sei / Preciso verificar' },
                ],
                currentValue: scoreData?.resp_debitos_abertos,
                onAnswer: (value) => updateManualAnswer('resp_debitos_abertos', value),
              }}
            />

            {/* P4: Obrigações Acessórias */}
            <ScoreCard
              title="Obrigações Acessórias"
              icon={FileCheck}
              status={
                !scoreData?.resp_obrigacoes ? 'incomplete'
                : scoreData.resp_obrigacoes === 'em_dia' ? 'complete'
                : scoreData.resp_obrigacoes === 'nao_sei' ? 'warning'
                : 'warning'
              }
              helpText="SPED Fiscal, DCTFWeb, eSocial, EFD-Reinf"
              question={{
                text: 'Você tem certeza de que todas as obrigações acessórias estão em dia?',
                options: [
                  { value: 'em_dia', label: 'Sim, tenho certeza' },
                  { value: 'algumas_atrasadas', label: 'Não tenho certeza / Às vezes atrasa' },
                  { value: 'nao_sei', label: 'Meu contador cuida, não sei' },
                ],
                currentValue: scoreData?.resp_obrigacoes,
                onAnswer: (value) => updateManualAnswer('resp_obrigacoes', value),
                hint: 'Pergunte ao contador: "Estamos em dia com SPED, DCTF, eSocial?"',
              }}
            />

            {/* P5: Conhece Receita Sintonia */}
            <ScoreCard
              title="Receita Sintonia"
              icon={Target}
              status={
                scoreData?.resp_conhece_receita_sintonia === undefined ? 'incomplete'
                : scoreData.resp_conhece_receita_sintonia ? 'complete'
                : 'warning'
              }
              helpText="Sistema de classificação A+ a D da Receita Federal"
              infoTooltip={{
                title: "O que é o Receita Sintonia?",
                content: "O Receita Sintonia é um programa de estímulo à conformidade tributária e aduaneira da Receita Federal. Ele classifica contribuintes de A+ (melhor) a D (pior) com base em critérios de regularidade. Quem se classifica bem recebe benefícios e tratamento diferenciado, como prioridade na restituição do IR, redução de garantias em parcelamentos e canal exclusivo de atendimento."
              }}
              question={{
                text: 'Você sabe qual é sua nota no Receita Sintonia (A+ a D)?',
                options: [
                  { value: 'sim', label: 'Sim, sei minha nota' },
                  { value: 'nao', label: 'Não sei o que é isso' },
                ],
                currentValue: scoreData?.resp_conhece_receita_sintonia === undefined 
                  ? undefined 
                  : scoreData.resp_conhece_receita_sintonia ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_conhece_receita_sintonia', value === 'sim'),
                hint: '99% dos empresários não conhece sua nota',
              }}
            />

            {/* P6: Certidões */}
            <ScoreCard
              title="Certidões Negativas"
              icon={FileCheck}
              status={
                !scoreData?.resp_certidoes ? 'incomplete'
                : scoreData.resp_certidoes === 'sim' ? 'complete'
                : 'warning'
              }
              helpText="Documento que bancos pedem para conceder crédito"
              question={{
                text: 'Você consegue emitir Certidão Negativa de Débitos (CND)?',
                options: [
                  { value: 'sim', label: 'Sim, consigo emitir' },
                  { value: 'parcelado', label: 'Consigo, mas mostra parcelamentos' },
                  { value: 'nao', label: 'Não consigo, tenho débitos' },
                  { value: 'nao_sei', label: 'Nunca tentei / Não sei' },
                ],
                currentValue: scoreData?.resp_certidoes,
                onAnswer: (value) => updateManualAnswer('resp_certidoes', value),
              }}
            />
          </div>
        </div>

        {/* SEÇÃO 3: DOR - Criar urgência */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Exposição a Riscos
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Avaliar sua vulnerabilidade fiscal</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* P7: Documentação pronta */}
            <ScoreCard
              title="Prontidão Documental"
              icon={FileSearch}
              status={
                scoreData?.resp_documentacao_pronta === undefined ? 'incomplete'
                : scoreData.resp_documentacao_pronta ? 'complete'
                : 'warning'
              }
              helpText="Se a Receita pedir documentos, você consegue responder em 48h?"
              question={{
                text: 'Se receber uma intimação hoje, consegue reunir toda documentação em 48h?',
                options: [
                  { value: 'sim', label: 'Sim, está tudo organizado' },
                  { value: 'nao', label: 'Não, levaria mais tempo' },
                ],
                currentValue: scoreData?.resp_documentacao_pronta === undefined 
                  ? undefined 
                  : scoreData.resp_documentacao_pronta ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_documentacao_pronta', value === 'sim'),
                hint: 'Expõe despreparo - Score funciona como um seguro',
              }}
            />

            {/* P8: Surpresas tributárias */}
            <ScoreCard
              title="Surpresas Tributárias"
              icon={AlertTriangle}
              status={
                scoreData?.resp_surpresas_tributarias === undefined ? 'incomplete'
                : scoreData.resp_surpresas_tributarias ? 'warning'
                : 'complete'
              }
              helpText="Multas inesperadas ou créditos que deixou de aproveitar"
              question={{
                text: 'Já teve surpresas desagradáveis? Multas inesperadas ou créditos perdidos?',
                options: [
                  { value: 'sim', label: 'Sim, já tive surpresas' },
                  { value: 'nao', label: 'Não, nunca tive problemas' },
                ],
                currentValue: scoreData?.resp_surpresas_tributarias === undefined 
                  ? undefined 
                  : scoreData.resp_surpresas_tributarias ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_surpresas_tributarias', value === 'sim'),
                hint: 'Se SIM, Score evita repetição. Se NÃO, garante que continue assim',
              }}
            />

            {/* P9: Controle de Prazos */}
            <ScoreCard
              title="Controle de Prazos"
              icon={Clock}
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

        {/* SEÇÃO 4: POSICIONAMENTO - Mostrar que você entende o jogo */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-green-500" />
            Visão Estratégica
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Sua preparação para o futuro tributário</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* P10: Preparação Reforma */}
            <ScoreCard
              title="Reforma Tributária"
              icon={TrendingUp}
              status={
                scoreData?.resp_preparando_reforma === undefined ? 'incomplete'
                : scoreData.resp_preparando_reforma ? 'complete'
                : 'warning'
              }
              helpText="Empresas que esperam 'ver como vai ser' perdem vantagem competitiva"
              question={{
                text: 'Sua empresa está se preparando para a Reforma Tributária?',
                options: [
                  { value: 'sim', label: 'Sim, já estou me preparando' },
                  { value: 'nao', label: 'Ainda estou esperando pra ver' },
                ],
                currentValue: scoreData?.resp_preparando_reforma === undefined 
                  ? undefined 
                  : scoreData.resp_preparando_reforma ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_preparando_reforma', value === 'sim'),
                hint: 'Score mapeia o impacto da Reforma no SEU negócio',
              }}
            />

            {/* P11: Conhece carga tributária */}
            <ScoreCard
              title="Carga Tributária"
              icon={Scale}
              status={
                scoreData?.resp_conhece_carga_tributaria === undefined ? 'incomplete'
                : scoreData.resp_conhece_carga_tributaria ? 'complete'
                : 'warning'
              }
              helpText="Saber quanto paga de tributo é o primeiro passo para otimizar"
              question={{
                text: 'Você sabe quanto do seu faturamento vai para tributos? E quanto poderia otimizar?',
                options: [
                  { value: 'sim', label: 'Sim, conheço minha carga tributária' },
                  { value: 'nao', label: 'Não sei exatamente' },
                ],
                currentValue: scoreData?.resp_conhece_carga_tributaria === undefined 
                  ? undefined 
                  : scoreData.resp_conhece_carga_tributaria ? 'sim' : 'nao',
                onAnswer: (value) => updateManualAnswer('resp_conhece_carga_tributaria', value === 'sim'),
                hint: 'Score revela exatamente isso',
              }}
            />
          </div>
        </div>

        {/* Benchmark e Histórico de Evolução */}
        {scoreData && scoreData.score_total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreBenchmarkCard />
            <ScoreHistoryChart currentScore={scoreData.score_total} />
          </div>
        )}

        {/* Seção de Resultados - Botões de ação */}
        {scoreData && scoreData.score_total > 0 && (
          <ScoreResults
            onRecalculate={calculateScore}
            onDownloadPdf={handleDownloadPdf}
            isLoading={calculating}
          />
        )}

        {/* PDF Report Modal */}
        {scoreData && (
          <ScorePdfReport
            scoreData={scoreData}
            actions={actions}
            open={showPdfReport}
            onClose={() => setShowPdfReport(false)}
          />
        )}
      </div>
      </FeatureGateLimit>
    </DashboardLayout>
  );
}
