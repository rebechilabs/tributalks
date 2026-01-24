-- Tabela para análise de NCM para CBS/IBS
CREATE TABLE public.company_ncm_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  ncm_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  reason TEXT,
  suggested_action TEXT,
  revenue_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('ok', 'revisar_ncm', 'revisar_tributacao', 'incompleto', 'pendente'))
);

-- Tabela para checklist de ERP
CREATE TABLE public.erp_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  item_description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_checklist_status CHECK (status IN ('pendente', 'em_andamento', 'concluido'))
);

-- Enable RLS
ALTER TABLE public.company_ncm_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_checklist ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_ncm_analysis
CREATE POLICY "Users can view own NCM analysis"
ON public.company_ncm_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NCM analysis"
ON public.company_ncm_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NCM analysis"
ON public.company_ncm_analysis
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own NCM analysis"
ON public.company_ncm_analysis
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for erp_checklist
CREATE POLICY "Users can view own ERP checklist"
ON public.erp_checklist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ERP checklist"
ON public.erp_checklist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ERP checklist"
ON public.erp_checklist
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ERP checklist"
ON public.erp_checklist
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on company_ncm_analysis
CREATE TRIGGER update_company_ncm_analysis_updated_at
BEFORE UPDATE ON public.company_ncm_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on erp_checklist
CREATE TRIGGER update_erp_checklist_updated_at
BEFORE UPDATE ON public.erp_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();