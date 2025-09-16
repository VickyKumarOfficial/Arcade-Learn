-- ArcadeLearn Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create user_game_data table for gamification
CREATE TABLE IF NOT EXISTS public.user_game_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date TIMESTAMPTZ DEFAULT NOW(),
  total_components_completed INTEGER DEFAULT 0,
  completed_components TEXT[] DEFAULT '{}',
  completed_roadmaps TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_survey table for onboarding survey responses
CREATE TABLE IF NOT EXISTS public.user_survey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  user_type TEXT CHECK (user_type IN ('Student', 'Teacher', 'Working Professional', 'Other')),
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  tech_interest TEXT CHECK (tech_interest IN ('Web Development', 'Data Science', 'Mobile Apps', 'DevOps', 'AI/ML', 'Not sure yet')),
  goal TEXT CHECK (goal IN ('Get a job', 'Switch careers', 'Upskill for current job', 'Build a project/startup', 'Just exploring')),
  time_commitment TEXT CHECK (time_commitment IN ('<5 hours', '5–10 hours', '10+ hours')),
  learning_style TEXT CHECK (learning_style IN ('Videos', 'Reading', 'Projects', 'Group learning')),
  wants_recommendations TEXT CHECK (wants_recommendations IN ('Yes', 'No')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  roadmap_title TEXT NOT NULL,
  certificate_url TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create detailed progress tracking table
CREATE TABLE IF NOT EXISTS public.user_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  component_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, roadmap_id, component_id)
);

-- Create learning events table for analytics
CREATE TABLE IF NOT EXISTS public.learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_game_data_user_id ON public.user_game_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_game_data_total_xp ON public.user_game_data(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_user_roadmap_progress_user_id ON public.user_roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roadmap_progress_roadmap_id ON public.user_roadmap_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON public.learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_timestamp ON public.learning_events(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_survey ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User game data policies
CREATE POLICY "Users can view own game data" ON public.user_game_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game data" ON public.user_game_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game data" ON public.user_game_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read for leaderboard (top users only)
CREATE POLICY "Public can view leaderboard" ON public.user_game_data
  FOR SELECT USING (true);

-- User survey policies
CREATE POLICY "Users can view own survey" ON public.user_survey
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own survey" ON public.user_survey
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own survey" ON public.user_survey
  FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" ON public.certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can verify certificates
CREATE POLICY "Public can verify certificates" ON public.certificates
  FOR SELECT USING (verification_code IS NOT NULL);

-- User roadmap progress policies
CREATE POLICY "Users can view own progress" ON public.user_roadmap_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_roadmap_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_roadmap_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning events policies
CREATE POLICY "Users can view own events" ON public.learning_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.learning_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_game_data
  BEFORE UPDATE ON public.user_game_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_roadmap_progress
  BEFORE UPDATE ON public.user_roadmap_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create view for leaderboard (optimized query)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  ugd.user_id,
  ugd.total_xp,
  ugd.level,
  ugd.current_streak,
  p.first_name,
  p.last_name,
  p.avatar_url,
  ROW_NUMBER() OVER (ORDER BY ugd.total_xp DESC) as rank
FROM public.user_game_data ugd
JOIN public.profiles p ON ugd.user_id = p.id
WHERE ugd.total_xp > 0
ORDER BY ugd.total_xp DESC;

-- Create view for user analytics
CREATE OR REPLACE VIEW public.user_analytics_view AS
SELECT 
  p.id as user_id,
  p.first_name,
  p.last_name,
  p.created_at as registration_date,
  ugd.total_xp,
  ugd.level,
  ugd.current_streak,
  ugd.longest_streak,
  ugd.total_components_completed,
  ARRAY_LENGTH(ugd.completed_roadmaps, 1) as completed_roadmaps_count,
  s.plan_type,
  s.status as subscription_status,
  COUNT(c.id) as certificates_earned
FROM public.profiles p
LEFT JOIN public.user_game_data ugd ON p.id = ugd.user_id
LEFT JOIN public.subscriptions s ON p.id = s.user_id
LEFT JOIN public.certificates c ON p.id = c.user_id
GROUP BY p.id, p.first_name, p.last_name, p.created_at, ugd.total_xp, ugd.level, 
         ugd.current_streak, ugd.longest_streak, ugd.total_components_completed, 
         ugd.completed_roadmaps, s.plan_type, s.status;

-- Insert initial data or default achievements (optional)
-- This would be handled by the application layer

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.leaderboard_view TO anon, authenticated;
GRANT SELECT ON public.user_analytics_view TO authenticated;

-- Success message
SELECT 'ArcadeLearn database schema created successfully!' as status;
