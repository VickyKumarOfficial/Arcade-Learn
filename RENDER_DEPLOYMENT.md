# 🚀 Deploying to Render (Full Stack)

This guide shows how to deploy the entire application (frontend + backend) to Render.

## ✅ Benefits of Render-Only Deployment

- ✨ **Single deployment** - No need to manage Vercel + Render separately
- 🎯 **No CORS issues** - Frontend and backend on same domain
- 🔧 **Simpler configuration** - Environment variables in one place
- 📦 **One build process** - Vite build + Node.js server together

## 📋 Prerequisites

1. Render account (free tier works!)
2. GitHub repository connected

## 🛠️ Deployment Steps

### 1. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `VickyKumarOfficial/Arcade-Learn`

### 2. Configure Build Settings

**Basic Settings:**
- **Name**: `arcade-learn` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty)

**Build & Deploy:**
- **Build Command**: 
  ```bash
  npm install && npm run build && cd backend && npm install
  ```
- **Start Command**:
  ```bash
  cd backend && node server.js
  ```

### 3. Add Environment Variables

Add these in the **Environment** tab:

```
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

### 4. Deploy!

Click **"Create Web Service"** and Render will:
1. Build the Vite frontend → creates `/dist` folder
2. Install backend dependencies
3. Start the Node.js server
4. Server serves both API routes AND static frontend files

### 5. Access Your App

Your app will be available at:
```
https://arcade-learn.onrender.com
```

- Frontend: `https://arcade-learn.onrender.com/`
- API: `https://arcade-learn.onrender.com/api/...`
- Health: `https://arcade-learn.onrender.com/health`

## 🏗️ How It Works

```
Render Web Service
├── Vite Build (Frontend)
│   └── dist/
│       ├── index.html
│       ├── assets/
│       └── ...
└── Node.js Server (Backend)
    ├── API Routes (/api/*)
    ├── Health Check (/health)
    └── Static File Server (serves dist/)
```

**Request Flow:**
1. User visits `https://arcade-learn.onrender.com`
2. Server checks if request is for `/api/*` → handles with Express routes
3. Otherwise → serves static files from `/dist` folder
4. Client-side routing handled by React Router

## 🔄 Auto-Deploy

Every push to `main` branch triggers:
1. Automatic rebuild on Render
2. ~2-3 minute deployment
3. Zero-downtime rollout

## 🧹 Cleanup (Optional)

Since everything is now on Render, you can:
1. Delete the Vercel project
2. Remove `.vercelignore` and `vercel.json` (not needed anymore)

## 🐛 Troubleshooting

**Build fails?**
- Check build logs on Render dashboard
- Ensure all dependencies are in `package.json`

**API returns 404?**
- Check that routes are properly defined in `backend/server.js`
- Verify environment variables are set

**Frontend not loading?**
- Check that `dist` folder was created in build
- Verify static file middleware is before API routes in `server.js`

## 📝 Local Development

```bash
# Terminal 1: Start Vite dev server (frontend)
npm run dev

# Terminal 2: Start backend
cd backend
node server.js
```

Frontend: `http://localhost:8080`
Backend: `http://localhost:8081`

In production, both are served from the same Render URL!
