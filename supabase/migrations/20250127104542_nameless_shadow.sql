/*
  # Remove prompt columns from depthmaps table

  1. Changes
    - Remove positive_prompt column from depthmaps table
    - Remove negative_prompt column from depthmaps table

  2. Notes
    - These columns are not needed in the depthmaps table as they are stored in result_images
*/

DO $$ 
BEGIN
  -- Remove positive_prompt column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'depthmaps' 
    AND column_name = 'positive_prompt'
  ) THEN
    ALTER TABLE public.depthmaps DROP COLUMN positive_prompt;
  END IF;

  -- Remove negative_prompt column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'depthmaps' 
    AND column_name = 'negative_prompt'
  ) THEN
    ALTER TABLE public.depthmaps DROP COLUMN negative_prompt;
  END IF;
END $$;