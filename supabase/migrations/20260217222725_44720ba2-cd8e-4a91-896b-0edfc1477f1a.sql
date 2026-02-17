
-- Add batch_id column to xml_imports for grouping files from the same upload session
ALTER TABLE xml_imports ADD COLUMN IF NOT EXISTS batch_id TEXT;

-- Backfill existing imports: group by user_id and 5-minute windows
WITH ranked AS (
  SELECT 
    id,
    user_id,
    created_at,
    DATE_TRUNC('minute', created_at) - 
      (EXTRACT(MINUTE FROM created_at)::int % 5) * INTERVAL '1 minute' AS batch_window
  FROM xml_imports
  WHERE batch_id IS NULL
)
UPDATE xml_imports 
SET batch_id = ranked.user_id || '_' || TO_CHAR(ranked.batch_window, 'YYYYMMDDHH24MI')
FROM ranked
WHERE xml_imports.id = ranked.id;

-- Create index for batch_id lookups
CREATE INDEX IF NOT EXISTS idx_xml_imports_batch_id ON xml_imports(batch_id);
