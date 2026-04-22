import { useCallback } from "react";
import { notification, Modal } from "antd";
import { useApproveUser } from "../../../../../hooks/Auth/Admin/Annotators/useApproveUser";
import { useQAManagement } from "../../../../../hooks/Auth/Admin/Annotators/useQAManagement";
import { QAUserSchema, AnnotatorUser } from "../../../../../validators/annotators/annotators-schema";
import errorMessage from "../../../../../lib/error-message";
import { getErrorMessage } from "../../../../../service/apiUtils";
import { NOTIFICATION_PLACEMENT } from "../constants";

interface UseAnnotatorActionsProps {
  selectedAnnotator: AnnotatorUser | QAUserSchema | null;
  onActionComplete: () => void; // Callback to refresh data and close modals
}

export const useAnnotatorActions = ({ selectedAnnotator, onActionComplete }: UseAnnotatorActionsProps) => {
  const { approveUser, loading: updateLoading } = useApproveUser();
  const { approveQA, rejectQA, loading: qaLoading } = useQAManagement();

  const showNotification = useCallback((type: 'success' | 'error', message: string, description: string) => {
    notification.open({
      type,
      message,
      description,
      placement: NOTIFICATION_PLACEMENT,
    });
  }, []);

  const handleApprove = useCallback(async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    try {
      const result = await approveUser({
        userId: selectedAnnotator._id,
        status: 'approved'
      });

      if (result.success) {
        const successMessage = result.message || `${type === 'annotator' ? 'Annotator' : 'MicroTasker'} approved successfully`;
        showNotification('success', 'User Approved', successMessage);
        onActionComplete();
      } else {
        const errorMsg = errorMessage(result?.error) || 'Failed to approve user';
        showNotification('error', 'Approval Failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = errorMessage(error) || 'An unexpected error occurred while approving user';
      showNotification('error', 'Unexpected Error', errorMsg);
    }
  }, [selectedAnnotator, approveUser, showNotification, onActionComplete]);

  const handleReject = useCallback(async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    try {
      const result = await approveUser({
        userId: selectedAnnotator._id,
        status: 'rejected'
      });

      if (result.success) {
        const successMessage = result.message || `${type === 'annotator' ? 'Annotator' : 'MicroTasker'} rejected successfully`;
        showNotification('success', 'User Rejected', successMessage);
        onActionComplete();
      } else {
        const errorMsg = result.error || result.message || 'Failed to reject user';
        showNotification('error', 'Rejection Failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error) || 'An unexpected error occurred while rejecting user';
      showNotification('error', 'Unexpected Error', errorMsg);
    }
  }, [selectedAnnotator, approveUser, showNotification, onActionComplete]);

  const handleElevateToQA = useCallback(async () => {
    if (!selectedAnnotator) return;

    try {
      const result = await approveQA(selectedAnnotator._id);

      if (result.success) {
        const successMessage = result.message || `${selectedAnnotator.fullName} has been elevated to QA successfully`;
        showNotification('success', 'QA Elevation Successful', successMessage);
        onActionComplete();
      } else {
        const errorMsg = result.error || result.message || 'Failed to elevate user to QA';
        showNotification('error', 'QA Elevation Failed', errorMsg);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error) || 'An unexpected error occurred while elevating user to QA';
      showNotification('error', 'Unexpected Error', errorMsg);
    }
  }, [selectedAnnotator, approveQA, showNotification, onActionComplete]);

  const handleRemoveFromQA = useCallback(async () => {
    if (!selectedAnnotator) return;

    Modal.confirm({
      title: 'Remove from QA',
      content: `Are you sure you want to remove ${selectedAnnotator.fullName} from QA status?`,
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const result = await rejectQA(selectedAnnotator._id, 'Removed from QA by admin');

          if (result.success) {
            const successMessage = result.message || `${selectedAnnotator.fullName} has been removed from QA successfully`;
            showNotification('success', 'QA Removal Successful', successMessage);
            onActionComplete();
          } else {
            const errorMsg = result.error || result.message || 'Failed to remove user from QA';
            showNotification('error', 'QA Removal Failed', errorMsg);
          }
        } catch (error) {
          const errorMsg = getErrorMessage(error) || 'An unexpected error occurred while removing user from QA';
          showNotification('error', 'Unexpected Error', errorMsg);
        }
      }
    });
  }, [selectedAnnotator, rejectQA, showNotification, onActionComplete]);

  return {
    // Action handlers
    handleApprove,
    handleReject,
    handleElevateToQA,
    handleRemoveFromQA,
    
    // Loading states
    updateLoading,
    qaLoading,

    // Combined loading state
    isProcessing: updateLoading || qaLoading
  };
};