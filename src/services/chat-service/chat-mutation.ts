import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { 
  StartChatRequest, 
  StartChatResponse, 
  SendMessageRequest, 
  SendMessageResponse 
} from "../../types/chat.types";

const useStartChat = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.startChat],
    mutationFn: async (payload: StartChatRequest): Promise<StartChatResponse> => {
      const response = await axiosInstance.post<StartChatResponse>(
        endpoints.chat.startChat, 
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch chat-related queries
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.chatHistory] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.activeChats] });
    },
  });

  return {
    startChatMutation: mutation,
    isStartChatLoading: mutation.isPending,
    isStartChatError: mutation.isError,
    startChatError: mutation.error,
  };
};

const useSendMessage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.sendMessage],
    mutationFn: async ({ 
      ticketId, 
      data 
    }: { 
      ticketId: string; 
      data: SendMessageRequest;
    }): Promise<SendMessageResponse> => {
      const response = await axiosInstance.post<SendMessageResponse>(
        `${endpoints.chat.sendMessage}/${ticketId}/message`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific chat ticket and chat history
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.chatTicket, variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.chatHistory] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.activeChats] });
    },
  });

  return {
    sendMessageMutation: mutation,
    isSendMessageLoading: mutation.isPending,
    isSendMessageError: mutation.isError,
    sendMessageError: mutation.error,
  };
};

const chatMutationService = {
  useStartChat,
  useSendMessage,
};

export default chatMutationService;