import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import FormattedText from '@/components/FormattedText';
import { 
  Menu, 
  X, 
  Plus, 
  MessageCircle, 
  Search,
  Settings,
  HelpCircle,
  Brain,
  Sparkles,
  User,
  Bot,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Star,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChatService, type AIChat, type AIChatMessage } from '@/services/aiChatService';
import { aiService } from '@/services/aiService';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

const DISLIKE_FEEDBACK_OPTIONS = [
  'Incorrect or incomplete',
  'Not what I asked for',
  'Slow or buggy',
  'Style or tone',
  'Safety or legal concern',
  'Other',
] as const;

const OVERALL_FEEDBACK_OPTIONS = [
  'Helpful responses',
  'Response quality needs work',
  'Faster answers needed',
  'Better code examples',
  'Cleaner UI experience',
  'More personalized guidance',
] as const;

const OVERALL_FEEDBACK_RATING_LABELS = [
  'Very poor',
  'Poor',
  'Okay',
  'Good',
  'Excellent',
] as const;

const AI_CHAT_INPUT_PLACEHOLDERS = [
  'Ask me anything about coding...',
  'Debug this React error for me',
  'Explain closures in JavaScript',
  'Write a TypeScript utility function',
  'How do I optimize this API call?',
] as const;

const GREETING_QUESTION_OPTIONS = [
  'What should we tackle today?',
  'Want to ship something quickly?',
  'Which bug should we solve first?',
  'Ready to plan your next feature?',
  'Need a clean refactor strategy?',
] as const;

const TYPEWRITER_PROMPT_OPTIONS = [
  ['Map out a clean API strategy.'],
  ['Design a scalable React state flow.'],
  ['Refactor this feature with confidence.'],
  ['Ship the next improvement step by step.'],
  ['Break down this bug in minutes.'],
] as const;

const AIChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null);
  const [chatHistory, setChatHistory] = useState<(AIChat & { lastMessage?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiConnected, setAiConnected] = useState<boolean | null>(null);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [animatingAiMessageId, setAnimatingAiMessageId] = useState<string | null>(null);
  const [animatedAiContent, setAnimatedAiContent] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [aiFeedbackByMessageId, setAiFeedbackByMessageId] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [isDislikeFeedbackOpen, setIsDislikeFeedbackOpen] = useState(false);
  const [feedbackTargetMessageId, setFeedbackTargetMessageId] = useState<string | null>(null);
  const [selectedDislikeReason, setSelectedDislikeReason] = useState<string | null>(null);
  const [dislikeDetails, setDislikeDetails] = useState('');
  const [isSubmittingDislikeFeedback, setIsSubmittingDislikeFeedback] = useState(false);
  const [dislikeFeedbackError, setDislikeFeedbackError] = useState<string | null>(null);
  const [isOverallFeedbackOpen, setIsOverallFeedbackOpen] = useState(false);
  const [overallFeedbackRating, setOverallFeedbackRating] = useState<number>(0);
  const [overallFeedbackReasons, setOverallFeedbackReasons] = useState<string[]>([]);
  const [overallFeedbackDetails, setOverallFeedbackDetails] = useState('');
  const [isSubmittingOverallFeedback, setIsSubmittingOverallFeedback] = useState(false);
  const [overallFeedbackError, setOverallFeedbackError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationIntervalRef = useRef<number | null>(null);
  const copyIndicatorTimeoutRef = useRef<number | null>(null);

  // Test AI connection on mount (only once)
  useEffect(() => {
    const testAIConnection = async () => {
      try {
        const isConnected = await aiService.testConnection();
        setAiConnected(isConnected);
      } catch (error) {
        console.error('Failed to test AI connection:', error);
        setAiConnected(false);
      }
    };

    testAIConnection();
  }, []);

  // Load user chats on component mount
  useEffect(() => {
    const loadUserChats = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const chats = await aiChatService.getUserChatsWithLastMessage(user.id);
        setChatHistory(chats);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserChats();
  }, [isAuthenticated, user?.id]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const clearWordByWordAnimation = useCallback((resetState = false) => {
    if (animationIntervalRef.current !== null) {
      window.clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }

    if (resetState) {
      setAnimatingAiMessageId(null);
      setAnimatedAiContent('');
    }
  }, []);

  const startWordByWordAnimation = useCallback((messageId: string, content: string) => {
    clearWordByWordAnimation(true);

    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion || !content.trim()) {
      return;
    }

    const tokens = content.split(/(\s+)/).filter(Boolean);
    if (tokens.length === 0) {
      return;
    }

    const batchSize =
      tokens.length > 320 ? 4 :
      tokens.length > 200 ? 3 :
      tokens.length > 120 ? 2 : 1;
    const intervalMs =
      tokens.length > 320 ? 14 :
      tokens.length > 200 ? 16 : 20;

    let cursor = 0;
    setAnimatingAiMessageId(messageId);
    setAnimatedAiContent('');

    animationIntervalRef.current = window.setInterval(() => {
      cursor = Math.min(tokens.length, cursor + batchSize);
      setAnimatedAiContent(tokens.slice(0, cursor).join(''));

      if (cursor >= tokens.length) {
        clearWordByWordAnimation(true);
      }
    }, intervalMs);
  }, [clearWordByWordAnimation]);

  const setCopiedIndicator = useCallback((messageId: string) => {
    setCopiedMessageId(messageId);

    if (copyIndicatorTimeoutRef.current !== null) {
      window.clearTimeout(copyIndicatorTimeoutRef.current);
    }

    copyIndicatorTimeoutRef.current = window.setTimeout(() => {
      setCopiedMessageId(null);
    }, 1300);
  }, []);

  const handleCopyMessage = useCallback(async (text: string, messageId: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedIndicator(messageId);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [setCopiedIndicator]);

  const handleAiFeedback = useCallback((messageId: string, feedback: 'like' | 'dislike') => {
    setAiFeedbackByMessageId((prev) => {
      const current = prev[messageId] || null;
      return {
        ...prev,
        [messageId]: current === feedback ? null : feedback,
      };
    });
  }, []);

  const closeDislikeFeedbackPopup = useCallback(() => {
    setIsDislikeFeedbackOpen(false);
    setFeedbackTargetMessageId(null);
    setSelectedDislikeReason(null);
    setDislikeDetails('');
    setDislikeFeedbackError(null);
  }, []);

  const openDislikeFeedbackPopup = useCallback((messageId: string) => {
    setFeedbackTargetMessageId(messageId);
    setSelectedDislikeReason(null);
    setDislikeDetails('');
    setDislikeFeedbackError(null);
    setIsDislikeFeedbackOpen(true);
  }, []);

  const handleDislikeClick = useCallback((messageId: string) => {
    const isAlreadyDisliked = aiFeedbackByMessageId[messageId] === 'dislike';

    handleAiFeedback(messageId, 'dislike');

    if (!isAlreadyDisliked) {
      openDislikeFeedbackPopup(messageId);
      return;
    }

    if (feedbackTargetMessageId === messageId) {
      closeDislikeFeedbackPopup();
    }
  }, [aiFeedbackByMessageId, closeDislikeFeedbackPopup, feedbackTargetMessageId, handleAiFeedback, openDislikeFeedbackPopup]);

  const submitDislikeFeedback = useCallback(async () => {
    if (!feedbackTargetMessageId || !selectedDislikeReason) {
      return;
    }

    setDislikeFeedbackError(null);
    setIsSubmittingDislikeFeedback(true);

    try {
      const result = await aiService.submitFeedback({
        feedbackScope: 'message',
        chatId: currentChat?.id || null,
        messageId: feedbackTargetMessageId,
        feedbackValue: 'dislike',
        reason: selectedDislikeReason,
        details: dislikeDetails.trim() || null,
      });

      if (!result.success) {
        const errorMessage = result.error || 'Could not submit feedback. Please try again.';
        setDislikeFeedbackError(errorMessage);
        toast.error('Feedback not submitted', {
          description: errorMessage,
        });
        return;
      }

      toast.success('Feedback submitted', {
        description: 'Thanks for helping us improve Nova responses.',
      });

      closeDislikeFeedbackPopup();
    } catch (error) {
      console.error('Unexpected dislike feedback submit error:', error);
      setDislikeFeedbackError('Could not submit feedback. Please try again.');
      toast.error('Feedback not submitted', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmittingDislikeFeedback(false);
    }
  }, [closeDislikeFeedbackPopup, currentChat?.id, dislikeDetails, feedbackTargetMessageId, selectedDislikeReason]);

  const closeOverallFeedbackPopup = useCallback(() => {
    setIsOverallFeedbackOpen(false);
    setOverallFeedbackRating(0);
    setOverallFeedbackReasons([]);
    setOverallFeedbackDetails('');
    setOverallFeedbackError(null);
  }, []);

  const openOverallFeedbackPopup = useCallback(() => {
    setOverallFeedbackError(null);
    setIsOverallFeedbackOpen(true);
  }, []);

  const toggleOverallFeedbackReason = useCallback((reason: string) => {
    setOverallFeedbackReasons((prev) => {
      if (prev.includes(reason)) {
        return prev.filter((item) => item !== reason);
      }
      return [...prev, reason];
    });
  }, []);

  const submitOverallFeedback = useCallback(async () => {
    if (!overallFeedbackRating) {
      return;
    }

    setOverallFeedbackError(null);
    setIsSubmittingOverallFeedback(true);

    try {
      const result = await aiService.submitFeedback({
        feedbackScope: 'overall',
        chatId: currentChat?.id || null,
        rating: overallFeedbackRating,
        reason: overallFeedbackReasons[0] || null,
        reasons: overallFeedbackReasons,
        details: overallFeedbackDetails.trim() || null,
      });

      if (!result.success) {
        const errorMessage = result.error || 'Could not submit overall feedback. Please try again.';
        setOverallFeedbackError(errorMessage);
        toast.error('Feedback not submitted', {
          description: errorMessage,
        });
        return;
      }

      toast.success('Feedback submitted', {
        description: 'Thanks for rating your Nova experience.',
      });

      closeOverallFeedbackPopup();
    } catch (error) {
      console.error('Unexpected overall feedback submit error:', error);
      setOverallFeedbackError('Could not submit overall feedback. Please try again.');
      toast.error('Feedback not submitted', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmittingOverallFeedback(false);
    }
  }, [closeOverallFeedbackPopup, currentChat?.id, overallFeedbackDetails, overallFeedbackRating, overallFeedbackReasons]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  useEffect(() => {
    if (animatingAiMessageId) {
      scrollToBottom();
    }
  }, [animatingAiMessageId, animatedAiContent, scrollToBottom]);

  useEffect(() => {
    clearWordByWordAnimation(true);
  }, [currentChat?.id, clearWordByWordAnimation]);

  useEffect(() => {
    return () => {
      clearWordByWordAnimation(true);

      if (copyIndicatorTimeoutRef.current !== null) {
        window.clearTimeout(copyIndicatorTimeoutRef.current);
      }
    };
  }, [clearWordByWordAnimation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isAuthenticated || !user?.id) return;

    try {
      let chatToUpdate = currentChat;

      // If no current chat, create a new one
      if (!currentChat) {
        const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        
        const newChat = await aiChatService.createChat(user.id, {
          title,
          firstMessage: {
            type: 'user',
            content: message
          }
        });

        if (!newChat) {
          console.error('Failed to create new chat');
          return;
        }

        // Load the full chat with messages
        const fullChat = await aiChatService.getChatWithMessages(newChat.id);
        if (fullChat) {
          setCurrentChat(fullChat);
          chatToUpdate = fullChat;
          
          // Update chat history
          setChatHistory(prev => [
            { ...newChat, lastMessage: message },
            ...prev.filter(chat => chat.id !== newChat.id)
          ]);
        }
      } else {
        // Add message to existing chat
        const newMessage = await aiChatService.addMessage({
          chatId: currentChat.id,
          type: 'user',
          content: message
        });

        if (newMessage) {
          // Update current chat with new message
          const updatedChat = {
            ...currentChat,
            messages: [
              ...(currentChat.messages || []),
              {
                id: newMessage.id,
                chatId: newMessage.chatId,
                type: newMessage.type,
                content: newMessage.content,
                createdAt: newMessage.createdAt
              }
            ]
          };
          setCurrentChat(updatedChat);
          chatToUpdate = updatedChat;

          // Update chat history
          setChatHistory(prev => prev.map(chat =>
            chat.id === currentChat.id
              ? { ...chat, lastMessage: message, updatedAt: new Date() }
              : chat
          ));
        }
      }

      setMessage('');
      setIsTyping(true);

      // Get real AI response
      try {
        if (!chatToUpdate) return;

        // Prepare conversation history for context
        const conversationHistory = (chatToUpdate.messages || []).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

        // Get AI response with context
        const aiResponse = await aiService.getContextualResponse(message, conversationHistory);

        if (!aiResponse.success) {
          throw new Error(aiResponse.error || 'Failed to get AI response');
        }

        const aiResponseContent = aiResponse.response || 'I apologize, but I couldn\'t generate a response. Please try again.';

        const aiMessage = await aiChatService.addMessage({
          chatId: chatToUpdate.id,
          type: 'ai',
          content: aiResponseContent
        });

        if (aiMessage) {
          // Update current chat with AI response
          const updatedChat = {
            ...chatToUpdate,
            messages: [
              ...(chatToUpdate.messages || []),
              {
                id: aiMessage.id,
                chatId: aiMessage.chatId,
                type: aiMessage.type,
                content: aiMessage.content,
                createdAt: aiMessage.createdAt
              }
            ]
          };
          setCurrentChat(updatedChat);

          // Update chat history with AI response
          setChatHistory(prev => prev.map(chat =>
            chat.id === chatToUpdate.id
              ? { ...chat, lastMessage: aiResponseContent, updatedAt: new Date() }
              : chat
          ));

          startWordByWordAnimation(aiMessage.id, aiResponseContent);
        }

        setIsTyping(false);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Still save an error message to chat
        const errorMessage = await aiChatService.addMessage({
          chatId: chatToUpdate.id,
          type: 'ai',
          content: `I apologize, but I'm having trouble processing your request right now. ${error instanceof Error ? error.message : 'Please try again later.'}`
        });

        if (errorMessage) {
          const updatedChat = {
            ...chatToUpdate,
            messages: [
              ...(chatToUpdate.messages || []),
              {
                id: errorMessage.id,
                chatId: errorMessage.chatId,
                type: errorMessage.type,
                content: errorMessage.content,
                createdAt: errorMessage.createdAt
              }
            ]
          };
          setCurrentChat(updatedChat);
          startWordByWordAnimation(errorMessage.id, errorMessage.content);
        }

        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleVanishInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleVanishInputSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aiConnected || isTyping) {
      return;
    }
    handleSendMessage();
  }, [aiConnected, isTyping, handleSendMessage]);

  const startNewChat = () => {
    setCurrentChat(null);
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleRetryFromAiMessage = async (aiMessageId: string) => {
    if (!currentChat || isTyping) return;

    const chatMessages = currentChat.messages || [];
    const aiMessageIndex = chatMessages.findIndex(
      (item) => item.id === aiMessageId && item.type === 'ai',
    );

    if (aiMessageIndex < 0) {
      return;
    }

    const sourceUserMessage = [...chatMessages.slice(0, aiMessageIndex)]
      .reverse()
      .find((item) => item.type === 'user');

    if (!sourceUserMessage) {
      return;
    }

    setIsTyping(true);

    try {
      const conversationHistory = chatMessages.slice(0, aiMessageIndex).map((item) => ({
        role: item.type === 'user' ? 'user' as const : 'assistant' as const,
        content: item.content,
      }));

      const aiResponse = await aiService.getContextualResponse(sourceUserMessage.content, conversationHistory);

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to retry response');
      }

      const aiResponseContent = aiResponse.response || 'I could not generate a retry response. Please try again.';
      const aiMessage = await aiChatService.addMessage({
        chatId: currentChat.id,
        type: 'ai',
        content: aiResponseContent,
      });

      if (!aiMessage) {
        throw new Error('Failed to persist retry response');
      }

      const updatedChat = {
        ...currentChat,
        messages: [
          ...chatMessages,
          {
            id: aiMessage.id,
            chatId: aiMessage.chatId,
            type: aiMessage.type,
            content: aiMessage.content,
            createdAt: aiMessage.createdAt,
          },
        ],
      };

      setCurrentChat(updatedChat);
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChat.id
            ? { ...chat, lastMessage: aiResponseContent, updatedAt: new Date() }
            : chat,
        ),
      );
      startWordByWordAnimation(aiMessage.id, aiResponseContent);
    } catch (error) {
      console.error('Retry response failed:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user?.id) return;

    setDeletingChatId(chatId);
    
    try {
      const success = await aiChatService.deleteChat(chatId);
      
      if (success) {
        // Remove chat from history
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        // If this was the current chat, clear it
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      } else {
        console.error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeletingChatId(null);
    }
  };

  const selectChat = async (chat: AIChat & { lastMessage?: string }) => {
    try {
      // Load the full chat with messages
      const fullChat = await aiChatService.getChatWithMessages(chat.id);
      if (fullChat) {
        setCurrentChat(fullChat);
      } else {
        // Fallback to basic chat without messages
        setCurrentChat({
          ...chat,
          messages: []
        });
      }
      
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-[36px] sm:pt-[40px]">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the AI chat feature.
            </p>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const chatInputPlaceholders = aiConnected === false
    ? ['AI is offline - please try again later']
    : [...AI_CHAT_INPUT_PLACEHOLDERS];

  const randomTypewriterWords = useMemo(() => {
    const prompt = TYPEWRITER_PROMPT_OPTIONS[
      Math.floor(Math.random() * TYPEWRITER_PROMPT_OPTIONS.length)
    ];

    return prompt.map((text, index) => ({
      text,
      className: index === prompt.length - 1 ? 'text-blue-400 dark:text-blue-400' : undefined,
    }));
  }, [user?.id]);

  const randomGreetingQuestion = useMemo(() => {
    return GREETING_QUESTION_OPTIONS[
      Math.floor(Math.random() * GREETING_QUESTION_OPTIONS.length)
    ];
  }, [user?.id]);

  const chatInputPanel = (
    <div className="mx-auto max-w-4xl pointer-events-auto">
      {/* Container wrapper around the input field is temporarily disabled */}
      {/* <div className="rounded-2xl border border-slate-700/90 bg-slate-900/95 px-3 pb-2 pt-3 shadow-[0_14px_40px_rgba(2,6,23,0.45)] backdrop-blur-md"> */}
      <PlaceholdersAndVanishInput
        placeholders={chatInputPlaceholders}
        onChange={handleVanishInputChange}
        onSubmit={handleVanishInputSubmit}
        disabled={!aiConnected || isTyping}
        inputElementRef={inputRef}
        className="max-w-none bg-slate-950 border border-slate-700 shadow-none"
        inputClassName="text-slate-100 dark:text-slate-100 disabled:cursor-not-allowed"
        placeholderClassName="text-slate-500 dark:text-slate-500 pl-4 sm:pl-10"
        buttonClassName="!bg-transparent dark:!bg-transparent disabled:!bg-transparent hover:!bg-transparent"
      />
      <p className="mt-2 text-center text-xs text-slate-500">
        AI can make mistakes. Consider checking important information.
      </p>
      </div>
    // </div>
  );

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen || sidebarHovered ? 'w-80' : 'w-16'
        } bg-slate-950 border-r border-slate-800 shadow-lg`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <AnimatePresence>
              {(sidebarOpen || sidebarHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startNewChat}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {(sidebarOpen || sidebarHovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-2"
              >
                {/* Search */}
                <div className="relative mb-4 px-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search chats..."
                    className="pl-10 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                {/* Recent Chats */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-400 px-2 mb-2">
                    Recent Chats
                  </h3>
                  {loading ? (
                    <div className="px-2 py-4 text-center text-sm text-slate-400">
                      Loading chats...
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-slate-400">
                      No chats yet. Start a conversation!
                    </div>
                  ) : (
                    chatHistory.map((chat) => (
                      <div
                        key={chat.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => selectChat(chat)}
                          className={`w-full p-3 text-left justify-start h-auto relative overflow-hidden ${
                            currentChat?.id === chat.id 
                              ? 'bg-slate-800 border border-slate-700 text-slate-100' 
                              : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                          }`}
                        >
                          {/* Chat Content */}
                          <div className="flex items-start space-x-3 w-full">
                            <MessageCircle className="h-4 w-4 flex-shrink-0 mt-1 text-slate-500" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {chat.title}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </div>
                            </div>
                          </div>
                        </Button>
                        
                        {/* Delete Button - appears on hover with gradient background */}
                        <AnimatePresence>
                          {hoveredChatId === chat.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 z-20"
                            >
                              {/* Gradient background behind the icon */}
                              <div 
                                className="absolute inset-0 w-8 h-8 -m--3 rounded-full"
                                style={{
                                  background: `conic-gradient(from 0deg, 
                                    rgba(0,0,0,0.4) 0deg, 
                                    rgba(0,0,0,0.4) 90deg, 
                                    rgba(0,0,0,0.4) 180deg, 
                                    rgba(0,0,0,0.4) 270deg, 
                                    rgba(0,0,0,0.4) 360deg)`
                                }}
                              />
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full bg-transparent hover:bg-color-black-800 transition-colors relative z-10"
                                    disabled={deletingChatId === chat.id}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent chat selection
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-white drop-shadow-sm" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{chat.title}"? This will permanently delete the entire conversation and cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteChat(chat.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Chat
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4">
          <AnimatePresence>
            {(sidebarOpen || sidebarHovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-slate-100">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openOverallFeedbackPopup}
                  className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Give a Feedback
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen || sidebarHovered ? 'ml-80' : 'ml-16'
      } bg-slate-900 relative flex flex-col`}>
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2 hover:bg-slate-800 rounded-full"
                title="Back to Home"
              >
                <ArrowLeft className="h-5 w-5 text-slate-300" />
              </Button>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-2 rounded-full">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-100">
                  Hello, {user?.firstName || 'User'}
                </h1>
                <p className="text-sm text-slate-400">
                  AI-Powered Coding Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {aiConnected === null ? (
                <>
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-yellow-600">Connecting...</span>
                </>
              ) : aiConnected ? (
                <>
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">AI Online</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600">AI Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${currentChat ? 'pb-48' : 'pb-8'}`}>
          {!currentChat ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-5xl text-center">
                <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-100">
                    Hey, {user?.firstName || 'there'}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-300">
                    {randomGreetingQuestion}
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <TypewriterEffectSmooth
                    words={randomTypewriterWords}
                    className="my-0 justify-center"
                    cursorClassName="bg-blue-400 h-4 sm:h-5"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: 'easeInOut' }}
                  className="mt-8 px-4 sm:px-6"
                >
                  {chatInputPanel}
                </motion.div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <>
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex items-start space-x-3 relative w-full ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse md:w-1/2' : 'border-b border-slate-800/80 pb-5'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      msg.type === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 ${
                      msg.type === 'user'
                        ? 'p-4 rounded-2xl bg-blue-600 text-white'
                        : 'min-w-0 pr-2'
                    }`}>
                      {msg.type === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : animatingAiMessageId === msg.id ? (
                        <motion.p
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="text-[15px] md:text-base leading-8 whitespace-pre-wrap text-slate-100 font-medium"
                        >
                          {animatedAiContent}
                          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-blue-500 align-middle" />
                        </motion.p>
                      ) : (
                        <FormattedText 
                          content={msg.content} 
                          className="text-[15px] md:text-base leading-8"
                        />
                      )}
                      <p className={`text-xs mt-2 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {msg.type === 'user' && (
                        <div className="mt-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            className="h-6 w-6 p-0 bg-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-transparent"
                            title="Copy your query"
                            aria-label="Copy your query"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-blue-100" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-blue-100/85" />
                            )}
                          </Button>
                        </div>
                      )}

                      {msg.type === 'ai' && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyMessage(msg.content, msg.id)}
                            className="h-6 w-6 p-0 bg-transparent text-slate-500 hover:bg-transparent hover:text-slate-200"
                            title="Copy response"
                            aria-label="Copy response"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAiFeedback(msg.id, 'like')}
                            className={`h-6 w-6 p-0 bg-transparent hover:bg-transparent ${
                              aiFeedbackByMessageId[msg.id] === 'like'
                                ? 'text-emerald-400'
                                : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title="Like response"
                            aria-label="Like response"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDislikeClick(msg.id)}
                            className={`h-6 w-6 p-0 bg-transparent hover:bg-transparent ${
                              aiFeedbackByMessageId[msg.id] === 'dislike'
                                ? 'text-rose-400'
                                : 'text-slate-500 hover:text-slate-200'
                            }`}
                            title="Dislike response"
                            aria-label="Dislike response"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRetryFromAiMessage(msg.id)}
                            disabled={isTyping}
                            className="h-6 w-6 p-0 bg-transparent text-slate-500 hover:bg-transparent hover:text-slate-200 disabled:opacity-40"
                            title="Try again"
                            aria-label="Try again"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start w-full">
                  <div className="flex items-start space-x-3 w-full border-b border-slate-800/80 pb-5">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-[15px] text-slate-400 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Floating Input Area */}
        <AnimatePresence initial={false}>
          {currentChat && (
            <motion.div
              key="floating-chat-input"
              className="pointer-events-none absolute inset-x-0 bottom-5 z-20 px-4 sm:px-6"
              initial={{ opacity: 0, y: -56 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 64 }}
              transition={{ duration: 0.34, ease: 'easeInOut' }}
            >
              {chatInputPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOverallFeedbackOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOverallFeedbackPopup}
          >
            <motion.div
              className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-medium text-slate-100">Rate your Nova experience</h3>
                <button
                  type="button"
                  onClick={closeOverallFeedbackPopup}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
                  aria-label="Close overall feedback popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-slate-300">How would you rate Nova overall?</p>
              <div className="mt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = value <= overallFeedbackRating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOverallFeedbackRating(value)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? 'border-amber-300 bg-amber-400/20 text-amber-200'
                          : 'border-slate-600 text-slate-300 hover:border-slate-400'
                      }`}
                      aria-label={`Set overall feedback rating to ${value}`}
                    >
                      <Star className={`h-5 w-5 ${selected ? 'fill-current' : ''}`} />
                    </button>
                  );
                })}
              </div>

              {overallFeedbackRating > 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  {OVERALL_FEEDBACK_RATING_LABELS[overallFeedbackRating - 1]}
                </p>
              )}

              <div className="mb-4 mt-4 flex flex-wrap gap-2">
                {OVERALL_FEEDBACK_OPTIONS.map((option) => {
                  const selected = overallFeedbackReasons.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOverallFeedbackReason(option)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                          : 'border-slate-600 text-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={overallFeedbackDetails}
                onChange={(event) => setOverallFeedbackDetails(event.target.value)}
                placeholder="What should Nova improve? (optional)"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
              />

              <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
                Your feedback helps us improve response quality, speed, and guidance.
              </div>

              {overallFeedbackError && (
                <p className="mt-3 text-sm text-rose-300">{overallFeedbackError}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={submitOverallFeedback}
                  disabled={!overallFeedbackRating || isSubmittingOverallFeedback}
                  className="rounded-full bg-slate-600 px-5 text-slate-100 hover:bg-slate-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isSubmittingOverallFeedback ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting
                    </span>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {isDislikeFeedbackOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDislikeFeedbackPopup}
          >
            <motion.div
              className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-medium text-slate-100">Share feedback</h3>
                <button
                  type="button"
                  onClick={closeDislikeFeedbackPopup}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-600 text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
                  aria-label="Close feedback popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {DISLIKE_FEEDBACK_OPTIONS.map((option) => {
                  const selected = selectedDislikeReason === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedDislikeReason(option)}
                      className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                          : 'border-slate-600 text-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={dislikeDetails}
                onChange={(event) => setDislikeDetails(event.target.value)}
                placeholder="Share details (optional)"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
              />

              <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
                Your conversation will be included with your feedback to help improve Nova.
              </div>

              {dislikeFeedbackError && (
                <p className="mt-3 text-sm text-rose-300">{dislikeFeedbackError}</p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={submitDislikeFeedback}
                  disabled={!selectedDislikeReason || isSubmittingDislikeFeedback}
                  className="rounded-full bg-slate-600 px-5 text-slate-100 hover:bg-slate-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {isSubmittingDislikeFeedback ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting
                    </span>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatPage;