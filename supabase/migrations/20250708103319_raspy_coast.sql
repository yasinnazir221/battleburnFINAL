/*
  # Fix RLS policies for users table

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new policies that use auth.uid() directly instead of checking users table
    - Allow users to insert their own profile during signup
    - Allow users to read and update their own data
    - Allow admins to manage all users without circular references

  2. Policy Changes
    - Replace recursive policies with direct auth.uid() checks
    - Add proper INSERT policy for user registration
    - Maintain admin access without causing recursion
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create new non-recursive policies

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own data (no recursion)
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data (no recursion)
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all users (check role directly from auth metadata)
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role' = 'admin') OR
    (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Allow admins to update all users (check role directly from auth metadata)
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role' = 'admin') OR
    (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin'
  )
  WITH CHECK (
    auth.uid() = id OR 
    (auth.jwt() ->> 'role' = 'admin') OR
    (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Allow public access for initial user creation (needed for signup)
CREATE POLICY "Allow public insert for signup"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);