
-- Create storage bucket for Clara chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('clara-attachments', 'clara-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload clara attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'clara-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own clara attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'clara-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own clara attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'clara-attachments'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Also allow public read since bucket is public (for AI to access)
CREATE POLICY "Public can read clara attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'clara-attachments');
