-- ============================================================================
-- Mirava Magic Prompt - Supabase Setup Instructions
-- ============================================================================
-- 
-- Run this SQL in your Supabase Dashboard SQL Editor to set up the stats table
-- 
-- Steps:
-- 1. Go to https://supabase.com and log in to your project
-- 2. Navigate to SQL Editor in the left sidebar
-- 3. Paste this entire script and click "Run"
-- 4. After running, copy your Supabase URL and Anon Key from Project Settings > API
-- 5. Add them to your .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
--
-- ============================================================================

-- Drop existing objects if they exist (for clean reinstall)
DROP FUNCTION IF EXISTS increment_prompt_count();
DROP POLICY IF EXISTS "Allow public read" ON stats;
DROP TABLE IF EXISTS stats;

-- Create stats table
CREATE TABLE stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_prompts BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row
INSERT INTO stats (id, total_prompts) VALUES ('global', 0)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view stats)
CREATE POLICY "Allow public read" ON stats FOR SELECT USING (true);

-- RPC function for atomic increment (prevents race conditions)
-- This function atomically increments the total_prompts counter
CREATE OR REPLACE FUNCTION increment_prompt_count()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE stats 
  SET total_prompts = total_prompts + 1, updated_at = NOW() 
  WHERE id = 'global'
  RETURNING total_prompts INTO new_count;
  RETURN new_count;
END;
$$;

-- Enable realtime subscriptions for the stats table
-- This allows clients to receive instant updates when stats change
ALTER PUBLICATION supabase_realtime ADD TABLE stats;

-- ============================================================================
-- Verification Query (run this to verify setup)
-- ============================================================================
-- SELECT * FROM stats WHERE id = 'global';
-- SELECT increment_prompt_count(); -- Test the increment function
