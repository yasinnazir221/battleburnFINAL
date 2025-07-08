import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          role: 'player' | 'admin'
          tokens: number
          player_id: string
          game_uid: string
          registered_tournaments: string[]
          match_history: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          role?: 'player' | 'admin'
          tokens?: number
          player_id: string
          game_uid: string
          registered_tournaments?: string[]
          match_history?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          role?: 'player' | 'admin'
          tokens?: number
          player_id?: string
          game_uid?: string
          registered_tournaments?: string[]
          match_history?: any[]
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          title: string
          description: string
          mode: '1v1' | 'squad'
          entry_fee: number
          kill_reward: number
          booyah_reward: number
          date_time: string
          status: 'upcoming' | 'waiting' | 'full' | 'live' | 'active' | 'completed'
          max_players: number
          current_players: number
          participants: string[]
          matches: any[]
          room_id: string
          room_password: string
          rules: string[]
          winner: string | null
          results: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          mode: '1v1' | 'squad'
          entry_fee: number
          kill_reward: number
          booyah_reward: number
          date_time: string
          status?: 'upcoming' | 'waiting' | 'full' | 'live' | 'active' | 'completed'
          max_players: number
          current_players?: number
          participants?: string[]
          matches?: any[]
          room_id?: string
          room_password?: string
          rules?: string[]
          winner?: string | null
          results?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          mode?: '1v1' | 'squad'
          entry_fee?: number
          kill_reward?: number
          booyah_reward?: number
          date_time?: string
          status?: 'upcoming' | 'waiting' | 'full' | 'live' | 'active' | 'completed'
          max_players?: number
          current_players?: number
          participants?: string[]
          matches?: any[]
          room_id?: string
          room_password?: string
          rules?: string[]
          winner?: string | null
          results?: any[]
          updated_at?: string
        }
      }
      payment_requests: {
        Row: {
          id: string
          user_id: string
          user_email: string
          username: string
          amount: number
          screenshot_url: string | null
          screenshot_path: string | null
          status: 'pending' | 'approved' | 'rejected'
          submitted_at: string
          processed_at: string | null
          method: 'jazzcash' | 'easypaisa'
          rejection_reason: string | null
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          username: string
          amount: number
          screenshot_url?: string | null
          screenshot_path?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          processed_at?: string | null
          method: 'jazzcash' | 'easypaisa'
          rejection_reason?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          username?: string
          amount?: number
          screenshot_url?: string | null
          screenshot_path?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          submitted_at?: string
          processed_at?: string | null
          method?: 'jazzcash' | 'easypaisa'
          rejection_reason?: string | null
        }
      }
      token_transactions: {
        Row: {
          id: string
          player_id: string
          amount: number
          type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'tournament_win' | 'kill_reward' | 'bonus' | 'penalty'
          reason: string
          admin_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          amount: number
          type: 'deposit' | 'withdrawal' | 'tournament_entry' | 'tournament_win' | 'kill_reward' | 'bonus' | 'penalty'
          reason: string
          admin_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          amount?: number
          type?: 'deposit' | 'withdrawal' | 'tournament_entry' | 'tournament_win' | 'kill_reward' | 'bonus' | 'penalty'
          reason?: string
          admin_id?: string | null
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