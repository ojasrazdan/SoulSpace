import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export async function signInWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password })
	if (error) throw error
	return data
}

export async function signUpWithEmail(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({ email, password })
	if (error) throw error
	return data
}

export async function signOut() {
	const { error } = await supabase.auth.signOut()
	if (error) throw error
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
	return supabase.auth.onAuthStateChange((event, session) => callback(event, session))
}

export async function getSession() {
	const { data, error } = await supabase.auth.getSession()
	if (error) throw error
	return data.session
}

export async function signInWithProvider(provider: 'google' | 'apple') {
	const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
	const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
	if (error) throw error
	return data
}


