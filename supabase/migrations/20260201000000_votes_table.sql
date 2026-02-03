-- Votes table for feedback reactions
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('👍', '🔥', '💡')),
  voter_id TEXT NOT NULL, -- anonymous session ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, voter_id, emoji) -- one vote per emoji per voter per entry
);

-- Indexes
CREATE INDEX idx_votes_entry_id ON votes(entry_id);

-- RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can add votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete own votes" ON votes FOR DELETE USING (true);
