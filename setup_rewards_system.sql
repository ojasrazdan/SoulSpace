-- Complete setup script for the rewards system
-- Run this entire script in your Supabase SQL Editor

-- User Progress and XP System
CREATE TABLE IF NOT EXISTS public.user_progress (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	level integer NOT NULL DEFAULT 1,
	xp integer NOT NULL DEFAULT 0,
	total_xp integer NOT NULL DEFAULT 0,
	calm_points integer NOT NULL DEFAULT 0,
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now(),
	UNIQUE(user_id)
);

-- XP and Points Logs
CREATE TABLE IF NOT EXISTS public.xp_logs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	amount integer NOT NULL,
	source text NOT NULL, -- 'goal_completion', 'quiz_completion', 'daily_challenge', etc.
	source_id uuid, -- ID of the source (goal_id, assessment_id, challenge_id)
	total_xp integer NOT NULL,
	created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.points_logs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	amount integer NOT NULL,
	source text NOT NULL,
	source_id uuid,
	total_points integer NOT NULL,
	created_at timestamptz DEFAULT now()
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	title text NOT NULL,
	description text NOT NULL,
	xp_reward integer NOT NULL DEFAULT 0,
	points_reward integer NOT NULL DEFAULT 0,
	category text NOT NULL CHECK (category IN ('wellness', 'productivity', 'social', 'learning')),
	difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
	date date NOT NULL DEFAULT current_date,
	created_at timestamptz DEFAULT now()
);

-- Challenge Completions
CREATE TABLE IF NOT EXISTS public.challenge_completions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
	completed_at timestamptz DEFAULT now(),
	UNIQUE(user_id, challenge_id)
);

-- RLS Policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own xp logs" ON public.xp_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own xp logs" ON public.xp_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.points_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own points logs" ON public.points_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own points logs" ON public.points_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Daily challenges are public readable" ON public.daily_challenges FOR SELECT USING (true);

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own completions" ON public.challenge_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own completions" ON public.challenge_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample daily challenges
INSERT INTO public.daily_challenges (title, description, xp_reward, points_reward, category, difficulty, date) VALUES
-- Wellness Challenges
('Morning Meditation', 'Start your day with 10 minutes of meditation or mindfulness', 50, 10, 'wellness', 'easy', CURRENT_DATE),
('Hydration Hero', 'Drink 8 glasses of water throughout the day', 40, 8, 'wellness', 'easy', CURRENT_DATE),
('Nature Walk', 'Take a 20-minute walk outside in nature', 60, 12, 'wellness', 'medium', CURRENT_DATE),
('Digital Detox', 'Spend 2 hours without any digital devices', 80, 15, 'wellness', 'hard', CURRENT_DATE),
('Gratitude Journal', 'Write down 3 things you are grateful for today', 30, 6, 'wellness', 'easy', CURRENT_DATE),

-- Productivity Challenges
('Deep Work Session', 'Focus on one task for 90 minutes without distractions', 100, 20, 'productivity', 'hard', CURRENT_DATE),
('Task Completion', 'Complete 5 tasks from your to-do list', 70, 14, 'productivity', 'medium', CURRENT_DATE),
('Learning Hour', 'Spend 1 hour learning something new', 80, 16, 'learning', 'medium', CURRENT_DATE),
('Email Organization', 'Organize and respond to all pending emails', 50, 10, 'productivity', 'easy', CURRENT_DATE),
('Goal Setting', 'Set 3 specific goals for the week', 40, 8, 'productivity', 'easy', CURRENT_DATE),

-- Social Challenges
('Kindness Act', 'Perform one random act of kindness', 60, 12, 'social', 'easy', CURRENT_DATE),
('Connect with Someone', 'Have a meaningful conversation with a friend or family member', 50, 10, 'social', 'easy', CURRENT_DATE),
('Community Help', 'Help someone in your community or online', 80, 16, 'social', 'medium', CURRENT_DATE),
('Share Knowledge', 'Teach someone something you know', 70, 14, 'social', 'medium', CURRENT_DATE),

-- Learning Challenges
('Read for 30 Minutes', 'Read a book, article, or educational content for 30 minutes', 60, 12, 'learning', 'easy', CURRENT_DATE),
('Skill Practice', 'Practice a skill you want to improve for 45 minutes', 80, 16, 'learning', 'medium', CURRENT_DATE),
('Language Learning', 'Spend 20 minutes learning a new language', 50, 10, 'learning', 'easy', CURRENT_DATE),
('Research Project', 'Research a topic you are curious about for 1 hour', 90, 18, 'learning', 'hard', CURRENT_DATE);

-- Add some challenges for tomorrow as well
INSERT INTO public.daily_challenges (title, description, xp_reward, points_reward, category, difficulty, date) VALUES
('Yoga Session', 'Complete a 30-minute yoga or stretching session', 70, 14, 'wellness', 'medium', CURRENT_DATE + INTERVAL '1 day'),
('Creative Expression', 'Spend 45 minutes on a creative activity (drawing, writing, music)', 80, 16, 'wellness', 'medium', CURRENT_DATE + INTERVAL '1 day'),
('Healthy Meal Prep', 'Prepare 3 healthy meals for the week', 100, 20, 'wellness', 'hard', CURRENT_DATE + INTERVAL '1 day'),
('Code or Build', 'Work on a coding project or build something for 2 hours', 120, 24, 'learning', 'hard', CURRENT_DATE + INTERVAL '1 day'),
('Network Connection', 'Reach out to a professional contact or make a new connection', 60, 12, 'social', 'medium', CURRENT_DATE + INTERVAL '1 day');

-- Success message
SELECT 'Rewards system setup completed successfully! All tables created and daily challenges seeded.' as status;

