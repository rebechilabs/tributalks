-- Tabela para mensagens de contato
CREATE TABLE public.contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  respondido BOOLEAN DEFAULT false,
  respondido_em TIMESTAMP WITH TIME ZONE,
  respondido_por TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção pública (formulário de contato)
CREATE POLICY "Anyone can submit contact form"
ON public.contatos
FOR INSERT
WITH CHECK (true);

-- Índices para busca
CREATE INDEX idx_contatos_email ON public.contatos(email);
CREATE INDEX idx_contatos_assunto ON public.contatos(assunto);
CREATE INDEX idx_contatos_respondido ON public.contatos(respondido);
CREATE INDEX idx_contatos_created_at ON public.contatos(created_at DESC);