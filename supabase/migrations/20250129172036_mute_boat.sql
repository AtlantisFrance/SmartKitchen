/*
  # Add cascade delete for projects

  1. Changes
    - Add ON DELETE CASCADE to result_images.project_id foreign key
    - Add ON DELETE CASCADE to depthmaps.project_id foreign key
    - Add project_id column to depthmaps table
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add project_id to depthmaps if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'depthmaps' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.depthmaps
    ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Recreate result_images.project_id with CASCADE
ALTER TABLE public.result_images 
  DROP CONSTRAINT IF EXISTS result_images_project_id_fkey,
  ALTER COLUMN project_id DROP NOT NULL,
  ADD CONSTRAINT result_images_project_id_fkey 
    FOREIGN KEY (project_id) 
    REFERENCES public.projects(id) 
    ON DELETE CASCADE;