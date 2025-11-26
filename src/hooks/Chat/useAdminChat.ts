import { useState, useCallback, useEffect } from 'react';
import AdminChatAPI from '../../services/AdminChatAPI';
import AdminChatSocketService from '../../services/AdminChatSocketService';
import { getErrorMessage } from '../../service/apiUtils';
import {
  AdminActiveChatsResponse,
  JoinChatResponse,
  ChatTicket,
  ChatMessage
} from '../../types/enhanced-chat.types';

export interface HookOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface CloseChatRequest {
  resolutionSummary?: string;
}

export const useAdminChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<ChatTicket[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatTicket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize admin socket connection
  const initializeAdminConnection = useCallback(async (token: string): Promise<HookOperationResult> => {
    try {
      await AdminChatSocketService.connect(token);
      setIsConnected(true);
      setConnectionError(null);
      
      // Join admin room
      AdminChatSocketService.joinAdminRoom();
      
      return { success: true };
    } catch (error) {
      console.error('[useAdminChat] Failed to initialize admin connection:', error);
      setConnectionError(getErrorMessage(error));
      setIsConnected(false);
      return { success: false, error: getErrorMessage(error) };
    }
  }, []);

  const getActiveChats = useCallback(async (status = 'active'): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: AdminActiveChatsResponse = await AdminChatAPI.getActiveChatTickets(status);

      if (response.success && response.data) {
        setActiveChats(response.data.chats || []);
        return { success: true, data: response.data };
      } else {
        const errorMessage = 'Failed to get active chats';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinChat = useCallback(async (ticketId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: JoinChatResponse = await AdminChatAPI.joinChat(ticketId);

      if (response.success && response.data) {
        setSelectedChat(response.data as any);
        
        // Join socket room for real-time updates
        if (isConnected) {
          AdminChatSocketService.joinChatRoom(ticketId);
        }
        
        return { success: true, data: response.data };
      } else {
        const errorMessage = 'Failed to join chat';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  const closeChat = useCallback(async (
    ticketId: string, 
    data?: CloseChatRequest
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await AdminChatAPI.closeChatSession(
        ticketId, 
        data?.resolutionSummary || 'Chat session completed successfully'
      );

      if (response.success) {
        // Remove from active chats
        setActiveChats(prev => prev.filter(chat => chat._id !== ticketId));
        // Clear selected chat if it was the one closed
        if (selectedChat?._id === ticketId) {
          setSelectedChat(null);
        }
        
        // Notify via socket if connected
        if (isConnected) {
          AdminChatSocketService.closeChat(ticketId, data?.resolutionSummary);
        }
        
        return { success: true, data: response.data };
      } else {
        const errorMessage = 'Failed to close chat';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [selectedChat, isConnected]);

  const sendMessage = useCallback(async (
    ticketId: string, 
    message: string, 
    attachments: any[] = []
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log('📤 [useAdminChat] Sending admin message via socket:', { ticketId, message });
      
      // Send via socket for real-time delivery (now returns a Promise)
      // The backend identifies admin messages by the @mydeeptech.ng email domain
      if (isConnected) {
        await AdminChatSocketService.sendMessage(ticketId, message, attachments);
        console.log('✅ [useAdminChat] Admin message sent via socket successfully');
        return { success: true, data: { message: 'Message sent successfully' } };
      } else {
        throw new Error('Socket not connected');
      }
    } catch (err: any) {
      console.error('❌ [useAdminChat] Send message error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  const getActiveTickets = useCallback((status?: string) => {
    if (isConnected) {
      AdminChatSocketService.getActiveTickets(status);
    }
  }, [isConnected]);

  const assignAgent = useCallback(async (ticketId: string, agentId: string): Promise<HookOperationResult> => {
    try {
      const response = await AdminChatAPI.assignAgent(ticketId, agentId);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = 'Failed to assign agent';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const getChatStats = useCallback(async (): Promise<HookOperationResult> => {
    try {
      const response = await AdminChatAPI.getChatStats();
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = 'Failed to get chat stats';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setConnectionError(null);
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setConnectionError(null);
    setActiveChats([]);
    setSelectedChat(null);
    setIsConnected(false);
  }, []);

  return {
    // State
    loading,
    error,
    connectionError,
    activeChats,
    selectedChat,
    isConnected,
    
    // Actions
    initializeAdminConnection,
    getActiveChats,
    joinChat,
    closeChat,
    sendMessage,
    getActiveTickets,
    assignAgent,
    getChatStats,
    clearError,
    resetState,
    
    // Setters
    setSelectedChat
  };
};