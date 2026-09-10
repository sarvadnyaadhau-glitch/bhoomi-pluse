export interface Farm {
  id: string
  user_id: string
  name: string
  location_text: string
  latitude: number | null
  longitude: number | null
  area_acres: number | null
  soil_type: string | null
  irrigation_type: string | null
  created_at: string
  updated_at: string
}

export interface Field {
  id: string
  farm_id: string
  name: string
  area_acres: number | null
  boundary_geojson: unknown
  created_at: string
}

export interface CropSeason {
  id: string
  field_id: string
  crop_name: string
  variety: string | null
  sowing_date: string | null
  expected_harvest_date: string | null
  status: 'planning' | 'active' | 'harvested' | 'failed'
  notes: string | null
  created_at: string
}

export interface SensorDevice {
  id: string
  farm_id: string
  field_id: string | null
  device_name: string
  device_code: string
  status: 'live' | 'stale' | 'offline' | 'invalid' | 'calibration_required'
  battery_level: number | null
  firmware_version: string | null
  last_seen: string | null
  created_at: string
}

export interface SensorReading {
  id: string
  device_id: string
  nitrogen: number | null
  phosphorus: number | null
  potassium: number | null
  ph: number | null
  ec: number | null
  soil_moisture: number | null
  soil_temperature: number | null
  air_temperature: number | null
  air_humidity: number | null
  reading_timestamp: string
  created_at: string
}

export interface FarmEvent {
  id: string
  farm_id: string
  field_id: string | null
  event_type: string
  description: string
  event_date: string
  metadata: unknown
  created_at: string
}

export interface Task {
  id: string
  farm_id: string
  field_id: string | null
  title: string
  description: string | null
  task_type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'missed'
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export interface Recommendation {
  id: string
  farm_id: string
  field_id: string | null
  recommendation_type: string
  action: string
  reason: string
  evidence: unknown
  confidence: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'dismissed' | 'acted_upon' | 'expired'
  expires_at: string | null
  created_at: string
}

export interface ScanSession {
  id: string
  farm_id: string
  field_id: string | null
  scan_type: string
  image_url: string | null
  diagnosis: string | null
  confidence: 'low' | 'medium' | 'high' | null
  evidence: unknown
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  created_at: string
}

export interface Expense {
  id: string
  farm_id: string
  field_id: string | null
  category: string
  description: string
  amount: number
  expense_date: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  preferred_language: 'en' | 'hi' | 'mr'
  role: 'farmer' | 'expert' | 'service_provider' | 'buyer' | 'fpo' | 'enterprise' | 'admin'
  created_at: string
}
