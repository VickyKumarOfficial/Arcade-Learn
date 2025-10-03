# Quick Start: Gemini AI Integration

## 🚀 Get Started in 3 Minutes

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Configure Environment
Create or update your `.env` file in the project root:

```bash
VITE_GEMINI_API_KEY=AIza...your_actual_key_here
```

### Step 3: Install Dependencies (if needed)
The dependency is already in package.json, but run this to ensure it's installed:

```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
```

## ✅ Verify It's Working

1. Open the app in your browser
2. Navigate to the AI Chat page
3. Send a test message: "Hello Nova!"
4. You should receive a response from the Gemini AI

## 🔍 Check Console for API Status

When the app starts, you should see:
```
🔑 Gemini API Key Status: {
  loaded: true,
  length: 39,
  firstChars: 'AIza....'
}
```

## 🎯 What You Can Do Now

### 1. Chat with Nova AI
- Ask programming questions
- Get code explanations
- Debug your code
- Learn new concepts

### 2. Generate Personalized Roadmaps
- Complete the user survey
- Get AI-generated learning paths
- Tailored to your skill level and goals

### 3. Solve Coding Doubts
- Paste your code
- Describe the issue
- Get detailed solutions

## ⚡ Quick Test Commands

Test the AI service directly in browser console:

```javascript
// Import the service
import { aiService } from './src/services/aiService';

// Simple test
await aiService.testConnection();

// Get a response
const result = await aiService.getSimpleResponse("What is JavaScript?");
console.log(result);
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "API key is not configured" | Check your `.env` file has `VITE_GEMINI_API_KEY` |
| "Invalid API key" | Verify key is correct in Google AI Studio |
| "Rate limit exceeded" | Wait a few seconds, Gemini has usage quotas |
| No response | Check browser console for errors |

## 📝 Environment Variables Checklist

Make sure your `.env` has:
- ✅ `VITE_GEMINI_API_KEY` - Your Gemini API key
- ✅ `VITE_SUPABASE_URL` - Your Supabase URL
- ✅ `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- ✅ Other optional variables (EmailJS, etc.)

## 🎨 Features Ready to Use

With Gemini AI configured, these features are active:

1. **AI Chat Assistant** (`/ai-chat`)
   - Real-time conversations
   - Code examples with syntax highlighting
   - Persistent chat history

2. **AI Doubt Solving** (`/ai-doubt-solving`)
   - Submit coding questions
   - Get detailed explanations
   - Code debugging assistance

3. **AI Roadmap Generation** (`/ai-roadmap`)
   - Personalized learning paths
   - Based on your survey responses
   - Tailored recommendations

## 🔗 Next Steps

- Read the full [GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md) for advanced configuration
- Explore the [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- Check out the [aiService.ts](./src/services/aiService.ts) implementation

## 💡 Pro Tips

1. **API Key Security**: Never commit your `.env` file to git
2. **Rate Limits**: Gemini has generous free quotas, but be mindful
3. **Model Choice**: Currently using `gemini-2.0-flash-exp` for latest features
4. **Error Handling**: The service has built-in error handling for common issues

## 🎉 You're All Set!

Your Gemini AI integration is ready. Start chatting with Nova and explore the AI-powered features of ArcadeLearn!
