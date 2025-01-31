/*
  # Remove public_url column from depthmaps

  1. Changes
    - Remove public_url column from depthmaps table
    - Remove check constraint for url fields
    - Make image_path required again
*/

-- Remove check constraint
ALTER TABLE public.depthmaps
DROP CONSTRAINT IF EXISTS depthmaps_url_check;

-- Remove public_url column
ALTER TABLE public.depthmaps
DROP COLUMN IF EXISTS public_url;

-- Make image_path required again
ALTER TABLE public.depthmaps
ALTER COLUMN image_path SET NOT NULL;