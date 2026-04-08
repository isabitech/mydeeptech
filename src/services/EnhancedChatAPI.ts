// Enhanced Chat API Service with corrected endpoints
import { 
  IChatAPI, 
  StartChatResponse, 
  ActiveChatsResponse, 
  ChatHistoryResponse, 
  AdminActiveChatsResponse,
  JoinChatResponse 
} from '../types/enhanced-chat.types';
import { apiGet, apiPost, apiPatch, apiDelete } from '../service/apiUtils';
import { endpoints } from '../store/api/endpoints';

class EnhancedChatAPI implements IChatAPI {
  // USER ENDPOINTS

  async startChat(message: string, category: string = 'general_inquiry', priority: string = 'medium'): Promise<StartChatResponse> {
    try {
      const response = await apiPost('/chat/start', {
        message,
        category,
        priority
      });
      

      return response;
    } catch (error) {
      console.error('Failed to start chat:', error);
      throw error;
    }
  }

  async getActiveChats(): Promise<ActiveChatsResponse> {
    try {
      const response = await apiGet('/chat/active?status=active');

      return response;
    } catch (error) {
      console.error('Failed to get active chats:', error);
      throw error;
    }
  }

  async getChatHistory(page: number = 1, limit: number = 50): Promise<ChatHistoryResponse> {
    try {
      const response = await apiGet(`/api/chat/history?page=${page}&limit=${limit}`);

      return response;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }
  }

  async getChatTicket(ticketId: string) {
    try {
      const response = await apiGet(`${endpoints.chat.getChat}/${ticketId}`);

      return response;
    } catch (error) {
      console.error('Failed to get chat ticket:', error);
      throw error;
    }
  }

  async sendMessage(ticketId: string, message: string, attachments: any[] = []) {
    try {
      const response = await apiPost(`/api/chat/${ticketId}/message`, {
        message,
        attachments
      });

      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // File upload utility
  async uploadFile(file: File, ticketId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);

      const response = await apiPost(endpoints.chat.uploadFile, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      

      return response;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  // ADMIN ENDPOINTS

  async getAdminActiveChats(status: string = 'active'): Promise<AdminActiveChatsResponse> {
    try {
      const response = await apiGet(`${endpoints.chat.admin.getActiveChats}?status=${status}`);

      return response;
    } catch (error) {
      console.error('Failed to get admin active chats:', error);
      throw error;
    }
  }

  async joinChatAsAdmin(ticketId: string): Promise<JoinChatResponse> {
    try {
      const response = await apiPost(`${endpoints.chat.admin.joinChat}/${ticketId}`);

      return response;
    } catch (error) {
      console.error('Failed to join chat as admin:', error);
      throw error;
    }
  }

  async closeChatAsAdmin(ticketId: string, resolutionSummary: string = '') {
    try {
      const response = await apiPost(`${endpoints.chat.admin.closeChat}/${ticketId}`, {
        resolutionSummary
      });

      return response;
    } catch (error) {
      console.error('Failed to close chat as admin:', error);
      throw error;
    }
  }

  async getChatStats() {
    try {
      const response = await apiGet(endpoints.chat.admin.getStats);

      return response;
    } catch (error) {
      console.error('Failed to get chat stats:', error);
      throw error;
    }
  }

  async assignAgent(ticketId: string, agentId: string) {
    try {
      const response = await apiPost(`${endpoints.chat.admin.assignAgent}/${ticketId}`, {
        agentId
      });

      return response;
    } catch (error) {
      console.error('Failed to assign agent:', error);
      throw error;
    }
  }

  async getChatDetails(ticketId: string) {
    try {
      const response = await apiGet(`${endpoints.chat.admin.getChatDetails}/${ticketId}`);

      return response;
    } catch (error) {
      console.error('Failed to get chat details:', error);
      throw error;
    }
  }

  // UTILITY METHODS

  async getNotifications() {
    try {
      const response = await apiGet('/api/notifications');
      return response;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await apiPatch(`/api/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Bulk operations for admin
  async bulkCloseChats(ticketIds: string[], resolutionSummary: string = '') {
    try {
      const response = await apiPost('/api/chat/admin/bulk-close', {
        ticketIds,
        resolutionSummary
      });

      return response;
    } catch (error) {
      console.error('Failed to bulk close chats:', error);
      throw error;
    }
  }

  async bulkAssignAgent(ticketIds: string[], agentId: string) {
    try {
      const response = await apiPost('/api/chat/admin/bulk-assign', {
        ticketIds,
        agentId
      });

      return response;
    } catch (error) {
      console.error('Failed to bulk assign agent:', error);
      throw error;
    }
  }

  // Search and filter
  async searchChats(query: string, filters?: any) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });
      
      const response = await apiGet(`/api/chat/search?${params.toString()}`);

      return response;
    } catch (error) {
      console.error('Failed to search chats:', error);
      throw error;
    }
  }

  // Export chat history
  async exportChatHistory(ticketId: string, format: 'pdf' | 'csv' = 'pdf') {
    try {
      const response = await apiGet(`/api/chat/${ticketId}/export?format=${format}`);

      return response;
    } catch (error) {
      console.error('Failed to export chat:', error);
      throw error;
    }
  }

  // Admin analytics
  async getChatAnalytics(dateRange?: { start: string; end: string }) {
    try {
      const params = dateRange ? 
        `?start=${dateRange.start}&end=${dateRange.end}` : '';
      
      const response = await apiGet(`/api/chat/admin/analytics${params}`);

      return response;
    } catch (error) {
      console.error('Failed to get chat analytics:', error);
      throw error;
    }
  }

  // Real-time status updates
  async updateChatStatus(ticketId: string, status: 'open' | 'in_progress' | 'waiting_for_user' | 'closed') {
    try {
      const response = await apiPatch(`/api/chat/${ticketId}/status`, { status });

      return response;
    } catch (error) {
      console.error('Failed to update chat status:', error);
      throw error;
    }
  }

  // Priority management
  async updateChatPriority(ticketId: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    try {
      const response = await apiPatch(`/api/chat/${ticketId}/priority`, { priority });

      return response;
    } catch (error) {
      console.error('Failed to update chat priority:', error);
      throw error;
    }
  }

  // Category management
  async updateChatCategory(ticketId: string, category: string) {
    try {
      const response = await apiPatch(`/api/chat/${ticketId}/category`, { category });
      console.log('🏷️ Chat category updated:', response);
      return response;
    } catch (error) {
      console.error('Failed to update chat category:', error);
      throw error;
    }
  }

  // Notes and internal communication
  async addInternalNote(ticketId: string, note: string) {
    try {
      const response = await apiPost(`/api/chat/${ticketId}/internal-note`, { note });
      console.log('📝 Internal note added:', response);
      return response;
    } catch (error) {
      console.error('Failed to add internal note:', error);
      throw error;
    }
  }

  async getInternalNotes(ticketId: string) {
    try {
      const response = await apiGet(`/api/chat/${ticketId}/internal-notes`);
      console.log('📋 Internal notes fetched:', response);
      return response;
    } catch (error) {
      console.error('Failed to get internal notes:', error);
      throw error;
    }
  }
}

export default new EnhancedChatAPI();