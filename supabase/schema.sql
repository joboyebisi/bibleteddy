-- ============================================================
-- Bible Teddy (BTB) — Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PARENT PROFILES (linked to Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  youversion_user_id TEXT,
  youversion_access_token TEXT,  -- OAuth access token for YouVersion API
  youversion_refresh_token TEXT, -- OAuth refresh token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can read/write own profile"
  ON parent_profiles FOR ALL
  USING (auth.uid() = id);

-- ============================================================
-- CHILD PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT DEFAULT 'kids',        -- 'little' | 'kids' | 'teens'
  avatar_url TEXT,
  streak INT DEFAULT 0,                  -- Daily reading streak
  seeds INT DEFAULT 0,                   -- Faith seeds (XP)
  badges TEXT[] DEFAULT '{}',           -- Earned badge names
  virtues JSONB DEFAULT '{"love":0,"faith":0,"kindness":0}',
  completed_checkpoints TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can CRUD their children"
  ON child_profiles FOR ALL
  USING (parent_id = auth.uid());

-- ============================================================
-- CURATED STORIES (Parent-submitted YouTube URLs)
-- ============================================================
CREATE TABLE IF NOT EXISTS curated_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,                       -- Extracted video ID
  thumbnail_url TEXT,
  description TEXT,
  gemini_topic TEXT,                     -- Gemini-extracted topic
  quiz_questions JSONB,                 -- AI-generated quiz checkpoints
  age_group TEXT DEFAULT 'all',
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE curated_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can CRUD their curated stories"
  ON curated_stories FOR ALL
  USING (parent_id = auth.uid());
CREATE POLICY "Kids can read curated stories for their parent"
  ON curated_stories FOR SELECT
  USING (true);  -- Children read all approved stories (parent_id linked via child profile)

-- ============================================================
-- BADGES EARNED (Detailed badge log per child)
-- ============================================================
CREATE TABLE IF NOT EXISTS badges_earned (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  story_id TEXT,                         -- Which story triggered the badge
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE badges_earned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their children's badges"
  ON badges_earned FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );
CREATE POLICY "System can insert badges"
  ON badges_earned FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- VERSE COMPLETIONS (Track which verses a child has recited)
-- ============================================================
CREATE TABLE IF NOT EXISTS verse_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  verse_reference TEXT NOT NULL,         -- e.g. "Genesis 1:1"
  translation TEXT DEFAULT 'ICB',
  accuracy_percent INT DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  seeds_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE verse_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view verse completions"
  ON verse_completions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );
CREATE POLICY "System can insert verse completions"
  ON verse_completions FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- CHECKPOINT COMPLETIONS (Track which video checkpoints passed)
-- ============================================================
CREATE TABLE IF NOT EXISTS checkpoint_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  seeds_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE checkpoint_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view checkpoint completions"
  ON checkpoint_completions FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );
CREATE POLICY "System can insert checkpoint completions"
  ON checkpoint_completions FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- WEEKLY STREAKS (Daily activity for streak tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT,                   -- 'verse_recite' | 'video_quiz' | 'trivia'
  seeds_earned INT DEFAULT 0,
  UNIQUE(child_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view daily activity"
  ON daily_activity FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME: Enable realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE child_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE badges_earned;
ALTER PUBLICATION supabase_realtime ADD TABLE verse_completions;

-- ============================================================
-- FUNCTION: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ACHIEVEMENT SHARES (Public share links + parent invite funnel)
-- ============================================================
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

CREATE POLICY "Parents can insert shares for their children"
  ON achievement_shares FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents can read their family shares"
  ON achievement_shares FOR SELECT
  USING (parent_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE achievement_shares;
