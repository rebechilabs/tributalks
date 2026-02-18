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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
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
      clara_agents: {
        Row: {
          agent_type: string
          capabilities: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          priority_rules: Json | null
          status: string
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          capabilities?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          priority_rules?: Json | null
          status?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          capabilities?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          priority_rules?: Json | null
          status?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clara_autonomous_actions: {
        Row: {
          action_payload: Json
          action_type: string
          agent_id: string | null
          agent_type: string
          created_at: string | null
          executed_at: string | null
          expires_at: string | null
          id: string
          priority: string | null
          requires_approval: boolean | null
          result: Json | null
          status: string
          trigger_data: Json | null
          trigger_event: string
          user_id: string
        }
        Insert: {
          action_payload: Json
          action_type: string
          agent_id?: string | null
          agent_type: string
          created_at?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          requires_approval?: boolean | null
          result?: Json | null
          status?: string
          trigger_data?: Json | null
          trigger_event: string
          user_id: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          agent_id?: string | null
          agent_type?: string
          created_at?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          requires_approval?: boolean | null
          result?: Json | null
          status?: string
          trigger_data?: Json | null
          trigger_event?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clara_autonomous_actions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "clara_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      clara_cache: {
        Row: {
          category: string
          created_at: string | null
          hit_count: number | null
          id: string
          model_used: string | null
          query_hash: string
          query_normalized: string
          requires_validation: boolean | null
          response: string
          tokens_saved: number | null
          ttl_days: number
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          model_used?: string | null
          query_hash: string
          query_normalized: string
          requires_validation?: boolean | null
          response: string
          tokens_saved?: number | null
          ttl_days?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          hit_count?: number | null
          id?: string
          model_used?: string | null
          query_hash?: string
          query_normalized?: string
          requires_validation?: boolean | null
          response?: string
          tokens_saved?: number | null
          ttl_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      clara_conversations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          screen_context: string | null
          session_id: string
          tokens_used: number | null
          tools_used: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          screen_context?: string | null
          session_id: string
          tokens_used?: number | null
          tools_used?: string[] | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          screen_context?: string | null
          session_id?: string
          tokens_used?: number | null
          tools_used?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      clara_embeddings_cache: {
        Row: {
          content_hash: string
          content_preview: string | null
          created_at: string | null
          embedding: string
          id: string
          model: string | null
          tokens_used: number | null
        }
        Insert: {
          content_hash: string
          content_preview?: string | null
          created_at?: string | null
          embedding: string
          id?: string
          model?: string | null
          tokens_used?: number | null
        }
        Update: {
          content_hash?: string
          content_preview?: string | null
          created_at?: string | null
          embedding?: string
          id?: string
          model?: string | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      clara_feedback: {
        Row: {
          category: string | null
          context_screen: string | null
          conversation_id: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          message_content: string
          metadata: Json | null
          model_used: string | null
          rating: string
          response_content: string
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          context_screen?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_content: string
          metadata?: Json | null
          model_used?: string | null
          rating: string
          response_content: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          context_screen?: string | null
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_content?: string
          metadata?: Json | null
          model_used?: string | null
          rating?: string
          response_content?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clara_insights: {
        Row: {
          acted_at: string | null
          action_cta: string | null
          action_route: string | null
          created_at: string | null
          description: string
          dismissed_at: string | null
          expires_at: string | null
          id: string
          insight_type: string
          priority: string
          source_data: Json | null
          title: string
          trigger_condition: string | null
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          action_cta?: string | null
          action_route?: string | null
          created_at?: string | null
          description: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          priority?: string
          source_data?: Json | null
          title: string
          trigger_condition?: string | null
          user_id: string
        }
        Update: {
          acted_at?: string | null
          action_cta?: string | null
          action_route?: string | null
          created_at?: string | null
          description?: string
          dismissed_at?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          priority?: string
          source_data?: Json | null
          title?: string
          trigger_condition?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clara_knowledge_base: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          embedded_at: string | null
          embedding: string | null
          embedding_model: string | null
          full_content: string | null
          id: string
          legal_basis: string | null
          must_not_say: string[] | null
          must_say: string[] | null
          priority: number
          slug: string
          source_url: string | null
          status: string
          summary: string
          title: string
          trigger_keywords: string[]
          trigger_regimes: string[] | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          full_content?: string | null
          id?: string
          legal_basis?: string | null
          must_not_say?: string[] | null
          must_say?: string[] | null
          priority?: number
          slug: string
          source_url?: string | null
          status?: string
          summary: string
          title: string
          trigger_keywords?: string[]
          trigger_regimes?: string[] | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          full_content?: string | null
          id?: string
          legal_basis?: string | null
          must_not_say?: string[] | null
          must_say?: string[] | null
          priority?: number
          slug?: string
          source_url?: string | null
          status?: string
          summary?: string
          title?: string
          trigger_keywords?: string[]
          trigger_regimes?: string[] | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      clara_learned_patterns: {
        Row: {
          confidence: number | null
          created_at: string | null
          decay_rate: number | null
          embedded_at: string | null
          embedding: string | null
          embedding_model: string | null
          id: string
          last_observed_at: string | null
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          times_observed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          decay_rate?: number | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          last_observed_at?: string | null
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          times_observed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          decay_rate?: number | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          last_observed_at?: string | null
          pattern_key?: string
          pattern_type?: string
          pattern_value?: Json
          times_observed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clara_memory: {
        Row: {
          category: string
          confidence_score: number | null
          content: string
          created_at: string | null
          decision_context: string | null
          embedded_at: string | null
          embedding: string | null
          embedding_model: string | null
          expires_at: string | null
          id: string
          importance: number
          last_used_at: string | null
          learned_pattern: Json | null
          memory_type: string
          metadata: Json | null
          source_conversation_id: string | null
          source_screen: string | null
          times_reinforced: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          confidence_score?: number | null
          content: string
          created_at?: string | null
          decision_context?: string | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          last_used_at?: string | null
          learned_pattern?: Json | null
          memory_type?: string
          metadata?: Json | null
          source_conversation_id?: string | null
          source_screen?: string | null
          times_reinforced?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          decision_context?: string | null
          embedded_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          last_used_at?: string | null
          learned_pattern?: Json | null
          memory_type?: string
          metadata?: Json | null
          source_conversation_id?: string | null
          source_screen?: string | null
          times_reinforced?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clara_prompt_configs: {
        Row: {
          config_key: string
          config_type: string
          content: Json
          created_at: string | null
          id: string
          priority: number | null
          status: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          config_key: string
          config_type: string
          content: Json
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          config_key?: string
          config_type?: string
          content?: Json
          created_at?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      clara_roadmaps: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          data_signals: Json | null
          decision_style: string | null
          effectiveness_score: number | null
          estimated_total_time: number | null
          feedback_text: string | null
          id: string
          model_used: string | null
          session_date: string
          session_goal: string | null
          skipped_steps: string[] | null
          steps: Json | null
          time_available: string | null
          time_spent: number | null
          updated_at: string | null
          urgent_concern: string | null
          user_feedback: string | null
          user_id: string
          user_priority: string | null
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          data_signals?: Json | null
          decision_style?: string | null
          effectiveness_score?: number | null
          estimated_total_time?: number | null
          feedback_text?: string | null
          id?: string
          model_used?: string | null
          session_date?: string
          session_goal?: string | null
          skipped_steps?: string[] | null
          steps?: Json | null
          time_available?: string | null
          time_spent?: number | null
          updated_at?: string | null
          urgent_concern?: string | null
          user_feedback?: string | null
          user_id: string
          user_priority?: string | null
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          data_signals?: Json | null
          decision_style?: string | null
          effectiveness_score?: number | null
          estimated_total_time?: number | null
          feedback_text?: string | null
          id?: string
          model_used?: string | null
          session_date?: string
          session_goal?: string | null
          skipped_steps?: string[] | null
          steps?: Json | null
          time_available?: string | null
          time_spent?: number | null
          updated_at?: string | null
          urgent_concern?: string | null
          user_feedback?: string | null
          user_id?: string
          user_priority?: string | null
        }
        Relationships: []
      }
      clara_user_decisions: {
        Row: {
          agent_type: string | null
          context: Json
          created_at: string | null
          decision_type: string
          id: string
          option_chosen: string | null
          options_presented: Json | null
          outcome_feedback: string | null
          user_id: string
        }
        Insert: {
          agent_type?: string | null
          context: Json
          created_at?: string | null
          decision_type: string
          id?: string
          option_chosen?: string | null
          options_presented?: Json | null
          outcome_feedback?: string | null
          user_id: string
        }
        Update: {
          agent_type?: string | null
          context?: Json
          created_at?: string | null
          decision_type?: string
          id?: string
          option_chosen?: string | null
          options_presented?: Json | null
          outcome_feedback?: string | null
          user_id?: string
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
          period_month: number
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
          period_month?: number
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
          period_month?: number
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
          compras_insumos_mensal: number | null
          created_at: string | null
          cursos_livres: boolean | null
          dados_financeiros_atualizados_em: string | null
          dados_financeiros_origem: string | null
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
          is_active: boolean | null
          laboratorio: boolean | null
          margem_bruta_percentual: number | null
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
          prolabore_mensal: number | null
          qtd_cnpjs: number | null
          qtd_filiais: number | null
          razao_social: string | null
          recebe_gorjetas: boolean | null
          receita_liquida_mensal: number | null
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
          compras_insumos_mensal?: number | null
          created_at?: string | null
          cursos_livres?: boolean | null
          dados_financeiros_atualizados_em?: string | null
          dados_financeiros_origem?: string | null
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
          is_active?: boolean | null
          laboratorio?: boolean | null
          margem_bruta_percentual?: number | null
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
          prolabore_mensal?: number | null
          qtd_cnpjs?: number | null
          qtd_filiais?: number | null
          razao_social?: string | null
          recebe_gorjetas?: boolean | null
          receita_liquida_mensal?: number | null
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
          compras_insumos_mensal?: number | null
          created_at?: string | null
          cursos_livres?: boolean | null
          dados_financeiros_atualizados_em?: string | null
          dados_financeiros_origem?: string | null
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
          is_active?: boolean | null
          laboratorio?: boolean | null
          margem_bruta_percentual?: number | null
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
          prolabore_mensal?: number | null
          qtd_cnpjs?: number | null
          qtd_filiais?: number | null
          razao_social?: string | null
          recebe_gorjetas?: boolean | null
          receita_liquida_mensal?: number | null
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
      connect_applications: {
        Row: {
          cargo: string
          created_at: string
          email: string
          empresa: string | null
          id: string
          nome: string
          setor: string
          status: string
          updated_at: string
        }
        Insert: {
          cargo: string
          created_at?: string
          email: string
          empresa?: string | null
          id?: string
          nome: string
          setor: string
          status?: string
          updated_at?: string
        }
        Update: {
          cargo?: string
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          nome?: string
          setor?: string
          status?: string
          updated_at?: string
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
      dctf_debitos: {
        Row: {
          codigo_receita: string
          created_at: string | null
          credito_vinculado: number | null
          dctf_id: string
          descricao_tributo: string | null
          id: string
          pagamento_vinculado: number | null
          periodo_apuracao: string | null
          saldo_devedor: number | null
          status_quitacao: string | null
          user_id: string
          valor_juros: number | null
          valor_multa: number | null
          valor_principal: number | null
          valor_total: number | null
        }
        Insert: {
          codigo_receita: string
          created_at?: string | null
          credito_vinculado?: number | null
          dctf_id: string
          descricao_tributo?: string | null
          id?: string
          pagamento_vinculado?: number | null
          periodo_apuracao?: string | null
          saldo_devedor?: number | null
          status_quitacao?: string | null
          user_id: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Update: {
          codigo_receita?: string
          created_at?: string | null
          credito_vinculado?: number | null
          dctf_id?: string
          descricao_tributo?: string | null
          id?: string
          pagamento_vinculado?: number | null
          periodo_apuracao?: string | null
          saldo_devedor?: number | null
          status_quitacao?: string | null
          user_id?: string
          valor_juros?: number | null
          valor_multa?: number | null
          valor_principal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dctf_debitos_dctf_id_fkey"
            columns: ["dctf_id"]
            isOneToOne: false
            referencedRelation: "dctf_declaracoes"
            referencedColumns: ["id"]
          },
        ]
      }
      dctf_declaracoes: {
        Row: {
          ano_calendario: number
          arquivo_nome: string | null
          cnpj: string
          created_at: string | null
          gap_identificado: number | null
          id: string
          mes_referencia: number | null
          periodo_apuracao: string
          razao_social: string | null
          retificadora: boolean | null
          status: string | null
          tipo_declaracao: string | null
          total_creditos_vinculados: number | null
          total_debitos_declarados: number | null
          total_pagamentos: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ano_calendario: number
          arquivo_nome?: string | null
          cnpj: string
          created_at?: string | null
          gap_identificado?: number | null
          id?: string
          mes_referencia?: number | null
          periodo_apuracao: string
          razao_social?: string | null
          retificadora?: boolean | null
          status?: string | null
          tipo_declaracao?: string | null
          total_creditos_vinculados?: number | null
          total_debitos_declarados?: number | null
          total_pagamentos?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ano_calendario?: number
          arquivo_nome?: string | null
          cnpj?: string
          created_at?: string | null
          gap_identificado?: number | null
          id?: string
          mes_referencia?: number | null
          periodo_apuracao?: string
          razao_social?: string | null
          retificadora?: boolean | null
          status?: string | null
          tipo_declaracao?: string | null
          total_creditos_vinculados?: number | null
          total_debitos_declarados?: number | null
          total_pagamentos?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          cashflow_impact_q2_2027: number | null
          cashflow_risk: string | null
          created_at: string | null
          credits_items: Json | null
          credits_total: number | null
          erp_connection_id: string | null
          expires_at: string | null
          id: string
          insights: Json | null
          margin_current: number | null
          margin_delta_pp: number | null
          margin_projected: number | null
          processing_time_ms: number | null
          source: string
          status: string
          updated_at: string | null
          user_id: string
          xmls_processed: number | null
        }
        Insert: {
          cashflow_impact_q2_2027?: number | null
          cashflow_risk?: string | null
          created_at?: string | null
          credits_items?: Json | null
          credits_total?: number | null
          erp_connection_id?: string | null
          expires_at?: string | null
          id?: string
          insights?: Json | null
          margin_current?: number | null
          margin_delta_pp?: number | null
          margin_projected?: number | null
          processing_time_ms?: number | null
          source?: string
          status?: string
          updated_at?: string | null
          user_id: string
          xmls_processed?: number | null
        }
        Update: {
          cashflow_impact_q2_2027?: number | null
          cashflow_risk?: string | null
          created_at?: string | null
          credits_items?: Json | null
          credits_total?: number | null
          erp_connection_id?: string | null
          expires_at?: string | null
          id?: string
          insights?: Json | null
          margin_current?: number | null
          margin_delta_pp?: number | null
          margin_projected?: number | null
          processing_time_ms?: number | null
          source?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          xmls_processed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_results_erp_connection_id_fkey"
            columns: ["erp_connection_id"]
            isOneToOne: false
            referencedRelation: "erp_connections"
            referencedColumns: ["id"]
          },
        ]
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
      fiscal_cross_analysis: {
        Row: {
          ano: number
          created_at: string | null
          dctf_cofins_declarado: number | null
          dctf_csll_declarado: number | null
          dctf_id: string | null
          dctf_irpj_declarado: number | null
          dctf_pis_declarado: number | null
          divergencia_cofins: number | null
          divergencia_pis: number | null
          divergencia_total: number | null
          id: string
          mes: number
          nivel_risco: string | null
          observacoes: string | null
          periodo_referencia: string
          sped_cofins_credito: number | null
          sped_cofins_debito: number | null
          sped_id: string | null
          sped_pis_credito: number | null
          sped_pis_debito: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string | null
          dctf_cofins_declarado?: number | null
          dctf_csll_declarado?: number | null
          dctf_id?: string | null
          dctf_irpj_declarado?: number | null
          dctf_pis_declarado?: number | null
          divergencia_cofins?: number | null
          divergencia_pis?: number | null
          divergencia_total?: number | null
          id?: string
          mes: number
          nivel_risco?: string | null
          observacoes?: string | null
          periodo_referencia: string
          sped_cofins_credito?: number | null
          sped_cofins_debito?: number | null
          sped_id?: string | null
          sped_pis_credito?: number | null
          sped_pis_debito?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string | null
          dctf_cofins_declarado?: number | null
          dctf_csll_declarado?: number | null
          dctf_id?: string | null
          dctf_irpj_declarado?: number | null
          dctf_pis_declarado?: number | null
          divergencia_cofins?: number | null
          divergencia_pis?: number | null
          divergencia_total?: number | null
          id?: string
          mes?: number
          nivel_risco?: string | null
          observacoes?: string | null
          periodo_referencia?: string
          sped_cofins_credito?: number | null
          sped_cofins_debito?: number | null
          sped_id?: string | null
          sped_pis_credito?: number | null
          sped_pis_debito?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_cross_analysis_dctf_id_fkey"
            columns: ["dctf_id"]
            isOneToOne: false
            referencedRelation: "dctf_declaracoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_cross_analysis_sped_id_fkey"
            columns: ["sped_id"]
            isOneToOne: false
            referencedRelation: "sped_contribuicoes"
            referencedColumns: ["id"]
          },
        ]
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
      identified_credits_archive: {
        Row: {
          archived_at: string
          archived_reason: string
          cfop: string | null
          confidence_level: string | null
          confidence_score: number | null
          credit_not_used: number | null
          cst: string | null
          id: string
          ncm_code: string | null
          nfe_date: string | null
          nfe_key: string | null
          nfe_number: string | null
          original_created_at: string | null
          original_credit_id: string
          original_tax_value: number | null
          potential_recovery: number | null
          product_description: string | null
          rule_id: string | null
          status: string | null
          supplier_cnpj: string | null
          supplier_name: string | null
          user_id: string
          xml_import_id: string | null
        }
        Insert: {
          archived_at?: string
          archived_reason?: string
          cfop?: string | null
          confidence_level?: string | null
          confidence_score?: number | null
          credit_not_used?: number | null
          cst?: string | null
          id?: string
          ncm_code?: string | null
          nfe_date?: string | null
          nfe_key?: string | null
          nfe_number?: string | null
          original_created_at?: string | null
          original_credit_id: string
          original_tax_value?: number | null
          potential_recovery?: number | null
          product_description?: string | null
          rule_id?: string | null
          status?: string | null
          supplier_cnpj?: string | null
          supplier_name?: string | null
          user_id: string
          xml_import_id?: string | null
        }
        Update: {
          archived_at?: string
          archived_reason?: string
          cfop?: string | null
          confidence_level?: string | null
          confidence_score?: number | null
          credit_not_used?: number | null
          cst?: string | null
          id?: string
          ncm_code?: string | null
          nfe_date?: string | null
          nfe_key?: string | null
          nfe_number?: string | null
          original_created_at?: string | null
          original_credit_id?: string
          original_tax_value?: number | null
          potential_recovery?: number | null
          product_description?: string | null
          rule_id?: string | null
          status?: string | null
          supplier_cnpj?: string | null
          supplier_name?: string | null
          user_id?: string
          xml_import_id?: string | null
        }
        Relationships: []
      }
      margin_dashboard: {
        Row: {
          created_at: string | null
          economia_potencial_renegociacao: number | null
          fornecedores_analisados: number | null
          fornecedores_criticos: number | null
          gap_competitivo_medio: number | null
          gap_credito_total: number | null
          id: string
          impacto_ebitda_anual_max: number | null
          impacto_ebitda_anual_min: number | null
          periodo_referencia: string
          risco_perda_margem: number | null
          score_prontidao: number | null
          skus_simulados: number | null
          total_compras_analisado: number | null
          updated_at: string | null
          user_id: string
          variacao_media_preco: number | null
        }
        Insert: {
          created_at?: string | null
          economia_potencial_renegociacao?: number | null
          fornecedores_analisados?: number | null
          fornecedores_criticos?: number | null
          gap_competitivo_medio?: number | null
          gap_credito_total?: number | null
          id?: string
          impacto_ebitda_anual_max?: number | null
          impacto_ebitda_anual_min?: number | null
          periodo_referencia: string
          risco_perda_margem?: number | null
          score_prontidao?: number | null
          skus_simulados?: number | null
          total_compras_analisado?: number | null
          updated_at?: string | null
          user_id: string
          variacao_media_preco?: number | null
        }
        Update: {
          created_at?: string | null
          economia_potencial_renegociacao?: number | null
          fornecedores_analisados?: number | null
          fornecedores_criticos?: number | null
          gap_competitivo_medio?: number | null
          gap_credito_total?: number | null
          id?: string
          impacto_ebitda_anual_max?: number | null
          impacto_ebitda_anual_min?: number | null
          periodo_referencia?: string
          risco_perda_margem?: number | null
          score_prontidao?: number | null
          skus_simulados?: number | null
          total_compras_analisado?: number | null
          updated_at?: string | null
          user_id?: string
          variacao_media_preco?: number | null
        }
        Relationships: []
      }
      monophasic_ncms: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          is_active: boolean | null
          legal_basis: string
          ncm_prefix: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          legal_basis: string
          ncm_prefix: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          legal_basis?: string
          ncm_prefix?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
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
      pending_plan_grants: {
        Row: {
          applied_at: string | null
          applied_to_user_id: string | null
          created_at: string | null
          email: string
          id: string
          plano: string
          plano_expires_at: string
        }
        Insert: {
          applied_at?: string | null
          applied_to_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          plano?: string
          plano_expires_at: string
        }
        Update: {
          applied_at?: string | null
          applied_to_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          plano?: string
          plano_expires_at?: string
        }
        Relationships: []
      }
      pgdas_arquivos: {
        Row: {
          aliquota_efetiva: number | null
          anexo_simples: string | null
          arquivo_nome: string
          arquivo_storage_path: string | null
          cnpj: string | null
          created_at: string | null
          dados_completos: Json | null
          erro_mensagem: string | null
          id: string
          periodo_apuracao: string | null
          razao_social: string | null
          receita_bruta: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          valor_devido: number | null
        }
        Insert: {
          aliquota_efetiva?: number | null
          anexo_simples?: string | null
          arquivo_nome: string
          arquivo_storage_path?: string | null
          cnpj?: string | null
          created_at?: string | null
          dados_completos?: Json | null
          erro_mensagem?: string | null
          id?: string
          periodo_apuracao?: string | null
          razao_social?: string | null
          receita_bruta?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          valor_devido?: number | null
        }
        Update: {
          aliquota_efetiva?: number | null
          anexo_simples?: string | null
          arquivo_nome?: string
          arquivo_storage_path?: string | null
          cnpj?: string | null
          created_at?: string | null
          dados_completos?: Json | null
          erro_mensagem?: string | null
          id?: string
          periodo_apuracao?: string | null
          razao_social?: string | null
          receita_bruta?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          valor_devido?: number | null
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
      price_simulations: {
        Row: {
          aliquota_cbs: number | null
          aliquota_ibs_mun: number | null
          aliquota_ibs_uf: number | null
          aliquota_icms: number | null
          aliquota_ipi: number | null
          aliquota_is: number | null
          aliquota_iss: number | null
          aliquota_pis_cofins: number | null
          cenario_otimista: Json | null
          cenario_pessimista: Json | null
          created_at: string | null
          credito_fonte: string | null
          credito_insumo_estimado: number | null
          custo_unitario: number | null
          data_quality: string | null
          despesa_proporcional: number | null
          gap_competitivo_percent: number | null
          id: string
          lucro_unitario_2026: number | null
          lucro_unitario_atual: number | null
          margem_2026_mantida: number | null
          margem_atual_percent: number | null
          municipio_codigo: number | null
          municipio_nome: string | null
          nbs_code: string | null
          ncm_code: string | null
          preco_2026_necessario: number | null
          preco_atual: number | null
          preco_concorrente: number | null
          product_name: string
          recomendacao: string | null
          simulation_batch_id: string | null
          sku_code: string | null
          uf: string | null
          updated_at: string | null
          user_id: string
          variacao_preco_percent: number | null
          volume_mensal: number | null
        }
        Insert: {
          aliquota_cbs?: number | null
          aliquota_ibs_mun?: number | null
          aliquota_ibs_uf?: number | null
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          aliquota_is?: number | null
          aliquota_iss?: number | null
          aliquota_pis_cofins?: number | null
          cenario_otimista?: Json | null
          cenario_pessimista?: Json | null
          created_at?: string | null
          credito_fonte?: string | null
          credito_insumo_estimado?: number | null
          custo_unitario?: number | null
          data_quality?: string | null
          despesa_proporcional?: number | null
          gap_competitivo_percent?: number | null
          id?: string
          lucro_unitario_2026?: number | null
          lucro_unitario_atual?: number | null
          margem_2026_mantida?: number | null
          margem_atual_percent?: number | null
          municipio_codigo?: number | null
          municipio_nome?: string | null
          nbs_code?: string | null
          ncm_code?: string | null
          preco_2026_necessario?: number | null
          preco_atual?: number | null
          preco_concorrente?: number | null
          product_name: string
          recomendacao?: string | null
          simulation_batch_id?: string | null
          sku_code?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id: string
          variacao_preco_percent?: number | null
          volume_mensal?: number | null
        }
        Update: {
          aliquota_cbs?: number | null
          aliquota_ibs_mun?: number | null
          aliquota_ibs_uf?: number | null
          aliquota_icms?: number | null
          aliquota_ipi?: number | null
          aliquota_is?: number | null
          aliquota_iss?: number | null
          aliquota_pis_cofins?: number | null
          cenario_otimista?: Json | null
          cenario_pessimista?: Json | null
          created_at?: string | null
          credito_fonte?: string | null
          credito_insumo_estimado?: number | null
          custo_unitario?: number | null
          data_quality?: string | null
          despesa_proporcional?: number | null
          gap_competitivo_percent?: number | null
          id?: string
          lucro_unitario_2026?: number | null
          lucro_unitario_atual?: number | null
          margem_2026_mantida?: number | null
          margem_atual_percent?: number | null
          municipio_codigo?: number | null
          municipio_nome?: string | null
          nbs_code?: string | null
          ncm_code?: string | null
          preco_2026_necessario?: number | null
          preco_atual?: number | null
          preco_concorrente?: number | null
          product_name?: string
          recomendacao?: string | null
          simulation_batch_id?: string | null
          sku_code?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string
          variacao_preco_percent?: number | null
          volume_mensal?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          circle_invited_at: string | null
          circle_member_id: string | null
          city: string | null
          cnae: string | null
          country_code: string | null
          country_name: string | null
          created_at: string | null
          current_streak: number | null
          email: string | null
          empresa: string | null
          estado: string | null
          extra_seats_purchased: number | null
          faturamento_mensal: number | null
          id: string
          last_access_date: string | null
          last_seen_at: string | null
          longest_streak: number | null
          max_seats: number | null
          nome: string | null
          notif_consultorias: boolean | null
          notif_legislacao: boolean | null
          notif_novidades: boolean | null
          onboarding_complete: boolean | null
          percentual_vendas_pj: number | null
          plano: string | null
          plano_expires_at: string | null
          regime: string | null
          setor: string | null
          setup_complete: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_period_end: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
          welcome_seen: boolean | null
        }
        Insert: {
          circle_invited_at?: string | null
          circle_member_id?: string | null
          city?: string | null
          cnae?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          extra_seats_purchased?: number | null
          faturamento_mensal?: number | null
          id?: string
          last_access_date?: string | null
          last_seen_at?: string | null
          longest_streak?: number | null
          max_seats?: number | null
          nome?: string | null
          notif_consultorias?: boolean | null
          notif_legislacao?: boolean | null
          notif_novidades?: boolean | null
          onboarding_complete?: boolean | null
          percentual_vendas_pj?: number | null
          plano?: string | null
          plano_expires_at?: string | null
          regime?: string | null
          setor?: string | null
          setup_complete?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
          welcome_seen?: boolean | null
        }
        Update: {
          circle_invited_at?: string | null
          circle_member_id?: string | null
          city?: string | null
          cnae?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          extra_seats_purchased?: number | null
          faturamento_mensal?: number | null
          id?: string
          last_access_date?: string | null
          last_seen_at?: string | null
          longest_streak?: number | null
          max_seats?: number | null
          nome?: string | null
          notif_consultorias?: boolean | null
          notif_legislacao?: boolean | null
          notif_novidades?: boolean | null
          onboarding_complete?: boolean | null
          percentual_vendas_pj?: number | null
          plano?: string | null
          plano_expires_at?: string | null
          regime?: string | null
          setor?: string | null
          setup_complete?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_seen?: boolean | null
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
      rtc_rate_cache: {
        Row: {
          aliquota_cbs: number | null
          aliquota_ibs_mun: number | null
          aliquota_ibs_uf: number | null
          aliquota_is: number | null
          created_at: string | null
          expires_at: string | null
          fetched_at: string | null
          id: string
          municipio_ibge: number
          ncm: string
          uf: string
        }
        Insert: {
          aliquota_cbs?: number | null
          aliquota_ibs_mun?: number | null
          aliquota_ibs_uf?: number | null
          aliquota_is?: number | null
          created_at?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          municipio_ibge: number
          ncm: string
          uf: string
        }
        Update: {
          aliquota_cbs?: number | null
          aliquota_ibs_mun?: number | null
          aliquota_ibs_uf?: number | null
          aliquota_is?: number | null
          created_at?: string | null
          expires_at?: string | null
          fetched_at?: string | null
          id?: string
          municipio_ibge?: number
          ncm?: string
          uf?: string
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
      simples_tax_distribution: {
        Row: {
          aliquota_nominal: number
          anexo: string
          cofins: number
          cpp: number
          csll: number
          deducao: number
          faixa: number
          icms: number
          irpj: number
          iss: number
          pis: number
          receita_max: number
          receita_min: number
        }
        Insert: {
          aliquota_nominal: number
          anexo: string
          cofins: number
          cpp: number
          csll: number
          deducao?: number
          faixa: number
          icms?: number
          irpj: number
          iss?: number
          pis: number
          receita_max: number
          receita_min: number
        }
        Update: {
          aliquota_nominal?: number
          anexo?: string
          cofins?: number
          cpp?: number
          csll?: number
          deducao?: number
          faixa?: number
          icms?: number
          irpj?: number
          iss?: number
          pis?: number
          receita_max?: number
          receita_min?: number
        }
        Relationships: []
      }
      simpronto_simulations: {
        Row: {
          cnae_principal: string | null
          compras_insumos: number
          created_at: string | null
          despesas_operacionais: number | null
          economia_estimada: number | null
          faturamento_anual: number
          folha_pagamento: number
          id: string
          margem_lucro: number
          perfil_clientes: string
          regime_recomendado: string
          resultados: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cnae_principal?: string | null
          compras_insumos?: number
          created_at?: string | null
          despesas_operacionais?: number | null
          economia_estimada?: number | null
          faturamento_anual: number
          folha_pagamento?: number
          id?: string
          margem_lucro: number
          perfil_clientes: string
          regime_recomendado: string
          resultados: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cnae_principal?: string | null
          compras_insumos?: number
          created_at?: string | null
          despesas_operacionais?: number | null
          economia_estimada?: number | null
          faturamento_anual?: number
          folha_pagamento?: number
          id?: string
          margem_lucro?: number
          perfil_clientes?: string
          regime_recomendado?: string
          resultados?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          calculator_slug: string
          company_id: string | null
          created_at: string | null
          id: string
          inputs: Json
          outputs: Json
          user_id: string
        }
        Insert: {
          calculator_slug: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          inputs: Json
          outputs: Json
          user_id: string
        }
        Update: {
          calculator_slug?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          inputs?: Json
          outputs?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      sped_contribuicoes: {
        Row: {
          arquivo_nome: string | null
          arquivo_storage_path: string | null
          cnpj: string
          created_at: string | null
          erro_mensagem: string | null
          id: string
          periodo_fim: string
          periodo_inicio: string
          razao_social: string | null
          regime_apuracao: string | null
          registros_processados: number | null
          status: string | null
          tipo_escrituracao: string | null
          total_cofins_apurado: number | null
          total_credito_cofins: number | null
          total_credito_pis: number | null
          total_debito_cofins: number | null
          total_debito_pis: number | null
          total_pis_apurado: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_storage_path?: string | null
          cnpj: string
          created_at?: string | null
          erro_mensagem?: string | null
          id?: string
          periodo_fim: string
          periodo_inicio: string
          razao_social?: string | null
          regime_apuracao?: string | null
          registros_processados?: number | null
          status?: string | null
          tipo_escrituracao?: string | null
          total_cofins_apurado?: number | null
          total_credito_cofins?: number | null
          total_credito_pis?: number | null
          total_debito_cofins?: number | null
          total_debito_pis?: number | null
          total_pis_apurado?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_storage_path?: string | null
          cnpj?: string
          created_at?: string | null
          erro_mensagem?: string | null
          id?: string
          periodo_fim?: string
          periodo_inicio?: string
          razao_social?: string | null
          regime_apuracao?: string | null
          registros_processados?: number | null
          status?: string | null
          tipo_escrituracao?: string | null
          total_cofins_apurado?: number | null
          total_credito_cofins?: number | null
          total_credito_pis?: number | null
          total_debito_cofins?: number | null
          total_debito_pis?: number | null
          total_pis_apurado?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sped_contribuicoes_items: {
        Row: {
          aliquota: number | null
          base_calculo: number | null
          bloco: string | null
          created_at: string | null
          id: string
          natureza_credito: string | null
          observacao: string | null
          origem_credito: string | null
          potencial_recuperacao: number | null
          saldo_credito: number | null
          sped_id: string
          tipo_credito: string | null
          tipo_credito_descricao: string | null
          tipo_tributo: string
          user_id: string
          valor_credito: number | null
          valor_credito_utilizado: number | null
        }
        Insert: {
          aliquota?: number | null
          base_calculo?: number | null
          bloco?: string | null
          created_at?: string | null
          id?: string
          natureza_credito?: string | null
          observacao?: string | null
          origem_credito?: string | null
          potencial_recuperacao?: number | null
          saldo_credito?: number | null
          sped_id: string
          tipo_credito?: string | null
          tipo_credito_descricao?: string | null
          tipo_tributo: string
          user_id: string
          valor_credito?: number | null
          valor_credito_utilizado?: number | null
        }
        Update: {
          aliquota?: number | null
          base_calculo?: number | null
          bloco?: string | null
          created_at?: string | null
          id?: string
          natureza_credito?: string | null
          observacao?: string | null
          origem_credito?: string | null
          potencial_recuperacao?: number | null
          saldo_credito?: number | null
          sped_id?: string
          tipo_credito?: string | null
          tipo_credito_descricao?: string | null
          tipo_tributo?: string
          user_id?: string
          valor_credito?: number | null
          valor_credito_utilizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sped_contribuicoes_items_sped_id_fkey"
            columns: ["sped_id"]
            isOneToOne: false
            referencedRelation: "sped_contribuicoes"
            referencedColumns: ["id"]
          },
        ]
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
      supplier_analysis: {
        Row: {
          created_at: string | null
          credito_aproveitado_atual: number | null
          credito_potencial_2026: number | null
          custo_efetivo_liquido: number | null
          gap_credito: number | null
          id: string
          notas_analise: string | null
          periodo_fim: string
          periodo_inicio: string
          preco_indiferenca: number | null
          recomendacao: string | null
          status: string | null
          supplier_id: string
          updated_at: string | null
          user_id: string
          valor_nominal_total: number | null
          valor_tributos_pagos: number | null
        }
        Insert: {
          created_at?: string | null
          credito_aproveitado_atual?: number | null
          credito_potencial_2026?: number | null
          custo_efetivo_liquido?: number | null
          gap_credito?: number | null
          id?: string
          notas_analise?: string | null
          periodo_fim: string
          periodo_inicio: string
          preco_indiferenca?: number | null
          recomendacao?: string | null
          status?: string | null
          supplier_id: string
          updated_at?: string | null
          user_id: string
          valor_nominal_total?: number | null
          valor_tributos_pagos?: number | null
        }
        Update: {
          created_at?: string | null
          credito_aproveitado_atual?: number | null
          credito_potencial_2026?: number | null
          custo_efetivo_liquido?: number | null
          gap_credito?: number | null
          id?: string
          notas_analise?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          preco_indiferenca?: number | null
          recomendacao?: string | null
          status?: string | null
          supplier_id?: string
          updated_at?: string | null
          user_id?: string
          valor_nominal_total?: number | null
          valor_tributos_pagos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_analysis_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          aliquota_credito_estimada: number | null
          classificacao: string | null
          cnae_principal: string | null
          cnpj: string
          created_at: string | null
          custo_efetivo_score: number | null
          id: string
          municipio: string | null
          ncms_frequentes: string[] | null
          preco_indiferenca: number | null
          qtd_notas_12m: number | null
          razao_social: string | null
          regime_confianca: string | null
          regime_tributario: string | null
          total_compras_12m: number | null
          uf: string | null
          ultima_atualizacao: string | null
          user_id: string
        }
        Insert: {
          aliquota_credito_estimada?: number | null
          classificacao?: string | null
          cnae_principal?: string | null
          cnpj: string
          created_at?: string | null
          custo_efetivo_score?: number | null
          id?: string
          municipio?: string | null
          ncms_frequentes?: string[] | null
          preco_indiferenca?: number | null
          qtd_notas_12m?: number | null
          razao_social?: string | null
          regime_confianca?: string | null
          regime_tributario?: string | null
          total_compras_12m?: number | null
          uf?: string | null
          ultima_atualizacao?: string | null
          user_id: string
        }
        Update: {
          aliquota_credito_estimada?: number | null
          classificacao?: string | null
          cnae_principal?: string | null
          cnpj?: string
          created_at?: string | null
          custo_efetivo_score?: number | null
          id?: string
          municipio?: string | null
          ncms_frequentes?: string[] | null
          preco_indiferenca?: number | null
          qtd_notas_12m?: number | null
          razao_social?: string | null
          regime_confianca?: string | null
          regime_tributario?: string | null
          total_compras_12m?: number | null
          uf?: string | null
          ultima_atualizacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_calculations: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tax_calculations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_knowledge_edges: {
        Row: {
          created_at: string | null
          edge_type: Database["public"]["Enums"]["kg_edge_type"]
          id: string
          properties: Json | null
          source: string | null
          source_node_id: string
          target_node_id: string
          valid_from: string | null
          valid_until: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          edge_type: Database["public"]["Enums"]["kg_edge_type"]
          id?: string
          properties?: Json | null
          source?: string | null
          source_node_id: string
          target_node_id: string
          valid_from?: string | null
          valid_until?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          edge_type?: Database["public"]["Enums"]["kg_edge_type"]
          id?: string
          properties?: Json | null
          source?: string | null
          source_node_id?: string
          target_node_id?: string
          valid_from?: string | null
          valid_until?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_knowledge_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "tax_knowledge_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_knowledge_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "tax_knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_knowledge_nodes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          label: string
          node_type: Database["public"]["Enums"]["kg_node_type"]
          properties: Json | null
          source: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          node_type: Database["public"]["Enums"]["kg_node_type"]
          properties?: Json | null
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          node_type?: Database["public"]["Enums"]["kg_node_type"]
          properties?: Json | null
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
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
      tax_reform_impacts: {
        Row: {
          analysis_date: string | null
          current_value: number | null
          delta_value: number | null
          details: Json | null
          effective_date: string | null
          id: string
          impact_type: string
          node_id: string | null
          projected_value: number | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          current_value?: number | null
          delta_value?: number | null
          details?: Json | null
          effective_date?: string | null
          id?: string
          impact_type: string
          node_id?: string | null
          projected_value?: number | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          current_value?: number | null
          delta_value?: number | null
          details?: Json | null
          effective_date?: string | null
          id?: string
          impact_type?: string
          node_id?: string | null
          projected_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_reform_impacts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "tax_knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "tax_score_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profile"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_code: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          achievement_code: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          achievement_code?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_ai_journey: {
        Row: {
          completed_tools: string[] | null
          created_at: string | null
          id: string
          last_activity: string | null
          priority: string | null
          satisfaction_score: number | null
          tool_plan: Json | null
          tool_results: Json | null
          updated_at: string | null
          user_id: string
          welcome_seen_at: string | null
        }
        Insert: {
          completed_tools?: string[] | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          priority?: string | null
          satisfaction_score?: number | null
          tool_plan?: Json | null
          tool_results?: Json | null
          updated_at?: string | null
          user_id: string
          welcome_seen_at?: string | null
        }
        Update: {
          completed_tools?: string[] | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          priority?: string | null
          satisfaction_score?: number | null
          tool_plan?: Json | null
          tool_results?: Json | null
          updated_at?: string | null
          user_id?: string
          welcome_seen_at?: string | null
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
      user_onboarding_progress: {
        Row: {
          checklist_items: Json | null
          completed_at: string | null
          created_at: string | null
          first_mission_completed: boolean | null
          id: string
          started_at: string | null
          tour_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          first_mission_completed?: boolean | null
          id?: string
          started_at?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          first_mission_completed?: boolean | null
          id?: string
          started_at?: string | null
          tour_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string | null
          id: string
          last_active_at: string
          page_path: string | null
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active_at?: string
          page_path?: string | null
          status?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active_at?: string
          page_path?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_product_catalog: {
        Row: {
          created_at: string | null
          id: string
          nbs_categoria: string | null
          ncm_code: string | null
          ncm_descricao: string | null
          nome: string
          percentual_receita: number | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nbs_categoria?: string | null
          ncm_code?: string | null
          ncm_descricao?: string | null
          nome: string
          percentual_receita?: number | null
          tipo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nbs_categoria?: string | null
          ncm_code?: string | null
          ncm_descricao?: string | null
          nome?: string
          percentual_receita?: number | null
          tipo?: string
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
      user_session_preferences: {
        Row: {
          avg_session_duration: number | null
          business_stage: string | null
          created_at: string | null
          decision_style: string | null
          id: string
          last_session_date: string | null
          learning_pattern: string | null
          main_pain: string | null
          preferred_tools: string[] | null
          roadmap_enabled: boolean | null
          show_welcome_modal: boolean | null
          sophistication_level: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_session_duration?: number | null
          business_stage?: string | null
          created_at?: string | null
          decision_style?: string | null
          id?: string
          last_session_date?: string | null
          learning_pattern?: string | null
          main_pain?: string | null
          preferred_tools?: string[] | null
          roadmap_enabled?: boolean | null
          show_welcome_modal?: boolean | null
          sophistication_level?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_session_duration?: number | null
          business_stage?: string | null
          created_at?: string | null
          decision_style?: string | null
          id?: string
          last_session_date?: string | null
          learning_pattern?: string | null
          main_pain?: string | null
          preferred_tools?: string[] | null
          roadmap_enabled?: boolean | null
          show_welcome_modal?: boolean | null
          sophistication_level?: number | null
          updated_at?: string | null
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
          batch_id: string | null
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
          batch_id?: string | null
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
          batch_id?: string | null
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
      analyze_cascade_impact: {
        Args: {
          p_max_depth?: number
          p_start_node_code: string
          p_start_node_type: Database["public"]["Enums"]["kg_node_type"]
        }
        Returns: {
          depth: number
          edge_chain: Database["public"]["Enums"]["kg_edge_type"][]
          impact_weight: number
          node_code: string
          node_id: string
          node_label: string
          node_type: Database["public"]["Enums"]["kg_node_type"]
          path: string[]
        }[]
      }
      apply_memory_decay: {
        Args: never
        Returns: {
          avg_importance_after: number
          avg_importance_before: number
          memories_decayed: number
          memories_expired: number
        }[]
      }
      apply_pattern_decay: {
        Args: never
        Returns: {
          avg_confidence_after: number
          avg_confidence_before: number
          patterns_decayed: number
          patterns_removed: number
        }[]
      }
      calculate_roadmap_effectiveness: {
        Args: { p_roadmap_id: string }
        Returns: number
      }
      create_autonomous_action: {
        Args: {
          p_action_payload: Json
          p_action_type: string
          p_agent_type: string
          p_priority?: string
          p_requires_approval?: boolean
          p_trigger_data: Json
          p_trigger_event: string
          p_user_id: string
        }
        Returns: string
      }
      find_relationship_path: {
        Args: {
          p_from_code: string
          p_from_type: Database["public"]["Enums"]["kg_node_type"]
          p_max_depth?: number
          p_to_code: string
          p_to_type: Database["public"]["Enums"]["kg_node_type"]
        }
        Returns: {
          edge_path: Database["public"]["Enums"]["kg_edge_type"][]
          node_path: string[]
          path_length: number
          total_weight: number
        }[]
      }
      get_memory_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_memories: number
          active_patterns: number
          avg_memory_importance: number
          avg_pattern_confidence: number
          high_confidence_patterns: number
          most_used_pattern_key: string
          oldest_pattern_days: number
          total_memories: number
          total_patterns: number
        }[]
      }
      get_node_relationships: {
        Args: {
          p_direction?: string
          p_edge_types?: Database["public"]["Enums"]["kg_edge_type"][]
          p_node_code: string
          p_node_type: Database["public"]["Enums"]["kg_node_type"]
        }
        Returns: {
          direction: string
          edge_type: Database["public"]["Enums"]["kg_edge_type"]
          properties: Json
          related_node_code: string
          related_node_id: string
          related_node_label: string
          related_node_type: Database["public"]["Enums"]["kg_node_type"]
          relationship_id: string
          weight: number
        }[]
      }
      get_recent_conversations: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          role: string
          screen_context: string
          session_id: string
        }[]
      }
      get_user_memories: {
        Args: { p_category?: string; p_limit?: number; p_user_id: string }
        Returns: {
          category: string
          content: string
          created_at: string
          id: string
          importance: number
          memory_type: string
          source_screen: string
        }[]
      }
      get_user_patterns: {
        Args: {
          p_limit?: number
          p_min_confidence?: number
          p_pattern_type?: string
          p_user_id: string
        }
        Returns: {
          confidence: number
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          times_observed: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hybrid_search_knowledge: {
        Args: {
          match_count?: number
          query_embedding: string
          query_text: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          combined_score: number
          id: string
          keyword_match: boolean
          similarity: number
          summary: string
          title: string
        }[]
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
      record_user_decision: {
        Args: {
          p_agent_type?: string
          p_chosen?: string
          p_context: Json
          p_decision_type: string
          p_options?: Json
          p_user_id: string
        }
        Returns: string
      }
      reinforce_pattern: {
        Args: {
          p_boost?: number
          p_pattern_key: string
          p_pattern_type: string
          p_user_id: string
        }
        Returns: {
          new_confidence: number
          new_times_observed: number
          pattern_id: string
        }[]
      }
      search_knowledge_base: {
        Args: {
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          full_content: string
          id: string
          legal_basis: string
          similarity: number
          summary: string
          title: string
        }[]
      }
      search_user_memories: {
        Args: {
          match_count?: number
          p_user_id: string
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          category: string
          content: string
          id: string
          importance: number
          memory_type: string
          similarity: number
        }[]
      }
      search_user_patterns: {
        Args: {
          match_count?: number
          p_user_id: string
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          confidence: number
          id: string
          pattern_key: string
          pattern_type: string
          pattern_value: Json
          similarity: number
        }[]
      }
      update_user_sophistication: {
        Args: { p_user_id: string }
        Returns: number
      }
      validate_referral_code: {
        Args: { code_to_check: string }
        Returns: {
          referrer_id: string
          valid: boolean
        }[]
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
        | "auto"
        | "manual"
      erp_type: "omie" | "bling" | "contaazul" | "tiny" | "sankhya" | "totvs"
      kg_edge_type:
        | "tributado_por"
        | "tem_beneficio"
        | "aplica_em"
        | "fornece"
        | "opera_com"
        | "gera_credito"
        | "impacta"
        | "pertence_a"
        | "substitui"
        | "depende_de"
        | "conflita_com"
      kg_node_type:
        | "ncm"
        | "nbs"
        | "cfop"
        | "regime"
        | "beneficio"
        | "tributo"
        | "fornecedor"
        | "estado"
        | "setor"
        | "aliquota"
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
        "auto",
        "manual",
      ],
      erp_type: ["omie", "bling", "contaazul", "tiny", "sankhya", "totvs"],
      kg_edge_type: [
        "tributado_por",
        "tem_beneficio",
        "aplica_em",
        "fornece",
        "opera_com",
        "gera_credito",
        "impacta",
        "pertence_a",
        "substitui",
        "depende_de",
        "conflita_com",
      ],
      kg_node_type: [
        "ncm",
        "nbs",
        "cfop",
        "regime",
        "beneficio",
        "tributo",
        "fornecedor",
        "estado",
        "setor",
        "aliquota",
      ],
    },
  },
} as const
