/*
  # Create Depthmap Storage and Table

  1. New Storage Bucket
    - `depthmaps` bucket for storing depthmap images
    
  2. New Tables
    - `depthmaps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_path` (text, stores the storage path)
      - `positive_prompt` (text)
      - `negative_prompt` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
  3. Security
    - Enable RLS on `depthmaps` table
    - Add policies for authenticated users to:
      - Insert their own depthmaps
      - View their own depthmaps
      - Delete their own depthmaps
    - Add storage policies for:
      - Uploading images
      - Viewing images
      - Deleting images
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('depthmaps', 'depthmaps')
ON CONFLICT (id) DO NOTHING;

-- Create depthmaps table
CREATE TABLE IF NOT EXISTS public.depthmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  positive_prompt text,
  negative_prompt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.depthmaps ENABLE ROW LEVEL SECURITY;

-- Create policies for depthmaps table
CREATE POLICY "Users can insert their own depthmaps"
  ON public.depthmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own depthmaps"
  ON public.depthmaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own depthmaps"
  ON public.depthmaps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage policies
CREATE POLICY "Users can upload depthmaps"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'depthmaps' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own depthmaps"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'depthmaps' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own depthmaps"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'depthmaps' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_depthmaps_updated_at
  BEFORE UPDATE ON public.depthmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();