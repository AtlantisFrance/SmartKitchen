/*
  # Add updated_at column to result_images table

  1. Changes
    - Add `updated_at` column to `result_images` table with default value of now()
    - Add trigger to automatically update `updated_at` on row updates
*/

-- Add updated_at column
ALTER TABLE public.result_images
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_result_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_result_images_updated_at ON public.result_images;
CREATE TRIGGER update_result_images_updated_at
  BEFORE UPDATE ON public.result_images
  FOR EACH ROW
  EXECUTE FUNCTION update_result_images_updated_at();