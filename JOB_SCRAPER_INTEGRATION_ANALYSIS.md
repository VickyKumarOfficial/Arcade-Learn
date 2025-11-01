# Job Scraper Integration - Comprehensive Analysis Report
**Date:** November 1, 2025  
**Project:** Arcade-Learn Job Integration  
**External Repo:** [darshgandhi/job-scraper](https://github.com/darshgandhi/job-scraper)

---

## Executive Summary

✅ **Integration Feasibility:** **HIGH** — The external job-scraper is fully compatible with our existing Supabase infrastructure.

**Key Finding:** No local scraper exists in `backend/Scraper/` — we need to either adopt the external scraper or build our own. The external scraper is production-ready with proven scraping logic for multiple job sites.

---

## 1. Current State Analysis

### 1.1 Local Project (Arcade-Learn)
- **Backend:** Node.js/Express (`backend/server.js`)
- **Database:** Supabase (PostgreSQL)
- **Schema:** `backend/database/schema.sql` — **NO `jobs` table exists**
- **Local Scraper:** ❌ None found (searched `backend/` — no Python scraper exists)
- **Frontend:** React + TypeScript, using `src/lib/supabase.ts`

### 1.2 External Repo (job-scraper)
**Architecture:**
```
Python Playwright Scrapers → Supabase (jobs table) → React Frontend
```

**Backend (Python):**
- File: `backend/scraper/scraper.py` (254 lines)
- Dependencies: `playwright`, `supabase-py`, `pandas`, `python-dotenv`
- Config files:
  - `backend/data/hosts.txt` — list of job sites to scrape (lines starting with `*` are ignored)
  - `backend/data/selectors.json` — CSS/XPath selectors per site
- Output: Local Excel (`./output/output.xlsx`) + Supabase upsert

**Database Schema (Inferred):**
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  company_name TEXT,
  location TEXT,
  department TEXT,
  type TEXT,  -- 'Full-Time', 'Part-Time', 'Internship', 'Contract'
  salary TEXT,
  description TEXT,
  url TEXT UNIQUE NOT NULL,  -- Used for upsert conflict resolution
  posted_at TIMESTAMPTZ,
  source TEXT,  -- Website URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Frontend (React + Vite):**
- Uses `@supabase/supabase-js` to fetch from `jobs` table
- Components:
  - `FilterSearch.jsx` — search + filters (location, type)
  - `Item.jsx` — Job card showing: title, company, location, department, type, salary, description, posted_at
  - `JobContext.jsx` — fetches all jobs via pagination (1000 records/chunk), client-side filtering
  - `Jobs.jsx` — Main jobs page (36 jobs/page)

---

## 2. Scraper Technical Deep Dive

### 2.1 Core Scraping Logic (`scraper.py`)

**Key Functions:**
1. **`async scrape_page(page, job_elements, site, site_details)`**  
   - Extracts job data using CSS/XPath selectors from `selectors.json`
   - Fields extracted: `title`, `company_name`, `location`, `department`, `type`, `salary`, `description`, `url`, `posted_at`, `source`
   - Supports two scrape modes:
     - `tab-page`: Opens new tab for each job, scrapes description, closes tab
     - `in-page`: Clicks job in same page, scrapes, navigates back
   - Regex logic for job type classification (Part-Time, Internship, Contract, Full-Time)

2. **`async scrape_site(site, browser)`**  
   - Creates new browser context (locale: en-US)
   - Navigates to job site, waits for selectors defined in `selectors.json`
   - Paginates through results (clicks "Next" if `pagination_xpath` exists)
   - Deduplicates by URL after each page scrape
   - **Row limit:** 500 jobs per site (configurable via `ROW_LIMIT` constant)

3. **`async main()`**  
   - Launches Chromium browser (`headless=False` by default — **must change to `True` for production**)
   - Runs scrapers concurrently using `asyncio.gather`
   - Writes results to Excel (`./output/output.xlsx`)
   - Queries Supabase for existing job URLs
   - Upserts new jobs: `supabase.table('jobs').upsert(job_records, on_conflict=['url']).execute()`

**Dependencies Required:**
```python
playwright>=1.40.0
supabase>=2.0.0
pandas>=2.0.0
python-dotenv>=1.0.0
```

**Environment Variables (`.env`):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key  # Use service role, NOT anon key
```

### 2.2 Cleanup Script (`removeOlder.py`)
- Deletes jobs older than 30 days
- Uses: `supabase.table('jobs').delete().lt('created_at', cutoff_date).execute()`
- **Note:** Hardcoded date in example (`datetime(2025, 6, 22)`) — should use `datetime.now()` in production

---

## 3. Database Schema Compatibility

### 3.1 Jobs Table Migration (SQL)

**Add this to Supabase SQL Editor:**
```sql
-- Create jobs table for scraped job listings
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  company_name TEXT,
  location TEXT,
  department TEXT,
  type TEXT CHECK (type IN ('Full-Time', 'Part-Time', 'Internship', 'Contract')),
  salary TEXT,
  description TEXT,
  url TEXT UNIQUE NOT NULL,
  posted_at TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);

-- Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access for job listings
CREATE POLICY "Public can view all jobs" ON public.jobs
  FOR SELECT USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role can manage jobs" ON public.jobs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.jobs IS 'Scraped job listings from multiple job boards';
```

### 3.2 Field Mapping (Scraper → DB → Frontend)

| Scraper Output | DB Column | Frontend Display | Component |
|---------------|-----------|------------------|-----------|
| `title` | `title` | Job title | `Item.jsx` — `CardTitle` |
| `company_name` | `company_name` | Company | `Item.jsx` — `CardDescription` |
| `location` | `location` | Location | `Item.jsx` — with `MapPin` icon |
| `department` | `department` | Department | `Item.jsx` — with `Users` icon |
| `type` | `type` | Job Type | `Item.jsx` — with `BriefcaseBusiness` icon; `FilterSearch.jsx` filter |
| `salary` | `salary` | Salary | `Item.jsx` — with `CircleDollarSign` icon |
| `description` | `description` | Description (truncated) | `Item.jsx` — line-clamp-3 |
| `url` | `url` | Apply link | `Item.jsx` — "Apply Now" button (external link) |
| `posted_at` | `posted_at` | Posted date | `Item.jsx` — with `Calendar` icon |
| `source` | `source` | Source site | (not shown in UI) |

✅ **All scraper fields map directly** — no transformation needed!

---

## 4. Frontend Integration Plan

### 4.1 Create New Jobs Page

**Option A:** Add to existing `src/pages/` (recommended)
```tsx
// src/pages/Jobs.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  department: string | null;
  type: string;
  salary: string | null;
  description: string | null;
  url: string;
  posted_at: string | null;
  source: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', type: '' });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || job.type === filters.type;
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div>Loading jobs...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.company_name}</p>
              <p className="text-sm text-gray-500 mb-4">{job.location}</p>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{job.type}</span>
                {job.department && <span className="px-2 py-1 bg-gray-100 rounded text-xs">{job.department}</span>}
              </div>
              {job.description && <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.description}</p>}
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Now →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4.2 Add Route
```tsx
// src/App.tsx (add route)
import Jobs from '@/pages/Jobs';

// In routes:
<Route path="/jobs" element={<Jobs />} />
```

### 4.3 Add Navigation Link
```tsx
// src/components/Navigation.tsx (add to dropdown or main nav)
<Link to="/jobs">Job Board</Link>
```

---

## 5. Deployment Architecture

### 5.1 Recommended Setup

```
┌─────────────────────────────────────────────────────┐
│  GitHub Actions (Scheduled Workflow)                │
│  Runs: Daily at 2 AM UTC                            │
│  ┌──────────────────────────────────────┐          │
│  │ 1. Checkout repo                      │          │
│  │ 2. Set up Python 3.11                 │          │
│  │ 3. Install deps + Playwright          │          │
│  │ 4. Run scraper.py (headless=True)     │          │
│  │ 5. Upload output.xlsx as artifact     │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Supabase PostgreSQL (jobs table)                   │
│  - Service role key used by scraper                 │
│  - Anon key used by frontend                        │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  Arcade-Learn Frontend (Vercel)                     │
│  - Fetches jobs via Supabase client                 │
│  - Public read-only access (RLS policy)             │
└─────────────────────────────────────────────────────┘
```

### 5.2 GitHub Actions Workflow

Create `.github/workflows/scrape-jobs.yml`:
```yaml
name: Scrape Jobs

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install playwright supabase pandas python-dotenv
          playwright install chromium
          playwright install-deps
      
      - name: Run scraper
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          cd backend/scraper
          python scraper.py
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: job-scrape-results
          path: backend/scraper/output/output.xlsx
```

**GitHub Secrets to add:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key (NOT anon key)

### 5.3 Alternative: Docker Container

Create `backend/scraper/Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/playwright/python:v1.40.0-focal

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "scraper.py"]
```

Create `backend/scraper/requirements.txt`:
```
playwright>=1.40.0
supabase>=2.0.0
pandas>=2.0.0
python-dotenv>=1.0.0
```

**Run locally:**
```powershell
cd backend/scraper
docker build -t job-scraper .
docker run --env-file .env job-scraper
```

---

## 6. Production Checklist

### 6.1 Code Changes Required

**In `scraper.py` line 208:**
```python
# CHANGE THIS:
browser = await p.chromium.launch(headless=False)

# TO THIS:
browser = await p.chromium.launch(headless=True)
```

**In `removeOlder.py` line 10:**
```python
# CHANGE THIS:
current_date = datetime(2025, 6, 22)

# TO THIS:
current_date = datetime.now()
```

### 6.2 Supabase Setup

1. ✅ Run SQL migration (from section 3.1)
2. ✅ Get Service Role Key:
   - Go to Supabase Dashboard → Settings → API
   - Copy `service_role` key (NOT `anon` key)
   - Store securely in GitHub Secrets or `.env`
3. ✅ Verify RLS policies allow:
   - Public SELECT on `jobs` table
   - Service role can INSERT/UPDATE/DELETE

### 6.3 Sites to Scrape

**Review `backend/data/hosts.txt`:**
- Ensure all sites are legal to scrape (check `robots.txt` and ToS)
- Add your own job sites if needed
- Example format:
  ```
  https://example-jobs.com/careers
  https://anothersite.com/jobs
  * https://blocked-site.com  # Lines starting with * are ignored
  ```

**Review `backend/data/selectors.json`:**
- CSS/XPath selectors are site-specific
- May break if sites update their HTML structure
- Test regularly and update selectors as needed

### 6.4 Legal & Ethical Considerations

⚠️ **Important:**
- Verify each site's Terms of Service allows scraping
- Respect `robots.txt`
- Add delays between requests (avoid overloading servers)
- Consider using official job board APIs instead (e.g., Indeed API, LinkedIn API)
- Attribute job sources properly (`source` field)
- Comply with GDPR/CCPA if scraping sites with user data

---

## 7. Testing Plan

### 7.1 Local Testing

**Step 1: Set up Python environment**
```powershell
cd backend/scraper
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install playwright supabase pandas python-dotenv
playwright install chromium
```

**Step 2: Create `.env` file**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

**Step 3: Test scraper (dry run)**
```powershell
# Edit hosts.txt to test one site only:
echo "https://jobs.example.com" > backend/data/hosts.txt

# Run scraper:
python scraper.py
```

**Step 4: Verify results**
- Check `./output/output.xlsx` — should contain scraped jobs
- Check Supabase jobs table — should have new rows
- Query: `SELECT * FROM jobs ORDER BY created_at DESC LIMIT 10;`

### 7.2 Frontend Testing

**Step 1: Add jobs table and sample data**
```sql
-- Insert test job
INSERT INTO public.jobs (title, company_name, location, type, url, source) VALUES
('Senior Software Engineer', 'Tech Corp', 'Remote', 'Full-Time', 'https://example.com/job1', 'https://example.com');
```

**Step 2: Test frontend page**
- Navigate to `/jobs`
- Verify job cards display correctly
- Test search/filter functionality
- Click "Apply Now" — should open external link in new tab

---

## 8. Cost Analysis

### 8.1 GitHub Actions (Free Tier)
- ✅ 2,000 minutes/month free for public repos
- Estimated scraper runtime: ~5-15 minutes/run
- Daily runs: ~30 runs/month = ~150-450 minutes/month
- **Cost: FREE** (well within limit)

### 8.2 Supabase (Free Tier)
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- Estimated jobs table size: ~100 KB/1000 jobs = ~10 MB for 100K jobs
- **Cost: FREE** (well within limit)

### 8.3 Playwright
- No cost (open-source library)
- Chromium browser runs in CI environment (free)

### 8.4 Total Monthly Cost: **$0**

---

## 9. Troubleshooting Guide

### Issue: Scraper fails with "Timeout waiting for selector"
**Solution:**
- Check if job site HTML structure changed
- Update selectors in `selectors.json`
- Increase timeout: `page.wait_for_selector(..., timeout=30000)`

### Issue: Duplicate jobs in database
**Solution:**
- Scraper uses `url` as unique key
- Duplicates should not occur due to `UNIQUE` constraint
- If duplicates exist with different URLs, consider deduplication by `title + company_name`

### Issue: Frontend shows old jobs
**Solution:**
- Run `removeOlder.py` to clean up stale jobs:
  ```powershell
  python removeOlder.py
  ```
- Or add to GitHub Actions workflow after scraper runs

### Issue: Rate-limited by job sites
**Solution:**
- Add delays between requests:
  ```python
  await asyncio.sleep(2)  # 2 second delay
  ```
- Scrape during off-peak hours
- Use proxies/VPNs if necessary (check legal implications)

---

## 10. Recommended Next Steps

### Phase 1: Database Setup (15 minutes)
1. ✅ Run SQL migration in Supabase (section 3.1)
2. ✅ Insert 1-2 test jobs manually
3. ✅ Verify RLS policies work (test SELECT with anon key)

### Phase 2: Frontend Integration (1-2 hours)
1. ✅ Create `src/pages/Jobs.tsx` (use code from section 4.1)
2. ✅ Add `/jobs` route to `src/App.tsx`
3. ✅ Add navigation link
4. ✅ Test with sample data

### Phase 3: Scraper Setup (2-3 hours)
1. ✅ Copy external repo files to `backend/scraper/`:
   - `scraper.py`
   - `removeOlder.py`
   - `data/hosts.txt`
   - `data/selectors.json`
2. ✅ Fix production issues (headless=True, datetime.now())
3. ✅ Test locally with `.env` file
4. ✅ Verify jobs appear in Supabase

### Phase 4: CI/CD Deployment (1 hour)
1. ✅ Create `.github/workflows/scrape-jobs.yml`
2. ✅ Add GitHub Secrets (SUPABASE_URL, SUPABASE_SERVICE_KEY)
3. ✅ Test manual workflow dispatch
4. ✅ Enable scheduled runs

### Phase 5: Production Monitoring (ongoing)
1. ✅ Set up Supabase email alerts for scraper errors
2. ✅ Monitor GitHub Actions logs
3. ✅ Review scraped data quality weekly
4. ✅ Update selectors as sites change

---

## 11. Security Considerations

### 11.1 API Keys
- ❌ **Never commit** `.env` files or API keys to Git
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use different keys for dev/prod environments
- ✅ Rotate keys quarterly

### 11.2 Supabase RLS
- ✅ **Frontend (anon key):** Read-only access to jobs table
- ✅ **Scraper (service role key):** Full access to jobs table
- ❌ Never expose service role key in frontend code

### 11.3 Job URLs
- ✅ Validate URLs before storing (prevent XSS)
- ✅ Use `rel="noopener noreferrer"` on external links
- ✅ Consider URL sanitization if accepting user-submitted jobs

---

## 12. Conclusion

**Verdict:** ✅ **READY TO INTEGRATE**

**Strengths:**
- ✅ Zero code conflicts (no local scraper exists)
- ✅ Proven scraping logic from external repo
- ✅ Direct Supabase compatibility
- ✅ Complete frontend reference implementation available
- ✅ Zero-cost deployment using GitHub Actions
- ✅ All required fields map perfectly

**Risks:**
- ⚠️ Scrapers may break if job sites change HTML structure (requires maintenance)
- ⚠️ Legal compliance depends on sites scraped (verify ToS)
- ⚠️ No built-in anti-bot detection evasion (may need proxies for some sites)

**Estimated Total Effort:**
- Database setup: 15 minutes
- Frontend integration: 1-2 hours
- Scraper setup & testing: 2-3 hours
- CI/CD deployment: 1 hour
- **Total: 4-6 hours** (1 working day)

**Recommendation:**
Proceed with integration — use external scraper as-is with minor production fixes (headless mode, datetime). Focus effort on:
1. Legal compliance review of target job sites
2. Robust error handling and monitoring
3. Regular selector maintenance

---

**Questions or need help with implementation? Let me know!** 🚀
