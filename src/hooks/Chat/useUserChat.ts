import { useState, useCallback } from 'react';
import { endpoints } from '../../store/api/endpoints';
import { apiGet, apiPost, getErrorMessage } from '../../service/apiUtils';
import {
  StartChatRequest,
  StartChatResponse,
  ChatHistoryResponse,
  ChatTicket,
  SendMessageRequest,
  SendMessageResponse,
  HookOperationResult,
} from '../../types/chat.types';

export const useUserChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatTicket[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatTicket | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const startChat = useCallback(async (data: StartChatRequest): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: StartChatResponse = await apiPost(endpoints.chat.startChat, data);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to start chat';
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

  const getChatHistory = useCallback(async (page = 1, limit = 10): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: ChatHistoryResponse = await apiGet(
        `${endpoints.chat.getChatHistory}?page=${page}&limit=${limit}`
      );

      if (response.success) {
        setChatHistory(response.data.chats);
        setPagination(response.data.pagination);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to get chat history';
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

  const getSpecificChat = useCallback(async (ticketId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(`${endpoints.chat.getChat}/${ticketId}`);

      if (response.success) {
        setCurrentChat(response.data.ticket);
        return { success: true, data: response.data.ticket };
      } else {
        const errorMessage = response.message || 'Failed to get chat details';
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

  const sendMessage = useCallback(async (
    ticketId: string, 
    data: SendMessageRequest
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response: SendMessageResponse = await apiPost(
        `${endpoints.chat.sendMessage}/${ticketId}/message`,
        data
      );

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.message || 'Failed to send message';
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

  const getActiveChats = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Use the general chat endpoint which should return active chats for the user
      const response = await apiGet(`${endpoints.chat.getChat}/active`);

      if (response.success) {
        return { 
          success: true, 
          data: { 
            activeChats: response.data?.chats || response.data?.activeChats || [] 
          } 
        };
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setChatHistory([]);
    setCurrentChat(null);
    setPagination(null);
  }, []);

  return {
    loading,
    error,
    chatHistory,
    currentChat,
    pagination,
    startChat,
    getChatHistory,
    getActiveChats,
    getSpecificChat,
    sendMessage,
    clearError,
    resetState,
  };
};