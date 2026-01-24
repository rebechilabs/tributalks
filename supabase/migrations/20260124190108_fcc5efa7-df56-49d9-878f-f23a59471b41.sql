-- Add email fields to company_profile for report recipients
ALTER TABLE public.company_profile 
ADD COLUMN IF NOT EXISTS email_ceo text,
ADD COLUMN IF NOT EXISTS email_cfo text,
ADD COLUMN IF NOT EXISTS email_contador text,
ADD COLUMN IF NOT EXISTS email_socios text[];

-- Create executive_report_logs table
CREATE TABLE public.executive_report_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  company_name text,
  reference_month date NOT NULL,
  sent_to text[] NOT NULL DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  error_message text,
  report_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.executive_report_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own report logs"
  ON public.executive_report_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own report logs"
  ON public.executive_report_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report logs"
  ON public.executive_report_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for querying by user and month
CREATE INDEX idx_executive_report_logs_user_month 
  ON public.executive_report_logs(user_id, reference_month DESC);