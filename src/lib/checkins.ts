import { supabase } from './supabaseClient'

export type DailyCheckin = {
	id: string
	user_id: string
	mood: number | null
	energy: number | null
	gratitude: string | null
	challenge: string | null
	tomorrow: string | null
	activities: string[] | null
	water_intake: number | null
	sleep_hours: number | null
	created_at: string
	created_date?: string
}

function getUtcDayBounds(date = new Date()) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function getTodayCheckin(userId: string) {
    console.log("getTodayCheckin called for user:", userId);
    
    // Use created_at day range to find today's check-in
    const { startIso, endIso } = getUtcDayBounds();
    console.log("Date range for today:", { startIso, endIso });
    
    const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startIso)
        .lt('created_at', endIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    
    if (error) {
        console.error("Error fetching today's check-in:", error);
        throw error;
    }
    
    console.log("Today's check-in:", data);
    return data as DailyCheckin | null;
}

export async function upsertTodayCheckin(userId: string, payload: Partial<DailyCheckin>) {
    console.log("upsertTodayCheckin called with:", { userId, payload });
    
    try {
        // Use the fallback approach: find today's row and update or insert
        const { startIso, endIso } = getUtcDayBounds();
        console.log("Date range:", { startIso, endIso });
        
        // First, try to find existing check-in for today
        const { data: existing, error: selectError } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startIso)
            .lt('created_at', endIso)
            .maybeSingle();
        
        if (selectError) {
            console.error("Error selecting existing check-in:", selectError);
            throw selectError;
        }
        
        console.log("Existing check-in:", existing);
        
        if (existing?.id) {
            // Update existing check-in
            console.log("Updating existing check-in with ID:", existing.id);
            const { data, error } = await supabase
                .from('daily_checkins')
                .update(payload)
                .eq('id', existing.id)
                .select()
                .single();
            if (error) {
                console.error("Error updating check-in:", error);
                throw error;
            }
            console.log("Updated check-in:", data);
            return data as DailyCheckin;
        } else {
            // Insert new check-in
            console.log("Inserting new check-in");
            const { data, error } = await supabase
                .from('daily_checkins')
                .insert({ user_id: userId, ...payload })
                .select()
                .single();
            if (error) {
                console.error("Error inserting check-in:", error);
                throw error;
            }
            console.log("Inserted check-in:", data);
            return data as DailyCheckin;
        }
    } catch (error) {
        console.error("Database operation failed:", error);
        
        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Network error: Cannot connect to Supabase. Please check your internet connection and try again.");
        }
        
        // Re-throw the original error
        throw error;
    }
}


