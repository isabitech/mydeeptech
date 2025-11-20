import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from "../../../service/apiUtils";
import {
  Notification,
  NotificationsResponse,
  NotificationSummaryResponse,
  NotificationFilters,
  HookOperationResult,
  NotificationSummary,
  PaginationInfo,
} from "../../../types/notification.types";

export const useUserNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);

  const getUserNotifications = useCallback(async (filters?: NotificationFilters): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      if (filters?.page) queryParams.page = filters.page.toString();
      if (filters?.limit) queryParams.limit = filters.limit.toString();
      if (filters?.unreadOnly) queryParams.unreadOnly = filters.unreadOnly.toString();
      if (filters?.type) queryParams.type = filters.type;
      if (filters?.priority) queryParams.priority = filters.priority;

      const data: NotificationsResponse = await apiGet(endpoints.notifications.getUserNotifications, { params: queryParams });

      if (data.success) {
        setNotifications(data.data.notifications);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
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

  const markAsRead = useCallback(async (notificationId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.notifications.markAsRead}/${notificationId}/read`;
      const data: any = await apiPatch(url, {});

      if (data.success) {
        // Update the notification in local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true, readAt: data.data.readAt }
              : notification
          )
        );
        
        // Update summary unread count
        setSummary(prevSummary => prevSummary ? {
          ...prevSummary,
          unreadCount: Math.max(0, prevSummary.unreadCount - 1),
          readCount: prevSummary.readCount + 1
        } : null);

        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to mark notification as read";
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

  const markAllAsRead = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: any = await apiPatch(endpoints.notifications.markAllAsRead, {});

      if (data.success) {
        // Update all notifications as read in local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt || new Date().toISOString()
          }))
        );

        // Update summary
        setSummary(prevSummary => prevSummary ? {
          ...prevSummary,
          unreadCount: 0,
          readCount: prevSummary.totalNotifications
        } : null);

        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to mark all notifications as read";
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
      const url = `${endpoints.notifications.deleteNotification}/${notificationId}`;
      const data: any = await apiDelete(url);

      if (data.success) {
        // Remove notification from local state
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== notificationId)
        );

        // Update summary counts
        setSummary(prevSummary => {
          if (!prevSummary) return null;
          
          const deletedNotification = notifications.find(n => n._id === notificationId);
          const wasUnread = deletedNotification && !deletedNotification.isRead;
          
          return {
            ...prevSummary,
            totalNotifications: Math.max(0, prevSummary.totalNotifications - 1),
            unreadCount: wasUnread ? Math.max(0, prevSummary.unreadCount - 1) : prevSummary.unreadCount,
            readCount: !wasUnread ? Math.max(0, prevSummary.readCount - 1) : prevSummary.readCount
          };
        });

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
  }, [notifications]);

  const getSummary = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: NotificationSummaryResponse = await apiGet(endpoints.notifications.getSummary);

      if (data.success) {
        setSummary(data.data);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch notification summary";
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

  // Utility function to refresh notifications
  const refreshNotifications = useCallback(async (filters?: NotificationFilters) => {
    return await getUserNotifications(filters);
  }, [getUserNotifications]);

  return {
    // State
    loading,
    error,
    notifications,
    pagination,
    summary,
    
    // Actions
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getSummary,
    refreshNotifications,
    
    // State setters for manual control if needed
    setNotifications,
    setLoading,
    setError,
  };
};