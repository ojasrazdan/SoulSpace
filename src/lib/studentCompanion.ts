import { supabase } from './supabaseClient';

export interface CompanionProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  interests: string[];
  availability_status: 'available' | 'busy' | 'offline';
  experience_level: 'beginner' | 'intermediate' | 'experienced';
  preferred_communication: 'text' | 'voice' | 'video' | 'any';
  timezone?: string;
  languages: string[];
  is_mentor: boolean;
  is_seeking_help: boolean;
  max_buddies: number;
  current_buddies: number;
  rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface BuddyMatch {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined' | 'cancelled';
  match_score: number;
  created_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  mentor?: CompanionProfile;
  mentee?: CompanionProfile;
}

export interface CompanionSession {
  id: string;
  match_id: string;
  session_type: 'checkin' | 'crisis' | 'regular' | 'emergency';
  duration_minutes: number;
  session_notes?: string;
  mentee_feedback?: string;
  mentor_feedback?: string;
  mentee_rating?: number;
  mentor_rating?: number;
  created_at: string;
  ended_at?: string;
}

export interface CompanionMessage {
  id: string;
  match_id: string;
  sender_id: string;
  message_type: 'text' | 'voice' | 'image' | 'system';
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: CompanionProfile;
}

// Get or create companion profile for user
export async function getCompanionProfile(userId: string): Promise<CompanionProfile | null> {
  const { data, error } = await supabase
    .from('student_companion_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching companion profile:', error);
    return null;
  }

  return data;
}

// Create companion profile
export async function createCompanionProfile(profile: Partial<CompanionProfile>): Promise<CompanionProfile | null> {
  const { data, error } = await supabase
    .from('student_companion_profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating companion profile:', error);
    return null;
  }

  return data;
}

// Update companion profile
export async function updateCompanionProfile(profileId: string, updates: Partial<CompanionProfile>): Promise<CompanionProfile | null> {
  const { data, error } = await supabase
    .from('student_companion_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating companion profile:', error);
    return null;
  }

  return data;
}

// Get available mentors for matching
export async function getAvailableMentors(userId: string, limit: number = 10): Promise<CompanionProfile[]> {
  const { data, error } = await supabase
    .from('student_companion_profiles')
    .select('*')
    .eq('is_mentor', true)
    .eq('availability_status', 'available')
    .neq('user_id', userId)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching available mentors:', error);
    return [];
  }

  return data || [];
}

// Get available mentees for mentors
export async function getAvailableMentees(userId: string, limit: number = 10): Promise<CompanionProfile[]> {
  const { data, error } = await supabase
    .from('student_companion_profiles')
    .select('*')
    .eq('is_seeking_help', true)
    .eq('availability_status', 'available')
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching available mentees:', error);
    return [];
  }

  return data || [];
}

// Create buddy match request
export async function createBuddyMatch(menteeId: string, mentorId: string): Promise<BuddyMatch | null> {
  // Calculate match score based on interests and preferences
  const menteeProfile = await getCompanionProfile(menteeId);
  const mentorProfile = await getCompanionProfile(mentorId);
  
  let matchScore = 50; // Base score
  
  if (menteeProfile && mentorProfile) {
    // Calculate interest overlap
    const commonInterests = menteeProfile.interests.filter(interest => 
      mentorProfile.interests.includes(interest)
    );
    matchScore += commonInterests.length * 10;
    
    // Communication preference match
    if (menteeProfile.preferred_communication === mentorProfile.preferred_communication ||
        mentorProfile.preferred_communication === 'any') {
      matchScore += 15;
    }
    
    // Experience level bonus
    if (mentorProfile.experience_level === 'experienced') {
      matchScore += 10;
    }
  }

  const { data, error } = await supabase
    .from('buddy_matches')
    .insert({
      mentee_id: menteeId,
      mentor_id: mentorId,
      match_score: matchScore,
      status: 'pending'
    })
    .select(`
      *,
      mentor:student_companion_profiles!buddy_matches_mentor_id_fkey(*),
      mentee:student_companion_profiles!buddy_matches_mentee_id_fkey(*)
    `)
    .single();

  if (error) {
    console.error('Error creating buddy match:', error);
    return null;
  }

  return data;
}

// Get user's buddy matches
export async function getUserBuddyMatches(userId: string): Promise<BuddyMatch[]> {
  const { data, error } = await supabase
    .from('buddy_matches')
    .select(`
      *,
      mentor:student_companion_profiles!buddy_matches_mentor_id_fkey(*),
      mentee:student_companion_profiles!buddy_matches_mentee_id_fkey(*)
    `)
    .or(`mentor.user_id.eq.${userId},mentee.user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching buddy matches:', error);
    return [];
  }

  return data || [];
}

// Update buddy match status
export async function updateBuddyMatchStatus(matchId: string, status: BuddyMatch['status'], notes?: string): Promise<BuddyMatch | null> {
  const updates: any = { status };
  
  if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString();
  } else if (status === 'active') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }
  
  if (notes) {
    updates.notes = notes;
  }

  const { data, error } = await supabase
    .from('buddy_matches')
    .update(updates)
    .eq('id', matchId)
    .select(`
      *,
      mentor:student_companion_profiles!buddy_matches_mentor_id_fkey(*),
      mentee:student_companion_profiles!buddy_matches_mentee_id_fkey(*)
    `)
    .single();

  if (error) {
    console.error('Error updating buddy match status:', error);
    return null;
  }

  return data;
}

// Create companion session
export async function createCompanionSession(session: Partial<CompanionSession>): Promise<CompanionSession | null> {
  const { data, error } = await supabase
    .from('companion_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error creating companion session:', error);
    return null;
  }

  return data;
}

// Get sessions for a match
export async function getMatchSessions(matchId: string): Promise<CompanionSession[]> {
  const { data, error } = await supabase
    .from('companion_sessions')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching match sessions:', error);
    return [];
  }

  return data || [];
}

// Send companion message
export async function sendCompanionMessage(message: Partial<CompanionMessage>): Promise<CompanionMessage | null> {
  const { data, error } = await supabase
    .from('companion_messages')
    .insert(message)
    .select(`
      *,
      sender:student_companion_profiles!companion_messages_sender_id_fkey(*)
    `)
    .single();

  if (error) {
    console.error('Error sending companion message:', error);
    return null;
  }

  return data;
}

// Get messages for a match
export async function getMatchMessages(matchId: string): Promise<CompanionMessage[]> {
  const { data, error } = await supabase
    .from('companion_messages')
    .select(`
      *,
      sender:student_companion_profiles!companion_messages_sender_id_fkey(*)
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching match messages:', error);
    return [];
  }

  return data || [];
}

// Mark messages as read
export async function markMessagesAsRead(matchId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('companion_messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .neq('sender_id', userId);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
}

// Get companion statistics
export async function getCompanionStats(userId: string): Promise<{
  totalMatches: number;
  activeMatches: number;
  completedSessions: number;
  averageRating: number;
  totalHelpProvided: number;
}> {
  const profile = await getCompanionProfile(userId);
  if (!profile) {
    return {
      totalMatches: 0,
      activeMatches: 0,
      completedSessions: 0,
      averageRating: 0,
      totalHelpProvided: 0
    };
  }

  const matches = await getUserBuddyMatches(userId);
  const activeMatches = matches.filter(m => m.status === 'active').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;

  // Get total sessions
  const { data: sessions } = await supabase
    .from('companion_sessions')
    .select('*')
    .in('match_id', matches.map(m => m.id));

  const completedSessions = sessions?.length || 0;

  return {
    totalMatches: matches.length,
    activeMatches,
    completedSessions,
    averageRating: profile.rating,
    totalHelpProvided: profile.is_mentor ? completedSessions : 0
  };
}


