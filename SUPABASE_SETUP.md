# Supabase Setup Guide for Arcade-Learn

This guide will help you set up Supabase for authentication and database management in the Arcade-Learn project.

## Prerequisites

1. A Supabase account (free tier available)
2. Node.js and npm installed
3. Git repository access

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `arcade-learn` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholders:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content of `supabase-schema.sql`
3. Paste it into a new query in the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `profiles` table for user information
- `user_progress` table for gamification data
- `user_achievements` table for unlocked achievements
- `subscriptions` table for future monetization
- Row Level Security (RLS) policies
- Necessary triggers and functions

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure **Site URL**:
   - For development: `http://localhost:5173`
   - For production: Your deployed app URL

3. **Configure OAuth Providers** (optional):
   
   ### Google OAuth:
   - Go to **Authentication** → **Providers** → **Google**
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Client ID from Google Cloud Console
     - Client Secret from Google Cloud Console
   
   ### GitHub OAuth:
   - Go to **Authentication** → **Providers** → **GitHub**
   - Enable GitHub provider
   - Add your GitHub OAuth App credentials:
     - Client ID from GitHub
     - Client Secret from GitHub

4. **Email Settings**:
   - Configure email templates if needed
   - Set up custom SMTP if required (optional for development)

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Try to sign up with a new account
4. Check your Supabase dashboard:
   - **Authentication** → **Users** should show your new user
   - **Table Editor** → **profiles** should have your user profile
   - **Table Editor** → **user_progress** should have initial progress data

## Step 7: Production Deployment

For production deployment:

1. **Update Environment Variables**:
   - Set production Supabase URL and keys
   - Configure proper Site URL in Supabase settings

2. **Configure CORS** (if needed):
   - Add your production domain to allowed origins

3. **Set up Email Authentication**:
   - Configure custom SMTP for production emails
   - Update email templates with your branding

## Database Structure Overview

### Tables Created:

1. **profiles**: User profile information
   - Links to Supabase auth.users
   - Stores first_name, last_name, phone, avatar_url

2. **user_progress**: Gamification data
   - XP, level, streaks
   - Completed components and roadmaps
   - Automatically created for each new user

3. **user_achievements**: Unlocked achievements
   - Achievement ID and unlock timestamp
   - Linked to user profiles

4. **subscriptions**: Subscription management
   - Plan type, status, billing periods
   - Stripe integration ready

### Security Features:

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic triggers for updated_at timestamps
- Automatic user progress initialization

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check that your environment variables are correct
2. **CORS errors**: Ensure Site URL is configured in Supabase
3. **RLS policy errors**: Verify the SQL schema was executed completely
4. **OAuth not working**: Check provider configuration and redirect URLs

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded: `console.log(import.meta.env.VITE_SUPABASE_URL)`
3. Check Supabase logs in dashboard
4. Test database connection in Supabase SQL Editor

## Next Steps

With Supabase configured, you can:

1. **Implement real-time features**: Use Supabase realtime for live leaderboards
2. **Add subscription management**: Integrate Stripe for paid features
3. **Enhanced user profiles**: Add avatars, bio, social links
4. **Analytics**: Track user engagement and progress
5. **Admin dashboard**: Monitor users and system health

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Project repository issues for implementation-specific questions
