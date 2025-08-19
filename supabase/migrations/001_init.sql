-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE visitor_event_type AS ENUM (
  'page_view',
  'click',
  'form_submit',
  'custom'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'inactive',
  'trial',
  'cancelled'
);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL,
  subscription_status subscription_status DEFAULT 'trial',
  plan_limits JSONB DEFAULT '{"monthly_visitors": 10000, "data_retention_days": 30}'::jsonb
);

-- Visitors table
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id VARCHAR(255) NOT NULL,
  fingerprint VARCHAR(255),
  thumbmark VARCHAR(255),
  user_agent TEXT,
  screen_resolution VARCHAR(50),
  timezone VARCHAR(100),
  language VARCHAR(10),
  platform VARCHAR(100),
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  region VARCHAR(100),
  isp VARCHAR(255),
  is_bot BOOLEAN DEFAULT FALSE,
  risk_score INTEGER DEFAULT 0,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(site_id, visitor_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  event_type visitor_event_type NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  url TEXT,
  referrer TEXT,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255),
  page_title VARCHAR(500),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255)
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT TRUE,
  entry_page TEXT,
  exit_page TEXT,
  referrer TEXT,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  UNIQUE(site_id, session_id)
);

-- Fraud detection table
CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  signal_type VARCHAR(100) NOT NULL,
  signal_value TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- API usage tracking
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  requests_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
  UNIQUE(site_id, endpoint, method, date, hour)
);

-- Create indexes for performance
CREATE INDEX idx_visitors_site_id ON visitors(site_id);
CREATE INDEX idx_visitors_visitor_id ON visitors(visitor_id);
CREATE INDEX idx_visitors_last_seen ON visitors(last_seen);
CREATE INDEX idx_visitors_ip_address ON visitors(ip_address);

CREATE INDEX idx_events_site_id ON events(site_id);
CREATE INDEX idx_events_visitor_id ON events(visitor_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_session_id ON events(session_id);

CREATE INDEX idx_sessions_site_id ON sessions(site_id);
CREATE INDEX idx_sessions_visitor_id ON sessions(visitor_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

CREATE INDEX idx_fraud_signals_site_id ON fraud_signals(site_id);
CREATE INDEX idx_fraud_signals_visitor_id ON fraud_signals(visitor_id);
CREATE INDEX idx_fraud_signals_detected_at ON fraud_signals(detected_at);
CREATE INDEX idx_fraud_signals_risk_score ON fraud_signals(risk_score);

CREATE INDEX idx_api_usage_site_id ON api_usage(site_id);
CREATE INDEX idx_api_usage_date ON api_usage(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to sites table
CREATE TRIGGER update_sites_updated_at 
  BEFORE UPDATE ON sites 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be customized based on auth requirements)
CREATE POLICY "Users can view their own sites" ON sites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" ON sites
  FOR UPDATE USING (auth.uid() = user_id);

-- Site owners can access their site data
CREATE POLICY "Site owners can access visitors" ON visitors
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

CREATE POLICY "Site owners can access events" ON events
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

CREATE POLICY "Site owners can access sessions" ON sessions
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

CREATE POLICY "Site owners can access fraud signals" ON fraud_signals
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));

CREATE POLICY "Site owners can access API usage" ON api_usage
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE user_id = auth.uid()));
