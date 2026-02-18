import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Target,
  Sparkles,
  Clock,
  DollarSign,
  Check,
  Info,
  Lightbulb,
  User,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SETOR_OPTIONS,
  FATURAMENTO_OPTIONS,
  PRODUTOS_ESPECIFICOS,
  REGIME_OPTIONS,
  FOLHA_OPTIONS,
  WIZARD_STEPS,
  INITIAL_PROFILE_DATA,
  SECTOR_CHARACTERISTICS,
  type ProfileFormData
} from "@/components/opportunities/ProfileWizardSteps";

export default function PerfilEmpresa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_PROFILE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);

  // Multi-company filter helper
  const getProfileFilter = () => {
    if (currentCompany?.id) {
      return { column: "id" as const, value: currentCompany.id };
    }
    return { column: "user_id" as const, value: user!.id };
  };

  // Load existing profile — reloads when company changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const filter = getProfileFilter();
        const { data, error } = await supabase
          .from('company_profile')
          .select('*')
          .eq(filter.column, filter.value)
          .maybeSingle();

        if (data && !error) {
          setExistingProfile(true);
          setFormData({
            ...INITIAL_PROFILE_DATA,
            setor: data.setor || '',
            porte: data.porte || '',
            faturamento_anual: data.faturamento_anual || 0,
            vende_produtos: data.vende_produtos || false,
            vende_servicos: data.vende_servicos || false,
            vende_combustiveis: data.vende_combustiveis || false,
            vende_bebidas: data.vende_bebidas || false,
            vende_farmacos: data.vende_farmacos || false,
            vende_cosmeticos: data.vende_cosmeticos || false,
            vende_autopecas: data.vende_autopecas || false,
            vende_pneus: data.vende_pneus || false,
            vende_eletronicos: data.vende_eletronicos || false,
            vende_automoveis: data.vende_automoveis || false,
            tem_produtos_monofasicos: data.tem_produtos_monofasicos || false,
            tem_atividades_mistas: data.tem_atividades_mistas || false,
            vende_pf: data.vende_pf || false,
            vende_pj: data.vende_pj || false,
            percentual_pf: data.percentual_pf || 50,
            percentual_pj: data.percentual_pj || 50,
            vende_governo: data.vende_governo || false,
            opera_outros_estados: data.opera_outros_estados || false,
            exporta_produtos: data.exporta_produtos || false,
            exporta_servicos: data.exporta_servicos || false,
            qtd_cnpjs: data.qtd_cnpjs || 1,
            tem_holding: data.tem_holding || false,
            tem_filiais: data.tem_filiais || false,
            regime_tributario: data.regime_tributario || '',
            tem_atividade_pd: data.tem_atividade_pd || false,
            tem_patentes: data.tem_patentes || false,
            zona_franca: data.zona_franca || false,
            folha_percentual_faturamento: data.folha_percentual_faturamento || 0,
            // E-commerce
            tem_ecommerce: data.tem_ecommerce || false,
            tem_marketplace: data.tem_marketplace || false,
            centro_distribuicao_incentivado: data.centro_distribuicao_incentivado || false,
            centro_distribuicao_zfm: data.centro_distribuicao_zfm || false,
            // Agro
            tem_area_preservacao: data.tem_area_preservacao || false,
            comercializa_commodities: data.comercializa_commodities || false,
            compra_insumos: data.compra_insumos_agricolas || false,
            investe_maquinas: data.investe_maquinas_agricolas || false,
            tipo_cooperativa: data.tipo_cooperativa || false,
            // Energia
            tem_geracao_solar: data.tem_geracao_solar || false,
            compra_equipamento_solar: data.compra_equipamento_solar || false,
            importa_equipamento_solar: data.importa_equipamento_solar || false,
            projeto_infraestrutura: data.projeto_infraestrutura_energia || false,
            // Saúde
            tem_internacao_ou_procedimento_complexo: data.procedimentos_complexos || data.tem_internacao || false,
            comercializa_medicamentos: data.comercializa_medicamentos || false,
            compra_equipamentos_medicos: data.compra_equipamentos_medicos || false,
            investe_pd_saude: data.investe_pd_saude || false,
            // Construção
            incorporacao_imobiliaria: data.incorporacao_imobiliaria || false,
            programa_mcmv: data.programa_mcmv || false,
            folha_alta_construcao: data.folha_alta_construcao || false,
            // Transporte
            transporte_cargas: data.transporte_cargas || false,
            transporte_passageiros: data.transporte_passageiros || false,
            operacao_interestadual: data.operacao_interestadual || false,
            investe_frota: data.investe_frota || false,
            frete_exportacao: data.frete_exportacao || false,
            // Alimentação
            prepara_alimentos: data.prepara_alimentos || false,
            recebe_gorjetas: data.recebe_gorjetas || false,
            usa_plataformas_delivery: data.usa_plataformas_delivery || false,
            tem_bar: data.tem_bar || false,
            // Educação
            escola_regular: data.escola_regular || false,
            cursos_livres: data.cursos_livres || false,
            fins_lucrativos: data.fins_lucrativos !== null ? (data.fins_lucrativos ?? true) : true,
            investe_tecnologia_educacional: data.investe_tecnologia_educacional || false,
            // Artesanato (Produção)
            tem_carteira_artesao: data.tem_carteira_artesao || false,
            artesanato_regional: data.artesanato_regional || false,
            mei_artesao: data.mei_artesao || false,
            venda_direta_consumidor: data.venda_direta_consumidor || false,
            participa_feiras: data.participa_feiras || false,
            exporta_artesanato: data.exporta_artesanato || false,
            usa_insumos_naturais: data.usa_insumos_naturais || false,
            // Comércio de Artesanato
            compra_artesao_local: data.compra_artesao_local || false,
            compra_cooperativas: data.compra_cooperativas || false,
            revende_artesanato_regional: data.revende_artesanato_regional || false,
            loja_fisica_artesanato: data.loja_fisica_artesanato || false,
            vende_turistas: data.vende_turistas || false,
            exporta_revenda_artesanato: data.exporta_revenda_artesanato || false,
            participa_feiras_revenda: data.participa_feiras_revenda || false,
          });
          if (data.etapa_atual && data.etapa_atual > 1) {
            setCurrentStep(data.etapa_atual);
          }
        } else {
          // Reset form when switching to a company with no profile yet
          setExistingProfile(false);
          setFormData(INITIAL_PROFILE_DATA);
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, currentCompany?.id]);

  const updateFormData = (field: keyof ProfileFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProgress = async (step: number, complete = false) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const faturamentoMensal = formData.faturamento_anual ? formData.faturamento_anual / 12 : 0;
      const temMonofasicos = formData.vende_combustiveis || formData.vende_bebidas || 
        formData.vende_farmacos || formData.vende_cosmeticos || formData.vende_autopecas || 
        formData.vende_pneus;
      const temMistas = formData.vende_produtos && formData.vende_servicos;

      const profileData = {
        user_id: user.id,
        setor: formData.setor,
        porte: formData.porte,
        faturamento_anual: formData.faturamento_anual,
        faturamento_mensal_medio: faturamentoMensal,
        vende_produtos: formData.vende_produtos,
        vende_servicos: formData.vende_servicos,
        vende_combustiveis: formData.vende_combustiveis,
        vende_bebidas: formData.vende_bebidas,
        vende_farmacos: formData.vende_farmacos,
        vende_cosmeticos: formData.vende_cosmeticos,
        vende_autopecas: formData.vende_autopecas,
        vende_pneus: formData.vende_pneus,
        vende_eletronicos: formData.vende_eletronicos,
        tem_produtos_monofasicos: temMonofasicos,
        tem_atividades_mistas: temMistas,
        vende_pf: formData.vende_pf,
        vende_pj: formData.vende_pj,
        percentual_pf: formData.percentual_pf,
        percentual_pj: formData.percentual_pj,
        vende_governo: formData.vende_governo,
        opera_outros_estados: formData.opera_outros_estados,
        exporta_produtos: formData.exporta_produtos,
        exporta_servicos: formData.exporta_servicos,
        qtd_cnpjs: formData.qtd_cnpjs,
        tem_holding: formData.tem_holding,
        tem_filiais: formData.tem_filiais,
        regime_tributario: formData.regime_tributario === 'nao_sei' ? null : formData.regime_tributario,
        tem_atividade_pd: formData.tem_atividade_pd,
        tem_patentes: formData.tem_patentes,
        zona_franca: formData.zona_franca,
        folha_percentual_faturamento: formData.folha_percentual_faturamento,
        // E-commerce
        tem_ecommerce: formData.tem_ecommerce,
        tem_marketplace: formData.tem_marketplace,
        centro_distribuicao_incentivado: formData.centro_distribuicao_incentivado,
        centro_distribuicao_zfm: formData.centro_distribuicao_zfm,
        // Agro (map form names → DB column names)
        tem_area_preservacao: formData.tem_area_preservacao,
        comercializa_commodities: formData.comercializa_commodities,
        compra_insumos_agricolas: formData.compra_insumos,
        investe_maquinas_agricolas: formData.investe_maquinas,
        tipo_cooperativa: formData.tipo_cooperativa,
        // Energia
        tem_geracao_solar: formData.tem_geracao_solar,
        compra_equipamento_solar: formData.compra_equipamento_solar,
        importa_equipamento_solar: formData.importa_equipamento_solar,
        projeto_infraestrutura_energia: formData.projeto_infraestrutura,
        // Saúde
        procedimentos_complexos: formData.tem_internacao_ou_procedimento_complexo,
        tem_internacao: formData.tem_internacao_ou_procedimento_complexo,
        comercializa_medicamentos: formData.comercializa_medicamentos,
        compra_equipamentos_medicos: formData.compra_equipamentos_medicos,
        investe_pd_saude: formData.investe_pd_saude,
        // Construção
        incorporacao_imobiliaria: formData.incorporacao_imobiliaria,
        programa_mcmv: formData.programa_mcmv,
        folha_alta_construcao: formData.folha_alta_construcao,
        // Transporte
        transporte_cargas: formData.transporte_cargas,
        transporte_passageiros: formData.transporte_passageiros,
        operacao_interestadual: formData.operacao_interestadual,
        investe_frota: formData.investe_frota,
        frete_exportacao: formData.frete_exportacao,
        // Alimentação
        prepara_alimentos: formData.prepara_alimentos,
        recebe_gorjetas: formData.recebe_gorjetas,
        usa_plataformas_delivery: formData.usa_plataformas_delivery,
        tem_bar: formData.tem_bar,
        // Educação
        escola_regular: formData.escola_regular,
        cursos_livres: formData.cursos_livres,
        fins_lucrativos: formData.fins_lucrativos,
        investe_tecnologia_educacional: formData.investe_tecnologia_educacional,
        // Artesanato (Produção)
        tem_carteira_artesao: formData.tem_carteira_artesao,
        artesanato_regional: formData.artesanato_regional,
        mei_artesao: formData.mei_artesao,
        venda_direta_consumidor: formData.venda_direta_consumidor,
        participa_feiras: formData.participa_feiras,
        exporta_artesanato: formData.exporta_artesanato,
        usa_insumos_naturais: formData.usa_insumos_naturais,
        // Comércio de Artesanato
        compra_artesao_local: formData.compra_artesao_local,
        compra_cooperativas: formData.compra_cooperativas,
        revende_artesanato_regional: formData.revende_artesanato_regional,
        loja_fisica_artesanato: formData.loja_fisica_artesanato,
        vende_turistas: formData.vende_turistas,
        exporta_revenda_artesanato: formData.exporta_revenda_artesanato,
        participa_feiras_revenda: formData.participa_feiras_revenda,
        etapa_atual: step,
        perfil_completo: complete,
        updated_at: new Date().toISOString(),
      };

      if (existingProfile) {
        const filter = getProfileFilter();
        await supabase
          .from('company_profile')
          .update(profileData)
          .eq(filter.column, filter.value);
      } else {
        await supabase
          .from('company_profile')
          .insert(profileData);
        setExistingProfile(true);
      }

      if (complete) {
        const { data: matchResult, error: matchError } = await supabase.functions.invoke('match-opportunities', {
          body: { user_id: user.id }
        });

        if (matchError) {
          console.error('Match error:', matchError);
        }

        toast({
          title: "Perfil salvo com sucesso!",
          description: matchResult?.total_opportunities 
            ? `Encontramos ${matchResult.total_opportunities} oportunidades para você!`
            : "Vamos buscar oportunidades para você.",
        });

        navigate('/dashboard/planejar/oportunidades');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (currentStep > 0) {
        saveProgress(newStep);
      }
    } else {
      saveProgress(6, true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return true;
      case 1: return !!formData.setor;
      case 2: return !!formData.porte;
      case 3: return formData.vende_produtos || formData.vende_servicos;
      case 4: return formData.vende_pf || formData.vende_pj;
      case 5: return !!formData.regime_tributario;
      case 6: return true;
      default: return false;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Intro screen
  if (currentStep === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          {/* Banner da empresa selecionada — útil para grupos multi-CNPJ */}
          {currentCompany && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>
                Configurando perfil para:{" "}
                <span className="font-medium text-foreground">
                  {currentCompany.nome_fantasia || currentCompany.cnpj_principal || 'Empresa'}
                </span>
              </span>
            </div>
          )}

          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Descubra Quanto Sua Empresa Pode Economizar
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Responda algumas perguntas sobre seu negócio e vamos identificar 
                oportunidades de economia tributária específicas para você.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Tempo estimado</p>
                    <p className="text-muted-foreground text-sm">5 minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Análise IA</p>
                    <p className="text-muted-foreground text-sm">Personalizada</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Economia média</p>
                    <p className="text-muted-foreground text-sm">R$ 127.000/ano</p>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full gap-2"
                onClick={nextStep}
              >
                Começar Análise
                <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-primary" />
                Suas informações são confidenciais e usadas apenas para identificar oportunidades
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-6">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Etapa {currentStep} de {WIZARD_STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {WIZARD_STEPS[currentStep - 1]?.title}
            </span>
          </div>
          <Progress value={(currentStep / WIZARD_STEPS.length) * 100} className="h-2" />
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Setor */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Qual o principal negócio da sua empresa?</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SETOR_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateFormData('setor', option.value)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center hover:border-primary/50",
                          formData.setor === option.value 
                            ? "border-primary bg-primary/5" 
                            : "border-border"
                        )}
                      >
                        <Icon className={cn(
                          "h-8 w-8 mx-auto mb-2",
                          formData.setor === option.value ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        {formData.setor === option.value && (
                          <Check className="h-5 w-5 text-primary mx-auto mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Faturamento */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Qual o faturamento anual da empresa?</h2>
                  <p className="text-muted-foreground">Aproximado, não precisa ser exato</p>
                </div>
                <div className="space-y-3">
                  {FATURAMENTO_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFormData('porte', option.value);
                        updateFormData('faturamento_anual', option.faturamentoAnual);
                      }}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between",
                        formData.porte === option.value 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <span>{option.label}</span>
                      <Badge variant={formData.porte === option.value ? "default" : "outline"}>
                        {option.tag}
                      </Badge>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Não se preocupe, essa informação é confidencial
                </p>
              </div>
            )}

            {/* Step 3: O que vende */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">O que sua empresa vende?</h2>
                  <p className="text-muted-foreground">Pode marcar mais de um</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Checkbox 
                        id="produtos"
                        checked={formData.vende_produtos}
                        onCheckedChange={(checked) => updateFormData('vende_produtos', !!checked)}
                      />
                      <label htmlFor="produtos" className="flex-1 cursor-pointer">
                        <span className="font-medium">Produtos físicos</span>
                        <p className="text-sm text-muted-foreground">Mercadorias, equipamentos</p>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Checkbox 
                        id="servicos"
                        checked={formData.vende_servicos}
                        onCheckedChange={(checked) => updateFormData('vende_servicos', !!checked)}
                      />
                      <label htmlFor="servicos" className="flex-1 cursor-pointer">
                        <span className="font-medium">Serviços</span>
                        <p className="text-sm text-muted-foreground">Consultoria, projetos, manutenção</p>
                      </label>
                    </div>
                  </div>

                  {formData.vende_produtos && (
                    <>
                      <div className="border-t pt-4">
                        <p className="font-medium mb-3">
                          Você vende algum desses produtos específicos?
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            (importantes para identificar economia)
                          </span>
                        </p>
                        <div className="space-y-2">
                          {PRODUTOS_ESPECIFICOS.map((item) => (
                            <div key={item.field} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                              <Checkbox 
                                id={item.field}
                                checked={formData[item.field as keyof ProfileFormData] as boolean}
                                onCheckedChange={(checked) => updateFormData(item.field as keyof ProfileFormData, !!checked)}
                              />
                              <label htmlFor={item.field} className="cursor-pointer">
                                {item.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-lg flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-primary shrink-0" />
                        Esses produtos têm regras especiais de tributação que podem te beneficiar
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Para quem vende */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Para quem você vende?</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox 
                      id="pf"
                      checked={formData.vende_pf}
                      onCheckedChange={(checked) => updateFormData('vende_pf', !!checked)}
                    />
                    <label htmlFor="pf" className="flex-1 cursor-pointer">
                      <span className="font-medium"><User className="w-4 h-4 inline mr-1" />Pessoas físicas (consumidor final)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox 
                      id="pj"
                      checked={formData.vende_pj}
                      onCheckedChange={(checked) => updateFormData('vende_pj', !!checked)}
                    />
                    <label htmlFor="pj" className="flex-1 cursor-pointer">
                      <span className="font-medium"><Building2 className="w-4 h-4 inline mr-1" />Outras empresas (B2B)</span>
                    </label>
                  </div>

                  {formData.vende_pf && formData.vende_pj && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <p className="text-sm font-medium">Proporção aproximada:</p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm"><User className="w-3 h-3 inline mr-0.5" /> {formData.percentual_pf}%</span>
                        <Slider 
                          value={[formData.percentual_pf]}
                          onValueChange={([val]) => {
                            updateFormData('percentual_pf', val);
                            updateFormData('percentual_pj', 100 - val);
                          }}
                          max={100}
                          step={10}
                          className="flex-1"
                        />
                        <span className="text-sm"><Building2 className="w-3 h-3 inline mr-0.5" /> {formData.percentual_pj}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Checkbox 
                      id="governo"
                      checked={formData.vende_governo}
                      onCheckedChange={(checked) => updateFormData('vende_governo', !!checked)}
                    />
                    <label htmlFor="governo" className="cursor-pointer">
                      Também vendemos para o governo (licitações)
                    </label>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <p className="font-medium">Sua empresa vende para outros estados ou países?</p>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id="outros_estados"
                        checked={formData.opera_outros_estados}
                        onCheckedChange={(checked) => updateFormData('opera_outros_estados', !!checked)}
                      />
                      <label htmlFor="outros_estados" className="cursor-pointer">
                        Sim, vendemos para outros estados
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id="exporta_produtos"
                        checked={formData.exporta_produtos}
                        onCheckedChange={(checked) => updateFormData('exporta_produtos', !!checked)}
                      />
                      <label htmlFor="exporta_produtos" className="cursor-pointer">
                        Exportamos produtos para outros países
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id="exporta_servicos"
                        checked={formData.exporta_servicos}
                        onCheckedChange={(checked) => updateFormData('exporta_servicos', !!checked)}
                      />
                      <label htmlFor="exporta_servicos" className="cursor-pointer">
                        Exportamos serviços (prestamos para clientes no exterior)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Estrutura */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Sobre a estrutura da empresa</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-3">Quantos CNPJs você tem?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 1, label: 'Apenas 1 CNPJ' },
                        { value: 2, label: '2 a 3 CNPJs' },
                        { value: 5, label: '4 a 10 CNPJs' },
                        { value: 15, label: 'Mais de 10' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateFormData('qtd_cnpjs', opt.value)}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all text-sm",
                            formData.qtd_cnpjs === opt.value 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.qtd_cnpjs > 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id="holding"
                          checked={formData.tem_holding}
                          onCheckedChange={(checked) => updateFormData('tem_holding', !!checked)}
                        />
                        <label htmlFor="holding" className="cursor-pointer">
                          Temos uma holding controladora
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id="filiais"
                          checked={formData.tem_filiais}
                          onCheckedChange={(checked) => updateFormData('tem_filiais', !!checked)}
                        />
                        <label htmlFor="filiais" className="cursor-pointer">
                          Temos filiais em outros estados
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="font-medium mb-3">Qual o regime tributário? (como você paga imposto)</p>
                    <div className="space-y-2">
                      {REGIME_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateFormData('regime_tributario', opt.value)}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 transition-all text-left",
                            formData.regime_tributario === opt.value 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <span className="font-medium">{opt.label}</span>
                          <p className="text-sm text-muted-foreground">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Características especiais */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Última etapa! Marque o que se aplica:</h2>
                </div>

                <div className="space-y-4">
                  {/* Sector-specific characteristics */}
                  {formData.setor && SECTOR_CHARACTERISTICS[formData.setor] && (
                    <div className="border rounded-lg p-4 bg-primary/5">
                      <p className="font-medium mb-3 text-primary uppercase text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Específico do seu setor
                      </p>
                      <div className="space-y-2">
                        {SECTOR_CHARACTERISTICS[formData.setor].map((item) => (
                          <div key={item.field} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-background/50">
                            <Checkbox 
                              id={item.field}
                              checked={formData[item.field as keyof ProfileFormData] as boolean || false}
                              onCheckedChange={(checked) => updateFormData(item.field as keyof ProfileFormData, !!checked)}
                            />
                            <label htmlFor={item.field} className="cursor-pointer flex-1">
                              <span className="font-medium">{item.label}</span>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-3 text-muted-foreground uppercase text-sm">Inovação</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id="pd"
                          checked={formData.tem_atividade_pd}
                          onCheckedChange={(checked) => updateFormData('tem_atividade_pd', !!checked)}
                        />
                        <label htmlFor="pd" className="cursor-pointer">
                          Desenvolvemos tecnologia / fazemos P&D
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox 
                          id="patentes"
                          checked={formData.tem_patentes}
                          onCheckedChange={(checked) => updateFormData('tem_patentes', !!checked)}
                        />
                        <label htmlFor="patentes" className="cursor-pointer">
                          Temos patentes ou marcas registradas
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-3 text-muted-foreground uppercase text-sm">Localização Especial</p>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <Checkbox 
                        id="zfm"
                        checked={formData.zona_franca}
                        onCheckedChange={(checked) => updateFormData('zona_franca', !!checked)}
                      />
                      <label htmlFor="zfm" className="cursor-pointer">
                        Operamos na Zona Franca de Manaus ou área de incentivo (SUDENE/SUDAM)
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium mb-3">Quanto representa a folha de pagamento no faturamento?</p>
                    <div className="space-y-2">
                      {FOLHA_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => updateFormData('folha_percentual_faturamento', opt.percentual)}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between",
                            formData.folha_percentual_faturamento === opt.percentual 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <span>{opt.label}</span>
                          {opt.highlight && (
                            <Badge variant="secondary" className="bg-accent text-accent-foreground">
                              💡 Pode te beneficiar!
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!canProceed() || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : currentStep === 6 ? (
                  <Sparkles className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {currentStep === 6 ? 'Finalizar e Ver Oportunidades' : 'Continuar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
