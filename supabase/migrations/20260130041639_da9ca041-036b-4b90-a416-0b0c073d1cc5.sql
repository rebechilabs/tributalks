-- Add score benchmark fields to sector_benchmarks table
ALTER TABLE public.sector_benchmarks 
ADD COLUMN IF NOT EXISTS avg_score INTEGER DEFAULT 65,
ADD COLUMN IF NOT EXISTS score_percentile_data JSONB DEFAULT '{"p25": 45, "p50": 60, "p75": 75, "p90": 85}'::jsonb;

-- Update existing sectors with estimated score benchmarks
UPDATE public.sector_benchmarks SET 
  avg_score = 62,
  score_percentile_data = '{"p25": 42, "p50": 58, "p75": 72, "p90": 84}'::jsonb
WHERE sector_name LIKE '%Comércio%';

UPDATE public.sector_benchmarks SET 
  avg_score = 68,
  score_percentile_data = '{"p25": 48, "p50": 64, "p75": 78, "p90": 88}'::jsonb
WHERE sector_name LIKE '%Serviços%';

UPDATE public.sector_benchmarks SET 
  avg_score = 58,
  score_percentile_data = '{"p25": 38, "p50": 54, "p75": 68, "p90": 82}'::jsonb
WHERE sector_name LIKE '%Indústria%';