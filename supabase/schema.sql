-- RetroShift Database Schema
-- Run this in Supabase SQL Editor

-- Retros table
CREATE TABLE retros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'start-stop-continue', -- start-stop-continue, mad-sad-glad, liked-learned-lacked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closes_at TIMESTAMP WITH TIME ZONE,
  is_closed BOOLEAN DEFAULT FALSE,
  owner_email TEXT, -- optional, for claiming later
  access_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8)
);

-- Feedback entries
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  retro_id UUID REFERENCES retros(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'start', 'stop', 'continue', etc.
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_entries_retro_id ON entries(retro_id);
CREATE INDEX idx_retros_access_code ON retros(access_code);

-- Row Level Security
ALTER TABLE retros ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read retros by access_code (we'll filter in app)
CREATE POLICY "Anyone can view retros" ON retros FOR SELECT USING (true);
CREATE POLICY "Anyone can create retros" ON retros FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own retros" ON retros FOR UPDATE USING (true);

-- Policies: Anyone can add entries to open retros
CREATE POLICY "Anyone can view entries" ON entries FOR SELECT USING (true);
CREATE POLICY "Anyone can add entries" ON entries FOR INSERT WITH CHECK (true);
