/*
  # Fix storage bucket permissions

  1. Changes
    - Enable public access for the depthmaps bucket
    - Add public select policy for depthmaps bucket
    - Update bucket configuration for public access

  2. Security
    - Maintains existing RLS policies
    - Adds public read access for generated URLs
*/

-- Update bucket to allow public access
UPDATE storage.buckets
SET public = true
WHERE id = 'depthmaps';

-- Add public policy for viewing depthmaps
CREATE POLICY "Public can view depthmaps"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'depthmaps');