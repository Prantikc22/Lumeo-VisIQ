// Visitor Events
export interface VisitorEvent {
  id: string
  created_at: string
  ip: string
  ip_city: string
  ip_country: string
  ip_org: string
  fingerprint_hash: string
  risk_score: number
  verdict: 'low' | 'medium' | 'high'
  incognito?: boolean
  vpn?: boolean
  velocity_count?: number
  abuse_listed?: boolean
  timezone_mismatch?: boolean
  browser_headless?: boolean
  signals?: string[]
}

// Client Apps
export interface ClientApp {
  id: string
  name: string
  site_key: string
  auto_block: boolean
  risk_threshold: number
  created_at: string
  webhook_url?: string
}

// Manual Blocks
export interface ManualBlock {
  id: string
  type: 'ip' | 'fingerprint'
  value: string
  reason: string
  site_key: string
  created_at: string
  expires_at?: string
}

// Dashboard Stats
export interface DashboardStats {
  eventsToday: number
  highRiskToday: number
  uniqueVisitors: number
  topCountries: { country: string; count: number }[]
}

// API Responses
export interface ApiResponse<T> {
  error?: string
  [key: string]: any
  data?: T
}
