import { useState, useCallback } from 'react';
import { endpoints } from '../../store/api/endpoints';
import { apiGet, apiPost, getErrorMessage } from '../../service/apiUtils';
import {
  ActiveChatsResponse,
  JoinChatResponse,
  CloseChatRequest,
  CloseChatResponse,
  ChatTicket,
  HookOperationResult,
} from '../../types/chat.types';

export const useAdminChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<ChatTicket[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatTicket | null>(null);

  const getActiveChats = useCallback(async (status = 'active'): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: ActiveChatsResponse = await apiGet(
        `${endpoints.chat.admin.getActiveChats}?status=${status}`
      );

      if (response.success) {
        setActiveChats(response.data.chats);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to get active chats';
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
      const response: JoinChatResponse = await apiPost(
        `${endpoints.chat.admin.joinChat}/${ticketId}`,
        {}
      );

      if (response.success) {
        setSelectedChat(response.data as any);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to join chat';
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

  const closeChat = useCallback(async (
    ticketId: string, 
    data?: CloseChatRequest
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: CloseChatResponse = await apiPost(
        `${endpoints.chat.admin.closeChat}/${ticketId}`,
        data || {}
      );

      if (response.success) {
        // Remove from active chats
        setActiveChats(prev => prev.filter(chat => chat._id !== ticketId));
        // Clear selected chat if it was the one closed
        if (selectedChat?._id === ticketId) {
          setSelectedChat(null);
        }
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to close chat';
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
  }, [selectedChat]);

  const updateChatInList = useCallback((ticketId: string, lastMessage: string) => {
    setActiveChats(prev => 
      prev.map(chat => {
        if (chat._id === ticketId) {
          return {
            ...chat,
            lastUpdated: new Date().toISOString(),
            messages: [
              ...chat.messages,
              {
                _id: Date.now().toString(),
                sender: '',
                senderModel: 'DTUser' as const,
                message: lastMessage,
                isAdminReply: false,
                timestamp: new Date().toISOString(),
              }
            ]
          };
        }
        return chat;
      })
    );
  }, []);

  const addMessageToSelectedChat = useCallback((message: any) => {
    if (selectedChat) {
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);
    }
  }, [selectedChat]);

  const sendMessage = useCallback(async (
    ticketId: string, 
    message: string, 
    attachments: any[] = []
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      console.log('📤 [useAdminChat] Sending message via API:', { ticketId, message });
      const response = await apiPost(
        endpoints.chat.admin.sendMessage,
        {
          ticketId,
          message,
          attachments
        }
      );

      console.log('📤 [useAdminChat] Send message API response:', response);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to send message';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      console.error('❌ [useAdminChat] Send message API error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setActiveChats([]);
    setSelectedChat(null);
  }, []);

  return {
    loading,
    error,
    activeChats,
    selectedChat,
    getActiveChats,
    joinChat,
    closeChat,
    sendMessage,
    updateChatInList,
    addMessageToSelectedChat,
    setSelectedChat,
    clearError,
    resetState,
  };
};