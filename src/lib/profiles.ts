import { supabase } from './supabaseClient'

export type Profile = {
	id: string
	username: string | null
	full_name: string | null
	avatar_url: string | null
	first_name: string | null
	last_name: string | null
	email: string | null
	phone: string | null
	date_of_birth: string | null
	location: string | null
	academic_year: string | null
	major: string | null
	bio: string | null
	emergency_contact_name: string | null
	emergency_contact_phone: string | null
	updated_at: string | null
}

export type ActivityItem = {
	id: string
	type: 'assessment' | 'checkin' | 'exercise' | 'goal' | 'game'
	name: string
	date: string
	score?: string
	mood?: string
	duration?: string
	progress?: number
}

export type UserStats = {
	assessmentsCompleted: number
	dailyCheckins: number
	breathingSessions: number
	articlesRead: number
	goalsCompleted: number
	totalXP: number
	currentLevel: number
}

export async function getProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single()
	
	if (error) {
		if (error.code === 'PGRST116') {
			// Profile doesn't exist, create it
			return await createProfile(userId)
		}
		throw error
	}
	return data as Profile
}

export async function createProfile(userId: string): Promise<Profile> {
	const { data, error } = await supabase
		.from('profiles')
		.insert({ id: userId })
		.select()
		.single()
	
	if (error) throw error
	return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
	const { data, error } = await supabase
		.from('profiles')
		.update(updates)
		.eq('id', userId)
		.select()
		.single()
	
	if (error) throw error
	return data as Profile
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
	const { data, error } = await supabase
		.from('profiles')
		.upsert(profile)
		.select()
		.single()
	if (error) throw error
	return data as Profile
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
	const fileExt = file.name.split('.').pop()
	const fileName = `${userId}.${fileExt}`
	const filePath = `avatars/${fileName}`

	try {
		// Upload file to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from('avatars')
			.upload(filePath, file, { upsert: true })

		if (uploadError) {
			console.warn('Supabase Storage not available, using local URL:', uploadError);
			// Fallback to local URL if storage is not available
			return URL.createObjectURL(file);
		}

		// Get public URL
		const { data } = supabase.storage
			.from('avatars')
			.getPublicUrl(filePath)

		return data.publicUrl
	} catch (error) {
		console.warn('Avatar upload failed, using local URL:', error);
		// Fallback to local URL if storage fails
		return URL.createObjectURL(file);
	}
}

export async function getRecentActivity(userId: string, limit: number = 10): Promise<ActivityItem[]> {
	const activities: ActivityItem[] = []

	// Get recent assessments
	const { data: assessments } = await supabase
		.from('assessments')
		.select('id, category, score, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (assessments) {
		activities.push(...assessments.map(a => ({
			id: a.id,
			type: 'assessment' as const,
			name: `${a.category} Assessment`,
			date: formatRelativeDate(a.created_at),
			score: getScoreLabel(a.score)
		})))
	}

	// Get recent check-ins
	const { data: checkins } = await supabase
		.from('daily_checkins')
		.select('id, mood, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (checkins) {
		activities.push(...checkins.map(c => ({
			id: c.id,
			type: 'checkin' as const,
			name: 'Daily Mood Check',
			date: formatRelativeDate(c.created_at),
			mood: getMoodLabel(c.mood)
		})))
	}

	// Get recent goals
	const { data: goals } = await supabase
		.from('goals')
		.select('id, title, progress, status, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (goals) {
		activities.push(...goals.map(g => ({
			id: g.id,
			type: 'goal' as const,
			name: g.title,
			date: formatRelativeDate(g.created_at),
			progress: g.progress
		})))
	}

	// Get recent game scores
	const { data: games } = await supabase
		.from('game_scores')
		.select('id, game, score, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)

	if (games) {
		activities.push(...games.map(g => ({
			id: g.id,
			type: 'game' as const,
			name: g.game,
			date: formatRelativeDate(g.created_at),
			score: g.score.toString()
		})))
	}

	// Sort by date and return limited results
	return activities
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, limit)
}

export async function getUserStats(userId: string): Promise<UserStats> {
	// Get assessment count
	const { count: assessmentsCount } = await supabase
		.from('assessments')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)

	// Get check-in count
	const { count: checkinsCount } = await supabase
		.from('daily_checkins')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)

	// Get completed goals count
	const { count: goalsCount } = await supabase
		.from('goals')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.eq('status', 'completed')

	// Get user progress for XP and level
	const { data: progress } = await supabase
		.from('user_progress')
		.select('total_xp, level')
		.eq('user_id', userId)
		.single()

	// Get vault entries count (as proxy for articles read)
	const { count: articlesCount } = await supabase
		.from('vault_entries')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)

	return {
		assessmentsCompleted: assessmentsCount || 0,
		dailyCheckins: checkinsCount || 0,
		breathingSessions: Math.floor((checkinsCount || 0) * 0.3), // Estimate based on check-ins
		articlesRead: articlesCount || 0,
		goalsCompleted: goalsCount || 0,
		totalXP: progress?.total_xp || 0,
		currentLevel: progress?.level || 1
	}
}

// Helper functions
function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString)
	const now = new Date()
	const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
	
	if (diffInHours < 1) return 'Just now'
	if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
	
	const diffInDays = Math.floor(diffInHours / 24)
	if (diffInDays === 1) return 'Yesterday'
	if (diffInDays < 7) return `${diffInDays} days ago`
	
	return date.toLocaleDateString()
}

function getScoreLabel(score: number): string {
	if (score <= 4) return 'Minimal'
	if (score <= 9) return 'Mild'
	if (score <= 14) return 'Moderate'
	if (score <= 19) return 'Moderately Severe'
	return 'Severe'
}

function getMoodLabel(mood: number): string {
	if (mood <= 3) return 'Low'
	if (mood <= 6) return 'Moderate'
	if (mood <= 8) return 'Good'
	return 'Excellent'
}



