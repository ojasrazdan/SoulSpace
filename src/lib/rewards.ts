import { supabase as supabaseClient } from './supabaseClient';

export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  total_xp: number;
  calm_points: number;
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  points_reward: number;
  category: 'wellness' | 'productivity' | 'social' | 'learning';
  difficulty: 'easy' | 'medium' | 'hard';
  is_completed: boolean;
  completed_at?: string;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  points: number;
  redeemed: boolean;
  created_at: string;
}

// XP and Level System
const XP_PER_LEVEL = 1000; // Base XP needed per level
const LEVEL_MULTIPLIER = 1.2; // XP increases by 20% each level

export function calculateLevelFromXP(totalXP: number): { level: number; xpInCurrentLevel: number; xpNeededForNext: number } {
  let level = 1;
  let xpInCurrentLevel = totalXP;
  let xpNeededForNext = XP_PER_LEVEL;

  while (xpInCurrentLevel >= xpNeededForNext) {
    xpInCurrentLevel -= xpNeededForNext;
    level++;
    xpNeededForNext = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
  }

  return {
    level,
    xpInCurrentLevel,
    xpNeededForNext
  };
}

// Get or create user progress
export async function getUserProgress(): Promise<UserProgress> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new progress record
      const { data: newProgress, error: createError } = await supabaseClient
        .from('user_progress')
        .insert({
          user_id: user.id,
          level: 1,
          xp: 0,
          total_xp: 0,
          calm_points: 0
        })
        .select('*')
        .single();

      if (createError) throw createError;
      return newProgress;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

// Add XP and update level
export async function addXP(amount: number, source: string, sourceId?: string): Promise<{ leveledUp: boolean; newLevel: number; newXP: number }> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current progress
    const currentProgress = await getUserProgress();
    const newTotalXP = currentProgress.total_xp + amount;
    const { level: newLevel, xpInCurrentLevel } = calculateLevelFromXP(newTotalXP);
    const leveledUp = newLevel > currentProgress.level;

    // Update progress
    const { data, error } = await supabaseClient
      .from('user_progress')
      .update({
        level: newLevel,
        xp: xpInCurrentLevel,
        total_xp: newTotalXP,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) throw error;

    // Log XP gain
    await supabaseClient
      .from('xp_logs')
      .insert({
        user_id: user.id,
        amount: amount,
        source: source,
        source_id: sourceId,
        total_xp: newTotalXP
      });

    return {
      leveledUp,
      newLevel,
      newXP: xpInCurrentLevel
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
}

// Add Calm Points
export async function addCalmPoints(amount: number, source: string, sourceId?: string): Promise<number> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const currentProgress = await getUserProgress();
    const newPoints = currentProgress.calm_points + amount;

    const { error } = await supabaseClient
      .from('user_progress')
      .update({
        calm_points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    // Log points gain
    await supabaseClient
      .from('points_logs')
      .insert({
        user_id: user.id,
        amount: amount,
        source: source,
        source_id: sourceId,
        total_points: newPoints
      });

    return newPoints;
  } catch (error) {
    console.error('Error adding calm points:', error);
    throw error;
  }
}

// Get daily challenges
export async function getDailyChallenges(): Promise<DailyChallenge[]> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];

    // Get today's challenges
    const { data, error } = await supabaseClient
      .from('daily_challenges')
      .select(`
        *,
        challenge_completions!left (
          id,
          completed_at
        )
      `)
      .eq('date', today);

    if (error) throw error;

    return data.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      xp_reward: challenge.xp_reward,
      points_reward: challenge.points_reward,
      category: challenge.category,
      difficulty: challenge.difficulty,
      is_completed: challenge.challenge_completions && challenge.challenge_completions.length > 0,
      completed_at: challenge.challenge_completions?.[0]?.completed_at
    }));
  } catch (error) {
    console.error('Error getting daily challenges:', error);
    throw error;
  }
}

// Complete a daily challenge
export async function completeDailyChallenge(challengeId: string): Promise<{ xpGained: number; pointsGained: number; leveledUp: boolean }> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError) throw challengeError;

    // Check if already completed
    const { data: existingCompletion } = await supabaseClient
      .from('challenge_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existingCompletion) {
      throw new Error('Challenge already completed');
    }

    // Add completion record
    const { error: completionError } = await supabaseClient
      .from('challenge_completions')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        completed_at: new Date().toISOString()
      });

    if (completionError) throw completionError;

    // Add XP and points
    const xpResult = await addXP(challenge.xp_reward, 'daily_challenge', challengeId);
    const pointsGained = await addCalmPoints(challenge.points_reward, 'daily_challenge', challengeId);

    return {
      xpGained: challenge.xp_reward,
      pointsGained: challenge.points_reward,
      leveledUp: xpResult.leveledUp
    };
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    throw error;
  }
}

// Get user rewards
export async function getUserRewards(): Promise<Reward[]> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user rewards:', error);
    throw error;
  }
}

// Redeem a reward
export async function redeemReward(rewardId: string): Promise<void> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from('rewards')
      .update({ redeemed: true })
      .eq('id', rewardId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw error;
  }
}

// Award XP for goal completion
export async function awardGoalCompletionXP(goalId: string, goalTitle: string): Promise<void> {
  const xpAmount = 50; // Base XP for goal completion
  const pointsAmount = 10; // Base points for goal completion

  try {
    const xpResult = await addXP(xpAmount, 'goal_completion', goalId);
    await addCalmPoints(pointsAmount, 'goal_completion', goalId);

    // Award bonus XP for level up
    if (xpResult.leveledUp) {
      await addXP(100, 'level_up_bonus');
      await addCalmPoints(50, 'level_up_bonus');
    }
  } catch (error) {
    console.error('Error awarding goal completion XP:', error);
    throw error;
  }
}

// Award XP for quiz completion
export async function awardQuizCompletionXP(assessmentId: string, quizType: 'phq9' | 'gad7'): Promise<void> {
  const xpAmount = 75; // Base XP for quiz completion
  const pointsAmount = 15; // Base points for quiz completion

  try {
    const xpResult = await addXP(xpAmount, 'quiz_completion', assessmentId);
    await addCalmPoints(pointsAmount, 'quiz_completion', assessmentId);

    // Award bonus XP for level up
    if (xpResult.leveledUp) {
      await addXP(100, 'level_up_bonus');
      await addCalmPoints(50, 'level_up_bonus');
    }
  } catch (error) {
    console.error('Error awarding quiz completion XP:', error);
    throw error;
  }
}

