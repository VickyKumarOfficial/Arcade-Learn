import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChatService, type AIChat, type AIChatMessage } from '@/services/aiChatService';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null);
  const [chatHistory, setChatHistory] = useState<(AIChat & { lastMessage?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Simulate AI response
      setTimeout(async () => {
        if (!chatToUpdate) return;

        const aiResponseContent = `I understand you're asking about "${message}". This is a simulated AI response. In the actual implementation, this would connect to a real AI service to provide helpful coding assistance and explanations.`;

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
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    setCurrentChat(null);
    inputRef.current?.focus();
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
                      <Button
                        key={chat.id}
                        variant="ghost"
                        onClick={() => selectChat(chat)}
                        className={`w-full p-3 text-left justify-start h-auto ${
                          currentChat?.id === chat.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
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
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">AI Online</span>
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
                  Ask me anything about coding, programming concepts, or get help with your projects. I'm here to assist you!
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>💡 Ask about coding concepts</p>
                  <p>🐛 Get help debugging code</p>
                  <p>📚 Learn new technologies</p>
                  <p>🚀 Project guidance and best practices</p>
                </div>
              </div>
            </div>
          ) : (
            // Chat Messages
            <>
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
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
                      <p className="text-sm leading-relaxed">{msg.content}</p>
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
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                placeholder="Ask me anything about coding..."
                className="pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
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