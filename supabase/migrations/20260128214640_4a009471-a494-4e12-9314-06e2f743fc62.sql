-- Enum para tipos de ERP suportados
CREATE TYPE public.erp_type AS ENUM ('omie', 'bling', 'contaazul', 'tiny', 'sankhya', 'totvs');

-- Enum para status da conexão
CREATE TYPE public.erp_connection_status AS ENUM ('active', 'inactive', 'error', 'pending');

-- Enum para tipos de sincronização
CREATE TYPE public.erp_sync_type AS ENUM ('nfe', 'nfse', 'produtos', 'financeiro', 'empresa', 'full');

-- Enum para status de sincronização
CREATE TYPE public.erp_sync_status AS ENUM ('running', 'success', 'error', 'cancelled');

-- Tabela de conexões com ERPs
CREATE TABLE public.erp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  erp_type erp_type NOT NULL,
  connection_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  status erp_connection_status NOT NULL DEFAULT 'pending',
  status_message TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  sync_config JSONB NOT NULL DEFAULT '{
    "modules": ["nfe", "produtos", "financeiro", "empresa"],
    "frequency_hours": 24,
    "auto_sync": true
  }'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, erp_type)
);

-- Tabela de logs de sincronização
CREATE TABLE public.erp_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.erp_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sync_type erp_sync_type NOT NULL,
  status erp_sync_status NOT NULL DEFAULT 'running',
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.erp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies para erp_connections
CREATE POLICY "Users can view own ERP connections"
ON public.erp_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ERP connections"
ON public.erp_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ERP connections"
ON public.erp_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ERP connections"
ON public.erp_connections
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para erp_sync_logs
CREATE POLICY "Users can view own sync logs"
ON public.erp_sync_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
ON public.erp_sync_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync logs"
ON public.erp_sync_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_erp_connections_user_id ON public.erp_connections(user_id);
CREATE INDEX idx_erp_connections_status ON public.erp_connections(status);
CREATE INDEX idx_erp_sync_logs_connection_id ON public.erp_sync_logs(connection_id);
CREATE INDEX idx_erp_sync_logs_user_id ON public.erp_sync_logs(user_id);
CREATE INDEX idx_erp_sync_logs_started_at ON public.erp_sync_logs(started_at DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_erp_connections_updated_at
BEFORE UPDATE ON public.erp_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();