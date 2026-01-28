-- Create table for storing reform checklist responses
CREATE TABLE public.reform_checklist_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  block_key TEXT NOT NULL,
  item_key TEXT NOT NULL,
  response TEXT NOT NULL CHECK (response IN ('sim', 'parcial', 'nao', 'nao_sei')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_key)
);

-- Create table for storing completed checklist summaries
CREATE TABLE public.reform_checklist_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_items INTEGER DEFAULT 0,
  sim_count INTEGER DEFAULT 0,
  parcial_count INTEGER DEFAULT 0,
  nao_count INTEGER DEFAULT 0,
  nao_sei_count INTEGER DEFAULT 0,
  readiness_score INTEGER DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('baixo', 'moderado', 'alto', 'critico')),
  top_risks JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reform_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reform_checklist_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
CREATE POLICY "Users can view own checklist responses"
ON public.reform_checklist_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist responses"
ON public.reform_checklist_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist responses"
ON public.reform_checklist_responses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist responses"
ON public.reform_checklist_responses FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for summaries
CREATE POLICY "Users can view own checklist summary"
ON public.reform_checklist_summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist summary"
ON public.reform_checklist_summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist summary"
ON public.reform_checklist_summaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist summary"
ON public.reform_checklist_summaries FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reform_checklist_responses_updated_at
BEFORE UPDATE ON public.reform_checklist_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reform_checklist_summaries_updated_at
BEFORE UPDATE ON public.reform_checklist_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();