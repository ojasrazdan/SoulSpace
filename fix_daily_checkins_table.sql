-- Fix daily_checkins table to ensure it has the correct structure
-- This script ensures the table exists with the right columns and constraints

-- Drop and recreate the table to ensure clean state
DROP TABLE IF EXISTS public.daily_checkins CASCADE;

-- Create the daily_checkins table
CREATE TABLE public.daily_checkins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood integer CHECK (mood BETWEEN 1 AND 10),
    energy integer CHECK (energy BETWEEN 1 AND 10),
    gratitude text,
    challenge text,
    tomorrow text,
    activities text[] DEFAULT '{}',
    water_intake integer,
    sleep_hours numeric,
    journal text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own checkins" ON public.daily_checkins 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.daily_checkins 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.daily_checkins 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins" ON public.daily_checkins 
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS daily_checkins_user_id_idx ON public.daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS daily_checkins_created_at_idx ON public.daily_checkins(created_at);

