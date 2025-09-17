import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
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
  private systemPrompt = `You are a helpful AI coding assistant for ArcadeLearn, an interactive programming learning platform. Your role is to:

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
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        console.error('Groq API key is not configured');
        return {
          success: false,
          error: 'AI service is not properly configured. Please check your environment variables.'
        };
      }

      // Prepare messages with system prompt
      const messagesWithSystem: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt },
        ...messages
      ];

      // Create chat completion
      const completion = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: "openai/gpt-oss-120b", // Using Llama 3 for better performance and availability
        temperature: 0.7,
        max_tokens: 2000, // Increased for more detailed responses
        top_p: 0.9,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        return {
          success: false,
          error: 'No response received from AI service'
        };
      }

      // Clean up the response for better formatting
      const cleanedResponse = this.cleanResponse(response);

      return {
        success: true,
        response: cleanedResponse
      };

    } catch (error: any) {
      console.error('Error in AI service:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to get AI response. Please try again.';
      
      if (error?.message?.includes('rate limit')) {
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
}

export const aiService = new AIService();
export default AIService;