-- Migration to add manual_blocks table
CREATE TABLE manual_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_hash VARCHAR(255),
  ip VARCHAR(45),
  reason TEXT,
  site_key VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
