-- ============================================================================
-- Activity Tracking Schema for Arcade Learn
-- Purpose: Track user activities for GitHub-style heatmap visualization
-- ============================================================================

-- Drop existing table if it exists (for development)
DROP TABLE IF EXISTS user_activity_log CASCADE;

-- ============================================================================
-- Main Activity Log Table
-- ============================================================================
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_date DATE NOT NULL,
  activity_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Primary lookup index: Fast queries by user and date
CREATE INDEX idx_user_activity_user_date 
  ON user_activity_log(user_id, activity_date DESC);

-- Activity type filtering
CREATE INDEX idx_user_activity_type 
  ON user_activity_log(user_id, activity_type);

-- Date range queries (for heatmap year view)
CREATE INDEX idx_user_activity_date_range 
  ON user_activity_log(activity_date DESC);

-- Composite index for aggregation queries
CREATE INDEX idx_user_activity_composite 
  ON user_activity_log(user_id, activity_date, activity_type);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE user_activity_log IS 'Tracks all user activities for heatmap visualization and analytics';
COMMENT ON COLUMN user_activity_log.activity_type IS 'Type of activity: test_completed, roadmap_completed, login, achievement_unlocked, quiz_attempted, resume_updated, job_applied';
COMMENT ON COLUMN user_activity_log.activity_date IS 'Date when the activity occurred (without time component)';
COMMENT ON COLUMN user_activity_log.activity_count IS 'Number of activities of this type on this date';
COMMENT ON COLUMN user_activity_log.metadata IS 'Additional activity details in JSON format';

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
  ON user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
  ON user_activity_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service role has full access"
  ON user_activity_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Helper Function: Log Activity
-- ============================================================================

CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_activity_date DATE DEFAULT CURRENT_DATE,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  -- Check if an entry for this user, type, and date already exists
  SELECT id INTO v_existing_id
  FROM user_activity_log
  WHERE user_id = p_user_id
    AND activity_type = p_activity_type
    AND activity_date = p_activity_date;

  -- If exists, increment the count
  IF v_existing_id IS NOT NULL THEN
    UPDATE user_activity_log
    SET 
      activity_count = activity_count + 1,
      metadata = p_metadata,
      updated_at = NOW()
    WHERE id = v_existing_id;
    
    RETURN v_existing_id;
  ELSE
    -- Insert new activity log
    INSERT INTO user_activity_log (
      user_id,
      activity_type,
      activity_date,
      activity_count,
      metadata
    ) VALUES (
      p_user_id,
      p_activity_type,
      p_activity_date,
      1,
      p_metadata
    )
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_user_activity IS 'Logs a user activity, incrementing count if entry exists for same date and type';

-- ============================================================================
-- Helper Function: Get Activity Heatmap Data
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_activity_heatmap(
  p_user_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '1 year')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_activity_types VARCHAR(50)[] DEFAULT NULL
)
RETURNS TABLE(
  activity_date DATE,
  total_count INTEGER,
  activity_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ual.activity_date,
    SUM(ual.activity_count)::INTEGER AS total_count,
    jsonb_object_agg(
      ual.activity_type, 
      ual.activity_count
    ) AS activity_breakdown
  FROM user_activity_log ual
  WHERE ual.user_id = p_user_id
    AND ual.activity_date BETWEEN p_start_date AND p_end_date
    AND (p_activity_types IS NULL OR ual.activity_type = ANY(p_activity_types))
  GROUP BY ual.activity_date
  ORDER BY ual.activity_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_activity_heatmap IS 'Returns aggregated activity data for heatmap visualization';

-- ============================================================================
-- Helper Function: Get Activity Statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_activity_stats(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE(
  total_activities INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  most_active_month TEXT,
  most_active_count INTEGER,
  avg_activities_per_week NUMERIC
) AS $$
DECLARE
  v_year_start DATE := make_date(p_year, 1, 1);
  v_year_end DATE := make_date(p_year, 12, 31);
BEGIN
  RETURN QUERY
  WITH daily_totals AS (
    SELECT 
      activity_date,
      SUM(activity_count) AS daily_count
    FROM user_activity_log
    WHERE user_id = p_user_id
      AND activity_date BETWEEN v_year_start AND v_year_end
    GROUP BY activity_date
  ),
  streak_calc AS (
    SELECT 
      activity_date,
      activity_date - ROW_NUMBER() OVER (ORDER BY activity_date)::INTEGER AS streak_group
    FROM daily_totals
  ),
  streak_lengths AS (
    SELECT 
      COUNT(*) AS streak_length,
      MAX(activity_date) AS streak_end
    FROM streak_calc
    GROUP BY streak_group
  ),
  monthly_stats AS (
    SELECT 
      TO_CHAR(activity_date, 'Month') AS month_name,
      SUM(daily_count) AS month_count
    FROM daily_totals
    GROUP BY TO_CHAR(activity_date, 'Month'), EXTRACT(MONTH FROM activity_date)
    ORDER BY SUM(daily_count) DESC
    LIMIT 1
  )
  SELECT 
    COALESCE((SELECT SUM(daily_count)::INTEGER FROM daily_totals), 0) AS total_activities,
    COALESCE((
      SELECT streak_length::INTEGER
      FROM streak_lengths
      WHERE streak_end = CURRENT_DATE
      LIMIT 1
    ), 0) AS current_streak,
    COALESCE((SELECT MAX(streak_length)::INTEGER FROM streak_lengths), 0) AS longest_streak,
    COALESCE((SELECT month_name FROM monthly_stats), 'N/A') AS most_active_month,
    COALESCE((SELECT month_count::INTEGER FROM monthly_stats), 0) AS most_active_count,
    COALESCE((
      SELECT ROUND(AVG(weekly_total), 1)
      FROM (
        SELECT 
          EXTRACT(WEEK FROM activity_date) AS week_num,
          SUM(daily_count) AS weekly_total
        FROM daily_totals
        GROUP BY EXTRACT(WEEK FROM activity_date)
      ) week_data
    ), 0) AS avg_activities_per_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_activity_stats IS 'Returns comprehensive activity statistics including streaks and trends';

-- ============================================================================
-- Activity Type Reference (for documentation)
-- ============================================================================

/*
Supported Activity Types:
- 'test_completed'      : User completed a game test
- 'roadmap_completed'   : User completed a roadmap item
- 'login'               : User logged into the platform
- 'achievement_unlocked': User earned an achievement
- 'quiz_attempted'      : User attempted a quiz
- 'resume_updated'      : User updated their resume
- 'job_applied'         : User applied to a job
- 'roadmap_started'     : User started a new roadmap
- 'profile_updated'     : User updated their profile
- 'certificate_earned'  : User earned a certificate
*/

-- ============================================================================
-- Sample Data for Testing (Optional - Comment out for production)
-- ============================================================================

-- Example: Log some test activities
-- SELECT log_user_activity(
--   '839e5c04-b5b8-4c94-bc9d-cda48fc81f06'::UUID,
--   'test_completed',
--   CURRENT_DATE,
--   '{"test_name": "JavaScript Basics", "score": 85}'::JSONB
-- );
