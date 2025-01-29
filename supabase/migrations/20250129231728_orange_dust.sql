/*
  # Add UPDATE policy for result_images table

  1. Changes
    - Add policy to allow users to update their own result images
    
  2. Security
    - Users can only update their own result images
    - Enforces user_id check through RLS policy
*/

-- Add UPDATE policy for result_images
CREATE POLICY "Users can update their own result images"
  ON public.result_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);