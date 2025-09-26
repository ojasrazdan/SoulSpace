-- Student Companion Database Schema
-- This schema supports buddy matching for students who need emotional support

-- Create student_companion_profiles table
CREATE TABLE IF NOT EXISTS student_companion_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    experience_level VARCHAR(20) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'experienced')),
    preferred_communication VARCHAR(20) DEFAULT 'text' CHECK (preferred_communication IN ('text', 'voice', 'video', 'any')),
    timezone VARCHAR(50),
    languages TEXT[] DEFAULT '{"English"}',
    is_mentor BOOLEAN DEFAULT false,
    is_seeking_help BOOLEAN DEFAULT true,
    max_buddies INTEGER DEFAULT 3,
    current_buddies INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buddy_matches table
CREATE TABLE IF NOT EXISTS buddy_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES student_companion_profiles(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES student_companion_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'active', 'completed', 'declined', 'cancelled')),
    match_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(mentor_id, mentee_id)
);

-- Create companion_sessions table
CREATE TABLE IF NOT EXISTS companion_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES buddy_matches(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'checkin' CHECK (session_type IN ('checkin', 'crisis', 'regular', 'emergency')),
    duration_minutes INTEGER DEFAULT 0,
    session_notes TEXT,
    mentee_feedback TEXT,
    mentor_feedback TEXT,
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create companion_messages table
CREATE TABLE IF NOT EXISTS companion_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES buddy_matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES student_companion_profiles(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'system')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companion_availability table
CREATE TABLE IF NOT EXISTS companion_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES student_companion_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companion_profiles_user_id ON student_companion_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_availability ON student_companion_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_mentor ON student_companion_profiles(is_mentor);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_mentor ON buddy_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_mentee ON buddy_matches(mentee_id);
CREATE INDEX IF NOT EXISTS idx_buddy_matches_status ON buddy_matches(status);
CREATE INDEX IF NOT EXISTS idx_companion_sessions_match ON companion_sessions(match_id);
CREATE INDEX IF NOT EXISTS idx_companion_messages_match ON companion_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_companion_availability_profile ON companion_availability(profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_student_companion_profiles_updated_at 
    BEFORE UPDATE ON student_companion_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE student_companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buddy_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own companion profile
CREATE POLICY "Users can view own companion profile" ON student_companion_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companion profile" ON student_companion_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companion profile" ON student_companion_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view profiles of potential matches (mentors if seeking help, mentees if mentoring)
CREATE POLICY "Users can view potential matches" ON student_companion_profiles
    FOR SELECT USING (
        auth.uid() != user_id AND (
            (is_mentor = true AND availability_status = 'available') OR
            (is_seeking_help = true AND availability_status = 'available')
        )
    );

-- Users can view their own buddy matches
CREATE POLICY "Users can view own buddy matches" ON buddy_matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_companion_profiles 
            WHERE (id = mentor_id OR id = mentee_id) AND user_id = auth.uid()
        )
    );

-- Users can create buddy match requests
CREATE POLICY "Users can create buddy match requests" ON buddy_matches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM student_companion_profiles 
            WHERE id = mentee_id AND user_id = auth.uid()
        )
    );

-- Users can update their own buddy matches
CREATE POLICY "Users can update own buddy matches" ON buddy_matches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM student_companion_profiles 
            WHERE (id = mentor_id OR id = mentee_id) AND user_id = auth.uid()
        )
    );

-- Users can view sessions for their matches
CREATE POLICY "Users can view own sessions" ON companion_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM buddy_matches bm
            JOIN student_companion_profiles scp ON (scp.id = bm.mentor_id OR scp.id = bm.mentee_id)
            WHERE bm.id = match_id AND scp.user_id = auth.uid()
        )
    );

-- Users can create sessions for their matches
CREATE POLICY "Users can create sessions" ON companion_sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM buddy_matches bm
            JOIN student_companion_profiles scp ON (scp.id = bm.mentor_id OR scp.id = bm.mentee_id)
            WHERE bm.id = match_id AND scp.user_id = auth.uid()
        )
    );

-- Users can view messages for their matches
CREATE POLICY "Users can view own messages" ON companion_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM buddy_matches bm
            JOIN student_companion_profiles scp ON (scp.id = bm.mentor_id OR scp.id = bm.mentee_id)
            WHERE bm.id = match_id AND scp.user_id = auth.uid()
        )
    );

-- Users can send messages in their matches
CREATE POLICY "Users can send messages" ON companion_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM buddy_matches bm
            JOIN student_companion_profiles scp ON (scp.id = bm.mentor_id OR scp.id = bm.mentee_id)
            WHERE bm.id = match_id AND scp.user_id = auth.uid()
        )
    );

-- Users can manage their own availability
CREATE POLICY "Users can manage own availability" ON companion_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM student_companion_profiles 
            WHERE id = profile_id AND user_id = auth.uid()
        )
    );

-- Sample data removed to avoid foreign key constraint errors
-- In production, companion profiles will be created automatically when users sign up
-- or when they first access the Student Companion feature
