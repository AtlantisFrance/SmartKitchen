/*
  # Add seed field to result_images table

  1. Changes
    - Add `seed` column to `result_images` table to store the seed value used for generation

  2. Security
    - No changes to existing policies needed as the table already has proper RLS
*/

-- Add seed column to result_images table
ALTER TABLE public.result_images 
ADD COLUMN IF NOT EXISTS seed text;