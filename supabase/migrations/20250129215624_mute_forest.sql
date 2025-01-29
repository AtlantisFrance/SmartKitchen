/*
  # Add generation status tracking
  
  1. Changes
    - Add status column to result_images table
    - Add temp_image_url column for placeholder images
    - Add default values and constraints
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add status and temp_image_url columns to result_images
ALTER TABLE public.result_images
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS temp_image_url text;

-- Add check constraint for status values
ALTER TABLE public.result_images
ADD CONSTRAINT result_images_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed'));