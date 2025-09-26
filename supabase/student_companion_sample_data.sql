-- Sample data for Student Companion feature
-- Run this AFTER you have actual users in your auth.users table
-- Replace the user_ids below with actual user IDs from your auth.users table

-- To get actual user IDs, run this query first:
-- SELECT id, email FROM auth.users LIMIT 5;

-- Then replace the UUIDs below with real user IDs and uncomment the INSERT statements

/*
-- Sample mentors (replace with actual user IDs)
INSERT INTO student_companion_profiles (
    user_id, display_name, bio, interests, availability_status, 
    experience_level, preferred_communication, is_mentor, is_seeking_help
) VALUES 
-- Replace these UUIDs with actual user IDs from auth.users
('REPLACE_WITH_ACTUAL_USER_ID_1', 'Sarah Chen', 'Experienced peer counselor with 3 years of helping students through academic stress and anxiety. I love hiking and meditation.', 
 ARRAY['mental health', 'academic stress', 'meditation', 'hiking'], 'available', 'experienced', 'any', true, false),
('REPLACE_WITH_ACTUAL_USER_ID_2', 'Alex Rodriguez', 'Graduate student in psychology. Passionate about helping others navigate college life and build healthy relationships.', 
 ARRAY['relationships', 'college life', 'psychology', 'fitness'], 'available', 'intermediate', 'text', true, false),
('REPLACE_WITH_ACTUAL_USER_ID_3', 'Priya Patel', 'Senior student who has overcome social anxiety. I want to help others build confidence and social skills.', 
 ARRAY['social anxiety', 'confidence building', 'public speaking', 'art'], 'available', 'intermediate', 'voice', true, false);

-- Insert sample availability for mentors
INSERT INTO companion_availability (profile_id, day_of_week, start_time, end_time) 
SELECT id, day, time '09:00', time '17:00' 
FROM student_companion_profiles, generate_series(1, 5) as day 
WHERE is_mentor = true;
*/

-- Instructions for adding sample data:
-- 1. First, create some test users in your auth.users table (through your app's signup)
-- 2. Get their user IDs by running: SELECT id, email FROM auth.users;
-- 3. Replace the UUIDs in the INSERT statements above with the actual user IDs
-- 4. Uncomment the INSERT statements
-- 5. Run this file

-- Alternative: Create sample data through the app interface
-- Users can create their own companion profiles by visiting /student-companion
-- and filling out the profile form
