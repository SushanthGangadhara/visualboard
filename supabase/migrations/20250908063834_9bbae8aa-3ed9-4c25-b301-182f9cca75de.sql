-- Fix storage policies for csv-files bucket
-- First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv-files', 'csv-files', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can upload CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can download their own CSV files" ON storage.objects;
DROP POLICY IF EXISTS "Edge functions can access CSV files" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Users can upload CSV files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'csv-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can download their own CSV files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'csv-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Edge functions can access CSV files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'csv-files');