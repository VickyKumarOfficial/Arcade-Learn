import dotenv from 'dotenv';

dotenv.config();

function parseBooleanFlag(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
}

export const scoreFeatureFlags = Object.freeze({
  scoreV2WriteEnabled: parseBooleanFlag(process.env.SCORE_V2_WRITE_ENABLED, false),
  scoreV2ReadEnabled: parseBooleanFlag(process.env.SCORE_V2_READ_ENABLED, false),
  scoreV2LeaderboardEnabled: parseBooleanFlag(process.env.SCORE_V2_LEADERBOARD_ENABLED, false),
});

export function getScoreFeatureFlags() {
  return scoreFeatureFlags;
}
