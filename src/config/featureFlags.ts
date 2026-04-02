function parseBooleanFlag(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
}

export const scoreFeatureFlags = Object.freeze({
  scoreV2WriteEnabled: parseBooleanFlag(import.meta.env.VITE_SCORE_V2_WRITE_ENABLED, false),
  scoreV2ReadEnabled: parseBooleanFlag(import.meta.env.VITE_SCORE_V2_READ_ENABLED, false),
  scoreV2LeaderboardEnabled: parseBooleanFlag(import.meta.env.VITE_SCORE_V2_LEADERBOARD_ENABLED, false),
});
