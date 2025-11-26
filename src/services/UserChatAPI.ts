// User Chat API Service for DTUser operations
import { 
  StartChatResponse, 
  ActiveChatsResponse, 
  ChatHistoryResponse 
} from '../types/enhanced-chat.types';
import { apiGet, apiPost } from '../service/apiUtils';

class UserChatAPI {
  // USER ENDPOINTS ONLY

  async startChat(message: string, category: string = 'general_inquiry', priority: string = 'medium'): Promise<StartChatResponse> {
    try {
      const response = await apiPost('/chat/start', {
        message,
        category,
        priority
      });
      
      console.log('📝 [UserChatAPI] Chat started via API:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to start chat:', error);
      throw error;
    }
  }

  async getActiveChats(): Promise<ActiveChatsResponse> {
    try {
      const response = await apiGet('/chat/active');
      console.log('📋 [UserChatAPI] Active chats fetched:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to get active chats:', error);
      throw error;
    }
  }

  async getChatHistory(page: number = 1, limit: number = 50): Promise<ChatHistoryResponse> {
    try {
      const response = await apiGet(`/chat/history?page=${page}&limit=${limit}`);
      console.log('📚 [UserChatAPI] Chat history fetched:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to get chat history:', error);
      throw error;
    }
  }

  async sendMessage(ticketId: string, message: string, attachments: any[] = []) {
    try {
      const response = await apiPost(`/api/chat/${ticketId}/message`, {
        message,
        senderModel: 'DTUser',
        attachments
      });
      console.log('💬 [UserChatAPI] Message sent via API:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to send message:', error);
      throw error;
    }
  }

  async getChatTicket(ticketId: string) {
    try {
      const response = await apiGet(`/chat/${ticketId}`);
      console.log('🎫 [UserChatAPI] Chat ticket fetched:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to get chat ticket:', error);
      throw error;
    }
  }

  // File upload utility for users
  async uploadFile(file: File, ticketId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);

      const response = await apiPost('/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('📎 [UserChatAPI] File uploaded:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to upload file:', error);
      throw error;
    }
  }

  // User-specific utility methods
  async getNotifications() {
    try {
      const response = await apiGet('/notifications');
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to get notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await apiPost(`/notifications/${notificationId}/read`, {});
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Export chat history for user
  async exportChatHistory(ticketId: string, format: 'pdf' | 'csv' = 'pdf') {
    try {
      const response = await apiGet(`/chat/${ticketId}/export?format=${format}`);
      console.log('📄 [UserChatAPI] Chat export completed:', response);
      return response;
    } catch (error) {
      console.error('[UserChatAPI] Failed to export chat:', error);
      throw error;
    }
  }
}

export default new UserChatAPI();