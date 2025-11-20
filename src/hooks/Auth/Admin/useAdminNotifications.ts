import { useState, useCallback } from "react";
import { apiGet, apiPost, apiPut, apiDelete, getErrorMessage } from "../../../service/apiUtils";
import {
  Notification,
  NotificationsResponse,
  CreateNotificationForm,
  BroadcastNotificationForm,
  NotificationFilters,
  HookOperationResult,
  NotificationSummary,
  PaginationInfo,
} from "../../../types/notification.types";
import { endpoints } from "../../../store/api/endpoints";

export const useAdminNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const createNotification = useCallback(async (notificationData: CreateNotificationForm): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiPost(endpoints.adminNotifications.createNotification, notificationData);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to create notification";
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

  const getAllNotifications = useCallback(async (filters?: NotificationFilters): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      if (filters?.page) queryParams.page = filters.page.toString();
      if (filters?.limit) queryParams.limit = filters.limit.toString();
      if (filters?.type) queryParams.type = filters.type;
      if (filters?.priority) queryParams.priority = filters.priority;
      if (filters?.recipientType) queryParams.recipientType = filters.recipientType;
      if (filters?.recipientId) queryParams.recipientId = filters.recipientId;
      if (filters?.isRead !== undefined) queryParams.isRead = filters.isRead.toString();
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;

      const data: any = await apiGet(endpoints.adminNotifications.getAllNotifications, { params: queryParams });

      if (data.success) {
        setNotifications(data.data.notifications);
        setPagination(data.data.pagination);
        setAnalytics(data.data.analytics);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch notifications";
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

  const updateNotification = useCallback(async (
    notificationId: string,
    updateData: Partial<CreateNotificationForm>
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminNotifications.updateNotification}/${notificationId}`;
      const data: any = await apiPut(url, updateData);

      if (data.success) {
        // Update the notification in local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, ...updateData, updatedAt: data.data.updatedAt }
              : notification
          )
        );
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to update notification";
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

  const deleteNotification = useCallback(async (notificationId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminNotifications.deleteNotification}/${notificationId}`;
      const data: any = await apiDelete(url);

      if (data.success) {
        // Remove notification from local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== notificationId)
        );
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to delete notification";
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

  const broadcastNotification = useCallback(async (broadcastData: BroadcastNotificationForm): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiPost(endpoints.adminNotifications.broadcast, broadcastData);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to broadcast notification";
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

  const getAnalytics = useCallback(async (filters?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    priority?: string;
  }): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams: Record<string, string> = {};
      if (filters?.period) queryParams.period = filters.period;
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;
      if (filters?.type) queryParams.type = filters.type;
      if (filters?.priority) queryParams.priority = filters.priority;

      const data: any = await apiGet(endpoints.adminNotifications.analytics, { params: queryParams });

      if (data.success) {
        setAnalytics(data.data);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch analytics";
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

  // Utility function to refresh data
  const refreshNotifications = useCallback(async (filters?: NotificationFilters) => {
    return await getAllNotifications(filters);
  }, [getAllNotifications]);

  return {
    // State
    loading,
    error,
    notifications,
    pagination,
    analytics,
    
    // Actions
    createNotification,
    getAllNotifications,
    updateNotification,
    deleteNotification,
    broadcastNotification,
    getAnalytics,
    refreshNotifications,
    
    // State setters for manual control if needed
    setNotifications,
    setLoading,
    setError,
  };
};