import { useState } from 'react';
import { apiPatch, getErrorMessage } from '../../../../service/apiUtils';

interface QAApprovalResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    userId: string;
    fullName: string;
    email: string;
    previousQAStatus: string;
    newQAStatus: string;
    annotatorStatus: string;
    microTaskerStatus: string;
    updatedAt: string;
    approvedBy?: string;
    rejectedBy?: string;
    reason?: string;
  };
}

export const useQAManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Approve user for QA
  const approveQA = async (userId: string): Promise<QAApprovalResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPatch(`/admin/dtusers/${userId}/qa-approve`);
      
      if (response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      } else {
        const errorMessage = response.message || 'Failed to approve QA status';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Reject user for QA
  const rejectQA = async (userId: string, reason?: string): Promise<QAApprovalResult> => {
    setLoading(true);
    setError(null);

    try {
      const requestData = reason ? { reason } : undefined;
      const response = await apiPatch(`/admin/dtusers/${userId}/qa-reject`, requestData);
      
      if (response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      } else {
        const errorMessage = response.message || 'Failed to reject QA status';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset hook state
  const resetState = () => {
    setLoading(false);
    setError(null);
  };

  return {
    loading,
    error,
    approveQA,
    rejectQA,
    resetState
  };
};