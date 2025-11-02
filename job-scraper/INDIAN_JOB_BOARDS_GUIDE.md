# Adding Indian Job Boards to Job Scraper

## 🇮🇳 Indian Job Boards Configuration Guide

This guide shows you how to add popular Indian job boards to your scraper to get more relevant local opportunities.

---

## Step 1: Add Indian Job Board URLs to `hosts.txt`

File: `job-scraper/backend/data/hosts.txt`

### Recommended Indian Job Boards:

```plaintext
# ========================================
# INDIAN JOB BOARDS
# ========================================

# 1. Internshala (Best for students/freshers/internships)
https://internshala.com/jobs/

# 2. Naukri.com (India's largest job portal)
https://www.naukri.com/web-developer-jobs

# 3. Indeed India (Global with India focus)
https://in.indeed.com/jobs?q=web+developer&l=India

# 4. Freshersworld (Entry-level focused)
https://www.freshersworld.com/jobs

# 5. Instahyre (Tech jobs for experienced professionals)
https://www.instahyre.com/search-jobs/

# 6. AngelList India (Startup jobs)
https://wellfound.com/jobs?locations=India

# 7. LinkedIn India
https://www.linkedin.com/jobs/search/?location=India&keywords=web%20developer

# ========================================
# EXISTING GLOBAL JOB BOARDS
# ========================================
https://www.riotgames.com/en/work-with-us
https://careers.roblox.com/jobs
https://www.jobbank.gc.ca/jobsearch/
https://www.usajobs.gov/search/results/?l=&rmi=false&p=1
https://www.google.com/about/careers/applications/jobs/results/?location=United%20States
```

---

## Step 2: Add Selectors for Indian Job Boards

File: `job-scraper/backend/data/selectors.json`

### Example Configuration for Internshala:

```json
{
  "https://internshala.com/jobs/": {
    "company_name": "Various (Internshala)",
    "wait_for": ".individual_internship",
    "job_elements": ".individual_internship",
    "title_xpath": ".//h3[@class='job-internship-name']/a",
    "company_xpath": ".//a[@class='link_display_like_text']",
    "location_xpath": ".//div[@id='location_names']",
    "type_xpath": ".//div[@class='status-text']",
    "salary_xpath": ".//span[@class='stipend']",
    "url_xpath": ".//h3[@class='job-internship-name']/a",
    "description_xpath": "//div[@class='internship_details']",
    "raw_url": "https://internshala.com",
    "scrape_type": "tab-page"
  }
}
```

### Example Configuration for Naukri.com:

```json
{
  "https://www.naukri.com/web-developer-jobs": {
    "company_name": "Various (Naukri.com)",
    "wait_for": ".list",
    "job_elements": "article.jobTuple",
    "title_xpath": ".//a[@class='title fw500 ellipsis']",
    "company_xpath": ".//a[@class='subTitle ellipsis fleft']",
    "location_xpath": ".//li[@class='fleft grey-text br2 placeHolderLi location']",
    "salary_xpath": ".//li[@class='fleft grey-text br2 placeHolderLi salary']",
    "date_xpath": ".//span[@class='fleft grey-text']",
    "url_xpath": ".//a[@class='title fw500 ellipsis']",
    "description_xpath": "//div[@class='job-description']",
    "raw_url": "https://www.naukri.com",
    "scrape_type": "tab-page"
  }
}
```

### Example Configuration for Indeed India:

```json
{
  "https://in.indeed.com/jobs?q=web+developer&l=India": {
    "company_name": "Various (Indeed India)",
    "wait_for": "#mosaic-provider-jobcards",
    "job_elements": ".job_seen_beacon",
    "title_xpath": ".//h2[@class='jobTitle']//span",
    "company_xpath": ".//span[@data-testid='company-name']",
    "location_xpath": ".//div[@data-testid='text-location']",
    "salary_xpath": ".//div[@class='salary-snippet-container']",
    "date_xpath": ".//span[@class='date']",
    "url_xpath": ".//h2[@class='jobTitle']/a",
    "description_xpath": "//div[@id='jobDescriptionText']",
    "raw_url": "https://in.indeed.com",
    "scrape_type": "tab-page"
  }
}
```

---

## Step 3: Quick Start (Easiest Option)

### ✅ Start with Internshala (Best for Entry-Level)

**Why Internshala?**
- 🎓 Perfect for students and fresh graduates
- 💼 Mix of internships and full-time entry-level jobs
- 🇮🇳 India-focused with remote opportunities
- 📝 Clear job descriptions with skill requirements
- 🚀 Easy to scrape (consistent HTML structure)

### Add to `hosts.txt`:
```plaintext
https://internshala.com/jobs/web-development-job/
https://internshala.com/jobs/javascript-job/
https://internshala.com/jobs/frontend-development-job/
https://internshala.com/jobs/wordpress-job/
```

---

## Step 4: Testing the Scraper

### Before scraping, you need to:

1. **Install Python dependencies** (if not already):
   ```powershell
   cd job-scraper/backend
   pip install -r requirements.txt
   playwright install
   ```

2. **Configure Supabase credentials** in `.env`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key
   ```

3. **Test single website first**:
   - Comment out all websites in `hosts.txt` except one
   - Run: `python scraper/scraper.py`

4. **Monitor for errors**:
   - Website structure changes frequently
   - Selectors might need adjustment
   - Some sites have anti-scraping measures

---

## ⚠️ Important Notes:

### 1. **Website Structure Changes**
Job board websites frequently update their HTML structure, so selectors may break. You'll need to:
- Inspect the website HTML using browser DevTools
- Update XPath/CSS selectors accordingly

### 2. **Anti-Scraping Protection**
Some sites (especially Naukri, LinkedIn) have:
- Rate limiting
- CAPTCHA challenges
- IP blocking
- Login requirements

**Solutions:**
- Use delays between requests
- Rotate user agents
- Consider using their official APIs instead
- Use Playwright's stealth mode

### 3. **Legal Considerations**
- Check each website's `robots.txt` and Terms of Service
- Some sites prohibit automated scraping
- Use data responsibly and ethically

### 4. **Selector Discovery**
To find the right selectors:
1. Open the job board in Chrome/Firefox
2. Right-click → Inspect Element
3. Find the job listing container
4. Copy XPath or CSS selector
5. Test in browser console: `document.querySelector('YOUR_SELECTOR')`

---

## 🚀 Quick Command Reference:

```powershell
# Navigate to scraper directory
cd job-scraper/backend

# Install dependencies
pip install -r requirements.txt
playwright install

# Run scraper
python scraper/scraper.py

# Check scraped jobs in database
cd ../../backend
node check-jobs.js
```

---

## 📊 Expected Results:

After adding Indian job boards, you should see:
- ✅ More entry-level positions
- ✅ India-based locations (Bangalore, Mumbai, Pune, etc.)
- ✅ Remote opportunities in India
- ✅ Fresher-friendly job descriptions
- ✅ Internship opportunities
- ✅ Better skill matching (HTML, CSS, JavaScript, WordPress)

---

## 🔍 Recommended Workflow:

1. **Start Small**: Add only Internshala first
2. **Test Thoroughly**: Run scraper and verify data quality
3. **Add More**: Once working, add Indeed India, Naukri
4. **Monitor**: Check for duplicate jobs (same URL)
5. **Refine**: Adjust selectors as needed

---

## 💡 Alternative: Use Job Board APIs

Instead of scraping, consider using official APIs (more reliable):

- **Adzuna API**: https://developer.adzuna.com/
- **Reed API**: https://www.reed.co.uk/developers
- **RemoteOK API**: https://remoteok.com/api
- **GitHub Jobs API**: (deprecated, but alternatives exist)

APIs are:
- ✅ More reliable (no selector breakage)
- ✅ Faster (structured JSON data)
- ✅ Legal (approved by the platform)
- ❌ May have rate limits
- ❌ May require paid plans for high volume

---

## 🎯 Your Current Situation:

**Resume Skills**: HTML, CSS, JavaScript, WordPress, SEO, Content Writing  
**Experience**: Entry Level (0 years)  
**Location**: India  

**Best Job Boards for You:**
1. 🥇 **Internshala** - Best match for your profile
2. 🥈 **Freshersworld** - Entry-level focused
3. 🥉 **Indeed India** - Large volume, good filters

---

Need help with specific selectors? Let me know which job board you want to add first!
