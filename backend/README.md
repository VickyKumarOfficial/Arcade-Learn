# ArcadeLearn Backend API

This is the backend API server for the ArcadeLearn platform, providing user progress tracking, subscription management, certificate generation, and analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project set up
- PostgreSQL database (via Supabase)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3001/health
   ```

## 📋 Environment Setup

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Optional Environment Variables

```bash
# Stripe for payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email service
EMAIL_SERVICE_API_KEY=your_email_service_api_key

# AWS S3 for file storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=arcadelearn-certificates
```

## 🗄️ Database Schema

The backend uses the following Supabase tables:

### Core Tables

```sql
-- User profiles
profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- User game data (XP, levels, streaks)
user_game_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_active_date timestamptz DEFAULT now(),
  total_components_completed integer DEFAULT 0,
  completed_components text[] DEFAULT '{}',
  completed_roadmaps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- User achievements
user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
)

-- Subscriptions
subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)

-- Certificates
certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  roadmap_id text NOT NULL,
  roadmap_title text NOT NULL,
  certificate_url text,
  verification_code text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now()
)

-- Detailed progress tracking
user_roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  roadmap_id text NOT NULL,
  component_id text NOT NULL,
  completed_at timestamptz,
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, roadmap_id, component_id)
)
```

## 🔌 API Endpoints

### User Progress
- `GET /api/user/:userId/progress` - Get user progress
- `POST /api/user/:userId/progress` - Save user progress
- `POST /api/user/:userId/sync` - Sync user progress across devices

### Leaderboard
- `GET /api/leaderboard?limit=100` - Get leaderboard

### Subscriptions
- `GET /api/user/:userId/subscription` - Get user subscription
- `POST /api/user/:userId/subscription` - Update subscription
- `GET /api/user/:userId/access/:feature` - Check feature access

### Certificates
- `POST /api/user/:userId/certificate` - Generate certificate
- `GET /api/user/:userId/certificates` - Get user certificates
- `GET /api/certificate/verify/:verificationCode` - Verify certificate

### Analytics (Admin)
- `GET /api/admin/analytics/platform` - Platform analytics
- `GET /api/admin/analytics/learning` - Learning analytics
- `GET /api/admin/analytics/engagement` - User engagement
- `GET /api/admin/analytics/subscriptions` - Subscription analytics
- `GET /api/admin/analytics/certificates` - Certificate analytics

## 🔧 Services

### UserProgressService
Handles all user progress operations including XP, levels, streaks, and component completion tracking.

### SubscriptionService
Manages user subscriptions, premium access checks, and billing integration.

### CertificateService
Generates and manages digital certificates for completed roadmaps.

### AnalyticsService
Provides comprehensive analytics for platform usage, learning patterns, and user engagement.

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment-specific configs
- Development: Uses local environment variables
- Production: Uses environment variables from hosting platform

## 🔐 Security

- **CORS**: Configured for frontend domain
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: All inputs are validated
- **Error Handling**: Comprehensive error handling
- **Environment Variables**: Sensitive data stored securely

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Structured logging for debugging
- Error tracking and reporting
- Performance monitoring ready

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new functionality
3. Update documentation
4. Use proper error handling
5. Follow security best practices

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔄 Development Workflow

1. **Local Development**: Use `npm run dev` with local Supabase
2. **Testing**: Test endpoints with curl or Postman
3. **Staging**: Deploy to staging with staging database
4. **Production**: Deploy with production environment variables

## 📞 Support

For backend-related issues:
1. Check the health endpoint
2. Review server logs
3. Verify environment variables
4. Check database connectivity
5. Validate API requests
