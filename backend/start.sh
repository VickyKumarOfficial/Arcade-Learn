#!/bin/bash

# ArcadeLearn Backend Startup Script

echo "🚀 Starting ArcadeLearn Backend Server..."
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Make sure you're in the backend directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found."
    echo "📋 Please copy .env.example to .env and configure your environment variables."
    echo ""
    echo "Required variables:"
    echo "- SUPABASE_URL"
    echo "- SUPABASE_ANON_KEY" 
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Do you want to create a .env file now? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your actual values."
        echo "📝 Opening .env file for editing..."
        ${EDITOR:-nano} .env
    else
        echo "❌ Cannot start server without .env file."
        exit 1
    fi
fi

echo ""
echo "🔍 Environment Check:"
echo "- Node.js version: $(node --version)"
echo "- npm version: $(npm --version)"
echo "- Port: ${PORT:-3001}"
echo ""

echo "🚀 Starting development server..."
echo "📊 Health check will be available at: http://localhost:${PORT:-3001}/health"
echo "🔗 API endpoints will be available at: http://localhost:${PORT:-3001}/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==========================================="

# Start the server
npm run dev
