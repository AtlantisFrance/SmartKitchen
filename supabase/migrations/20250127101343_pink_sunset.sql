/*
  # Add profile fields to auth.users table
  
  1. Changes
    - Add name column (text)
    - Add surname column (text)
    - Add company column (text)
    
  2. Notes
    - Using ALTER TABLE to add columns to existing auth.users table
    - All new fields are nullable to maintain compatibility with existing users
    - Using DO block with IF NOT EXISTS checks for safety
*/

DO $$ 
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN name text;
  END IF;

  -- Add surname column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'surname'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN surname text;
  END IF;

  -- Add company column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'company'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN company text;
  END IF;
END $$;