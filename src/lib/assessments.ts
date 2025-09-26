import { supabase as supabaseClient } from './supabaseClient';

export interface AssessmentResult {
  id: string;
  user_id: string;
  category: string;
  score: number;
  severity: string;
  responses: Record<number, string>;
  recommendations: string;
  created_at: string;
}

export interface AssessmentHistory {
  id: string;
  category: string;
  score: number;
  severity: string;
  created_at: string;
}

// Save assessment results to database
export async function saveAssessment(
  category: 'phq9' | 'gad7',
  score: number,
  severity: string,
  responses: Record<number, string>,
  recommendations: string
): Promise<AssessmentResult> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('assessments')
      .insert({
        user_id: user.id,
        category: category,
        score: score,
        meta: {
          severity,
          responses,
          recommendations,
          questions_count: Object.keys(responses).length
        }
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      category: data.category,
      score: data.score,
      severity: data.meta.severity,
      responses: data.meta.responses,
      recommendations: data.meta.recommendations,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
}

// Get user's assessment history
export async function getAssessmentHistory(): Promise<AssessmentHistory[]> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('assessments')
      .select('id, category, score, meta, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(assessment => ({
      id: assessment.id,
      category: assessment.category,
      score: assessment.score,
      severity: assessment.meta?.severity || 'Unknown',
      created_at: assessment.created_at
    }));
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
}

// Get latest assessment for a specific category
export async function getLatestAssessment(category: 'phq9' | 'gad7'): Promise<AssessmentResult | null> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabaseClient
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      category: data.category,
      score: data.score,
      severity: data.meta?.severity || 'Unknown',
      responses: data.meta?.responses || {},
      recommendations: data.meta?.recommendations || '',
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    throw error;
  }
}

// Calculate assessment statistics
export async function getAssessmentStats(): Promise<{
  totalAssessments: number;
  latestPHQ9: AssessmentResult | null;
  latestGAD7: AssessmentResult | null;
  averageScore: { phq9: number; gad7: number };
  trend: { phq9: 'improving' | 'stable' | 'declining'; gad7: 'improving' | 'stable' | 'declining' };
}> {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const [history, latestPHQ9, latestGAD7] = await Promise.all([
      getAssessmentHistory(),
      getLatestAssessment('phq9'),
      getLatestAssessment('gad7')
    ]);

    const phq9Scores = history.filter(h => h.category === 'phq9').map(h => h.score);
    const gad7Scores = history.filter(h => h.category === 'gad7').map(h => h.score);

    const averageScore = {
      phq9: phq9Scores.length > 0 ? phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length : 0,
      gad7: gad7Scores.length > 0 ? gad7Scores.reduce((a, b) => a + b, 0) / gad7Scores.length : 0
    };

    // Calculate trend (simple comparison of last 2 assessments)
    const getTrend = (scores: number[]) => {
      if (scores.length < 2) return 'stable';
      const latest = scores[0];
      const previous = scores[1];
      if (latest < previous) return 'improving';
      if (latest > previous) return 'declining';
      return 'stable';
    };

    const trend = {
      phq9: getTrend(phq9Scores),
      gad7: getTrend(gad7Scores)
    };

    return {
      totalAssessments: history.length,
      latestPHQ9,
      latestGAD7,
      averageScore,
      trend
    };
  } catch (error) {
    console.error('Error calculating assessment stats:', error);
    throw error;
  }
}

