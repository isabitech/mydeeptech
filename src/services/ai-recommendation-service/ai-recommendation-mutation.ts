import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { notification } from 'antd';

// Types for mutations
export interface BulkInvitationPayload {
  projectId: string;
  annotatorIds: string[];
  customMessage?: string;
}

export interface BulkInvitationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    annotatorId: string;
    email: string;
    error: string;
  }>;
}

interface BulkInvitationResponse {
  summary: string;
  details: BulkInvitationResult;
}

// Hook for sending bulk invitations
export const useSendBulkInvitations = () => {
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.sendBulkInvitations],
    mutationFn: async (payload: BulkInvitationPayload): Promise<BulkInvitationResult> => {
      const { projectId, annotatorIds, customMessage } = payload;
      
      const response = await axiosInstance.post<{ data: BulkInvitationResponse }>(
        `${endpoints.aiRecommendations.sendInvitations}/${projectId}/send-invitations`,
        { annotatorIds, customMessage }
      );
      
      return response.data.data.details;
    },
    onSuccess: (data) => {
      // Show success notification
      notification.success({
        message: 'Bulk Invitations Sent',
        description: `Successfully sent ${data.successful} out of ${data.total} invitations`,
      });

      // Show warning if some failed
      if (data.failed > 0) {
        notification.warning({
          message: 'Some Invitations Failed',
          description: `${data.failed} invitations failed to send. Check the detailed results for more information.`,
        });
      }
    },
    onError: (error: unknown) => {
      // Extract error message
      const message = error instanceof Error ? error.message : 'Failed to send bulk invitations';
      
      notification.error({
        message: 'Bulk Invitation Error',
        description: message,
      });
    },
  });
};

const aiRecommendationMutation = {
  useSendBulkInvitations,
};

export default aiRecommendationMutation;