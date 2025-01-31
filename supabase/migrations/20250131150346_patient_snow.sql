/*
  # Add 3D Pictures Support

  1. New Tables
    - `pictures_3d`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `image_url` (text, the original image)
      - `depth_map_url` (text, the depth map image)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pictures_3d` table
    - Add policies for authenticated users to manage their own pictures
*/

-- Create pictures_3d table
CREATE TABLE IF NOT EXISTS public.pictures_3d (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  description text,
  image_url text NOT NULL,
  depth_map_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pictures_3d ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own 3D pictures"
  ON public.pictures_3d
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own 3D pictures"
  ON public.pictures_3d
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 3D pictures"
  ON public.pictures_3d
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 3D pictures"
  ON public.pictures_3d
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_pictures_3d_updated_at
  BEFORE UPDATE ON public.pictures_3d
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();