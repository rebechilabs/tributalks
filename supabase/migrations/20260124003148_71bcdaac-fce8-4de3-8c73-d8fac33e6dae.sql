-- Tabela para imports de XMLs
CREATE TABLE public.xml_imports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_name text NOT NULL,
  file_size integer NOT NULL,
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  error_message text,
  processed_at timestamp with time zone
);

-- Tabela para análises de XMLs
CREATE TABLE public.xml_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  import_id uuid REFERENCES public.xml_imports(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  xml_type text NOT NULL,
  document_number text,
  document_series text,
  issue_date timestamp with time zone,
  issuer_cnpj text,
  issuer_name text,
  recipient_cnpj text,
  recipient_name text,
  items_count integer DEFAULT 0,
  document_total numeric(15,2) DEFAULT 0,
  current_tax_total numeric(15,2) DEFAULT 0,
  reform_tax_total numeric(15,2) DEFAULT 0,
  difference_value numeric(15,2) DEFAULT 0,
  difference_percent numeric(5,2) DEFAULT 0,
  raw_data jsonb,
  analysis_data jsonb,
  current_taxes jsonb,
  reform_taxes jsonb
);

-- Enable RLS
ALTER TABLE public.xml_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xml_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xml_imports
CREATE POLICY "Users can view own xml imports"
  ON public.xml_imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xml imports"
  ON public.xml_imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own xml imports"
  ON public.xml_imports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own xml imports"
  ON public.xml_imports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for xml_analysis
CREATE POLICY "Users can view own xml analysis"
  ON public.xml_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xml analysis"
  ON public.xml_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own xml analysis"
  ON public.xml_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_xml_imports_user_id ON public.xml_imports(user_id);
CREATE INDEX idx_xml_imports_created_at ON public.xml_imports(created_at DESC);
CREATE INDEX idx_xml_imports_status ON public.xml_imports(status);
CREATE INDEX idx_xml_analysis_user_id ON public.xml_analysis(user_id);
CREATE INDEX idx_xml_analysis_import_id ON public.xml_analysis(import_id);
CREATE INDEX idx_xml_analysis_xml_type ON public.xml_analysis(xml_type);

-- Storage bucket for XML files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('xml-imports', 'xml-imports', false, 10485760);

-- Storage policies
CREATE POLICY "Users can upload own XMLs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'xml-imports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own XMLs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'xml-imports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own XMLs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'xml-imports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );