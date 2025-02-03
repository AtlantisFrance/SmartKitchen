/*
  # Create website pictures storage and table

  1. New Storage Bucket
    - Create 'website-pictures' bucket for storing website-related images
    - Enable public access for easy retrieval
    
  2. New Table
    - `website_pictures`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_path` (text)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  3. Security
    - Enable RLS on the table
    - Create policies for CRUD operations
    - Create storage policies for the bucket
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-pictures', 'website-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create website_pictures table
CREATE TABLE IF NOT EXISTS public.website_pictures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_path text NOT NULL,
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_pictures ENABLE ROW LEVEL SECURITY;

-- Create policies for website_pictures table
CREATE POLICY "Users can insert their own website pictures"
  ON public.website_pictures
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own website pictures"
  ON public.website_pictures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own website pictures"
  ON public.website_pictures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own website pictures"
  ON public.website_pictures
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage policies
CREATE POLICY "Users can upload website pictures"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'website-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own website pictures"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'website-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own website pictures"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'website-pictures' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add public access policy for the bucket
CREATE POLICY "Public can view website pictures"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'website-pictures');

-- Create updated_at trigger
CREATE TRIGGER update_website_pictures_updated_at
  BEFORE UPDATE ON public.website_pictures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();