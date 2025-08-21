-- Migration: Create user_billing table for plan and renewal tracking
CREATE TABLE IF NOT EXISTS user_billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  plan_name text,
  subscription_id text,
  renewal_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id ON user_billing(user_id);
