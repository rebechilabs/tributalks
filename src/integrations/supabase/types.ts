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
      profiles: {
        Row: {
          cnae: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          faturamento_mensal: number | null
          id: string
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
          faturamento_mensal?: number | null
          id?: string
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
          faturamento_mensal?: number | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
