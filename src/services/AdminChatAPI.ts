// Admin Chat API Service for Admin operations
import { 
  AdminActiveChatsResponse,
  JoinChatResponse 
} from '../types/enhanced-chat.types';
import { apiGet, apiPost, apiPatch } from '../service/apiUtils';

class AdminChatAPI {
  // ADMIN ENDPOINTS ONLY

  async getActiveChatTickets(status = 'active'): Promise<AdminActiveChatsResponse> {
    try {
      const statusFilter = status === 'active' ? '?status=active' : `?status=${status}`;
      const response = await apiGet(`/chat/admin/active${statusFilter}`);
      console.log('📋 [AdminChatAPI] Admin active chats fetched:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to get admin active chats:', error);
      throw error;
    }
  }

  async joinChat(ticketId: string): Promise<JoinChatResponse> {
    try {
      const response = await apiPost(`/chat/admin/join/${ticketId}`, {});
      console.log('👨‍💼 [AdminChatAPI] Admin joined chat:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to join chat as admin:', error);
      throw error;
    }
  }

  // async sendAdminMessage(ticketId: string, message: string, attachments: any[] = []) {
  //   try {
  //     // For support tickets, use the support endpoint as per backend documentation
  //     const response = await apiPost(`/support/admin/tickets/${ticketId}/messages`, {
  //       message,
  //       senderModel: 'Admin',
  //       attachments
  //     });
  //     console.log('💬 [AdminChatAPI] Admin message sent via API:', response);
  //     return response;
  //   } catch (error) {
  //     console.error('[AdminChatAPI] Failed to send admin message:', error);
  //     throw error;
  //   }
  // }

  async closeChatSession(ticketId: string, resolutionSummary = 'Chat session completed successfully') {
    try {
      const response = await apiPost(`/chat/admin/close/${ticketId}`, {
        resolutionSummary
      });
      console.log('✅ [AdminChatAPI] Chat closed by admin:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to close chat as admin:', error);
      throw error;
    }
  }

  async getChatStats() {
    try {
      const response = await apiGet('/chat/admin/stats');
      console.log('📊 [AdminChatAPI] Chat stats fetched:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to get chat stats:', error);
      throw error;
    }
  }

  async assignAgent(ticketId: string, agentId: string) {
    try {
      const response = await apiPost(`/chat/admin/assign/${ticketId}`, {
        agentId
      });
      console.log('👤 [AdminChatAPI] Agent assigned:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to assign agent:', error);
      throw error;
    }
  }

  async getChatDetails(ticketId: string) {
    try {
      const response = await apiGet(`/chat/admin/${ticketId}`);
      console.log('📋 [AdminChatAPI] Admin chat details fetched:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to get chat details:', error);
      throw error;
    }
  }

  // Bulk operations for admin
  async bulkCloseChats(ticketIds: string[], resolutionSummary: string = '') {
    try {
      const response = await apiPost('/chat/admin/bulk-close', {
        ticketIds,
        resolutionSummary
      });
      console.log('📦 [AdminChatAPI] Bulk close operation completed:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to bulk close chats:', error);
      throw error;
    }
  }

  async bulkAssignAgent(ticketIds: string[], agentId: string) {
    try {
      const response = await apiPost('/chat/admin/bulk-assign', {
        ticketIds,
        agentId
      });
      console.log('📦 [AdminChatAPI] Bulk assign operation completed:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to bulk assign agent:', error);
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
      
      const response = await apiGet(`/chat/admin/search?${params.toString()}`);
      console.log('🔍 [AdminChatAPI] Chat search results:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to search chats:', error);
      throw error;
    }
  }

  // Admin analytics
  async getChatAnalytics(dateRange?: { start: string; end: string }) {
    try {
      const params = dateRange ? 
        `?start=${dateRange.start}&end=${dateRange.end}` : '';
      
      const response = await apiGet(`/chat/admin/analytics${params}`);
      console.log('📈 [AdminChatAPI] Chat analytics fetched:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to get chat analytics:', error);
      throw error;
    }
  }

  // Real-time status updates
  async updateChatStatus(ticketId: string, status: 'open' | 'in_progress' | 'waiting_for_user' | 'closed') {
    try {
      const response = await apiPatch(`/chat/admin/${ticketId}/status`, { status });
      console.log('🔄 [AdminChatAPI] Chat status updated:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to update chat status:', error);
      throw error;
    }
  }

  // Priority management
  async updateChatPriority(ticketId: string, priority: 'low' | 'medium' | 'high' | 'urgent') {
    try {
      const response = await apiPatch(`/chat/admin/${ticketId}/priority`, { priority });
      console.log('⚡ [AdminChatAPI] Chat priority updated:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to update chat priority:', error);
      throw error;
    }
  }

  // Notes and internal communication
  async addInternalNote(ticketId: string, note: string) {
    try {
      const response = await apiPost(`/chat/admin/${ticketId}/internal-note`, { note });
      console.log('📝 [AdminChatAPI] Internal note added:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to add internal note:', error);
      throw error;
    }
  }

  async getInternalNotes(ticketId: string) {
    try {
      const response = await apiGet(`/chat/admin/${ticketId}/internal-notes`);
      console.log('📋 [AdminChatAPI] Internal notes fetched:', response);
      return response;
    } catch (error) {
      console.error('[AdminChatAPI] Failed to get internal notes:', error);
      throw error;
    }
  }
}

export default new AdminChatAPI();