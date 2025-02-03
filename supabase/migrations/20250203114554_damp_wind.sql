/*
  # Add URL field to website_pictures table

  1. Changes
    - Add `url` column to `website_pictures` table
    - Make `image_path` nullable
    - Add check constraint to ensure either URL or image_path is provided
    - Update RLS policies to handle URL field
*/

-- Add URL column
ALTER TABLE public.website_pictures
ADD COLUMN url text;

-- Make image_path nullable
ALTER TABLE public.website_pictures
ALTER COLUMN image_path DROP NOT NULL;

-- Add check constraint to ensure at least one is provided
ALTER TABLE public.website_pictures
ADD CONSTRAINT website_pictures_path_or_url_check
CHECK (
  (image_path IS NOT NULL AND url IS NULL) OR
  (image_path IS NULL AND url IS NOT NULL)
);

-- Update existing RLS policies to handle URL field
DROP POLICY IF EXISTS "Users can view their own website pictures" ON public.website_pictures;
CREATE POLICY "Users can view their own website pictures"
  ON public.website_pictures
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own website pictures" ON public.website_pictures;
CREATE POLICY "Users can update their own website pictures"
  ON public.website_pictures
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add public access policy for viewing website pictures
CREATE POLICY "Public can view website pictures"
  ON public.website_pictures
  FOR SELECT
  TO public
  USING (true);