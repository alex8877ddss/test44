/*
  # Initial Schema Setup for AirdropHub

  1. New Tables
    - `whitelist_tokens`
      - `id` (uuid, primary key)
      - `address` (text, unique)
      - `name` (text)
      - `symbol` (text)
      - `airdrop_amount` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `airdrop_claims`
      - `id` (uuid, primary key)
      - `wallet_address` (text)
      - `tokens_claimed` (jsonb)
      - `total_amount` (integer)
      - `transaction_hash` (text, nullable)
      - `status` (text with check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `admin_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `installation_status`
      - `id` (uuid, primary key)
      - `is_installed` (boolean)
      - `installed_at` (timestamp)
      - `version` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access where appropriate
*/

-- Create whitelist_tokens table
CREATE TABLE whitelist_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  airdrop_amount integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create airdrop_claims table
CREATE TABLE airdrop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  tokens_claimed jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount integer NOT NULL DEFAULT 0,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for status
ALTER TABLE airdrop_claims ADD CONSTRAINT airdrop_claims_status_check 
CHECK (status IN ('pending', 'completed', 'failed'));

-- Create admin_settings table
CREATE TABLE admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installation_status table
CREATE TABLE installation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_installed boolean DEFAULT false,
  installed_at timestamptz DEFAULT now(),
  version text DEFAULT '1.0.0'
);

-- Enable Row Level Security
ALTER TABLE whitelist_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_status ENABLE ROW LEVEL SECURITY;

-- Policies for whitelist_tokens
CREATE POLICY "Public can read active whitelist tokens"
  ON whitelist_tokens
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage whitelist tokens"
  ON whitelist_tokens
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for airdrop_claims
CREATE POLICY "Public can read claims"
  ON airdrop_claims
  FOR SELECT
  USING (true);

CREATE POLICY "Public can create claims"
  ON airdrop_claims
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update claims"
  ON airdrop_claims
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for admin_settings
CREATE POLICY "Public can read settings"
  ON admin_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for installation_status
CREATE POLICY "Public can read installation status"
  ON installation_status
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update installation status"
  ON installation_status
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_whitelist_tokens_address ON whitelist_tokens(address);
CREATE INDEX idx_whitelist_tokens_active ON whitelist_tokens(is_active);
CREATE INDEX idx_airdrop_claims_wallet ON airdrop_claims(wallet_address);
CREATE INDEX idx_airdrop_claims_status ON airdrop_claims(status);
CREATE INDEX idx_admin_settings_key ON admin_settings(key);

-- Insert default whitelist tokens
INSERT INTO whitelist_tokens (address, name, symbol, airdrop_amount, is_active) VALUES
  ('0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', 'Shiba Inu', 'SHIB', 1000000, true),
  ('0x514910771af9ca656af840dff83e8264ecf986ca', 'Chainlink', 'LINK', 50, true),
  ('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 'Uniswap', 'UNI', 100, true),
  ('0x6b175474e89094c44da98b954eedeac495271d0f', 'Dai Stablecoin', 'DAI', 500, true),
  ('0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', 'Polygon', 'MATIC', 200, true),
  ('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 'Wrapped Bitcoin', 'WBTC', 1, true);

-- Insert default settings
INSERT INTO admin_settings (key, value) VALUES
  ('ethplorer_api_key', 'freekey'),
  ('platform_name', 'AirdropHub'),
  ('max_claims_per_address', '1'),
  ('airdrop_enabled', 'true');

-- Insert installation status
INSERT INTO installation_status (is_installed, version) VALUES
  (false, '1.0.0');