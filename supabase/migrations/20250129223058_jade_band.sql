/*
  # Clean up unused columns

  1. Changes
    - Remove unused columns from result_images:
      - temp_image_url (not used in application)
      - status (managed in UI state)
    - Remove unused columns from depthmaps:
      - project_id (project association handled through result_images)

  2. Notes
    - All removed columns are not used in the application code
    - No data migration needed as these columns are not used for any functionality
*/

-- Remove unused columns from result_images
ALTER TABLE public.result_images
DROP COLUMN IF EXISTS temp_image_url,
DROP COLUMN IF EXISTS status;

-- Remove unused columns from depthmaps
ALTER TABLE public.depthmaps
DROP COLUMN IF EXISTS project_id;