-- Tabela para base de conhecimento dinâmica da Clara
CREATE TABLE public.clara_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  
  -- Categorização
  category text NOT NULL DEFAULT 'jurisprudencia',
  -- Valores: 'jurisprudencia', 'legislacao', 'reforma', 'prazo', 'aliquota'
  
  -- Conteúdo
  summary text NOT NULL, -- Resumo curto para Clara usar diretamente
  full_content text, -- Conteúdo completo se precisar de mais detalhes
  
  -- Contexto de quando aplicar
  trigger_keywords text[] NOT NULL DEFAULT '{}', -- Palavras que ativam essa informação
  trigger_regimes text[] DEFAULT '{}', -- Regimes afetados (presumido, real, simples)
  
  -- Status e validade
  status text NOT NULL DEFAULT 'active', -- active, expired, superseded
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date, -- NULL = indefinido
  
  -- Linguagem obrigatória
  must_say text[], -- Frases que Clara DEVE usar
  must_not_say text[], -- Frases que Clara NÃO PODE usar
  
  -- Metadados
  source_url text,
  legal_basis text,
  priority integer NOT NULL DEFAULT 5, -- 1-10, maior = mais importante
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para busca eficiente
CREATE INDEX idx_clara_kb_category ON public.clara_knowledge_base(category);
CREATE INDEX idx_clara_kb_status ON public.clara_knowledge_base(status);
CREATE INDEX idx_clara_kb_keywords ON public.clara_knowledge_base USING GIN(trigger_keywords);
CREATE INDEX idx_clara_kb_regimes ON public.clara_knowledge_base USING GIN(trigger_regimes);

-- RLS
ALTER TABLE public.clara_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar
CREATE POLICY "Admins can manage knowledge base"
ON public.clara_knowledge_base
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Service role (edge functions) pode ler
CREATE POLICY "Service role can read knowledge base"
ON public.clara_knowledge_base
FOR SELECT
USING (auth.role() = 'service_role');

-- Authenticated users podem ler (para cache no frontend se necessário)
CREATE POLICY "Authenticated users can read active knowledge"
ON public.clara_knowledge_base
FOR SELECT
USING (status = 'active');

-- Trigger para updated_at
CREATE TRIGGER update_clara_kb_updated_at
BEFORE UPDATE ON public.clara_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir a decisão da LC 224/2025 como primeiro registro
INSERT INTO public.clara_knowledge_base (
  slug,
  title,
  category,
  summary,
  full_content,
  trigger_keywords,
  trigger_regimes,
  status,
  valid_from,
  must_say,
  must_not_say,
  source_url,
  legal_basis,
  priority
) VALUES (
  'lc-224-2025-pedagio-presumido',
  'LC 224/2025 - Pedágio 10% Lucro Presumido (Liminar Suspendeu)',
  'jurisprudencia',
  'A LC 224/2025 criou aumento de 10% nos percentuais de presunção do Lucro Presumido para faturamento acima de R$ 5M/ano. Porém, liminar da Justiça Federal RJ (28/01/2026) suspendeu a exigibilidade. ADI 7.920 questiona constitucionalidade no STF. Fundamento: Lucro Presumido não é benefício fiscal.',
  E'**STATUS ATUAL (Fev/2026):** Liminar da Justiça Federal RJ suspendeu exigibilidade.\n\n**O que é:** LC 224/2025 criou aumento de 10% nos percentuais de presunção do Lucro Presumido (IRPJ/CSLL).\n- Aplica-se APENAS sobre faturamento > R$ 5M/ano (ou R$ 1,25M/trimestre)\n- Exemplo: serviços passa de 32% para 35,2%\n\n**Decisão liminar (28/01/2026, 1ª VF Resende/RJ):**\n- Fundamento: Lucro Presumido NÃO é benefício fiscal, é método alternativo de apuração\n- ADI 7.920 (CNI) questiona constitucionalidade no STF\n- PGFN vai recorrer\n\n**Vigência (se mantida):**\n- IRPJ: desde 01/01/2026 (anterioridade exercício)\n- CSLL: a partir de 01/04/2026 (noventena)',
  ARRAY['lc 224', 'pedagio', 'pedágio', 'presumido', '10%', 'aumento presumido', 'majoração', 'benefício fiscal', 'liminar'],
  ARRAY['presumido'],
  'active',
  '2026-01-28',
  ARRAY[
    'Existe liminar suspendendo em alguns casos',
    'A questão está sendo discutida judicialmente',
    'Recomendo verificar com advogado a possibilidade de medida judicial'
  ],
  ARRAY[
    'você vai pagar 10% a mais',
    'foi cancelado',
    'não precisa se preocupar'
  ],
  'https://www.conjur.com.br/2026-jan-29/juiza-veta-aumento-de-10-na-tributacao-sobre-lucro-presumido/',
  'LC 224/2025, Art. 4º, § 4º, VII',
  9
);