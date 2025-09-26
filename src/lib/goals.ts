import { supabase } from './supabaseClient'

export type Goal = {
	id: string
	user_id: string
	title: string
	description: string | null
	status: string
	progress: number
	created_at: string
	updated_at: string
}

export async function listGoals(userId: string) {
	const { data, error } = await supabase
		.from('goals')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
	if (error) throw error
	return data as Goal[]
}

export async function createGoal(userId: string, input: { title: string; description?: string }) {
	const { data, error } = await supabase
		.from('goals')
		.insert({ user_id: userId, title: input.title, description: input.description ?? null })
		.select()
		.single()
	if (error) throw error
	return data as Goal
}

export async function updateGoal(id: string, patch: Partial<Pick<Goal, 'title'|'description'|'status'|'progress'>>) {
	const { data, error } = await supabase
		.from('goals')
		.update(patch)
		.eq('id', id)
		.select()
		.single()
	if (error) throw error
	return data as Goal
}

export async function deleteGoal(id: string) {
	const { error } = await supabase
		.from('goals')
		.delete()
		.eq('id', id)
	if (error) throw error
}


