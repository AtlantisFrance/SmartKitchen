/*
  # Add automatic deletion of depth maps

  1. Changes
    - Create function to delete old depth maps
    - Create cron job to run every hour
    - Delete depth maps older than 24 hours from both storage and database
  
  2. Security
    - Function runs with security definer to bypass RLS
*/

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to delete old depth maps
CREATE OR REPLACE FUNCTION delete_old_depthmaps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  storage_object RECORD;
BEGIN
  -- First, get all old depthmap records
  FOR storage_object IN 
    SELECT obj.name
    FROM storage.objects obj
    JOIN public.depthmaps d ON obj.name = d.image_path
    WHERE obj.bucket_id = 'depthmaps'
    AND d.created_at < NOW() - INTERVAL '24 hours'
  LOOP
    -- Delete from storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'depthmaps' 
    AND name = storage_object.name;
  END LOOP;

  -- Then delete the database records
  DELETE FROM public.depthmaps
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create cron job to run every hour
SELECT cron.schedule(
  'delete-old-depthmaps',  -- job name
  '0 * * * *',            -- every hour
  'SELECT delete_old_depthmaps();'
);