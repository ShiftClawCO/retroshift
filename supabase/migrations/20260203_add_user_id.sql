-- Add user_id column to retros table for authenticated users
-- This allows users to see their own retros while keeping anonymous participation

ALTER TABLE retros 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for faster lookup of user's retros
CREATE INDEX IF NOT EXISTS idx_retros_user_id ON retros(user_id);

-- Update RLS policies to allow users to see their own retros
-- First, ensure RLS is enabled
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read any retro (needed for participation via link)
DROP POLICY IF EXISTS "Anyone can read retros" ON retros;
CREATE POLICY "Anyone can read retros" ON retros
  FOR SELECT USING (true);

-- Policy: Authenticated users can create retros
DROP POLICY IF EXISTS "Authenticated users can create retros" ON retros;
CREATE POLICY "Authenticated users can create retros" ON retros
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR user_id IS NULL
  );

-- Policy: Users can update their own retros
DROP POLICY IF EXISTS "Users can update own retros" ON retros;
CREATE POLICY "Users can update own retros" ON retros
  FOR UPDATE USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users can delete their own retros
DROP POLICY IF EXISTS "Users can delete own retros" ON retros;
CREATE POLICY "Users can delete own retros" ON retros
  FOR DELETE USING (
    auth.uid() = user_id
  );

-- Entries table policies (for anonymous participation)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read entries" ON entries;
CREATE POLICY "Anyone can read entries" ON entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create entries" ON entries;
CREATE POLICY "Anyone can create entries" ON entries
  FOR INSERT WITH CHECK (true);

-- Votes table policies
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create votes" ON votes;
CREATE POLICY "Anyone can create votes" ON votes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete own votes" ON votes;
CREATE POLICY "Anyone can delete own votes" ON votes
  FOR DELETE USING (true);
