/*
  # Initial Schema for Battle Burn FF Tournament Platform

  1. New Tables
    - `users` - User accounts and player profiles
    - `tournaments` - Tournament information and settings
    - `payment_requests` - Payment verification requests
    - `token_transactions` - Token transaction history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only access for sensitive operations

  3. Storage
    - Create bucket for payment screenshots
    - Set up storage policies
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  tokens INTEGER DEFAULT 50,
  player_id TEXT NOT NULL,
  game_uid TEXT NOT NULL,
  registered_tournaments TEXT[] DEFAULT '{}',
  match_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('1v1', 'squad')),
  entry_fee INTEGER NOT NULL DEFAULT 0,
  kill_reward INTEGER NOT NULL DEFAULT 0,
  booyah_reward INTEGER NOT NULL DEFAULT 0,
  date_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('upcoming', 'waiting', 'full', 'live', 'active', 'completed')),
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  participants TEXT[] DEFAULT '{}',
  matches JSONB DEFAULT '[]',
  room_id TEXT DEFAULT '',
  room_password TEXT DEFAULT '',
  rules TEXT[] DEFAULT '{}',
  winner TEXT,
  results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  username TEXT NOT NULL,
  amount INTEGER NOT NULL,
  screenshot_url TEXT,
  screenshot_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  method TEXT NOT NULL CHECK (method IN ('jazzcash', 'easypaisa')),
  rejection_reason TEXT
);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'tournament_entry', 'tournament_win', 'kill_reward', 'bonus', 'penalty')),
  reason TEXT NOT NULL,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tournaments policies
CREATE POLICY "Anyone can read tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournaments" ON tournaments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Payment requests policies
CREATE POLICY "Users can read own payment requests" ON payment_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payment requests" ON payment_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all payment requests" ON payment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update payment requests" ON payment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Token transactions policies
CREATE POLICY "Users can read own transactions" ON token_transactions
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Admins can read all transactions" ON token_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create transactions" ON token_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment screenshots
CREATE POLICY "Users can upload payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can read all screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-screenshots' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at 
  BEFORE UPDATE ON tournaments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();