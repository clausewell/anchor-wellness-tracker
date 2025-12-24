-- Anchor Wellness Tracker - Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MEDICATIONS CONFIGURATION
-- ============================================

-- Medication definitions (your personal med list)
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,                    -- e.g., "Propranolol", "Rexulti"
  dosage TEXT,                           -- e.g., "20mg", "2mg"
  dosage_value NUMERIC,                  -- Numeric value for adjustable meds (e.g., 2)
  dosage_unit TEXT,                      -- e.g., "mg"
  
  -- Scheduling
  schedule_type TEXT NOT NULL,           -- 'daytime' or 'evening'
  is_as_needed BOOLEAN DEFAULT FALSE,    -- PRN / extra meds
  times_per_day INTEGER DEFAULT 1,       -- How many times to take (for daytime)
  
  -- Tracking options
  track_time BOOLEAN DEFAULT TRUE,       -- Whether to log time taken
  dosage_adjustable BOOLEAN DEFAULT FALSE, -- Can dosage change day-to-day?
  
  -- Display
  sort_order INTEGER DEFAULT 0,
  color TEXT,                            -- Optional color coding
  
  -- Meta
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY MEDICATION LOGS
-- ============================================

-- Individual dose logs (each checkbox/pill taken)
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  
  -- When
  log_date DATE NOT NULL,                -- The calendar date
  dose_number INTEGER DEFAULT 1,         -- 1st dose, 2nd dose, etc.
  taken_at TIMESTAMPTZ,                  -- Actual time taken (optional)
  
  -- What (for adjustable dosages or PRN)
  dosage_taken TEXT,                     -- The actual dosage taken
  dosage_value_taken NUMERIC,            -- Numeric value if adjustable
  
  -- For PRN/extra meds
  custom_med_name TEXT,                  -- If it's an "additional" med
  notes TEXT,
  
  -- Status
  taken BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one log per med per dose per day
  UNIQUE(user_id, medication_id, log_date, dose_number)
);

-- ============================================
-- EVENING BATCH TIME
-- ============================================

-- Since evening meds are taken together, track the batch time separately
CREATE TABLE evening_med_times (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, log_date)
);

-- ============================================
-- OTHER DAILY ENTRIES (sleep, mood, etc.)
-- ============================================

CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  log_date DATE NOT NULL,
  activity_id TEXT NOT NULL,             -- e.g., 'sleep-quality', 'mood', 'exercise'
  
  -- Flexible value storage
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_json JSONB,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, log_date, activity_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medication_logs_user_date ON medication_logs(user_id, log_date);
CREATE INDEX idx_medication_logs_med ON medication_logs(medication_id);
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, log_date);
CREATE INDEX idx_evening_times_user_date ON evening_med_times(user_id, log_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evening_med_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can manage own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own evening times" ON evening_med_times
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own entries" ON daily_entries
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA (Brett's medications)
-- This would run after user signs up, or you can modify with your user_id
-- ============================================

-- To seed, replace 'YOUR_USER_ID' with your actual Supabase user UUID after signing up

/*
INSERT INTO medications (user_id, name, dosage, dosage_value, dosage_unit, schedule_type, times_per_day, track_time, dosage_adjustable, sort_order) VALUES
  ('YOUR_USER_ID', 'Propranolol', '20mg', 20, 'mg', 'daytime', 2, true, false, 1),
  ('YOUR_USER_ID', 'Xanax XR', '2mg', 2, 'mg', 'daytime', 2, true, false, 2),
  ('YOUR_USER_ID', 'Rexulti', '2mg', 2, 'mg', 'evening', 1, false, true, 1),
  ('YOUR_USER_ID', 'Lithium', '1050mg', 1050, 'mg', 'evening', 1, false, true, 2),
  ('YOUR_USER_ID', 'Lamictal', '200mg', 200, 'mg', 'evening', 1, false, false, 3),
  ('YOUR_USER_ID', 'Fish Oil', NULL, NULL, NULL, 'evening', 1, false, false, 4),
  ('YOUR_USER_ID', 'Multi Vitamin', NULL, NULL, NULL, 'evening', 1, false, false, 5);
*/
