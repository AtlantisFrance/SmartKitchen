/*
  # Add public_url column to depthmaps table

  1. Changes
    - Add public_url column to depthmaps table
    - Make image_path nullable since we'll have either image_path or public_url
    - Add check constraint to ensure at least one of them is set

  2. Purpose
    - Support both uploaded files (image_path) and direct URLs (public_url)
    - Maintain data integrity with check constraint
*/

-- Add public_url column
ALTER TABLE public.depthmaps
ADD COLUMN IF NOT EXISTS public_url text;

-- Make image_path nullable
ALTER TABLE public.depthmaps
ALTER COLUMN image_path DROP NOT NULL;

-- Add check constraint to ensure at least one is set
ALTER TABLE public.depthmaps
ADD CONSTRAINT depthmaps_url_check 
CHECK (
  (image_path IS NOT NULL AND public_url IS NULL) OR
  (image_path IS NULL AND public_url IS NOT NULL)
);