# 🚀 Job Scraper Setup & Usage Guide

## ✅ Completed Steps
- [x] Database migration run in Supabase
- [x] Repository cloned to `D:\Arcade-Learn\job-scraper`
- [x] Python dependencies installed (playwright, supabase, pandas, etc.)
- [x] Playwright browsers installed
- [x] `.env` template created

---

## 🔧 Required: Configure Your Credentials

### **Get Your Supabase Service Role Key:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Arcade-Learn** project
3. Click **⚙️ Project Settings** (bottom left)
4. Go to **API** section
5. Find **service_role** key (NOT the anon key!)
6. **Copy the key** (starts with `eyJ...`)

### **Update `.env` File:**

Open `job-scraper\backend\.env` and replace:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGci... (your service_role key)
```

---

## ▶️ How to Run the Scraper

### **Option 1: Run from Backend Folder**
```powershell
cd job-scraper\backend
python scraper/scraper.py
```

### **Option 2: Run from Root Folder**
```powershell
cd job-scraper
python backend/scraper/scraper.py
```

---

## 📊 What the Scraper Does

1. **Scrapes 5 job websites:**
   - Riot Games Careers
   - Roblox Careers
   - Job Bank Canada
   - USA Jobs (Government)
   - Google Careers

2. **Extracts job data:**
   - Title
   - Company Name
   - Location
   - Department
   - Job Type (Full-Time/Part-Time/Internship/Contract)
   - Salary (if available)
   - Description
   - Direct URL
   - Posted Date

3. **Saves to Supabase:**
   - Inserts new jobs
   - Updates existing jobs (based on URL)
   - Max 500 jobs per website

---

## 🎯 Expected Output

When running, you'll see:
```
Scraping: https://www.riotgames.com/en/work-with-us
✓ Found 45 jobs
✓ Inserted 45 new jobs to Supabase

Scraping: https://careers.roblox.com/jobs
✓ Found 67 jobs
✓ Inserted 67 new jobs to Supabase

...

Total jobs scraped: 312
Time taken: 2m 34s
```

---

## 🔍 Verify Data in Supabase

After running the scraper:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **jobs** table
4. You should see scraped jobs!

---

## 🧪 Test Your Setup First

Before running the full scraper, let's verify your credentials work:

### Quick Test Script:
```python
# test_connection.py
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

print(f"URL: {url}")
print(f"Key: {key[:20]}..." if key else "Key: Not found!")

supabase = create_client(url, key)
result = supabase.table('jobs').select("*").limit(1).execute()
print(f"✅ Connection successful! Jobs count: {len(result.data)}")
```

Run it:
```powershell
cd job-scraper\backend
python test_connection.py
```

---

## ⚠️ Troubleshooting

### "SUPABASE_URL not found"
- Make sure `.env` file is in `job-scraper/backend/` folder
- Check spelling: `SUPABASE_URL` and `SUPABASE_KEY`

### "Permission denied" / RLS errors
- You MUST use **service_role** key (not anon key)
- Service role bypasses RLS policies

### "No module named 'playwright'"
- Run: `pip install -r requirements.txt` again
- Run: `playwright install` again

### Scraper runs but no jobs appear
- Check `jobs` table in Supabase
- Run verification query:
  ```sql
  SELECT COUNT(*) FROM jobs;
  SELECT * FROM jobs LIMIT 10;
  ```

---

## 🔄 Run Automatically (Optional)

### **Option A: Windows Task Scheduler**
1. Open Task Scheduler
2. Create task to run daily at 2 AM
3. Action: `python D:\Arcade-Learn\job-scraper\backend\scraper\scraper.py`

### **Option B: GitHub Actions (Recommended)**
1. Create new GitHub repo for scraper
2. Add Supabase credentials as GitHub Secrets
3. Create workflow to run daily

I can help set up GitHub Actions if you want automated daily scraping!

---

## 📝 Next Steps After First Run

1. ✅ Run scraper manually to populate initial data
2. ✅ Start your backend: `cd backend && npm run dev`
3. ✅ Start your frontend: `npm run dev`
4. ✅ Test job recommendations on Aim page
5. ✅ Browse jobs on Jobs page (`/jobs`)

---

## 🎉 You're Ready!

Once you've updated the `.env` file with your Supabase credentials, run:

```powershell
cd job-scraper\backend
python scraper/scraper.py
```

Let me know if you run into any issues! 🚀
