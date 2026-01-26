-- Adicionar novos campos para as perguntas estratégicas do Score Tributário
ALTER TABLE public.tax_score
ADD COLUMN IF NOT EXISTS resp_faturamento_faixa text,
ADD COLUMN IF NOT EXISTS resp_recebeu_notificacao boolean,
ADD COLUMN IF NOT EXISTS resp_debitos_abertos text,
ADD COLUMN IF NOT EXISTS resp_conhece_receita_sintonia boolean,
ADD COLUMN IF NOT EXISTS resp_nota_receita_sintonia text,
ADD COLUMN IF NOT EXISTS resp_documentacao_pronta boolean,
ADD COLUMN IF NOT EXISTS resp_tempo_reunir_docs text,
ADD COLUMN IF NOT EXISTS resp_surpresas_tributarias boolean,
ADD COLUMN IF NOT EXISTS resp_preparando_reforma boolean,
ADD COLUMN IF NOT EXISTS resp_conhece_carga_tributaria boolean;

-- Atualizar cards_total para 11 (novas perguntas)
COMMENT ON COLUMN public.tax_score.cards_total IS 'Total de cards/perguntas: agora 11 perguntas estratégicas';