/*
  # Fix infinite recursion in RLS policies

  1. Security Changes
    - Remove all recursive policy references
    - Use only auth.uid() for user identification
    - Simplify admin access using JWT claims only
    - Allow public signup without recursion

  2. Policy Structure
    - Basic user access: auth.uid() = id only
    - Admin access: JWT role claims only
    - Public signup: temporary unrestricted insert
*/

-- Drop all existing policies completely
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow public insert for signup" ON users;

-- Create simple, non-recursive policies

-- 1. Allow public signup (no auth required for initial insert)
CREATE POLICY "Enable public signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. Users can read their own profile only
CREATE POLICY "Users read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Users can update their own profile only
CREATE POLICY "Users update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Simple admin read access (using JWT claims only)
CREATE POLICY "Admin read access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- 5. Simple admin update access (using JWT claims only)
CREATE POLICY "Admin update access"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role')::text = 'admin'
  )
  WITH CHECK (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role')::text = 'admin'
  );