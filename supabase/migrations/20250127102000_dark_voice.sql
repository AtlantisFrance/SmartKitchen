/*
  # Create Result Images Table

  1. New Tables
    - `result_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `depthmap_id` (uuid, references depthmaps)
      - `image_url` (text, stores the URL from ComfyOnline API)
      - `task_id` (text, stores the ComfyOnline task ID)
      - `positive_prompt` (text)
      - `negative_prompt` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `result_images` table
    - Add policies for authenticated users to:
      - Insert their own result images
      - View their own result images
      - Delete their own result images
*/

-- Create result_images table
CREATE TABLE IF NOT EXISTS public.result_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  depthmap_id uuid REFERENCES public.depthmaps(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  task_id text,
  positive_prompt text,
  negative_prompt text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.result_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own result images"
  ON public.result_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own result images"
  ON public.result_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own result images"
  ON public.result_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS result_images_user_id_idx ON public.result_images(user_id);
CREATE INDEX IF NOT EXISTS result_images_depthmap_id_idx ON public.result_images(depthmap_id);