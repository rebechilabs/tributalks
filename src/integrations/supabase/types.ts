export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alertas_configuracao: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          regimes_filtro: string[] | null
          relevancia_minima: string | null
          setores_filtro: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          regimes_filtro?: string[] | null
          relevancia_minima?: string | null
          setores_filtro?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          regimes_filtro?: string[] | null
          relevancia_minima?: string | null
          setores_filtro?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calculators: {
        Row: {
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
          status?: string | null
        }
        Relationships: []
      }
      company_dre: {
        Row: {
          calc_custo_produtos_vendidos: number | null
          calc_deducoes_receita: number | null
          calc_despesas_operacionais_total: number | null
          calc_ebitda: number | null
          calc_ebitda_margin: number | null
          calc_impostos_sobre_lucro: number | null
          calc_lucro_bruto: number | null
          calc_lucro_liquido: number | null
          calc_margem_bruta: number | null
          calc_margem_liquida: number | null
          calc_margem_operacional: number | null
          calc_ponto_equilibrio: number | null
          calc_receita_bruta: number | null
          calc_receita_liquida: number | null
          calc_resultado_antes_ir: number | null
          calc_resultado_financeiro: number | null
          calc_resultado_operacional: number | null
          created_at: string | null
          diagnostics: Json | null
          health_score: number | null
          health_status: string | null
          id: string
          input_aluguel: number | null
          input_calcular_impostos_auto: boolean | null
          input_contador_juridico: number | null
          input_custo_mao_obra_direta: number | null
          input_custo_materiais: number | null
          input_custo_mercadorias: number | null
          input_custo_servicos_terceiros: number | null
          input_descontos_concedidos: number | null
          input_devolucoes: number | null
          input_energia_agua_internet: number | null
          input_frete_logistica: number | null
          input_impostos_sobre_vendas: number | null
          input_juros_pagos: number | null
          input_juros_recebidos: number | null
          input_manutencao_equipamentos: number | null
          input_marketing_publicidade: number | null
          input_multas_pagas: number | null
          input_outras_despesas: number | null
          input_outras_receitas: number | null
          input_prolabore: number | null
          input_regime_tributario: string | null
          input_salarios_encargos: number | null
          input_software_assinaturas: number | null
          input_tarifas_bancarias: number | null
          input_vendas_produtos: number | null
          input_vendas_servicos: number | null
          input_viagens_refeicoes: number | null
          period_month: number | null
          period_quarter: number | null
          period_type: string
          period_year: number
          recommendations: Json | null
          reforma_calculated_at: string | null
          reforma_impacto_lucro: number | null
          reforma_impacto_percentual: number | null
          reforma_impostos_atuais: number | null
          reforma_impostos_novos: number | null
          reforma_source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calc_custo_produtos_vendidos?: number | null
          calc_deducoes_receita?: number | null
          calc_despesas_operacionais_total?: number | null
          calc_ebitda?: number | null
          calc_ebitda_margin?: number | null
          calc_impostos_sobre_lucro?: number | null
          calc_lucro_bruto?: number | null
          calc_lucro_liquido?: number | null
          calc_margem_bruta?: number | null
          calc_margem_liquida?: number | null
          calc_margem_operacional?: number | null
          calc_ponto_equilibrio?: number | null
          calc_receita_bruta?: number | null
          calc_receita_liquida?: number | null
          calc_resultado_antes_ir?: number | null
          calc_resultado_financeiro?: number | null
          calc_resultado_operacional?: number | null
          created_at?: string | null
          diagnostics?: Json | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          input_aluguel?: number | null
          input_calcular_impostos_auto?: boolean | null
          input_contador_juridico?: number | null
          input_custo_mao_obra_direta?: number | null
          input_custo_materiais?: number | null
          input_custo_mercadorias?: number | null
          input_custo_servicos_terceiros?: number | null
          input_descontos_concedidos?: number | null
          input_devolucoes?: number | null
          input_energia_agua_internet?: number | null
          input_frete_logistica?: number | null
          input_impostos_sobre_vendas?: number | null
          input_juros_pagos?: number | null
          input_juros_recebidos?: number | null
          input_manutencao_equipamentos?: number | null
          input_marketing_publicidade?: number | null
          input_multas_pagas?: number | null
          input_outras_despesas?: number | null
          input_outras_receitas?: number | null
          input_prolabore?: number | null
          input_regime_tributario?: string | null
          input_salarios_encargos?: number | null
          input_software_assinaturas?: number | null
          input_tarifas_bancarias?: number | null
          input_vendas_produtos?: number | null
          input_vendas_servicos?: number | null
          input_viagens_refeicoes?: number | null
          period_month?: number | null
          period_quarter?: number | null
          period_type?: string
          period_year: number
          recommendations?: Json | null
          reforma_calculated_at?: string | null
          reforma_impacto_lucro?: number | null
          reforma_impacto_percentual?: number | null
          reforma_impostos_atuais?: number | null
          reforma_impostos_novos?: number | null
          reforma_source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calc_custo_produtos_vendidos?: number | null
          calc_deducoes_receita?: number | null
          calc_despesas_operacionais_total?: number | null
          calc_ebitda?: number | null
          calc_ebitda_margin?: number | null
          calc_impostos_sobre_lucro?: number | null
          calc_lucro_bruto?: number | null
          calc_lucro_liquido?: number | null
          calc_margem_bruta?: number | null
          calc_margem_liquida?: number | null
          calc_margem_operacional?: number | null
          calc_ponto_equilibrio?: number | null
          calc_receita_bruta?: number | null
          calc_receita_liquida?: number | null
          calc_resultado_antes_ir?: number | null
          calc_resultado_financeiro?: number | null
          calc_resultado_operacional?: number | null
          created_at?: string | null
          diagnostics?: Json | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          input_aluguel?: number | null
          input_calcular_impostos_auto?: boolean | null
          input_contador_juridico?: number | null
          input_custo_mao_obra_direta?: number | null
          input_custo_materiais?: number | null
          input_custo_mercadorias?: number | null
          input_custo_servicos_terceiros?: number | null
          input_descontos_concedidos?: number | null
          input_devolucoes?: number | null
          input_energia_agua_internet?: number | null
          input_frete_logistica?: number | null
          input_impostos_sobre_vendas?: number | null
          input_juros_pagos?: number | null
          input_juros_recebidos?: number | null
          input_manutencao_equipamentos?: number | null
          input_marketing_publicidade?: number | null
          input_multas_pagas?: number | null
          input_outras_despesas?: number | null
          input_outras_receitas?: number | null
          input_prolabore?: number | null
          input_regime_tributario?: string | null
          input_salarios_encargos?: number | null
          input_software_assinaturas?: number | null
          input_tarifas_bancarias?: number | null
          input_vendas_produtos?: number | null
          input_vendas_servicos?: number | null
          input_viagens_refeicoes?: number | null
          period_month?: number | null
          period_quarter?: number | null
          period_type?: string
          period_year?: number
          recommendations?: Json | null
          reforma_calculated_at?: string | null
          reforma_impacto_lucro?: number | null
          reforma_impacto_percentual?: number | null
          reforma_impostos_atuais?: number | null
          reforma_impostos_novos?: number | null
          reforma_source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_ncm_analysis: {
        Row: {
          alerta_cfop: string | null
          cfops_frequentes: string[] | null
          created_at: string
          id: string
          ncm_code: string
          product_name: string
          qtd_operacoes: number | null
          reason: string | null
          revenue_percentage: number | null
          status: string
          suggested_action: string | null
          tipo_operacao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alerta_cfop?: string | null
          cfops_frequentes?: string[] | null
          created_at?: string
          id?: string
          ncm_code: string
          product_name: string
          qtd_operacoes?: number | null
          reason?: string | null
          revenue_percentage?: number | null
          status?: string
          suggested_action?: string | null
          tipo_operacao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alerta_cfop?: string | null
          cfops_frequentes?: string[] | null
          created_at?: string
          id?: string
          ncm_code?: string
          product_name?: string
          qtd_operacoes?: number | null
          reason?: string | null
          revenue_percentage?: number | null
          status?: string
          suggested_action?: string | null
          tipo_operacao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_opportunities: {
        Row: {
          alto_impacto: boolean | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio_implementacao: string | null
          economia_anual_max: number | null
          economia_anual_min: number | null
          economia_mensal_max: number | null
          economia_mensal_min: number | null
          economia_real_mensal: number | null
          id: string
          match_reasons: string[] | null
          match_score: number | null
          missing_criteria: string[] | null
          motivo_descarte: string | null
          notas_contador: string | null
          notas_usuario: string | null
          opportunity_id: string
          prioridade: number | null
          quick_win: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alto_impacto?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio_implementacao?: string | null
          economia_anual_max?: number | null
          economia_anual_min?: number | null
          economia_mensal_max?: number | null
          economia_mensal_min?: number | null
          economia_real_mensal?: number | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          missing_criteria?: string[] | null
          motivo_descarte?: string | null
          notas_contador?: string | null
          notas_usuario?: string | null
          opportunity_id: string
          prioridade?: number | null
          quick_win?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alto_impacto?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio_implementacao?: string | null
          economia_anual_max?: number | null
          economia_anual_min?: number | null
          economia_mensal_max?: number | null
          economia_mensal_min?: number | null
          economia_real_mensal?: number | null
          id?: string
          match_reasons?: string[] | null
          match_score?: number | null
          missing_criteria?: string[] | null
          motivo_descarte?: string | null
          notas_contador?: string | null
          notas_usuario?: string | null
          opportunity_id?: string
          prioridade?: number | null
          quick_win?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "tax_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profile: {
        Row: {
          agricultura: boolean | null
          area_livre_comercio: boolean | null
          atividades_diferentes_tributacao: boolean | null
          centro_distribuicao_incentivado: boolean | null
          centro_distribuicao_zfm: boolean | null
          clinica: boolean | null
          cnae_principal: string | null
          cnae_secundarios: string[] | null
          cnpj_principal: string | null
          cnpjs_grupo: string[] | null
          comercializa_commodities: boolean | null
          comercializa_medicamentos: boolean | null
          compra_equipamento_solar: boolean | null
          compra_equipamentos_medicos: boolean | null
          compra_insumos_agricolas: boolean | null
          created_at: string | null
          cursos_livres: boolean | null
          descricao_atividade: string | null
          email_ceo: string | null
          email_cfo: string | null
          email_contador: string | null
          email_socios: string[] | null
          escola_regular: boolean | null
          estado_beneficio_icms: string | null
          etapa_atual: number | null
          exporta_produtos: boolean | null
          exporta_servicos: boolean | null
          faculdade: boolean | null
          fator_r_acima_28: boolean | null
          faturamento_anual: number | null
          faturamento_mensal_medio: number | null
          fins_lucrativos: boolean | null
          folha_alta_construcao: boolean | null
          folha_mensal: number | null
          folha_percentual_faturamento: number | null
          frete_exportacao: boolean | null
          hospital: boolean | null
          id: string
          importa_equipamento_solar: boolean | null
          importa_insumos: boolean | null
          importa_produtos: boolean | null
          incorporacao_imobiliaria: boolean | null
          investe_em_inovacao: boolean | null
          investe_frota: boolean | null
          investe_maquinas_agricolas: boolean | null
          investe_pd_saude: boolean | null
          investe_tecnologia_educacional: boolean | null
          laboratorio: boolean | null
          municipio_sede: string | null
          nome_fantasia: string | null
          num_funcionarios: number | null
          opera_outros_estados: boolean | null
          opera_todo_brasil: boolean | null
          operacao_interestadual: boolean | null
          patrimonio_afetacao: boolean | null
          pecuaria: boolean | null
          percentual_exportacao: number | null
          percentual_governo: number | null
          percentual_importacao: number | null
          percentual_pf: number | null
          percentual_pj: number | null
          percentual_produtos: number | null
          percentual_servicos: number | null
          perfil_completo: boolean | null
          porte: string | null
          potencia_solar_kw: number | null
          prepara_alimentos: boolean | null
          procedimentos_complexos: boolean | null
          producao_rural: boolean | null
          programa_mcmv: boolean | null
          projeto_infraestrutura_energia: boolean | null
          qtd_cnpjs: number | null
          qtd_filiais: number | null
          razao_social: string | null
          recebe_gorjetas: boolean | null
          regime_tributario: string | null
          regimes_no_grupo: string[] | null
          segmento: string | null
          setor: string | null
          tem_area_preservacao: boolean | null
          tem_atividade_pd: boolean | null
          tem_atividades_mistas: boolean | null
          tem_bar: boolean | null
          tem_ecommerce: boolean | null
          tem_filiais: boolean | null
          tem_geracao_solar: boolean | null
          tem_holding: boolean | null
          tem_internacao: boolean | null
          tem_lanchonete: boolean | null
          tem_loja_fisica: boolean | null
          tem_marketplace: boolean | null
          tem_muitos_socios: boolean | null
          tem_patentes: boolean | null
          tem_produtos_monofasicos: boolean | null
          tem_restaurante: boolean | null
          tipo_cooperativa: boolean | null
          tipo_societario: string | null
          transporte_cargas: boolean | null
          transporte_passageiros: boolean | null
          uf_sede: string | null
          ufs_operacao: string[] | null
          updated_at: string | null
          usa_plataformas_delivery: boolean | null
          user_id: string
          vende_automoveis: boolean | null
          vende_autopecas: boolean | null
          vende_bebidas: boolean | null
          vende_cigarros: boolean | null
          vende_combustiveis: boolean | null
          vende_cosmeticos: boolean | null
          vende_eletronicos: boolean | null
          vende_farmacos: boolean | null
          vende_governo: boolean | null
          vende_pf: boolean | null
          vende_pj: boolean | null
          vende_pneus: boolean | null
          vende_produtos: boolean | null
          vende_servicos: boolean | null
          vende_whatsapp_social: boolean | null
          zona_especial: string | null
          zona_franca: boolean | null
        }
        Insert: {
          agricultura?: boolean | null
          area_livre_comercio?: boolean | null
          atividades_diferentes_tributacao?: boolean | null
          centro_distribuicao_incentivado?: boolean | null
          centro_distribuicao_zfm?: boolean | null
          clinica?: boolean | null
          cnae_principal?: string | null
          cnae_secundarios?: string[] | null
          cnpj_principal?: string | null
          cnpjs_grupo?: string[] | null
          comercializa_commodities?: boolean | null
          comercializa_medicamentos?: boolean | null
          compra_equipamento_solar?: boolean | null
          compra_equipamentos_medicos?: boolean | null
          compra_insumos_agricolas?: boolean | null
          created_at?: string | null
          cursos_livres?: boolean | null
          descricao_atividade?: string | null
          email_ceo?: string | null
          email_cfo?: string | null
          email_contador?: string | null
          email_socios?: string[] | null
          escola_regular?: boolean | null
          estado_beneficio_icms?: string | null
          etapa_atual?: number | null
          exporta_produtos?: boolean | null
          exporta_servicos?: boolean | null
          faculdade?: boolean | null
          fator_r_acima_28?: boolean | null
          faturamento_anual?: number | null
          faturamento_mensal_medio?: number | null
          fins_lucrativos?: boolean | null
          folha_alta_construcao?: boolean | null
          folha_mensal?: number | null
          folha_percentual_faturamento?: number | null
          frete_exportacao?: boolean | null
          hospital?: boolean | null
          id?: string
          importa_equipamento_solar?: boolean | null
          importa_insumos?: boolean | null
          importa_produtos?: boolean | null
          incorporacao_imobiliaria?: boolean | null
          investe_em_inovacao?: boolean | null
          investe_frota?: boolean | null
          investe_maquinas_agricolas?: boolean | null
          investe_pd_saude?: boolean | null
          investe_tecnologia_educacional?: boolean | null
          laboratorio?: boolean | null
          municipio_sede?: string | null
          nome_fantasia?: string | null
          num_funcionarios?: number | null
          opera_outros_estados?: boolean | null
          opera_todo_brasil?: boolean | null
          operacao_interestadual?: boolean | null
          patrimonio_afetacao?: boolean | null
          pecuaria?: boolean | null
          percentual_exportacao?: number | null
          percentual_governo?: number | null
          percentual_importacao?: number | null
          percentual_pf?: number | null
          percentual_pj?: number | null
          percentual_produtos?: number | null
          percentual_servicos?: number | null
          perfil_completo?: boolean | null
          porte?: string | null
          potencia_solar_kw?: number | null
          prepara_alimentos?: boolean | null
          procedimentos_complexos?: boolean | null
          producao_rural?: boolean | null
          programa_mcmv?: boolean | null
          projeto_infraestrutura_energia?: boolean | null
          qtd_cnpjs?: number | null
          qtd_filiais?: number | null
          razao_social?: string | null
          recebe_gorjetas?: boolean | null
          regime_tributario?: string | null
          regimes_no_grupo?: string[] | null
          segmento?: string | null
          setor?: string | null
          tem_area_preservacao?: boolean | null
          tem_atividade_pd?: boolean | null
          tem_atividades_mistas?: boolean | null
          tem_bar?: boolean | null
          tem_ecommerce?: boolean | null
          tem_filiais?: boolean | null
          tem_geracao_solar?: boolean | null
          tem_holding?: boolean | null
          tem_internacao?: boolean | null
          tem_lanchonete?: boolean | null
          tem_loja_fisica?: boolean | null
          tem_marketplace?: boolean | null
          tem_muitos_socios?: boolean | null
          tem_patentes?: boolean | null
          tem_produtos_monofasicos?: boolean | null
          tem_restaurante?: boolean | null
          tipo_cooperativa?: boolean | null
          tipo_societario?: string | null
          transporte_cargas?: boolean | null
          transporte_passageiros?: boolean | null
          uf_sede?: string | null
          ufs_operacao?: string[] | null
          updated_at?: string | null
          usa_plataformas_delivery?: boolean | null
          user_id: string
          vende_automoveis?: boolean | null
          vende_autopecas?: boolean | null
          vende_bebidas?: boolean | null
          vende_cigarros?: boolean | null
          vende_combustiveis?: boolean | null
          vende_cosmeticos?: boolean | null
          vende_eletronicos?: boolean | null
          vende_farmacos?: boolean | null
          vende_governo?: boolean | null
          vende_pf?: boolean | null
          vende_pj?: boolean | null
          vende_pneus?: boolean | null
          vende_produtos?: boolean | null
          vende_servicos?: boolean | null
          vende_whatsapp_social?: boolean | null
          zona_especial?: string | null
          zona_franca?: boolean | null
        }
        Update: {
          agricultura?: boolean | null
          area_livre_comercio?: boolean | null
          atividades_diferentes_tributacao?: boolean | null
          centro_distribuicao_incentivado?: boolean | null
          centro_distribuicao_zfm?: boolean | null
          clinica?: boolean | null
          cnae_principal?: string | null
          cnae_secundarios?: string[] | null
          cnpj_principal?: string | null
          cnpjs_grupo?: string[] | null
          comercializa_commodities?: boolean | null
          comercializa_medicamentos?: boolean | null
          compra_equipamento_solar?: boolean | null
          compra_equipamentos_medicos?: boolean | null
          compra_insumos_agricolas?: boolean | null
          created_at?: string | null
          cursos_livres?: boolean | null
          descricao_atividade?: string | null
          email_ceo?: string | null
          email_cfo?: string | null
          email_contador?: string | null
          email_socios?: string[] | null
          escola_regular?: boolean | null
          estado_beneficio_icms?: string | null
          etapa_atual?: number | null
          exporta_produtos?: boolean | null
          exporta_servicos?: boolean | null
          faculdade?: boolean | null
          fator_r_acima_28?: boolean | null
          faturamento_anual?: number | null
          faturamento_mensal_medio?: number | null
          fins_lucrativos?: boolean | null
          folha_alta_construcao?: boolean | null
          folha_mensal?: number | null
          folha_percentual_faturamento?: number | null
          frete_exportacao?: boolean | null
          hospital?: boolean | null
          id?: string
          importa_equipamento_solar?: boolean | null
          importa_insumos?: boolean | null
          importa_produtos?: boolean | null
          incorporacao_imobiliaria?: boolean | null
          investe_em_inovacao?: boolean | null
          investe_frota?: boolean | null
          investe_maquinas_agricolas?: boolean | null
          investe_pd_saude?: boolean | null
          investe_tecnologia_educacional?: boolean | null
          laboratorio?: boolean | null
          municipio_sede?: string | null
          nome_fantasia?: string | null
          num_funcionarios?: number | null
          opera_outros_estados?: boolean | null
          opera_todo_brasil?: boolean | null
          operacao_interestadual?: boolean | null
          patrimonio_afetacao?: boolean | null
          pecuaria?: boolean | null
          percentual_exportacao?: number | null
          percentual_governo?: number | null
          percentual_importacao?: number | null
          percentual_pf?: number | null
          percentual_pj?: number | null
          percentual_produtos?: number | null
          percentual_servicos?: number | null
          perfil_completo?: boolean | null
          porte?: string | null
          potencia_solar_kw?: number | null
          prepara_alimentos?: boolean | null
          procedimentos_complexos?: boolean | null
          producao_rural?: boolean | null
          programa_mcmv?: boolean | null
          projeto_infraestrutura_energia?: boolean | null
          qtd_cnpjs?: number | null
          qtd_filiais?: number | null
          razao_social?: string | null
          recebe_gorjetas?: boolean | null
          regime_tributario?: string | null
          regimes_no_grupo?: string[] | null
          segmento?: string | null
          setor?: string | null
          tem_area_preservacao?: boolean | null
          tem_atividade_pd?: boolean | null
          tem_atividades_mistas?: boolean | null
          tem_bar?: boolean | null
          tem_ecommerce?: boolean | null
          tem_filiais?: boolean | null
          tem_geracao_solar?: boolean | null
          tem_holding?: boolean | null
          tem_internacao?: boolean | null
          tem_lanchonete?: boolean | null
          tem_loja_fisica?: boolean | null
          tem_marketplace?: boolean | null
          tem_muitos_socios?: boolean | null
          tem_patentes?: boolean | null
          tem_produtos_monofasicos?: boolean | null
          tem_restaurante?: boolean | null
          tipo_cooperativa?: boolean | null
          tipo_societario?: string | null
          transporte_cargas?: boolean | null
          transporte_passageiros?: boolean | null
          uf_sede?: string | null
          ufs_operacao?: string[] | null
          updated_at?: string | null
          usa_plataformas_delivery?: boolean | null
          user_id?: string
          vende_automoveis?: boolean | null
          vende_autopecas?: boolean | null
          vende_bebidas?: boolean | null
          vende_cigarros?: boolean | null
          vende_combustiveis?: boolean | null
          vende_cosmeticos?: boolean | null
          vende_eletronicos?: boolean | null
          vende_farmacos?: boolean | null
          vende_governo?: boolean | null
          vende_pf?: boolean | null
          vende_pj?: boolean | null
          vende_pneus?: boolean | null
          vende_produtos?: boolean | null
          vende_servicos?: boolean | null
          vende_whatsapp_social?: boolean | null
          zona_especial?: string | null
          zona_franca?: boolean | null
        }
        Relationships: []
      }
      consultorias: {
        Row: {
          calendly_event_id: string | null
          calendly_event_uri: string | null
          created_at: string | null
          data_agendada: string | null
          duracao_minutos: number | null
          especialista: string | null
          id: string
          notas: string | null
          status: string | null
          tema: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendly_event_id?: string | null
          calendly_event_uri?: string | null
          created_at?: string | null
          data_agendada?: string | null
          duracao_minutos?: number | null
          especialista?: string | null
          id?: string
          notas?: string | null
          status?: string | null
          tema?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendly_event_id?: string | null
          calendly_event_uri?: string | null
          created_at?: string | null
          data_agendada?: string | null
          duracao_minutos?: number | null
          especialista?: string | null
          id?: string
          notas?: string | null
          status?: string | null
          tema?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          assunto: string
          created_at: string | null
          email: string
          id: string
          mensagem: string
          nome: string
          respondido: boolean | null
          respondido_em: string | null
          respondido_por: string | null
        }
        Insert: {
          assunto: string
          created_at?: string | null
          email: string
          id?: string
          mensagem: string
          nome: string
          respondido?: boolean | null
          respondido_em?: string | null
          respondido_por?: string | null
        }
        Update: {
          assunto?: string
          created_at?: string | null
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          respondido?: boolean | null
          respondido_em?: string | null
          respondido_por?: string | null
        }
        Relationships: []
      }
      credit_analysis_summary: {
        Row: {
          analysis_date: string | null
          created_at: string | null
          credits_found_count: number | null
          high_confidence_total: number | null
          icms_potential: number | null
          icms_st_potential: number | null
          id: string
          ipi_potential: number | null
          low_confidence_total: number | null
          medium_confidence_total: number | null
          period_end: string | null
          period_start: string | null
          pis_cofins_potential: number | null
          total_potential: number | null
          total_xmls_analyzed: number | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          created_at?: string | null
          credits_found_count?: number | null
          high_confidence_total?: number | null
          icms_potential?: number | null
          icms_st_potential?: number | null
          id?: string
          ipi_potential?: number | null
          low_confidence_total?: number | null
          medium_confidence_total?: number | null
          period_end?: string | null
          period_start?: string | null
          pis_cofins_potential?: number | null
          total_potential?: number | null
          total_xmls_analyzed?: number | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          created_at?: string | null
          credits_found_count?: number | null
          high_confidence_total?: number | null
          icms_potential?: number | null
          icms_st_potential?: number | null
          id?: string
          ipi_potential?: number | null
          low_confidence_total?: number | null
          medium_confidence_total?: number | null
          period_end?: string | null
          period_start?: string | null
          pis_cofins_potential?: number | null
          total_potential?: number | null
          total_xmls_analyzed?: number | null
          user_id?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          created_at: string | null
          credits_amount: number
          id: string
          price_paid: number
          status: string
          stripe_payment_id: string | null
          stripe_price_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_amount: number
          id?: string
          price_paid: number
          status?: string
          stripe_payment_id?: string | null
          stripe_price_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_amount?: number
          id?: string
          price_paid?: number
          status?: string
          stripe_payment_id?: string | null
          stripe_price_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_rules: {
        Row: {
          calculation_formula: string | null
          confidence_level: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          legal_basis: string | null
          recovery_window_years: number | null
          rule_code: string
          rule_name: string
          tax_type: string
          trigger_conditions: Json
        }
        Insert: {
          calculation_formula?: string | null
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          legal_basis?: string | null
          recovery_window_years?: number | null
          rule_code: string
          rule_name: string
          tax_type: string
          trigger_conditions: Json
        }
        Update: {
          calculation_formula?: string | null
          confidence_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          legal_basis?: string | null
          recovery_window_years?: number | null
          rule_code?: string
          rule_name?: string
          tax_type?: string
          trigger_conditions?: Json
        }
        Relationships: []
      }
      credit_usage: {
        Row: {
          created_at: string | null
          credits_used: number
          feature: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_used?: number
          feature?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          feature?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      erp_checklist: {
        Row: {
          id: string
          item_description: string | null
          item_key: string
          item_label: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_description?: string | null
          item_key: string
          item_label: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_description?: string | null
          item_key?: string
          item_label?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      erp_connections: {
        Row: {
          connection_name: string
          created_at: string
          credentials: Json
          erp_type: Database["public"]["Enums"]["erp_type"]
          id: string
          last_sync_at: string | null
          metadata: Json | null
          next_sync_at: string | null
          status: Database["public"]["Enums"]["erp_connection_status"]
          status_message: string | null
          sync_config: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_name: string
          created_at?: string
          credentials?: Json
          erp_type: Database["public"]["Enums"]["erp_type"]
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          next_sync_at?: string | null
          status?: Database["public"]["Enums"]["erp_connection_status"]
          status_message?: string | null
          sync_config?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_name?: string
          created_at?: string
          credentials?: Json
          erp_type?: Database["public"]["Enums"]["erp_type"]
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          next_sync_at?: string | null
          status?: Database["public"]["Enums"]["erp_connection_status"]
          status_message?: string | null
          sync_config?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      erp_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          details: Json | null
          error_message: string | null
          id: string
          records_failed: number | null
          records_synced: number | null
          started_at: string
          status: Database["public"]["Enums"]["erp_sync_status"]
          sync_type: Database["public"]["Enums"]["erp_sync_type"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["erp_sync_status"]
          sync_type: Database["public"]["Enums"]["erp_sync_type"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["erp_sync_status"]
          sync_type?: Database["public"]["Enums"]["erp_sync_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_report_logs: {
        Row: {
          company_name: string | null
          created_at: string
          error_message: string | null
          id: string
          reference_month: string
          report_data: Json | null
          sent_at: string | null
          sent_to: string[]
          status: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          reference_month: string
          report_data?: Json | null
          sent_at?: string | null
          sent_to?: string[]
          status?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          reference_month?: string
          report_data?: Json | null
          sent_at?: string | null
          sent_to?: string[]
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      identified_credits: {
        Row: {
          accountant_notes: string | null
          cfop: string | null
          confidence_level: string | null
          confidence_score: number | null
          created_at: string | null
          credit_not_used: number | null
          cst: string | null
          id: string
          ncm_code: string | null
          nfe_date: string | null
          nfe_key: string | null
          nfe_number: string | null
          original_tax_value: number | null
          potential_recovery: number | null
          product_description: string | null
          rule_id: string | null
          status: string | null
          supplier_cnpj: string | null
          supplier_name: string | null
          user_id: string
          validated_at: string | null
          validated_by: string | null
          xml_import_id: string | null
        }
        Insert: {
          accountant_notes?: string | null
          cfop?: string | null
          confidence_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          credit_not_used?: number | null
          cst?: string | null
          id?: string
          ncm_code?: string | null
          nfe_date?: string | null
          nfe_key?: string | null
          nfe_number?: string | null
          original_tax_value?: number | null
          potential_recovery?: number | null
          product_description?: string | null
          rule_id?: string | null
          status?: string | null
          supplier_cnpj?: string | null
          supplier_name?: string | null
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
          xml_import_id?: string | null
        }
        Update: {
          accountant_notes?: string | null
          cfop?: string | null
          confidence_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          credit_not_used?: number | null
          cst?: string | null
          id?: string
          ncm_code?: string | null
          nfe_date?: string | null
          nfe_key?: string | null
          nfe_number?: string | null
          original_tax_value?: number | null
          potential_recovery?: number | null
          product_description?: string | null
          rule_id?: string | null
          status?: string | null
          supplier_cnpj?: string | null
          supplier_name?: string | null
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
          xml_import_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identified_credits_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "credit_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identified_credits_xml_import_id_fkey"
            columns: ["xml_import_id"]
            isOneToOne: false
            referencedRelation: "xml_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias_tributarias: {
        Row: {
          acao_recomendada: string | null
          categoria: string | null
          conteudo_original: string | null
          created_at: string | null
          data_publicacao: string | null
          fonte: string
          fonte_url: string | null
          id: string
          o_que_muda: string | null
          publicado: boolean | null
          quem_e_afetado: string | null
          regimes_afetados: string[] | null
          relevancia: string | null
          resumo_executivo: string | null
          setores_afetados: string[] | null
          titulo_original: string
          tributos_relacionados: string[] | null
        }
        Insert: {
          acao_recomendada?: string | null
          categoria?: string | null
          conteudo_original?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          fonte: string
          fonte_url?: string | null
          id?: string
          o_que_muda?: string | null
          publicado?: boolean | null
          quem_e_afetado?: string | null
          regimes_afetados?: string[] | null
          relevancia?: string | null
          resumo_executivo?: string | null
          setores_afetados?: string[] | null
          titulo_original: string
          tributos_relacionados?: string[] | null
        }
        Update: {
          acao_recomendada?: string | null
          categoria?: string | null
          conteudo_original?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          fonte?: string
          fonte_url?: string | null
          id?: string
          o_que_muda?: string | null
          publicado?: boolean | null
          quem_e_afetado?: string | null
          regimes_afetados?: string[] | null
          relevancia?: string | null
          resumo_executivo?: string | null
          setores_afetados?: string[] | null
          titulo_original?: string
          tributos_relacionados?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_seats: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          member_email: string
          member_user_id: string | null
          owner_id: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          member_email: string
          member_user_id?: string | null
          owner_id: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          member_email?: string
          member_user_id?: string | null
          owner_id?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pilulas_reforma: {
        Row: {
          ativo: boolean | null
          conteudo: string
          created_at: string | null
          data_exibicao: string | null
          id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo: string
          created_at?: string | null
          data_exibicao?: string | null
          id?: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo?: string
          created_at?: string | null
          data_exibicao?: string | null
          id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prazos_reforma: {
        Row: {
          afeta_regimes: string[] | null
          afeta_setores: string[] | null
          ativo: boolean | null
          base_legal: string | null
          created_at: string | null
          data_prazo: string
          descricao: string | null
          id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
          url_referencia: string | null
        }
        Insert: {
          afeta_regimes?: string[] | null
          afeta_setores?: string[] | null
          ativo?: boolean | null
          base_legal?: string | null
          created_at?: string | null
          data_prazo: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          url_referencia?: string | null
        }
        Update: {
          afeta_regimes?: string[] | null
          afeta_setores?: string[] | null
          ativo?: boolean | null
          base_legal?: string | null
          created_at?: string | null
          data_prazo?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          url_referencia?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cnae: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          extra_seats_purchased: number | null
          faturamento_mensal: number | null
          id: string
          max_seats: number | null
          nome: string | null
          notif_consultorias: boolean | null
          notif_legislacao: boolean | null
          notif_novidades: boolean | null
          onboarding_complete: boolean | null
          percentual_vendas_pj: number | null
          plano: string | null
          regime: string | null
          setor: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_period_end: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cnae?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          extra_seats_purchased?: number | null
          faturamento_mensal?: number | null
          id?: string
          max_seats?: number | null
          nome?: string | null
          notif_consultorias?: boolean | null
          notif_legislacao?: boolean | null
          notif_novidades?: boolean | null
          onboarding_complete?: boolean | null
          percentual_vendas_pj?: number | null
          plano?: string | null
          regime?: string | null
          setor?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cnae?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          extra_seats_purchased?: number | null
          faturamento_mensal?: number | null
          id?: string
          max_seats?: number | null
          nome?: string | null
          notif_consultorias?: boolean | null
          notif_legislacao?: boolean | null
          notif_novidades?: boolean | null
          onboarding_complete?: boolean | null
          percentual_vendas_pj?: number | null
          plano?: string | null
          regime?: string | null
          setor?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          successful_referrals: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          successful_referrals?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          successful_referrals?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: string
          qualified_at: string | null
          referral_code: string
          referred_at: string
          referred_id: string
          referrer_id: string
          reward_applied_at: string | null
          status: string
          subscription_started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          qualified_at?: string | null
          referral_code: string
          referred_at?: string
          referred_id: string
          referrer_id: string
          reward_applied_at?: string | null
          status?: string
          subscription_started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          qualified_at?: string | null
          referral_code?: string
          referred_at?: string
          referred_id?: string
          referrer_id?: string
          reward_applied_at?: string | null
          status?: string
          subscription_started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_referrals_code"
            columns: ["referral_code"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "fk_referrals_referrer"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reform_checklist_responses: {
        Row: {
          block_key: string
          created_at: string | null
          id: string
          item_key: string
          notes: string | null
          response: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          block_key: string
          created_at?: string | null
          id?: string
          item_key: string
          notes?: string | null
          response: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          block_key?: string
          created_at?: string | null
          id?: string
          item_key?: string
          notes?: string | null
          response?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reform_checklist_summaries: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          nao_count: number | null
          nao_sei_count: number | null
          parcial_count: number | null
          readiness_score: number | null
          recommendations: Json | null
          risk_level: string | null
          sim_count: number | null
          top_risks: Json | null
          total_items: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          nao_count?: number | null
          nao_sei_count?: number | null
          parcial_count?: number | null
          readiness_score?: number | null
          recommendations?: Json | null
          risk_level?: string | null
          sim_count?: number | null
          top_risks?: Json | null
          total_items?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          nao_count?: number | null
          nao_sei_count?: number | null
          parcial_count?: number | null
          readiness_score?: number | null
          recommendations?: Json | null
          risk_level?: string | null
          sim_count?: number | null
          top_risks?: Json | null
          total_items?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      score_actions: {
        Row: {
          action_code: string
          action_description: string | null
          action_title: string
          created_at: string | null
          economia_estimada: number | null
          id: string
          link_to: string | null
          points_gain: number | null
          priority: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          action_code: string
          action_description?: string | null
          action_title: string
          created_at?: string | null
          economia_estimada?: number | null
          id?: string
          link_to?: string | null
          points_gain?: number | null
          priority?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          action_code?: string
          action_description?: string | null
          action_title?: string
          created_at?: string | null
          economia_estimada?: number | null
          id?: string
          link_to?: string | null
          points_gain?: number | null
          priority?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sector_benchmarks: {
        Row: {
          avg_ebitda_margin: number | null
          avg_margem_bruta: number | null
          avg_margem_liquida: number | null
          avg_margem_operacional: number | null
          avg_score: number | null
          cnae_code: string
          cnae_description: string | null
          company_size: string | null
          created_at: string | null
          id: string
          score_percentile_data: Json | null
          sector_name: string
          source: string | null
          typical_custo_aluguel_percent: number | null
          typical_custo_folha_percent: number | null
          year: number | null
        }
        Insert: {
          avg_ebitda_margin?: number | null
          avg_margem_bruta?: number | null
          avg_margem_liquida?: number | null
          avg_margem_operacional?: number | null
          avg_score?: number | null
          cnae_code: string
          cnae_description?: string | null
          company_size?: string | null
          created_at?: string | null
          id?: string
          score_percentile_data?: Json | null
          sector_name: string
          source?: string | null
          typical_custo_aluguel_percent?: number | null
          typical_custo_folha_percent?: number | null
          year?: number | null
        }
        Update: {
          avg_ebitda_margin?: number | null
          avg_margem_bruta?: number | null
          avg_margem_liquida?: number | null
          avg_margem_operacional?: number | null
          avg_score?: number | null
          cnae_code?: string
          cnae_description?: string | null
          company_size?: string | null
          created_at?: string | null
          id?: string
          score_percentile_data?: Json | null
          sector_name?: string
          source?: string | null
          typical_custo_aluguel_percent?: number | null
          typical_custo_folha_percent?: number | null
          year?: number | null
        }
        Relationships: []
      }
      simulations: {
        Row: {
          calculator_slug: string
          created_at: string | null
          id: string
          inputs: Json
          outputs: Json
          user_id: string
        }
        Insert: {
          calculator_slug: string
          created_at?: string | null
          id?: string
          inputs: Json
          outputs: Json
          user_id: string
        }
        Update: {
          calculator_slug?: string
          created_at?: string | null
          id?: string
          inputs?: Json
          outputs?: Json
          user_id?: string
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tax_calculations: {
        Row: {
          created_at: string
          has_simulated_data: boolean | null
          id: string
          input_data: Json
          items_count: number | null
          municipio_codigo: number | null
          municipio_nome: string | null
          result_data: Json | null
          total_cbs: number | null
          total_geral: number | null
          total_ibs_mun: number | null
          total_ibs_uf: number | null
          total_is: number | null
          uf: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          has_simulated_data?: boolean | null
          id?: string
          input_data: Json
          items_count?: number | null
          municipio_codigo?: number | null
          municipio_nome?: string | null
          result_data?: Json | null
          total_cbs?: number | null
          total_geral?: number | null
          total_ibs_mun?: number | null
          total_ibs_uf?: number | null
          total_is?: number | null
          uf?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          has_simulated_data?: boolean | null
          id?: string
          input_data?: Json
          items_count?: number | null
          municipio_codigo?: number | null
          municipio_nome?: string | null
          result_data?: Json | null
          total_cbs?: number | null
          total_geral?: number | null
          total_ibs_mun?: number | null
          total_ibs_uf?: number | null
          total_is?: number | null
          uf?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_opportunities: {
        Row: {
          base_legal: string | null
          base_legal_resumo: string | null
          casos_sucesso: Json | null
          category: string | null
          code: string
          complexidade: string | null
          created_at: string | null
          criterios: Json
          criterios_obrigatorios: Json | null
          criterios_pontuacao: Json | null
          descricao_lc_224_2025: string | null
          descricao_reforma: string | null
          description: string | null
          description_ceo: string | null
          destaque: boolean | null
          economia_base: string | null
          economia_descricao_simples: string | null
          economia_percentual_max: number | null
          economia_percentual_min: number | null
          economia_tipo: string | null
          exemplo_pratico: string | null
          faq: Json | null
          futuro_reforma: string | null
          id: string
          is_active: boolean | null
          link_legislacao: string | null
          name: string
          name_simples: string
          novo: boolean | null
          requer_advogado: boolean | null
          requer_certificacao: boolean | null
          requer_contador: boolean | null
          requer_sistema: boolean | null
          risco_descricao: string | null
          risco_fiscal: string | null
          status_lc_224_2025: string | null
          subcategory: string | null
          tempo_implementacao: string | null
          tempo_retorno: string | null
          tipo_tributo: string | null
          tributos_afetados: string[] | null
          updated_at: string | null
          validade_ate: string | null
        }
        Insert: {
          base_legal?: string | null
          base_legal_resumo?: string | null
          casos_sucesso?: Json | null
          category?: string | null
          code: string
          complexidade?: string | null
          created_at?: string | null
          criterios?: Json
          criterios_obrigatorios?: Json | null
          criterios_pontuacao?: Json | null
          descricao_lc_224_2025?: string | null
          descricao_reforma?: string | null
          description?: string | null
          description_ceo?: string | null
          destaque?: boolean | null
          economia_base?: string | null
          economia_descricao_simples?: string | null
          economia_percentual_max?: number | null
          economia_percentual_min?: number | null
          economia_tipo?: string | null
          exemplo_pratico?: string | null
          faq?: Json | null
          futuro_reforma?: string | null
          id?: string
          is_active?: boolean | null
          link_legislacao?: string | null
          name: string
          name_simples: string
          novo?: boolean | null
          requer_advogado?: boolean | null
          requer_certificacao?: boolean | null
          requer_contador?: boolean | null
          requer_sistema?: boolean | null
          risco_descricao?: string | null
          risco_fiscal?: string | null
          status_lc_224_2025?: string | null
          subcategory?: string | null
          tempo_implementacao?: string | null
          tempo_retorno?: string | null
          tipo_tributo?: string | null
          tributos_afetados?: string[] | null
          updated_at?: string | null
          validade_ate?: string | null
        }
        Update: {
          base_legal?: string | null
          base_legal_resumo?: string | null
          casos_sucesso?: Json | null
          category?: string | null
          code?: string
          complexidade?: string | null
          created_at?: string | null
          criterios?: Json
          criterios_obrigatorios?: Json | null
          criterios_pontuacao?: Json | null
          descricao_lc_224_2025?: string | null
          descricao_reforma?: string | null
          description?: string | null
          description_ceo?: string | null
          destaque?: boolean | null
          economia_base?: string | null
          economia_descricao_simples?: string | null
          economia_percentual_max?: number | null
          economia_percentual_min?: number | null
          economia_tipo?: string | null
          exemplo_pratico?: string | null
          faq?: Json | null
          futuro_reforma?: string | null
          id?: string
          is_active?: boolean | null
          link_legislacao?: string | null
          name?: string
          name_simples?: string
          novo?: boolean | null
          requer_advogado?: boolean | null
          requer_certificacao?: boolean | null
          requer_contador?: boolean | null
          requer_sistema?: boolean | null
          risco_descricao?: string | null
          risco_fiscal?: string | null
          status_lc_224_2025?: string | null
          subcategory?: string | null
          tempo_implementacao?: string | null
          tempo_retorno?: string | null
          tipo_tributo?: string | null
          tributos_afetados?: string[] | null
          updated_at?: string | null
          validade_ate?: string | null
        }
        Relationships: []
      }
      tax_score: {
        Row: {
          auto_comparativo_realizado: boolean | null
          auto_creditos_identificados: number | null
          auto_dre_preenchido: boolean | null
          auto_regime_tributario: string | null
          auto_xmls_importados: number | null
          auto_xmls_periodo_fim: string | null
          auto_xmls_periodo_inicio: string | null
          calculated_at: string | null
          cards_completos: number | null
          cards_total: number | null
          created_at: string | null
          creditos_nao_aproveitados: number | null
          economia_potencial: number | null
          id: string
          resp_certidoes: string | null
          resp_conhece_carga_tributaria: boolean | null
          resp_conhece_receita_sintonia: boolean | null
          resp_controles: string | null
          resp_debitos_abertos: string | null
          resp_documentacao_pronta: boolean | null
          resp_faturamento_faixa: string | null
          resp_nota_receita_sintonia: string | null
          resp_obrigacoes: string | null
          resp_preparando_reforma: boolean | null
          resp_recebeu_notificacao: boolean | null
          resp_situacao_fiscal: string | null
          resp_surpresas_tributarias: boolean | null
          resp_tempo_reunir_docs: string | null
          risco_autuacao: number | null
          score_conformidade: number | null
          score_documentacao: number | null
          score_eficiencia: number | null
          score_gestao: number | null
          score_grade: string | null
          score_risco: number | null
          score_status: string | null
          score_total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_comparativo_realizado?: boolean | null
          auto_creditos_identificados?: number | null
          auto_dre_preenchido?: boolean | null
          auto_regime_tributario?: string | null
          auto_xmls_importados?: number | null
          auto_xmls_periodo_fim?: string | null
          auto_xmls_periodo_inicio?: string | null
          calculated_at?: string | null
          cards_completos?: number | null
          cards_total?: number | null
          created_at?: string | null
          creditos_nao_aproveitados?: number | null
          economia_potencial?: number | null
          id?: string
          resp_certidoes?: string | null
          resp_conhece_carga_tributaria?: boolean | null
          resp_conhece_receita_sintonia?: boolean | null
          resp_controles?: string | null
          resp_debitos_abertos?: string | null
          resp_documentacao_pronta?: boolean | null
          resp_faturamento_faixa?: string | null
          resp_nota_receita_sintonia?: string | null
          resp_obrigacoes?: string | null
          resp_preparando_reforma?: boolean | null
          resp_recebeu_notificacao?: boolean | null
          resp_situacao_fiscal?: string | null
          resp_surpresas_tributarias?: boolean | null
          resp_tempo_reunir_docs?: string | null
          risco_autuacao?: number | null
          score_conformidade?: number | null
          score_documentacao?: number | null
          score_eficiencia?: number | null
          score_gestao?: number | null
          score_grade?: string | null
          score_risco?: number | null
          score_status?: string | null
          score_total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_comparativo_realizado?: boolean | null
          auto_creditos_identificados?: number | null
          auto_dre_preenchido?: boolean | null
          auto_regime_tributario?: string | null
          auto_xmls_importados?: number | null
          auto_xmls_periodo_fim?: string | null
          auto_xmls_periodo_inicio?: string | null
          calculated_at?: string | null
          cards_completos?: number | null
          cards_total?: number | null
          created_at?: string | null
          creditos_nao_aproveitados?: number | null
          economia_potencial?: number | null
          id?: string
          resp_certidoes?: string | null
          resp_conhece_carga_tributaria?: boolean | null
          resp_conhece_receita_sintonia?: boolean | null
          resp_controles?: string | null
          resp_debitos_abertos?: string | null
          resp_documentacao_pronta?: boolean | null
          resp_faturamento_faixa?: string | null
          resp_nota_receita_sintonia?: string | null
          resp_obrigacoes?: string | null
          resp_preparando_reforma?: boolean | null
          resp_recebeu_notificacao?: boolean | null
          resp_situacao_fiscal?: string | null
          resp_surpresas_tributarias?: boolean | null
          resp_tempo_reunir_docs?: string | null
          risco_autuacao?: number | null
          score_conformidade?: number | null
          score_documentacao?: number | null
          score_eficiencia?: number | null
          score_gestao?: number | null
          score_grade?: string | null
          score_risco?: number | null
          score_status?: string | null
          score_total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_score_history: {
        Row: {
          calculated_at: string | null
          id: string
          score_conformidade: number | null
          score_documentacao: number | null
          score_eficiencia: number | null
          score_gestao: number | null
          score_grade: string
          score_risco: number | null
          score_total: number
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          score_conformidade?: number | null
          score_documentacao?: number | null
          score_eficiencia?: number | null
          score_gestao?: number | null
          score_grade: string
          score_risco?: number | null
          score_total: number
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          id?: string
          score_conformidade?: number | null
          score_documentacao?: number | null
          score_eficiencia?: number | null
          score_gestao?: number | null
          score_grade?: string
          score_risco?: number | null
          score_total?: number
          user_id?: string
        }
        Relationships: []
      }
      tributbot_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          purchase_count: number
          total_purchased: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          purchase_count?: number
          total_purchased?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          purchase_count?: number
          total_purchased?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_progress: {
        Row: {
          completed_at: string | null
          completed_steps: string[]
          current_step_index: number
          id: string
          started_at: string
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[]
          current_step_index?: number
          id?: string
          started_at?: string
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[]
          current_step_index?: number
          id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      xml_analysis: {
        Row: {
          analysis_data: Json | null
          created_at: string
          current_tax_total: number | null
          current_taxes: Json | null
          difference_percent: number | null
          difference_value: number | null
          document_number: string | null
          document_series: string | null
          document_total: number | null
          id: string
          import_id: string | null
          issue_date: string | null
          issuer_cnpj: string | null
          issuer_name: string | null
          items_count: number | null
          raw_data: Json | null
          recipient_cnpj: string | null
          recipient_name: string | null
          reform_tax_total: number | null
          reform_taxes: Json | null
          user_id: string
          xml_type: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          current_tax_total?: number | null
          current_taxes?: Json | null
          difference_percent?: number | null
          difference_value?: number | null
          document_number?: string | null
          document_series?: string | null
          document_total?: number | null
          id?: string
          import_id?: string | null
          issue_date?: string | null
          issuer_cnpj?: string | null
          issuer_name?: string | null
          items_count?: number | null
          raw_data?: Json | null
          recipient_cnpj?: string | null
          recipient_name?: string | null
          reform_tax_total?: number | null
          reform_taxes?: Json | null
          user_id: string
          xml_type: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          current_tax_total?: number | null
          current_taxes?: Json | null
          difference_percent?: number | null
          difference_value?: number | null
          document_number?: string | null
          document_series?: string | null
          document_total?: number | null
          id?: string
          import_id?: string | null
          issue_date?: string | null
          issuer_cnpj?: string | null
          issuer_name?: string | null
          items_count?: number | null
          raw_data?: Json | null
          recipient_cnpj?: string | null
          recipient_name?: string | null
          reform_tax_total?: number | null
          reform_taxes?: Json | null
          user_id?: string
          xml_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "xml_analysis_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "xml_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      xml_imports: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          processed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_referral_count: {
        Args: { referrer_user_id: string }
        Returns: undefined
      }
      is_org_member: {
        Args: { _owner_id: string; _user_id: string }
        Returns: boolean
      }
      is_seat_owner: {
        Args: { _owner_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      erp_connection_status: "active" | "inactive" | "error" | "pending"
      erp_sync_status: "running" | "success" | "error" | "cancelled"
      erp_sync_type:
        | "nfe"
        | "nfse"
        | "produtos"
        | "financeiro"
        | "empresa"
        | "full"
      erp_type: "omie" | "bling" | "contaazul" | "tiny" | "sankhya" | "totvs"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      erp_connection_status: ["active", "inactive", "error", "pending"],
      erp_sync_status: ["running", "success", "error", "cancelled"],
      erp_sync_type: [
        "nfe",
        "nfse",
        "produtos",
        "financeiro",
        "empresa",
        "full",
      ],
      erp_type: ["omie", "bling", "contaazul", "tiny", "sankhya", "totvs"],
    },
  },
} as const
