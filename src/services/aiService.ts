// Backend URL from environment (e.g., http://localhost:8081)
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

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
      // Call the backend API endpoint
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const payload = await response.json().catch(() => ({
        success: false,
        error: 'Invalid server response.'
      }));

      if (!response.ok || !payload?.success) {
        return {
          success: false,
          error: payload?.error || `AI service request failed with status ${response.status}.`
        };
      }

      if (!payload?.response) {
        return {
          success: false,
          error: 'No response received from AI service'
        };
      }

      // Clean up the response for better formatting
      const cleanedResponse = this.cleanResponse(payload.response);

      return {
        success: true,
        response: cleanedResponse
      };

    } catch (error: any) {
      console.error('Error calling AI service:', error);

      // Handle specific error types
      let errorMessage = 'Failed to get AI response. Please try again.';

      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
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
   * Test if AI service is working (checks backend connectivity)
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
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