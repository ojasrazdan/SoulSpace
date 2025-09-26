-- Add ALL missing columns to daily_checkins table
-- Run this in your Supabase SQL editor

-- Add all the columns that the app expects
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS mood integer CHECK (mood BETWEEN 1 AND 10);

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS energy integer CHECK (energy BETWEEN 1 AND 10);

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS gratitude text;

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS challenge text;

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS tomorrow text;

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS activities text[] DEFAULT '{}';

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS water_intake integer;

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS sleep_hours numeric;

ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS journal text;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_checkins' 
AND table_schema = 'public'
ORDER BY ordinal_position;
