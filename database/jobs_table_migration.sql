-- =====================================================
-- Jobs Table Migration for ArcadeLearn
-- Purpose: Store scraped job listings for job board and AI recommendations
-- Based on: darshgandhi/job-scraper external repository
-- Migration Date: November 1, 2025
-- =====================================================

-- 1. Create jobs table for scraped job listings
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

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs(posted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON public.jobs(company_name);

-- Full-text search index for job matching
CREATE INDEX IF NOT EXISTS idx_jobs_search ON public.jobs USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(company_name, ''))
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow public read access for job listings (anyone can view jobs)
CREATE POLICY "Public can view all jobs" ON public.jobs
  FOR SELECT USING (true);

-- Only service role can insert/update/delete (scraper uses service role key)
CREATE POLICY "Service role can manage jobs" ON public.jobs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 5. Create or use existing updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_jobs ON public.jobs;
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Add table comment
COMMENT ON TABLE public.jobs IS 'Scraped job listings from multiple job boards for AI-powered job recommendations';

-- 8. Add column comments for documentation
COMMENT ON COLUMN public.jobs.id IS 'Unique identifier for each job listing';
COMMENT ON COLUMN public.jobs.title IS 'Job title/position name';
COMMENT ON COLUMN public.jobs.company_name IS 'Name of the hiring company';
COMMENT ON COLUMN public.jobs.location IS 'Job location (city, state, or remote)';
COMMENT ON COLUMN public.jobs.department IS 'Department or team name';
COMMENT ON COLUMN public.jobs.type IS 'Employment type: Full-Time, Part-Time, Internship, or Contract';
COMMENT ON COLUMN public.jobs.salary IS 'Salary range or compensation details';
COMMENT ON COLUMN public.jobs.description IS 'Full job description and requirements';
COMMENT ON COLUMN public.jobs.url IS 'Direct URL to the job posting (unique identifier for deduplication)';
COMMENT ON COLUMN public.jobs.posted_at IS 'Date when the job was originally posted';
COMMENT ON COLUMN public.jobs.source IS 'Source website URL where the job was scraped from';
COMMENT ON COLUMN public.jobs.created_at IS 'Timestamp when the job was added to our database';
COMMENT ON COLUMN public.jobs.updated_at IS 'Timestamp when the job was last updated';

-- =====================================================
-- Verification Queries (Run after migration)
-- =====================================================

-- Check if table was created successfully
-- SELECT table_name, table_type FROM information_schema.tables WHERE table_name = 'jobs';

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'jobs';

-- Check RLS policies
-- SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'jobs';

-- Test insert (will fail if you're using anon key - expected behavior)
-- INSERT INTO public.jobs (title, company_name, location, type, url, source) 
-- VALUES ('Test Job', 'Test Company', 'Remote', 'Full-Time', 'https://example.com/job/test-' || gen_random_uuid(), 'https://example.com');

-- =====================================================
-- Migration Complete! ✅
-- Next Steps:
-- 1. Set up Python scraper with Supabase service role key
-- 2. Create frontend Jobs page (src/pages/Jobs.tsx)
-- 3. Build job recommendation engine (backend/services/jobRecommendationService.js)
-- =====================================================
