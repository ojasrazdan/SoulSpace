import { supabase } from './supabaseClient'

export type UserAchievement = {
	user_id: string
	achievement_key: string
	earnt_at: string
}

export async function listUserAchievements(userId: string) {
	const { data, error } = await supabase
		.from('user_achievements')
		.select('achievement_key, earnt_at, achievements_catalog(title, description, icon)')
		.eq('user_id', userId)
		.order('earnt_at', { ascending: false })
	if (error) throw error
	return data
}

export async function awardAchievement(userId: string, key: string) {
	// idempotent due to PK
	const { error } = await supabase
		.from('user_achievements')
		.insert({ user_id: userId, achievement_key: key })
	if (error && !String(error.message).includes('duplicate key')) throw error
}

export async function maybeAwardGoalAchievements(userId: string, totalCompleted: number, reachedHundred: boolean) {
	if (totalCompleted === 1) await awardAchievement(userId, 'first_goal_completed')
	if (totalCompleted === 3) await awardAchievement(userId, 'streak_3')
	if (totalCompleted === 5) await awardAchievement(userId, 'streak_5')
	if (reachedHundred) await awardAchievement(userId, 'progress_100')
}



