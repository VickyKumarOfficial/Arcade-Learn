# ArcadeLearn Backend Setup Guide

## Overview

This guide explains how to set up the backend infrastructure for ArcadeLearn using Supabase as the database and authentication provider.

## Architecture

```
Frontend (React + Vite)  →  Supabase (Database + Auth)  ←  Backend (Express.js API)
```

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **npm**: Comes with Node.js

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `arcade-learn`
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**
   - **Project API Keys**:
     - `anon public` (for frontend)
     - `service_role` (for backend)

### Step 3: Set Up Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query and run this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_game_data table
CREATE TABLE public.user_game_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    total_components_completed INTEGER DEFAULT 0,
    completed_roadmaps TEXT[] DEFAULT '{}',
    completed_components TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Row Level Security Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own game data" ON user_game_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own game data" ON user_game_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game data" ON user_game_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone'
    );
    
    INSERT INTO public.user_game_data (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function every time a user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Configure Authentication

1. Go to **Authentication** → **Settings** in Supabase
2. Configure **Site URL**: `http://localhost:8082` (or your frontend URL)
3. Add **Redirect URLs**:
   - `http://localhost:8082`
   - `http://localhost:8082/dashboard`
4. Enable desired **Auth Providers**:
   - **Email**: Already enabled
   - **Google**: Configure OAuth if needed
   - **GitHub**: Configure OAuth if needed

### Step 5: Environment Variables

#### Frontend (.env.local)
```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Backend (.env)
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
```

### Step 6: Install Dependencies

#### Frontend
```bash
npm install @supabase/supabase-js
```

#### Backend
```bash
cd backend
npm install
```

### Step 7: Start Development Servers

#### Terminal 1 - Frontend
```bash
npm run dev
```

#### Terminal 2 - Backend
```bash
cd backend
npm run dev
```

## Features Implemented

### Authentication
- ✅ Email/Password signup and login
- ✅ OAuth with Google and GitHub (configured)
- ✅ Protected routes (Dashboard requires login)
- ✅ User profile management

### User Data Management
- ✅ Automatic user profile creation on signup
- ✅ Game data initialization (XP, level, streaks)
- ✅ Achievement tracking
- ✅ Progress persistence

### Security
- ✅ Row Level Security (RLS) policies
- ✅ User can only access their own data
- ✅ Secure API endpoints

## User Experience Changes

### For Non-Authenticated Users
- ❌ **No Dashboard access** - Shows login prompt
- ❌ **No user stats** - Hidden in navigation
- ❌ **No XP/Level/Streak display** - Only visible after login
- ✅ **Browse roadmaps** - Still accessible
- ✅ **View careers** - Still accessible

### For Authenticated Users
- ✅ **Full Dashboard access** - Progress tracking, achievements
- ✅ **User stats in navigation** - XP, level, streak badges
- ✅ **Personal greeting** - "Welcome, [Name]" in navigation
- ✅ **Data persistence** - Progress saved across sessions
- ✅ **Real-time sync** - Data synced across devices

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/user/:userId/progress` | Get user game data |
| PUT | `/api/user/:userId/progress` | Update user game data |
| GET | `/api/user/:userId/achievements` | Get user achievements |
| POST | `/api/user/:userId/achievements` | Unlock new achievement |

## Testing the Setup

1. **Start both servers**
2. **Open** `http://localhost:8082`
3. **Test unauthenticated state**:
   - Visit `/dashboard` → Should show login prompt
   - Navigation should not show user stats
4. **Create account** or **sign in**
5. **Test authenticated state**:
   - Dashboard should load with user data
   - Navigation should show user stats
   - Progress should persist

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` and `backend/.env` files exist
   - Restart development servers after adding env vars

2. **CORS errors**
   - Check Supabase Site URL configuration
   - Verify frontend URL is allowed

3. **Authentication redirect issues**
   - Verify redirect URLs in Supabase settings
   - Check auth callback handling

4. **Database connection errors**
   - Verify Supabase credentials
   - Check if RLS policies are properly set

## Next Steps

With this setup complete, you can now:

1. **Add subscription management** using Stripe integration
2. **Implement real-time features** using Supabase real-time subscriptions
3. **Add email notifications** using Supabase Edge Functions
4. **Scale the infrastructure** as user base grows

## Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Authentication**: See [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- **Database**: Review [Supabase Database Guide](https://supabase.com/docs/guides/database)
