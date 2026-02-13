CREATE POLICY "Users can upload pgdas files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pgdas-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);