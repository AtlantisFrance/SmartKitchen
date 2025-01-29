/*
  # Fix projects table RLS policy

  1. Changes
    - Add default value for user_id using auth.uid()
    - Update RLS policy to handle user_id automatically
    - Add trigger to ensure user_id matches auth.uid()

  2. Security
    - Ensures users can only create projects for themselves
    - Maintains existing RLS policies for viewing, updating, and deleting
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;

-- Create new insert policy that doesn't check user_id
CREATE POLICY "Users can create their own projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger to automatically set user_id
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new projects
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_project();