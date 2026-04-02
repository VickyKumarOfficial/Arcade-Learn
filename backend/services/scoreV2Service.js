import supabaseAdmin from '../lib/supabase.js';

const DEFAULT_CONFIG = {
  pass_score_min: 80,
  submodule_max_points: 2,
  module_completion_bonus: 1,
  scoring_version: 'v1',
};

const STAR_THRESHOLDS = [100, 250, 450, 750];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function calculateStars(totalScore) {
  if (totalScore >= STAR_THRESHOLDS[3]) return 4;
  if (totalScore >= STAR_THRESHOLDS[2]) return 3;
  if (totalScore >= STAR_THRESHOLDS[1]) return 2;
  if (totalScore >= STAR_THRESHOLDS[0]) return 1;
  return 0;
}

function calculateSubmodulePoints(quizScore, config) {
  const passScoreMin = toNumber(config.pass_score_min, DEFAULT_CONFIG.pass_score_min);
  const maxPoints = toNumber(config.submodule_max_points, DEFAULT_CONFIG.submodule_max_points);

  if (quizScore < passScoreMin) {
    return 0;
  }

  const scaled = ((quizScore - passScoreMin) / 20) * maxPoints;
  return Math.max(0, round2(scaled));
}

class ScoreV2Service {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  async getActiveConfig() {
    const { data, error } = await this.supabase
      .from('score_v2_config')
      .select('*')
      .eq('scope', 'global')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Score V2 config read failed, using defaults:', error.message);
      return DEFAULT_CONFIG;
    }

    return data || DEFAULT_CONFIG;
  }

  async getOrCreateUserGameData(userId) {
    const { data, error } = await this.supabase
      .from('user_game_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      return data;
    }

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to read user_game_data: ${error.message}`);
    }

    const seed = {
      user_id: userId,
      total_xp: 0,
      level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString(),
      total_components_completed: 0,
      completed_components: [],
      completed_roadmaps: [],
      total_score: 0,
      total_stars: 0,
      total_submodule_points: 0,
      total_module_bonus_points: 0,
      scoring_version: 'v1',
    };

    const { data: inserted, error: insertError } = await this.supabase
      .from('user_game_data')
      .insert([seed])
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to create user_game_data seed: ${insertError.message}`);
    }

    return inserted;
  }

  async updateGlobalSummary(userId, deltaSubmodulePoints = 0, deltaModuleBonusPoints = 0, scoringVersion = 'v1') {
    const gameData = await this.getOrCreateUserGameData(userId);

    const newSubmoduleTotal = round2(toNumber(gameData.total_submodule_points) + toNumber(deltaSubmodulePoints));
    const newModuleBonusTotal = round2(toNumber(gameData.total_module_bonus_points) + toNumber(deltaModuleBonusPoints));
    const newTotalScore = round2(newSubmoduleTotal + newModuleBonusTotal);
    const newStars = calculateStars(newTotalScore);

    const updatePayload = {
      user_id: userId,
      total_score: newTotalScore,
      total_stars: newStars,
      total_submodule_points: newSubmoduleTotal,
      total_module_bonus_points: newModuleBonusTotal,
      scoring_version: scoringVersion,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await this.supabase
      .from('user_game_data')
      .upsert(updatePayload, {
        onConflict: 'user_id',
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update global score summary: ${error.message}`);
    }

    return updated;
  }

  async updateRoadmapSummary(userId, roadmapId, deltaSubmodulePoints = 0, deltaModuleBonusPoints = 0, scoringVersion = 'v1') {
    const { data: existing, error: readError } = await this.supabase
      .from('user_roadmap_score_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('roadmap_id', roadmapId)
      .maybeSingle();

    if (readError) {
      throw new Error(`Failed to read roadmap score summary: ${readError.message}`);
    }

    const prevSubmodule = toNumber(existing?.total_submodule_points);
    const prevModuleBonus = toNumber(existing?.total_module_bonus_points);

    const totalSubmodule = round2(prevSubmodule + toNumber(deltaSubmodulePoints));
    const totalModuleBonus = round2(prevModuleBonus + toNumber(deltaModuleBonusPoints));
    const totalScore = round2(totalSubmodule + totalModuleBonus);
    const totalStars = calculateStars(totalScore);

    const { error } = await this.supabase
      .from('user_roadmap_score_summary')
      .upsert({
        user_id: userId,
        roadmap_id: roadmapId,
        total_score: totalScore,
        total_stars: totalStars,
        total_submodule_points: totalSubmodule,
        total_module_bonus_points: totalModuleBonus,
        scoring_version: scoringVersion,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,roadmap_id',
      });

    if (error) {
      throw new Error(`Failed to update roadmap score summary: ${error.message}`);
    }

    return {
      roadmapId,
      totalScore,
      totalStars,
      totalSubmodulePoints: totalSubmodule,
      totalModuleBonusPoints: totalModuleBonus,
    };
  }

  async submitAttempt(userId, payload) {
    const config = await this.getActiveConfig();
    const scoringVersion = payload.scoringVersion || config.scoring_version || DEFAULT_CONFIG.scoring_version;

    const { data: existingAttempt, error: existingAttemptError } = await this.supabase
      .from('user_score_events')
      .select('*')
      .eq('user_id', userId)
      .eq('attempt_id', payload.attemptId)
      .maybeSingle();

    if (existingAttemptError) {
      throw new Error(`Failed to check attempt idempotency: ${existingAttemptError.message}`);
    }

    if (existingAttempt) {
      const summary = await this.getUserSummary(userId);
      return {
        deduplicated: true,
        attempt: existingAttempt,
        summary,
      };
    }

    const candidatePoints = calculateSubmodulePoints(payload.quizScore, config);

    const { data: bestRow, error: bestError } = await this.supabase
      .from('user_score_events')
      .select('awarded_submodule_points')
      .eq('user_id', userId)
      .eq('roadmap_id', payload.roadmapId)
      .eq('module_id', payload.moduleId)
      .eq('node_id', payload.nodeId)
      .eq('node_depth', 'submodule')
      .order('awarded_submodule_points', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (bestError) {
      throw new Error(`Failed to check best historical points: ${bestError.message}`);
    }

    const previousBest = toNumber(bestRow?.awarded_submodule_points);
    const deltaPoints = Math.max(0, round2(candidatePoints - previousBest));

    const insertPayload = {
      attempt_id: payload.attemptId,
      user_id: userId,
      roadmap_id: payload.roadmapId,
      module_id: payload.moduleId,
      node_id: payload.nodeId,
      node_depth: payload.nodeDepth,
      quiz_score: payload.quizScore,
      awarded_submodule_points: deltaPoints,
      awarded_module_bonus_points: 0,
      scoring_version: scoringVersion,
      metadata: payload.metadata || {},
      submitted_at: payload.submittedAt,
    };

    const { data: inserted, error: insertError } = await this.supabase
      .from('user_score_events')
      .insert([insertPayload])
      .select('*')
      .single();

    if (insertError) {
      throw new Error(`Failed to insert score event: ${insertError.message}`);
    }

    if (deltaPoints > 0) {
      await this.updateGlobalSummary(userId, deltaPoints, 0, scoringVersion);
      await this.updateRoadmapSummary(userId, payload.roadmapId, deltaPoints, 0, scoringVersion);
    }

    const summary = await this.getUserSummary(userId);

    return {
      deduplicated: false,
      previousBest,
      candidatePoints,
      awardedPoints: deltaPoints,
      attempt: inserted,
      summary,
    };
  }

  async awardModuleBonus(userId, payload) {
    const config = await this.getActiveConfig();
    const scoringVersion = payload.scoringVersion || config.scoring_version || DEFAULT_CONFIG.scoring_version;
    const moduleBonus = toNumber(config.module_completion_bonus, DEFAULT_CONFIG.module_completion_bonus);

    const { data: existing, error: existingError } = await this.supabase
      .from('user_score_module_bonus_awards')
      .select('*')
      .eq('user_id', userId)
      .eq('roadmap_id', payload.roadmapId)
      .eq('module_id', payload.moduleId)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Failed to check existing module bonus: ${existingError.message}`);
    }

    if (existing) {
      const summary = await this.getUserSummary(userId);
      return {
        deduplicated: true,
        award: existing,
        summary,
      };
    }

    const { data: award, error: awardError } = await this.supabase
      .from('user_score_module_bonus_awards')
      .insert([{
        user_id: userId,
        roadmap_id: payload.roadmapId,
        module_id: payload.moduleId,
        awarded_points: moduleBonus,
        scoring_version: scoringVersion,
        awarded_at: payload.completedAt,
      }])
      .select('*')
      .single();

    if (awardError) {
      throw new Error(`Failed to award module bonus: ${awardError.message}`);
    }

    await this.updateGlobalSummary(userId, 0, moduleBonus, scoringVersion);
    await this.updateRoadmapSummary(userId, payload.roadmapId, 0, moduleBonus, scoringVersion);

    const summary = await this.getUserSummary(userId);

    return {
      deduplicated: false,
      awardedPoints: moduleBonus,
      award,
      summary,
    };
  }

  async getUserSummary(userId) {
    const gameData = await this.getOrCreateUserGameData(userId);

    const { data: roadmapRows, error: roadmapError } = await this.supabase
      .from('user_roadmap_score_summary')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (roadmapError) {
      throw new Error(`Failed to read roadmap summaries: ${roadmapError.message}`);
    }

    const { data: rankRow, error: rankError } = await this.supabase
      .from('v_score_v2_global_leaderboard')
      .select('rank')
      .eq('user_id', userId)
      .maybeSingle();

    if (rankError) {
      throw new Error(`Failed to read global rank: ${rankError.message}`);
    }

    return {
      userId,
      totalScore: round2(toNumber(gameData.total_score)),
      totalStars: Math.trunc(toNumber(gameData.total_stars)),
      totalSubmodulePoints: round2(toNumber(gameData.total_submodule_points)),
      totalModuleBonusPoints: round2(toNumber(gameData.total_module_bonus_points)),
      updatedAt: gameData.updated_at,
      scoringVersion: gameData.scoring_version || 'v1',
      globalRank: rankRow?.rank ?? null,
      roadmapSummaries: (roadmapRows || []).map((row) => ({
        roadmapId: row.roadmap_id,
        totalScore: round2(toNumber(row.total_score)),
        totalStars: Math.trunc(toNumber(row.total_stars)),
        rank: null,
        updatedAt: row.updated_at,
      })),
    };
  }

  async getGlobalLeaderboard(limit = 100) {
    const safeLimit = Number.isInteger(limit) ? Math.max(1, Math.min(limit, 500)) : 100;

    const { data, error } = await this.supabase
      .from('v_score_v2_global_leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(safeLimit);

    if (error) {
      throw new Error(`Failed to read global leaderboard: ${error.message}`);
    }

    return (data || []).map((row) => ({
      rank: row.rank,
      userId: row.user_id,
      displayName: [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || 'Anonymous',
      totalScore: round2(toNumber(row.total_score)),
      totalStars: Math.trunc(toNumber(row.total_stars)),
      updatedAt: row.updated_at,
    }));
  }
}

export const scoreV2Service = new ScoreV2Service();
export default ScoreV2Service;
