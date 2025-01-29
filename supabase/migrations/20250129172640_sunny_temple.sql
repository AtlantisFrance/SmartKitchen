/*
  # Update depth map deletion to hourly intervals

  1. Changes
    - Change interval from 24 hours to 1 hour
    - Update function to delete ALL depth maps older than 1 hour
    - Keep ordered deletion to ensure oldest are removed first
    - Maintain detailed logging

  2. Security
    - Maintains existing security settings
    - Uses SECURITY DEFINER for proper permissions
*/

-- Update the function to delete depth maps older than 1 hour
CREATE OR REPLACE FUNCTION delete_old_depthmaps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  storage_object RECORD;
  deleted_count INTEGER := 0;
BEGIN
  -- First, get and delete all old depthmap storage objects, ordered by creation date
  FOR storage_object IN 
    SELECT obj.name
    FROM storage.objects obj
    JOIN public.depthmaps d ON obj.name = d.image_path
    WHERE obj.bucket_id = 'depthmaps'
    AND d.created_at < NOW() - INTERVAL '1 hour'
    ORDER BY d.created_at ASC  -- Process oldest first
  LOOP
    -- Delete from storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'depthmaps' 
    AND name = storage_object.name;
    
    deleted_count := deleted_count + 1;
    -- Log deletion (useful for monitoring)
    RAISE NOTICE 'Deleted storage object: % (% of batch)', storage_object.name, deleted_count;
  END LOOP;

  -- Then delete all database records older than 1 hour, ordered by creation date
  DELETE FROM public.depthmaps
  WHERE created_at < NOW() - INTERVAL '1 hour'
  AND id IN (
    SELECT id 
    FROM public.depthmaps 
    WHERE created_at < NOW() - INTERVAL '1 hour'
    ORDER BY created_at ASC
  );

  -- Log summary
  RAISE NOTICE 'Cleanup completed. Total storage objects deleted: %', deleted_count;
END;
$$;