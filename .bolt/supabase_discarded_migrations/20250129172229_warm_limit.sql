/*
  # Add automatic deletion of old pictures

  1. Changes
    - Create function to delete old pictures
    - Create cron job to run every hour
    - Delete pictures older than 24 hours
  
  2. Security
    - Function runs with security definer to bypass RLS
*/

-- Create function to delete old pictures
CREATE OR REPLACE FUNCTION delete_old_pictures()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old depthmaps
  DELETE FROM storage.objects
  WHERE bucket_id = 'depthmaps'
  AND created_at < NOW() - INTERVAL '24 hours';

  -- Delete old depthmap records
  DELETE FROM public.depthmaps
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create cron job to run every hour
SELECT cron.schedule(
  'delete-old-pictures',  -- job name
  '0 * * * *',           -- every hour
  'SELECT delete_old_pictures();'
);