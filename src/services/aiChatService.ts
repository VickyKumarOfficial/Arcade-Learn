import { supabase } from '@/lib/supabase';

export interface AIChatMessage {
  id: string;
  chatId: string;
  type: 'user' | 'ai';
  content: string;
  createdAt: Date;
}

export interface AIChat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: AIChatMessage[];
}

export interface CreateChatData {
  title: string;
  firstMessage: {
    type: 'user' | 'ai';
    content: string;
  };
}

export interface CreateMessageData {
  chatId: string;
  type: 'user' | 'ai';
  content: string;
}

class AIChatService {
  // Create a new chat with optional first message
  async createChat(userId: string, data: CreateChatData): Promise<AIChat | null> {
    try {
      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('ai_chats')
        .insert({
          user_id: userId,
          title: data.title,
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        return null;
      }

      // Add the first message if provided
      if (data.firstMessage) {
        await this.addMessage({
          chatId: chat.id,
          type: data.firstMessage.type,
          content: data.firstMessage.content,
        });
      }

      return {
        id: chat.id,
        userId: chat.user_id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      };
    } catch (error) {
      console.error('Error in createChat:', error);
      return null;
    }
  }

  // Add a message to an existing chat
  async addMessage(data: CreateMessageData): Promise<AIChatMessage | null> {
    try {
      const { data: message, error: messageError } = await supabase
        .from('ai_messages')
        .insert({
          chat_id: data.chatId,
          type: data.type,
          content: data.content,
        })
        .select()
        .single();

      if (messageError) {
        console.error('Error adding message:', messageError);
        return null;
      }

      // Update the chat's updated_at timestamp
      await supabase
        .from('ai_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.chatId);

      return {
        id: message.id,
        chatId: message.chat_id,
        type: message.type as 'user' | 'ai',
        content: message.content,
        createdAt: new Date(message.created_at),
      };
    } catch (error) {
      console.error('Error in addMessage:', error);
      return null;
    }
  }

  // Get all chats for a user (without messages)
  async getUserChats(userId: string): Promise<AIChat[]> {
    try {
      const { data: chats, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching user chats:', error);
        return [];
      }

      return chats.map(chat => ({
        id: chat.id,
        userId: chat.user_id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }));
    } catch (error) {
      console.error('Error in getUserChats:', error);
      return [];
    }
  }

  // Get a specific chat with all its messages
  async getChatWithMessages(chatId: string): Promise<AIChat | null> {
    try {
      // Get the chat
      const { data: chat, error: chatError } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        console.error('Error fetching chat:', chatError);
        return null;
      }

      // Get all messages for this chat
      const { data: messages, error: messagesError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return null;
      }

      return {
        id: chat.id,
        userId: chat.user_id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
        messages: messages.map(msg => ({
          id: msg.id,
          chatId: msg.chat_id,
          type: msg.type as 'user' | 'ai',
          content: msg.content,
          createdAt: new Date(msg.created_at),
        })),
      };
    } catch (error) {
      console.error('Error in getChatWithMessages:', error);
      return null;
    }
  }

  // Get user chats with last message for preview
  async getUserChatsWithLastMessage(userId: string): Promise<(AIChat & { lastMessage?: string })[]> {
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select(`
          *,
          ai_messages (
            content,
            created_at,
            type
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats with messages:', error);
        return [];
      }

      return data.map(chat => {
        // Get the last message
        const messages = chat.ai_messages || [];
        const lastMessage = messages.length > 0 
          ? messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null;

        return {
          id: chat.id,
          userId: chat.user_id,
          title: chat.title,
          createdAt: new Date(chat.created_at),
          updatedAt: new Date(chat.updated_at),
          lastMessage: lastMessage?.content || '',
        };
      });
    } catch (error) {
      console.error('Error in getUserChatsWithLastMessage:', error);
      return [];
    }
  }

  // Update chat title
  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_chats')
        .update({ 
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (error) {
        console.error('Error updating chat title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateChatTitle:', error);
      return false;
    }
  }

  // Delete a specific message
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return false;
    }
  }

  // Delete a chat and all its messages
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      // Delete messages first (due to foreign key constraint)
      const { error: messagesError } = await supabase
        .from('ai_messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return false;
      }

      // Delete the chat
      const { error: chatError } = await supabase
        .from('ai_chats')
        .delete()
        .eq('id', chatId);

      if (chatError) {
        console.error('Error deleting chat:', chatError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChat:', error);
      return false;
    }
  }

  // Search chats by title or content
  async searchChats(userId: string, query: string): Promise<AIChat[]> {
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error searching chats:', error);
        return [];
      }

      return data.map(chat => ({
        id: chat.id,
        userId: chat.user_id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
      }));
    } catch (error) {
      console.error('Error in searchChats:', error);
      return [];
    }
  }
}

export const aiChatService = new AIChatService();
export default AIChatService;