# Activity Heatmap Debugging Guide

## Current Status
✅ Backend running on port 8081  
✅ Activity logging working (login tracked)  
✅ Heatmap data endpoint returning data (1 day of activity)  
❌ **Issue 1:** Database function type mismatch (stats endpoint)  
❌ **Issue 2:** Heatmap not visible on Dashboard  

---

## Fix #1: Database Function Error

### Problem
```
Error: structure of query does not match function result type
Details: Returned type text does not match expected type character varying in column 4
```

### Solution
Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
CREATE OR REPLACE FUNCTION get_user_activity_stats(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE(
  total_activities INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  most_active_month TEXT,  -- Changed from VARCHAR(20) to TEXT
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
```

Click **RUN** to execute.

---

## Fix #2: Heatmap Visibility

### Steps to Debug

1. **Open Browser Console (F12)**
   - Navigate to Dashboard page
   - Open DevTools → Console tab
   - Look for these log messages:

2. **Expected Console Output:**
   ```
   🔍 Starting activity heatmap initialization...
   📦 Attempting to load Heat.js library...
   📦 Heat.js module imported
   📦 Heat.js CSS added
   ✅ Heat.js global object found after X attempts
   ✅ Heat.js loaded successfully
   📊 Fetching activity data for user: [your-user-id]
   📈 Data fetched: { heatmapSuccess: true, statsSuccess: false/true, dataPoints: X }
   🎨 Rendering heatmap...
   ✨ Heatmap rendered with data!
   ```

3. **Common Issues & Solutions:**

   **❌ If you see: "Heat.js global object not found after 5 seconds"**
   - Solution: Heat.js library not loading properly
   - Try: Clear browser cache, hard refresh (Ctrl+Shift+R)

   **❌ If you see: "Failed to load heatmap library"**
   - Solution: Network issue or module import failed
   - Try: Check internet connection, restart dev server

   **❌ If you see: Error fetching activity stats (code 42804)**
   - Solution: Run Fix #1 SQL above
   - Backend logs will show this error until database is fixed

   **❌ If loading spinner never stops**
   - Solution: Check backend server is running
   - Try: `cd backend && npm run dev`

4. **Verify Backend:**
   ```powershell
   # Check if backend is running
   curl http://localhost:8081/health
   
   # Should return: {"status":"ok","timestamp":"..."}
   ```

5. **Test API Endpoints:**
   ```powershell
   # Test heatmap endpoint (replace USER_ID with your actual user ID)
   curl "http://localhost:8081/api/user/YOUR_USER_ID/activity/heatmap?startDate=2025-01-01&endDate=2025-12-31"
   
   # Should return: {"success":true,"heatmapData":{...}}
   ```

---

## What Should You See

### When Working Correctly:

1. **Loading State** (brief):
   - Skeleton loading animation
   - "Loading your activity heatmap..."

2. **Success State**:
   - GitHub-style heatmap grid with days/months
   - Activity squares (colored if you have activities)
   - 4 stat cards showing:
     - 🔥 Current Streak
     - 📊 Total Activities  
     - 🏆 Best Streak
     - 📅 Most Active Month

3. **Empty State** (no activities yet):
   - Empty heatmap grid (all squares gray/neutral)
   - Stats showing 0 for streaks/activities
   - "Keep learning daily to maintain your streak! 🔥"

### When Broken:

1. **Error State**:
   - Red error card
   - "Error Loading Activity Heatmap"
   - Checklist of things to verify

2. **Stuck Loading**:
   - Skeleton animation forever
   - Check console for errors

---

## Testing After Fixes

1. **Run the SQL fix** in Supabase Dashboard
2. **Refresh Dashboard page** (F5)
3. **Check console logs** - should see success messages
4. **Look for heatmap grid** - should be visible now
5. **Perform an activity** (login counts!) to test logging
6. **Refresh again** - square should appear on heatmap

---

## Files Modified (Latest Changes)

- ✅ `src/components/ActivityHeatmap.tsx` - Enhanced logging, better error handling
- ✅ `database/activity_tracking_schema.sql` - Fixed return type
- ✅ `database/fix_activity_stats_function.sql` - Migration SQL

---

## Questions?

If heatmap still not visible after:
1. ✅ Running SQL fix
2. ✅ Refreshing page  
3. ✅ Checking console logs

Share the **console output** and we'll debug further!
