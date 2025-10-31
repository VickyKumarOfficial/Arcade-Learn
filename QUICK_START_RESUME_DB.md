# 🚀 Quick Start Guide - Resume Database Setup

## ⚡ Fast Setup (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your **ArcadeLearn** project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Database Schema
1. Click **New Query** button
2. Open `database/resume_schema.sql` file
3. **Copy ALL the content** (Ctrl+A, Ctrl+C)
4. **Paste** into SQL Editor (Ctrl+V)
5. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Success
You should see: ✅ **Success. No rows returned**

Run this verification query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('parsed_resumes', 'resume_edit_history');
```

Expected result:
```
parsed_resumes
resume_edit_history
```

### Step 4: Test the Feature
1. Start your dev server: `npm run dev`
2. Navigate to: http://localhost:5173/resume
3. Upload a PDF resume
4. Click **"Save Resume"** button
5. See success message! ✅

### Step 5: Verify Data Saved
Run in Supabase SQL Editor:
```sql
SELECT 
  file_name,
  parsing_accuracy_score,
  created_at,
  jsonb_pretty(resume_data) as resume_data_formatted
FROM parsed_resumes 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

## 🎯 Quick Test

### Upload Test Resume
1. Go to `/resume` page
2. Upload any PDF resume
3. Wait for parsing (2-3 seconds)
4. See parsed data displayed

### Save to Database
1. Click **"Save Resume"** button
2. Loading spinner appears
3. Success message: "Resume saved successfully!"
4. Button changes to "Saved" with checkmark

### Export JSON
1. Click **"Export JSON"** button
2. JSON file downloads automatically
3. Open in text editor to verify data

## 📊 View Your Data

### Option 1: Supabase Dashboard
1. Go to **Table Editor**
2. Select `parsed_resumes` table
3. See your saved resumes

### Option 2: SQL Query
```sql
-- Get all your resumes
SELECT 
  id,
  file_name,
  parsing_accuracy_score,
  created_at
FROM parsed_resumes
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Get your active resume
SELECT * FROM get_active_resume(auth.uid());

-- Get statistics
SELECT * FROM v_user_resume_stats WHERE user_id = auth.uid();
```

## 🐛 Troubleshooting

### Issue: "permission denied for table parsed_resumes"
**Fix**: Make sure you're logged in. The table uses RLS (Row-Level Security).

### Issue: Schema run fails
**Fix**: 
1. Delete existing tables first:
   ```sql
   DROP TABLE IF EXISTS resume_edit_history CASCADE;
   DROP TABLE IF EXISTS parsed_resumes CASCADE;
   ```
2. Run schema again

### Issue: "No rows returned" when querying
**Fix**: 
1. Make sure you uploaded and saved a resume
2. Check you're using `auth.uid()` in WHERE clause
3. Verify you're logged in to the app

### Issue: Save button doesn't work
**Fix**:
1. Open browser console (F12)
2. Check for errors
3. Verify Supabase connection in Network tab
4. Make sure schema was run successfully

## ✅ Success Checklist

- [ ] Schema runs without errors
- [ ] Both tables visible in Table Editor
- [ ] Can upload PDF resume
- [ ] Parsing completes successfully
- [ ] Save button works
- [ ] Success message appears
- [ ] Data visible in Supabase dashboard
- [ ] Export JSON works
- [ ] Can reload page and data persists

## 🎉 You're Done!

Your resume parser now has full database integration!

**Next features available**:
- ✏️ Inline editing
- 📝 Multiple resume management
- 📊 Resume analytics
- 🔄 Version history

**Need Help?**
- Check `database/README.md` for detailed docs
- Review `RESUME_ENHANCEMENT_SUMMARY.md` for complete feature list
- Check console for error messages

---

**Setup Time**: ~5 minutes  
**Status**: Production Ready ✅  
**Last Updated**: October 31, 2025
