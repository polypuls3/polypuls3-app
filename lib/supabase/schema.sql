-- PolyPulse Quests & Gamification System Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- User profiles (linked to wallet addresses)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_points BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point transactions ledger
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'quest_completion', 'badge_earned', 'streak_bonus', 'referral', 'redemption'
  reference_type TEXT, -- 'quest', 'badge', 'streak', 'referral', 'reward_shop', 'pulse_exchange', 'milestone'
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('participation', 'creation', 'social', 'streak', 'milestone', 'special')),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest definitions (admin-managed)
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('poll_participation', 'poll_creation', 'social_referral')),
  category TEXT NOT NULL CHECK (category IN ('daily', 'weekly', 'monthly', 'one-time', 'special')),
  requirements JSONB NOT NULL,
  point_reward INTEGER NOT NULL,
  badge_reward_id UUID REFERENCES badges(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_completions INTEGER, -- null = unlimited for repeatable quests
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest progress
CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  current_progress JSONB DEFAULT '{}',
  completed_count INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  referred_wallet TEXT NOT NULL,
  referred_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward shop items
CREATE TABLE IF NOT EXISTS reward_shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  point_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('pulse_tokens', 'nft', 'discount', 'feature_unlock', 'custom')),
  reward_value JSONB NOT NULL,
  stock INTEGER, -- null = unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES reward_shop_items(id) ON DELETE SET NULL,
  redemption_type TEXT NOT NULL CHECK (redemption_type IN ('shop', 'exchange', 'milestone')),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Tiered milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('pulse_tokens', 'badge', 'title', 'feature_unlock')),
  reward_value JSONB NOT NULL,
  tier INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User milestone achievements
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  claimed BOOLEAN DEFAULT false,
  claim_transaction_hash TEXT,
  UNIQUE(user_id, milestone_id)
);

-- On-chain activity sync tracking
CREATE TABLE IF NOT EXISTS on_chain_activity_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('poll_vote', 'poll_create', 'survey_respond', 'survey_create')),
  on_chain_id TEXT NOT NULL,
  transaction_hash TEXT,
  block_number BIGINT,
  metadata JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  UNIQUE(wallet_address, activity_type, on_chain_id)
);

-- Leaderboard cache
CREATE TABLE IF NOT EXISTS leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  timeframe TEXT NOT NULL CHECK (timeframe IN ('weekly', 'monthly', 'all_time')),
  points INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, timeframe, period_start)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral ON user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_quest ON user_quest_progress(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_on_chain_sync_wallet ON on_chain_activity_sync(wallet_address, activity_type);
CREATE INDEX IF NOT EXISTS idx_on_chain_sync_processed ON on_chain_activity_sync(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_timeframe ON leaderboard_cache(timeframe, rank);
CREATE INDEX IF NOT EXISTS idx_quests_active ON quests(is_active, category);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id, status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quest_progress_updated_at
    BEFORE UPDATE ON user_quest_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache(p_timeframe TEXT)
RETURNS void AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  IF p_timeframe = 'weekly' THEN
    v_period_start := date_trunc('week', CURRENT_DATE)::DATE;
    v_period_end := (v_period_start + INTERVAL '1 week')::DATE;
  ELSIF p_timeframe = 'monthly' THEN
    v_period_start := date_trunc('month', CURRENT_DATE)::DATE;
    v_period_end := (v_period_start + INTERVAL '1 month')::DATE;
  ELSE
    v_period_start := '1970-01-01'::DATE;
    v_period_end := '2099-12-31'::DATE;
  END IF;

  -- Delete old cache for this timeframe/period
  DELETE FROM leaderboard_cache
  WHERE timeframe = p_timeframe
    AND (period_start = v_period_start OR p_timeframe = 'all_time');

  -- Insert new rankings
  INSERT INTO leaderboard_cache (user_id, timeframe, points, rank, period_start, period_end)
  SELECT
    pt.user_id,
    p_timeframe,
    COALESCE(SUM(pt.amount), 0)::INTEGER as points,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pt.amount), 0) DESC)::INTEGER as rank,
    v_period_start,
    v_period_end
  FROM point_transactions pt
  WHERE pt.created_at >= v_period_start::TIMESTAMPTZ
    AND pt.created_at < v_period_end::TIMESTAMPTZ
  GROUP BY pt.user_id
  HAVING SUM(pt.amount) > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE on_chain_activity_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for quests, badges, milestones, shop items (definitions)
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_shop_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR DEFINITION TABLES (Public Read)
-- ============================================

CREATE POLICY "Public read quests" ON quests FOR SELECT USING (is_active = true);
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (is_active = true);
CREATE POLICY "Public read milestones" ON milestones FOR SELECT USING (is_active = true);
CREATE POLICY "Public read shop items" ON reward_shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public read leaderboard" ON leaderboard_cache FOR SELECT USING (true);

-- ============================================
-- RLS POLICIES FOR USER DATA TABLES
-- Note: Since we use wallet-based auth (not Supabase Auth), we allow
-- the anon key to perform operations. The wallet address serves as identity.
-- For production, consider using signed messages for write verification.
-- ============================================

-- User Profiles: Anyone can read, create, and update profiles
-- (wallet address is the unique identifier)
CREATE POLICY "Anyone can view user profiles" ON user_profiles
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON user_profiles
  FOR UPDATE USING (true);

-- Point Transactions: Public read (for leaderboards), insert via service role
CREATE POLICY "Anyone can view point transactions" ON point_transactions
  FOR SELECT USING (true);
CREATE POLICY "Service can insert point transactions" ON point_transactions
  FOR INSERT WITH CHECK (true);

-- User Quest Progress: Users can read their own, service handles writes
CREATE POLICY "Anyone can view quest progress" ON user_quest_progress
  FOR SELECT USING (true);
CREATE POLICY "Service can manage quest progress" ON user_quest_progress
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update quest progress" ON user_quest_progress
  FOR UPDATE USING (true);

-- User Badges: Public read (for profiles), service handles writes
CREATE POLICY "Anyone can view user badges" ON user_badges
  FOR SELECT USING (true);
CREATE POLICY "Service can insert user badges" ON user_badges
  FOR INSERT WITH CHECK (true);

-- User Milestones: Public read, service handles writes
CREATE POLICY "Anyone can view user milestones" ON user_milestones
  FOR SELECT USING (true);
CREATE POLICY "Service can insert user milestones" ON user_milestones
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update user milestones" ON user_milestones
  FOR UPDATE USING (true);

-- Referrals: Users can view and create referrals
CREATE POLICY "Anyone can view referrals" ON referrals
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create referrals" ON referrals
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update referrals" ON referrals
  FOR UPDATE USING (true);

-- Reward Redemptions: Users can view their own, service handles writes
CREATE POLICY "Anyone can view reward redemptions" ON reward_redemptions
  FOR SELECT USING (true);
CREATE POLICY "Service can manage reward redemptions" ON reward_redemptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update reward redemptions" ON reward_redemptions
  FOR UPDATE USING (true);

-- On-chain Activity Sync: Service handles all operations
CREATE POLICY "Anyone can view activity sync" ON on_chain_activity_sync
  FOR SELECT USING (true);
CREATE POLICY "Service can insert activity sync" ON on_chain_activity_sync
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update activity sync" ON on_chain_activity_sync
  FOR UPDATE USING (true);

-- ============================================
-- SEED DATA: QUESTS
-- ============================================

INSERT INTO quests (title, description, quest_type, category, requirements, point_reward, sort_order) VALUES
-- One-time quests
('First Vote', 'Cast your first vote on any poll', 'poll_participation', 'one-time', '{"type": "vote_count", "target": 1}', 50, 1),
('Poll Creator', 'Create your first poll', 'poll_creation', 'one-time', '{"type": "poll_count", "target": 1}', 100, 2),
('First Referral', 'Invite a friend who becomes active', 'social_referral', 'one-time', '{"type": "referral_count", "target": 1}', 200, 3),
('Regular Voter', 'Vote on 25 polls', 'poll_participation', 'one-time', '{"type": "vote_count", "target": 25}', 150, 10),
('Voting Veteran', 'Vote on 100 polls', 'poll_participation', 'one-time', '{"type": "vote_count", "target": 100}', 500, 11),
('Power Voter', 'Vote on 500 polls', 'poll_participation', 'one-time', '{"type": "vote_count", "target": 500}', 2000, 12),
('Prolific Creator', 'Create 10 polls', 'poll_creation', 'one-time', '{"type": "poll_count", "target": 10}', 250, 20),
('Engaging Creator', 'Have a poll receive 10 or more responses', 'poll_creation', 'one-time', '{"type": "response_count", "target": 10}', 150, 21),
('Community Builder', 'Refer 5 active users', 'social_referral', 'one-time', '{"type": "referral_count", "target": 5}', 750, 30),
('Influencer', 'Refer 10 active users', 'social_referral', 'one-time', '{"type": "referral_count", "target": 10}', 1500, 31),

-- Daily quests
('Daily Voter', 'Vote on at least one poll today', 'poll_participation', 'daily', '{"type": "vote_count", "target": 1, "timeframe": "day"}', 10, 100),
('Active Participant', 'Vote on 3 polls today', 'poll_participation', 'daily', '{"type": "vote_count", "target": 3, "timeframe": "day"}', 25, 101),

-- Weekly quests
('Weekly Warrior', 'Vote on 10 polls this week', 'poll_participation', 'weekly', '{"type": "vote_count", "target": 10, "timeframe": "week"}', 75, 200),
('Governance Enthusiast', 'Vote on 5 governance polls this week', 'poll_participation', 'weekly', '{"type": "vote_count", "target": 5, "timeframe": "week", "category": "governance"}', 100, 201),
('Category Explorer', 'Vote on polls from 4 different categories this week', 'poll_participation', 'weekly', '{"type": "unique_categories", "target": 4, "timeframe": "week"}', 75, 202),
('Weekly Creator', 'Create a poll this week', 'poll_creation', 'weekly', '{"type": "poll_count", "target": 1, "timeframe": "week"}', 50, 210)

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: BADGES
-- ============================================

INSERT INTO badges (name, description, category, rarity, requirements) VALUES
-- Participation badges
('First Step', 'Cast your first vote', 'participation', 'common', '{"type": "vote_count", "target": 1}'),
('Regular Voter', 'Vote on 25 polls', 'participation', 'uncommon', '{"type": "vote_count", "target": 25}'),
('Voting Veteran', 'Vote on 100 polls', 'participation', 'rare', '{"type": "vote_count", "target": 100}'),
('Democratic Champion', 'Vote on 500 polls', 'participation', 'epic', '{"type": "vote_count", "target": 500}'),
('Governance Legend', 'Vote on 1000 polls', 'participation', 'legendary', '{"type": "vote_count", "target": 1000}'),

-- Creation badges
('Poll Starter', 'Create your first poll', 'creation', 'common', '{"type": "poll_count", "target": 1}'),
('Crowd Gatherer', 'Get 50 total responses on your polls', 'creation', 'uncommon', '{"type": "total_responses", "target": 50}'),
('Community Voice', 'Create 10 polls with 10+ responses each', 'creation', 'rare', '{"type": "successful_polls", "target": 10}'),
('Poll Master', 'Create 50 polls', 'creation', 'epic', '{"type": "poll_count", "target": 50}'),

-- Streak badges
('Getting Started', 'Maintain a 3-day streak', 'streak', 'common', '{"type": "streak", "target": 3}'),
('Committed', 'Maintain a 7-day streak', 'streak', 'uncommon', '{"type": "streak", "target": 7}'),
('Dedicated', 'Maintain a 30-day streak', 'streak', 'rare', '{"type": "streak", "target": 30}'),
('Unstoppable', 'Maintain a 100-day streak', 'streak', 'legendary', '{"type": "streak", "target": 100}'),

-- Social badges
('Ambassador', 'Refer 3 active users', 'social', 'uncommon', '{"type": "referral_count", "target": 3}'),
('Network Builder', 'Refer 10 active users', 'social', 'rare', '{"type": "referral_count", "target": 10}'),
('Community Champion', 'Refer 25 active users', 'social', 'epic', '{"type": "referral_count", "target": 25}'),

-- Special badges
('Early Adopter', 'Among the first 1000 users', 'special', 'epic', '{"type": "early_adopter", "target": 1000}'),
('Beta Tester', 'Participated in beta testing', 'special', 'legendary', '{"type": "beta_tester"}')

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: MILESTONES
-- ============================================

INSERT INTO milestones (name, description, threshold, reward_type, reward_value, tier) VALUES
('Pulse Newcomer', 'Earn your first 100 points', 100, 'badge', '{"badge_name": "Pulse Newcomer"}', 1),
('Active Voter', 'Reach 500 points', 500, 'pulse_tokens', '{"amount": 5}', 2),
('Community Member', 'Reach 1,000 points', 1000, 'title', '{"title": "Community Member"}', 3),
('Pulse Enthusiast', 'Reach 2,500 points', 2500, 'pulse_tokens', '{"amount": 15}', 4),
('Governance Pro', 'Reach 5,000 points', 5000, 'badge', '{"badge_name": "Governance Pro", "rarity": "rare"}', 5),
('Pulse Champion', 'Reach 10,000 points', 10000, 'pulse_tokens', '{"amount": 50}', 6),
('Platform Legend', 'Reach 25,000 points', 25000, 'pulse_tokens', '{"amount": 150}', 7)

ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: REWARD SHOP ITEMS
-- ============================================

INSERT INTO reward_shop_items (name, description, point_cost, reward_type, reward_value) VALUES
('1 PULSE Token', 'Exchange 100 points for 1 PULSE token', 100, 'pulse_tokens', '{"amount": 1}'),
('10 PULSE Tokens', 'Exchange 900 points for 10 PULSE tokens (10% bonus!)', 900, 'pulse_tokens', '{"amount": 10}'),
('50 PULSE Tokens', 'Exchange 4000 points for 50 PULSE tokens (20% bonus!)', 4000, 'pulse_tokens', '{"amount": 50}'),
('Poll Fee Discount 50%', 'Get 50% off your next poll creation fee', 250, 'discount', '{"type": "poll_fee", "percent": 50, "uses": 1}'),
('Premium Badge Frame', 'Unlock a premium frame for your badges', 500, 'feature_unlock', '{"feature": "premium_badge_frame"}'),
('Custom Poll Theme', 'Unlock a custom theme for your polls', 1000, 'feature_unlock', '{"feature": "custom_poll_theme"}')

ON CONFLICT DO NOTHING;
