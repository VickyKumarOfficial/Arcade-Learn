import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import FormattedText from '@/components/FormattedText';
import { 
  Menu, 
  X, 
  Send, 
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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChatService, type AIChat, type AIChatMessage } from '@/services/aiChatService';
import { aiService } from '@/services/aiService';
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Test AI connection on mount
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

    if (isAuthenticated) {
      testAIConnection();
    }
  }, [isAuthenticated]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

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
            ...prev
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
        }

        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setCurrentChat(null);
    inputRef.current?.focus();
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-[36px] sm:pt-[40px]">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to access the AI chat feature.
            </p>
            <Button 
              onClick={() => window.location.href = '/signin'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden pt-[36px] sm:pt-[40px] border-t border-gray-200 dark:border-gray-700">
      {/* Sidebar */}
      <div 
        className={`fixed top-[36px] sm:top-[40px] bottom-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen || sidebarHovered ? 'w-80' : 'w-16'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search chats..."
                    className="pl-10 bg-gray-50 dark:bg-gray-700 border-0"
                  />
                </div>

                {/* Recent Chats */}
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
                    Recent Chats
                  </h3>
                  {loading ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      Loading chats...
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
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
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {/* Chat Content */}
                          <div className="flex items-start space-x-3 w-full">
                            <MessageCircle className="h-4 w-4 flex-shrink-0 mt-1 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {chat.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <AnimatePresence>
            {(sidebarOpen || sidebarHovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & FAQ
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen || sidebarHovered ? 'ml-80' : 'ml-16'
      }`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                title="Back to Home"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-2 rounded-full">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hello, {user?.firstName || 'User'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(100vh-220px)] sm:h-[calc(100vh-220px)]">
          {!currentChat ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="bg-gradient-to-r from-blue-500 to-blue-800 p-6 rounded-full inline-block mb-6">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to AI Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ask me anything about coding, programming concepts, or get help with your projects.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>💡 Explain programming concepts and algorithms</p>
                  <p>🐛 Debug code and fix errors</p>
                  <p>📚 Learn new languages and frameworks</p>
                  <p>🚀 Get architecture and best practice advice</p>
                  <p>⚡ Fast responses by AI</p>
                </div>
                {!aiConnected && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      ⚠️ AI service is currently unavailable. Please check your connection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat Messages
            <>
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl relative ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
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
                    <div className={`p-4 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {msg.type === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <FormattedText 
                          content={msg.content} 
                          className="text-sm leading-relaxed"
                        />
                      )}
                      <p className={`text-xs mt-2 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto mb-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={aiConnected === false ? "AI is offline - please try again later" : "Ask me anything about coding..."}
                className="pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!aiConnected || isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !aiConnected || isTyping}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;