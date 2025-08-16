@echo off
REM ArcadeLearn Backend Startup Script for Windows

echo 🚀 Starting ArcadeLearn Backend Server...
echo ===========================================

REM Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: server.js not found. Make sure you're in the backend directory.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found.
    echo 📋 Please copy .env.example to .env and configure your environment variables.
    echo.
    echo Required variables:
    echo - SUPABASE_URL
    echo - SUPABASE_ANON_KEY
    echo - SUPABASE_SERVICE_ROLE_KEY
    echo.
    set /p response="Do you want to create a .env file now? (y/n): "
    if /i "%response%"=="y" (
        copy .env.example .env
        echo ✅ Created .env file. Please edit it with your actual values.
        echo 📝 Opening .env file for editing...
        notepad .env
    ) else (
        echo ❌ Cannot start server without .env file.
        pause
        exit /b 1
    )
)

echo.
echo 🔍 Environment Check:
node --version | findstr /C:"v" > temp.txt && set /p nodeversion= < temp.txt && echo - Node.js version: %nodeversion%
npm --version > temp.txt && set /p npmversion= < temp.txt && echo - npm version: %npmversion%
del temp.txt
if defined PORT (echo - Port: %PORT%) else (echo - Port: 3001)
echo.

echo 🚀 Starting development server...
if defined PORT (
    echo 📊 Health check will be available at: http://localhost:%PORT%/health
    echo 🔗 API endpoints will be available at: http://localhost:%PORT%/api
) else (
    echo 📊 Health check will be available at: http://localhost:3001/health
    echo 🔗 API endpoints will be available at: http://localhost:3001/api
)
echo.
echo Press Ctrl+C to stop the server
echo ===========================================

REM Start the server
npm run dev
