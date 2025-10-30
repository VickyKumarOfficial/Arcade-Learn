# Gemini AI Setup Guide

## 🤖 Overview
This project uses Google's Gemini AI (via the `@google/genai` SDK) to power the AI chatbot assistant "Nova" for ArcadeLearn.

## 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy your API key (it will start with something like `AIza...`)

## ⚙️ Configuration

### 1. Environment Variables

Add your Gemini API key to your `.env` file:

```bash
VITE_GOOGLE_CLOUD_API_KEY=your_gemini_api_key_here
```

### 2. Model Configuration

The AI service is configured to use:
- **Model**: `gemini-2.0-flash-exp` (latest experimental model)
- **Temperature**: 0.7 (balanced creativity)
- **Max Output Tokens**: 2000 (detailed responses)
- **Top P**: 0.9 (diverse responses)

## 📦 Dependencies

The project uses the official Google Gen AI SDK:

```json
"@google/genai": "^1.22.0"
```

This is already installed. If you need to reinstall:

```bash
npm install @google/genai
```

## 🚀 Usage

The AI service (`aiService.ts`) handles all interactions with Gemini AI:

```typescript
import { aiService } from './services/aiService';

// Simple response
const response = await aiService.getSimpleResponse("Explain JavaScript closures");

// Chat with context
const contextualResponse = await aiService.getContextualResponse(
  "Can you help me with this?",
  conversationHistory
);

// Coding help
const codingHelp = await aiService.getCodingHelp(
  "How do I fix this error?",
  codeContext,
  "javascript"
);
```

## 🔍 Key Features

- **Nova AI Assistant**: Personalized AI assistant for programming learning
- **Code Formatting**: Automatic code block formatting with syntax highlighting
- **Conversation History**: Maintains context across chat sessions
- **Error Handling**: Comprehensive error handling for rate limits, network issues, etc.
- **Personalized Roadmaps**: Generates custom learning paths based on user surveys

## 🛠️ Troubleshooting

### API Key Not Working
- Ensure your API key is correctly set in `.env`
- Check that the key starts with `AIza`
- Verify the key is valid in [Google AI Studio](https://makersuite.google.com/app/apikey)

### Rate Limit Errors
- Gemini has usage quotas. Check your quota in Google AI Studio
- Wait a moment before retrying if you hit the rate limit

### Network Errors
- Check your internet connection
- Verify that Google AI services are accessible from your network

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Quickstart](https://ai.google.dev/gemini-api/docs/quickstart)

## 🎯 Features Powered by Gemini

1. **AI Chat Page**: Real-time coding assistance
2. **Doubt Solving**: Get help with programming questions
3. **Roadmap Generation**: Personalized learning paths
4. **Code Debugging**: AI-powered code analysis
5. **Concept Explanations**: Detailed programming concept breakdowns
