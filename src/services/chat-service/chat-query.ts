import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { ChatHistoryResponse, ChatTicket } from "../../types/chat.types";

interface PaginationParams {
  page?: number;
  limit?: number;
}

// Get chat history with pagination
const useChatHistory = (paginationParams?: PaginationParams) => {
  const { page = 1, limit = 10 } = paginationParams || {};

  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.chatHistory, { page, limit }],
    queryFn: async (): Promise<ChatHistoryResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axiosInstance.get<ChatHistoryResponse>(
        `${endpoints.chat.getChatHistory}?${params.toString()}`
      );
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

// Get active chats
const useActiveChats = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.activeChats],
    queryFn: async () => {
      const response = await axiosInstance.get(`${endpoints.chat.getChat}/active`);
      return response.data;
    },
  });
};

// Get specific chat ticket
const useChatTicket = (ticketId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.chatTicket, ticketId],
    queryFn: async (): Promise<{ data: { ticket: ChatTicket } }> => {
      const response = await axiosInstance.get(`${endpoints.chat.getChat}/${ticketId}`);
      return response.data;
    },
    enabled: enabled && !!ticketId,
  });
};

const chatQueryService = {
  useChatHistory,
  useActiveChats,
  useChatTicket,
};

export default chatQueryService;