/*
  # Fix updated_at column handling

  1. Changes
    - Add default value for updated_at column
    - Add trigger to automatically update updated_at on changes
    - Backfill existing rows with updated_at values
*/

-- Set default for updated_at column
ALTER TABLE public.result_images
ALTER COLUMN updated_at SET DEFAULT now();

-- Update existing rows where updated_at is null
UPDATE public.result_images
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL
ALTER TABLE public.result_images
ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_result_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_result_images_updated_at ON public.result_images;

-- Create the trigger
CREATE TRIGGER update_result_images_updated_at
  BEFORE UPDATE ON public.result_images
  FOR EACH ROW
  EXECUTE FUNCTION update_result_images_updated_at();