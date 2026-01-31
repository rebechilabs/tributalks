-- Cache table for RTC rates to avoid repeated API calls
CREATE TABLE public.rtc_rate_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ncm TEXT NOT NULL,
  municipio_ibge INTEGER NOT NULL,
  uf TEXT NOT NULL,
  aliquota_cbs NUMERIC DEFAULT 0,
  aliquota_ibs_uf NUMERIC DEFAULT 0,
  aliquota_ibs_mun NUMERIC DEFAULT 0,
  aliquota_is NUMERIC DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ncm, municipio_ibge)
);

-- Enable RLS
ALTER TABLE public.rtc_rate_cache ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read from cache
CREATE POLICY "Authenticated users can read rtc cache"
  ON public.rtc_rate_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Index for faster lookups
CREATE INDEX idx_rtc_cache_ncm_municipio ON public.rtc_rate_cache(ncm, municipio_ibge);
CREATE INDEX idx_rtc_cache_expires ON public.rtc_rate_cache(expires_at);