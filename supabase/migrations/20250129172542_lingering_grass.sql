/*
  # Update depth map deletion function

  1. Changes
    - Modify delete_old_depthmaps function to delete oldest depth maps first
    - Add ordering by created_at to ensure oldest are deleted first
    - Add logging for better tracking

  2. Security
    - Maintains existing security settings
    - Uses SECURITY DEFINER for proper permissions
*/

-- Update the function to delete oldest depth maps first
CREATE OR REPLACE FUNCTION delete_old_depthmaps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  storage_object RECORD;
BEGIN
  -- First, get all old depthmap records, ordered by creation date
  FOR storage_object IN 
    SELECT obj.name
    FROM storage.objects obj
    JOIN public.depthmaps d ON obj.name = d.image_path
    WHERE obj.bucket_id = 'depthmaps'
    AND d.created_at < NOW() - INTERVAL '24 hours'
    ORDER BY d.created_at ASC  -- Process oldest first
  LOOP
    -- Delete from storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'depthmaps' 
    AND name = storage_object.name;
    
    -- Log deletion (useful for monitoring)
    RAISE NOTICE 'Deleted storage object: %', storage_object.name;
  END LOOP;

  -- Then delete the database records, ordered by creation date
  DELETE FROM public.depthmaps
  WHERE created_at < NOW() - INTERVAL '24 hours'
  AND id IN (
    SELECT id 
    FROM public.depthmaps 
    WHERE created_at < NOW() - INTERVAL '24 hours'
    ORDER BY created_at ASC
  );
END;
$$;