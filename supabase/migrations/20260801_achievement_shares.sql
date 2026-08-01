-- Run in Supabase SQL Editor if achievement_shares table is missing
-- (also included in supabase/schema.sql)

CREATE TABLE IF NOT EXISTS achievement_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_token TEXT UNIQUE NOT NULL,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  story_id TEXT,
  story_title TEXT,
  emoji TEXT DEFAULT '🌟',
  seeds_earned INT DEFAULT 0,
  child_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievement_shares_token ON achievement_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_achievement_shares_parent ON achievement_shares(parent_id, created_at DESC);

ALTER TABLE achievement_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents can insert shares for their children" ON achievement_shares;
CREATE POLICY "Parents can insert shares for their children"
  ON achievement_shares FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid())
  );

DROP POLICY IF EXISTS "Parents can read their family shares" ON achievement_shares;
CREATE POLICY "Parents can read their family shares"
  ON achievement_shares FOR SELECT
  USING (parent_id = auth.uid());
