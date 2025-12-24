-- Run this in Supabase SQL Editor to allow access without authentication
-- This replaces the auth-based policies with ones that check the hardcoded user_id

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own medications" ON medications;
DROP POLICY IF EXISTS "Users can manage own medication logs" ON medication_logs;
DROP POLICY IF EXISTS "Users can manage own evening times" ON evening_med_times;
DROP POLICY IF EXISTS "Users can manage own entries" ON daily_entries;

-- Create new policies that allow all operations for any request
-- Since this is a personal app with a hardcoded user_id, we just check that the user_id matches

CREATE POLICY "Allow all for Brett" ON medications
  FOR ALL USING (user_id = 'e871d924-f312-4aca-bc5f-c2a420c025d4'::uuid);

CREATE POLICY "Allow all for Brett" ON medication_logs
  FOR ALL USING (user_id = 'e871d924-f312-4aca-bc5f-c2a420c025d4'::uuid);

CREATE POLICY "Allow all for Brett" ON evening_med_times
  FOR ALL USING (user_id = 'e871d924-f312-4aca-bc5f-c2a420c025d4'::uuid);

CREATE POLICY "Allow all for Brett" ON daily_entries
  FOR ALL USING (user_id = 'e871d924-f312-4aca-bc5f-c2a420c025d4'::uuid);
