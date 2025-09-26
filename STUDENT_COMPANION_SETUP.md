# Student Companion Setup Guide

## Database Setup

### 1. Run the Schema
Execute the `supabase/student_companion_schema.sql` file in your Supabase SQL editor. This will create all the necessary tables and relationships.

### 2. Sample Data (Optional)
If you want to add sample data for testing:

1. **First, create some test users** through your app's signup process
2. **Get their user IDs** by running this query in Supabase:
   ```sql
   SELECT id, email FROM auth.users LIMIT 5;
   ```
3. **Update the sample data file** `supabase/student_companion_sample_data.sql`:
   - Replace the placeholder UUIDs with actual user IDs
   - Uncomment the INSERT statements
   - Run the file

### 3. Alternative: Let Users Create Profiles
Instead of adding sample data, users can create their own companion profiles by:
1. Visiting `/student-companion` in your app
2. Filling out the profile form
3. Setting their role (mentor/mentee/both)

## Features Available

### For Students Seeking Help (Mentees):
- **Create Profile**: Set up their profile with interests and needs
- **Find Mentors**: Browse available mentors with compatibility scores
- **Request Buddy**: Send requests to suitable mentors
- **Track Matches**: See their active and pending matches

### For Students Wanting to Help (Mentors):
- **Set Up Mentor Profile**: Define their expertise and availability
- **Browse Students**: See students seeking help in their areas
- **Accept Requests**: Accept or decline buddy requests
- **Provide Support**: Chat with matched students

### Smart Matching Algorithm:
- **Interest Overlap**: 10 points per common interest
- **Communication Preference**: 15 points for matching preferences
- **Experience Level**: 10 points bonus for experienced mentors
- **Base Score**: 50 points for all matches

## Database Tables Created

1. **`student_companion_profiles`** - User profiles for the companion system
2. **`buddy_matches`** - Matches between mentors and mentees
3. **`companion_sessions`** - Individual support sessions
4. **`companion_messages`** - Chat messages between buddies
5. **`companion_availability`** - User availability schedules

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only see their own data and potential matches
- **Safe profile sharing** with controlled visibility
- **Proper authentication** required for all operations

## Navigation

The Student Companion feature is accessible through:
- **Header Navigation**: "Companion" link in the main navigation
- **Home Page Dashboard**: "Student Companion" card in the features grid
- **Direct URL**: `/student-companion`

## Getting Started

1. **Run the schema** in your Supabase database
2. **Test the feature** by creating a user account
3. **Set up a profile** in the Student Companion page
4. **Invite other users** to test the matching system

The feature is now ready to use! Users can start creating profiles and connecting with each other for peer support.


