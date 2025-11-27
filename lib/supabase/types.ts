export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          wallet_address: string
          display_name: string | null
          avatar_url: string | null
          total_points: number
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          display_name?: string | null
          avatar_url?: string | null
          total_points?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          reference_type: string | null
          reference_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          quest_type: 'poll_participation' | 'poll_creation' | 'social_referral'
          category: 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special'
          requirements: Json
          point_reward: number
          badge_reward_id: string | null
          is_active: boolean
          start_date: string | null
          end_date: string | null
          max_completions: number | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          quest_type: 'poll_participation' | 'poll_creation' | 'social_referral'
          category: 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special'
          requirements: Json
          point_reward: number
          badge_reward_id?: string | null
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          max_completions?: number | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          quest_type?: 'poll_participation' | 'poll_creation' | 'social_referral'
          category?: 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special'
          requirements?: Json
          point_reward?: number
          badge_reward_id?: string | null
          is_active?: boolean
          start_date?: string | null
          end_date?: string | null
          max_completions?: number | null
          sort_order?: number
          created_at?: string
        }
      }
      user_quest_progress: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          current_progress: Json
          completed_count: number
          last_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quest_id: string
          current_progress?: Json
          completed_count?: number
          last_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string
          current_progress?: Json
          completed_count?: number
          last_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          category: 'participation' | 'creation' | 'social' | 'streak' | 'milestone' | 'special'
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          requirements: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          category: 'participation' | 'creation' | 'social' | 'streak' | 'milestone' | 'special'
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          requirements?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          category?: 'participation' | 'creation' | 'social' | 'streak' | 'milestone' | 'special'
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          requirements?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_wallet: string
          referred_user_id: string | null
          status: 'pending' | 'completed' | 'rewarded'
          completed_at: string | null
          rewarded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_wallet: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed' | 'rewarded'
          completed_at?: string | null
          rewarded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_wallet?: string
          referred_user_id?: string | null
          status?: 'pending' | 'completed' | 'rewarded'
          completed_at?: string | null
          rewarded_at?: string | null
          created_at?: string
        }
      }
      reward_shop_items: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string | null
          point_cost: number
          reward_type: 'pulse_tokens' | 'nft' | 'discount' | 'feature_unlock' | 'custom'
          reward_value: Json
          stock: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url?: string | null
          point_cost: number
          reward_type: 'pulse_tokens' | 'nft' | 'discount' | 'feature_unlock' | 'custom'
          reward_value: Json
          stock?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string | null
          point_cost?: number
          reward_type?: 'pulse_tokens' | 'nft' | 'discount' | 'feature_unlock' | 'custom'
          reward_value?: Json
          stock?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      reward_redemptions: {
        Row: {
          id: string
          user_id: string
          item_id: string | null
          redemption_type: 'shop' | 'exchange' | 'milestone'
          points_spent: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash: string | null
          metadata: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_id?: string | null
          redemption_type: 'shop' | 'exchange' | 'milestone'
          points_spent: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash?: string | null
          metadata?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string | null
          redemption_type?: 'shop' | 'exchange' | 'milestone'
          points_spent?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash?: string | null
          metadata?: Json | null
          created_at?: string
          completed_at?: string | null
        }
      }
      milestones: {
        Row: {
          id: string
          name: string
          description: string
          threshold: number
          reward_type: 'pulse_tokens' | 'badge' | 'title' | 'feature_unlock'
          reward_value: Json
          tier: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          threshold: number
          reward_type: 'pulse_tokens' | 'badge' | 'title' | 'feature_unlock'
          reward_value: Json
          tier: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          threshold?: number
          reward_type?: 'pulse_tokens' | 'badge' | 'title' | 'feature_unlock'
          reward_value?: Json
          tier?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_milestones: {
        Row: {
          id: string
          user_id: string
          milestone_id: string
          achieved_at: string
          claimed: boolean
          claim_transaction_hash: string | null
        }
        Insert: {
          id?: string
          user_id: string
          milestone_id: string
          achieved_at?: string
          claimed?: boolean
          claim_transaction_hash?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          milestone_id?: string
          achieved_at?: string
          claimed?: boolean
          claim_transaction_hash?: string | null
        }
      }
      on_chain_activity_sync: {
        Row: {
          id: string
          wallet_address: string
          activity_type: 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create'
          on_chain_id: string
          transaction_hash: string | null
          block_number: number | null
          metadata: Json | null
          synced_at: string
          processed: boolean
        }
        Insert: {
          id?: string
          wallet_address: string
          activity_type: 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create'
          on_chain_id: string
          transaction_hash?: string | null
          block_number?: number | null
          metadata?: Json | null
          synced_at?: string
          processed?: boolean
        }
        Update: {
          id?: string
          wallet_address?: string
          activity_type?: 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create'
          on_chain_id?: string
          transaction_hash?: string | null
          block_number?: number | null
          metadata?: Json | null
          synced_at?: string
          processed?: boolean
        }
      }
      leaderboard_cache: {
        Row: {
          id: string
          user_id: string
          timeframe: 'weekly' | 'monthly' | 'all_time'
          points: number
          rank: number
          period_start: string | null
          period_end: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timeframe: 'weekly' | 'monthly' | 'all_time'
          points: number
          rank: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timeframe?: 'weekly' | 'monthly' | 'all_time'
          points?: number
          rank?: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Quest = Database['public']['Tables']['quests']['Row']
export type QuestProgress = Database['public']['Tables']['user_quest_progress']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type PointTransaction = Database['public']['Tables']['point_transactions']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type UserMilestone = Database['public']['Tables']['user_milestones']['Row']
export type ShopItem = Database['public']['Tables']['reward_shop_items']['Row']
export type Redemption = Database['public']['Tables']['reward_redemptions']['Row']
export type Referral = Database['public']['Tables']['referrals']['Row']
export type OnChainActivity = Database['public']['Tables']['on_chain_activity_sync']['Row']
export type LeaderboardEntry = Database['public']['Tables']['leaderboard_cache']['Row']

// Quest types
export type QuestType = 'poll_participation' | 'poll_creation' | 'social_referral'
export type QuestCategory = 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special'

// Badge types
export type BadgeCategory = 'participation' | 'creation' | 'social' | 'streak' | 'milestone' | 'special'
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

// Leaderboard types
export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all_time'

// Activity types
export type ActivityType = 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create'
