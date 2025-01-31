/*
  # Enhance result_images table for better image storage

  1. Changes
    - Add original_image_url column to store the source image
    - Add workflow_id column to track which workflow was used
    - Add iterations column to store how many images were generated
    - Add is_public column for visibility control
    - Add metadata JSONB column for additional data

  2. Security
    - Enable RLS policies remain unchanged
*/

-- Add new columns to result_images
ALTER TABLE public.result_images
ADD COLUMN IF NOT EXISTS original_image_url text,
ADD COLUMN IF NOT EXISTS workflow_id text,
ADD COLUMN IF NOT EXISTS iterations integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata jsonb;