-- ============================================================================
-- Fix: Update get_user_activity_stats function to fix return type mismatch
-- Issue: most_active_month was VARCHAR(20) but TO_CHAR returns TEXT
-- Solution: Change return type to TEXT
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
