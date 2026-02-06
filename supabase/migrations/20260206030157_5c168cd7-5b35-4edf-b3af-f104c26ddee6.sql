-- Tabela de logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas comuns
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver todos os logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Política: Usuários podem ver logs dos próprios dados
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Função de trigger para auditoria
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_record_id UUID;
BEGIN
  -- Tenta obter o user_id do contexto de autenticação
  v_user_id := auth.uid();
  
  -- Obtém o ID do registro (prioriza NEW, depois OLD)
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
  ELSE
    v_record_id := NEW.id;
  END IF;
  
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    COALESCE(v_user_id, 
      CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END
    ),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers nas tabelas sensíveis

-- company_profile
CREATE TRIGGER audit_company_profile
AFTER INSERT OR UPDATE OR DELETE ON public.company_profile
FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- tax_score (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tax_score') THEN
    EXECUTE 'CREATE TRIGGER audit_tax_score AFTER INSERT OR UPDATE OR DELETE ON public.tax_score FOR EACH ROW EXECUTE FUNCTION public.log_audit()';
  END IF;
END $$;

-- identified_credits
CREATE TRIGGER audit_identified_credits
AFTER INSERT OR UPDATE OR DELETE ON public.identified_credits
FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- company_dre (dados financeiros importantes)
CREATE TRIGGER audit_company_dre
AFTER INSERT OR UPDATE OR DELETE ON public.company_dre
FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- profiles (dados do usuário)
CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- Comentário para documentação
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria para compliance LGPD e rastreabilidade de alterações em dados sensíveis';