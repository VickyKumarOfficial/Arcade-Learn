import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '' });

// Debug: Check if API key is loaded
console.log('🔑 Gemini API Key Status:', {
  loaded: !!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
  length: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY?.length || 0,
  firstChars: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY?.substring(0, 8) + '...' || 'MISSING'
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  success: boolean;
  response?: string;
  error?: string;
}

class AIService {
  private systemPrompt = `You are a helpful AI coding assistant for ArcadeLearn and Your name is - "Nova" not 'ChatGPT', an interactive programming learning platform. Your role is to:

1. Help users understand programming concepts
2. Provide code examples and explanations
3. Debug code issues
4. Suggest best practices
5. Guide users through learning roadmaps
6. Answer questions about web development, data structures, algorithms, and other programming topics

CRITICAL CODE FORMATTING RULES:
- ALWAYS wrap code in triple backticks with language specification: \`\`\`javascript, \`\`\`html, \`\`\`css, etc.
- For inline code, use single backticks: \`variable\`, \`function()\`
- NEVER use any other format for code - only triple backticks for blocks
- Always specify the programming language after the opening triple backticks
- Ensure there's a line break after opening backticks and before closing backticks

FORMATTING GUIDELINES:
- Use ## for main headings, ### for subheadings  
- Use **bold** for important terms and concepts
- Use numbered lists (1. 2. 3.) for step-by-step instructions
- Use bullet points (-) for feature lists or key points
- Keep paragraphs concise and well-spaced

EXAMPLE RESPONSE FORMAT:
## Topic Overview
Brief explanation here...

### Code Example
\`\`\`javascript
function example() {
    console.log("Hello World");
    return true;
}
\`\`\`

### Key Points
- Important point with \`inline code\`
- Another point

### Best Practices
1. Always use \`const\` for variables that don't change
2. Write descriptive function names

Remember: Code readability is CRITICAL. Always use proper code blocks with language specification.`;

  /**
   * Clean up AI response for better formatting
   */
  private cleanResponse(response: string): string {
    return response
      .trim()
      // Remove excessive formatting artifacts but preserve code blocks
      .replace(/(?<!``)[-]{5,}(?!``)/g, '')
      .replace(/(?<!`")[|]{2,}(?!"")/g, '')
      .replace(/(?<!\*)\*{5,}(?!\*)/g, '')
      // Clean up spacing but preserve code block spacing
      .replace(/\n{4,}/g, '\n\n\n')
      // Ensure proper spacing around headers
      .replace(/(\n)(#{1,4}\s)/g, '\n\n$2')
      .replace(/(#{1,4}\s.*?)(\n)([^\n#`])/g, '$1\n\n$3')
      // Ensure code blocks have proper spacing
      .replace(/(\n```[\w]*\n)/g, '\n\n$1')
      .replace(/(\n```\n)/g, '$1\n');
  }

  /**
   * Get AI response for a chat conversation
   */
  async getChatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    try {
      // Validate API key
      if (!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY) {
        console.error('Gemini API key is not configured');
        return {
          success: false,
          error: 'AI service is not properly configured. Please check your environment variables.'
        };
      }

      // Create chat completion using Gemini
      try {
        // Build the prompt with system prompt and user messages
        let prompt = this.systemPrompt + '\n\n';
        
        // Add conversation history
        for (const msg of messages) {
          if (msg.role === 'user') {
            prompt += `User: ${msg.content}\n\n`;
          } else if (msg.role === 'assistant') {
            prompt += `Assistant: ${msg.content}\n\n`;
          }
        }
        
        // For multi-turn conversations, we need to add "Assistant:" at the end to prompt a response
        if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
          prompt += 'Assistant: ';
        }

        // Generate content using the new SDK
        const response = await genAI.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: prompt,
          config: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.9,
          }
        });

        const text = response.text;

        if (!text) {
          return {
            success: false,
            error: 'No response received from AI service'
          };
        }

        // Clean up the response for better formatting
        const cleanedResponse = this.cleanResponse(text);

        return {
          success: true,
          response: cleanedResponse
        };

      } catch (error: any) {
        console.error('Gemini API Error Details:', {
          error: error,
          message: error.message,
          status: error.status,
          code: error.code
        });
        
        // Handle specific error types
        let errorMessage = 'Failed to get AI response. Please try again.';
        
        if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (error?.message?.includes('API key') || error?.message?.includes('401') || error?.message?.includes('Unauthorized') || error?.message?.includes('API_KEY_INVALID')) {
          errorMessage = 'Invalid API key. Please check your configuration.';
        } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error: any) {
      console.error('Error in AI service:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to get AI response. Please try again.';
      
      if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (error?.message?.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your configuration.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get AI response for a simple user message
   */
  async getSimpleResponse(userMessage: string): Promise<ChatCompletionResponse> {
    const messages: ChatMessage[] = [
      { role: 'user', content: userMessage }
    ];

    return this.getChatCompletion(messages);
  }

  /**
   * Get AI response with conversation context
   */
  async getContextualResponse(
    userMessage: string, 
    conversationHistory: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<ChatCompletionResponse> {
    // Convert conversation history to proper format
    const historyMessages: ChatMessage[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the new user message
    const messages: ChatMessage[] = [
      ...historyMessages,
      { role: 'user', content: userMessage }
    ];

    return this.getChatCompletion(messages);
  }

  /**
   * Get coding help response
   */
  async getCodingHelp(
    question: string, 
    codeContext?: string, 
    language?: string
  ): Promise<ChatCompletionResponse> {
    let prompt = `I need help with: ${question}`;
    
    if (language) {
      prompt += `\n\nProgramming language: ${language}`;
    }
    
    if (codeContext) {
      prompt += `\n\nHere's my code:\n\`\`\`\n${codeContext}\n\`\`\``;
    }

    return this.getSimpleResponse(prompt);
  }

  /**
   * Explain a programming concept
   */
  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<ChatCompletionResponse> {
    const prompt = `Please explain the programming concept "${concept}" at a ${level} level. Include practical examples and use cases.`;
    
    return this.getSimpleResponse(prompt);
  }

  /**
   * Debug code
   */
  async debugCode(code: string, language: string, issue?: string): Promise<ChatCompletionResponse> {
    let prompt = `Please help me debug this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    if (issue) {
      prompt += `\n\nThe issue I'm experiencing: ${issue}`;
    }
    
    prompt += '\n\nPlease identify any bugs and suggest fixes with explanations.';
    
    return this.getSimpleResponse(prompt);
  }

  /**
   * Test if AI service is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getSimpleResponse('Say "Hello, ArcadeLearn!" to test the connection.');
      return response.success;
    } catch (error) {
      console.error('AI service test failed:', error);
      return false;
    }
  }

  /**
   * Generate personalized learning roadmap based on user survey data
   */
  async generatePersonalizedRoadmap(surveyData: any): Promise<ChatCompletionResponse> {
    try {
      // Build comprehensive prompt for roadmap generation
      const interests = Array.isArray(surveyData.techInterest) ? surveyData.techInterest.join(', ') : surveyData.techInterest;
      const goals = Array.isArray(surveyData.goal) ? surveyData.goal.join(', ') : surveyData.goal;
      const learningStyles = Array.isArray(surveyData.learningStyle) ? surveyData.learningStyle.join(', ') : surveyData.learningStyle;

      const prompt = `As Nova, the AI assistant for ArcadeLearn, generate a comprehensive, personalized learning roadmap for a user with the following profile:

**User Profile:**
- User Type: ${surveyData.userType}
- Current Skill Level: ${surveyData.skillLevel}
- Tech Interests: ${interests}
- Goals: ${goals}
- Time Commitment: ${surveyData.timeCommitment}
- Learning Styles: ${learningStyles}
- Wants Recommendations: ${surveyData.wantsRecommendations}

**Please provide:**

## 🎯 Personalized Learning Roadmap

### Recommended Learning Path
Suggest 3-4 specific learning tracks that perfectly match their interests and goals, in order of priority.

### 📚 Learning Components
For each recommended track, include:
- **Duration estimate** based on their time commitment
- **Key skills** they'll develop
- **Prerequisites** (if any)
- **Difficulty progression**

### 🎓 Learning Approach
Based on their preferred learning styles (${learningStyles}), recommend:
- **Study methods** that match their preferences
- **Resource types** (videos, projects, reading, etc.)
- **Practice strategies**

### ⏰ Time Management
Given their ${surveyData.timeCommitment} commitment:
- **Weekly schedule** suggestions
- **Milestone timeline**
- **Progress tracking tips**

### 🚀 Next Steps
Provide immediate, actionable next steps to start their learning journey.

### 💡 Pro Tips
Share 2-3 specific tips for success based on their profile as a ${surveyData.userType} at ${surveyData.skillLevel} level.

Make this roadmap inspiring, practical, and perfectly tailored to their specific situation. Focus on achievable goals that align with their available time and learning preferences.`;

      return this.getSimpleResponse(prompt);
    } catch (error) {
      console.error('Error generating personalized roadmap:', error);
      return {
        success: false,
        error: 'Failed to generate personalized roadmap. Please try again.'
      };
    }
  }
}

export const aiService = new AIService();
export default AIService;