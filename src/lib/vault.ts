import { supabase } from './supabaseClient'

export type VaultEntry = {
	id: string
	user_id: string
	title: string
	content: string
	type: string | null
	mood: string | null
	word_count: number
	created_at: string
}

export async function createEntry(userId: string, input: { title: string; content: string; type?: string; mood?: string }) {
	const { data, error } = await supabase
		.from('vault_entries')
		.insert({ user_id: userId, title: input.title, content: input.content, type: input.type ?? null, mood: input.mood ?? null })
		.select('*')
		.single()
	if (error) throw error
	return data as VaultEntry
}

export async function listRecent(userId: string, limit = 10) {
	const { data, error } = await supabase
		.from('vault_entries')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(limit)
	if (error) throw error
	return data as VaultEntry[]
}

export async function listAll(userId: string) {
	const { data, error } = await supabase
		.from('vault_entries')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
	if (error) throw error
	return data as VaultEntry[]
}

export async function getOverview(userId: string) {
	const { data, error } = await supabase
		.rpc('vault_overview', { p_user_id: userId })
	if (error) throw error
	return data as { total_entries: number; total_words: number; by_mood: { mood: string; count: number }[] }
}

export async function deleteEntry(userId: string, id: string) {
	const { error } = await supabase
		.from('vault_entries')
		.delete()
		.eq('id', id)
		.eq('user_id', userId)
	if (error) throw error
}


