-- Add participant_id to entries table for tracking unique participants
-- This enables the 10-participant limit for free tier

ALTER TABLE entries 
ADD COLUMN IF NOT EXISTS participant_id TEXT;

-- Create index for efficient counting
CREATE INDEX IF NOT EXISTS idx_entries_participant_id ON entries(retro_id, participant_id);

-- Note: participant_id is the anonymous ID stored in localStorage (retroshift_voter_id)
-- It's the same ID used for voting, ensuring consistent participant tracking
