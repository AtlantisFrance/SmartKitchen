/*
  # Add generated images storage

  1. New Storage
    - Create storage bucket for generated images
    - Add appropriate policies for access control

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload generated images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own generated images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own generated images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'generated-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add public access policy
CREATE POLICY "Public can view generated images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'generated-images');