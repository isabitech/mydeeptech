import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationFiltersSchema, NotificationSchema } from "../../validators/notification/notification-schema";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { buildQueryParams } from "./notification-helpers";

const useMarkAsReadMutation = (params: NotificationFiltersSchema) => {
  const queryClient = useQueryClient();
  const queryKey = ["userNotifications", buildQueryParams(params)];

  const mutation =  useMutation({
    mutationFn: async (notificationId: string) => {
      const url = `${endpoints.notifications.markAsRead}/${notificationId}/read`;
      const response = await axiosInstance.patch(url);
      return response.data;
    },

    onMutate: async (notificationId: string) => {
      // 1. Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot the previous value for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // 3. Optimistically update the cache
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: NotificationSchema) =>
            notification._id === notificationId
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          ),
          summary: oldData.summary
            ? {
                ...oldData.summary,
                unreadCount: Math.max(0, oldData.summary.unreadCount - 1),
                readCount: oldData.summary.readCount + 1,
              }
            : oldData.summary,
        };
      });

      // 4. Return snapshot so onError can rollback
      return { previousData };
    },

    onError: (_err, _notificationId, context) => {
      // Rollback to snapshot on failure
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    mutation: mutation,
    markAsRead: mutation,
    isMarkAsReadLoading: mutation.isPending,
    isMarkAsReadError: mutation.isError,
    markAsReadError: mutation.error,
    refetchNotifications: () => queryClient.invalidateQueries({ queryKey }),
  };
};

const useDeleteNotificationMutation = (params: NotificationFiltersSchema) => {
  const queryClient = useQueryClient();
  const queryKey = ["userNotifications", buildQueryParams(params)];

  const mutation =  useMutation({
    mutationFn: async (notificationId: string) => {
      const url = `${endpoints.notifications.deleteNotification}/${notificationId}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    },

    onMutate: async (notificationId: string) => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // 3. Optimistically update cache
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        // Capture deleted notification BEFORE filtering — needed for summary adjustment
        const deletedNotification = oldData.notifications.find(
          (notification: NotificationSchema) => notification._id === notificationId
        );
        const wasUnread = deletedNotification && !deletedNotification.isRead;

        return {
          ...oldData,
          notifications: oldData.notifications.filter(
            (notification: NotificationSchema) => notification._id !== notificationId
          ),
          summary: oldData.summary
            ? {
                ...oldData.summary,
                totalNotifications: Math.max(0, oldData.summary.totalNotifications - 1),
                unreadCount: wasUnread
                  ? Math.max(0, oldData.summary.unreadCount - 1)
                  : oldData.summary.unreadCount,
                readCount: !wasUnread
                  ? Math.max(0, oldData.summary.readCount - 1)
                  : oldData.summary.readCount,
              }
            : oldData.summary,
        };
      });

      return { previousData };
    },

    onError: (_err, _notificationId, context) => {
      // Rollback to snapshot
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    mutation: mutation,
    deleteNotification: mutation,
    isDeleteNotificationLoading: mutation.isPending,
    isDeleteNotificationError: mutation.isError,
    deleteNotificationError: mutation.error,
    refetchNotifications: () => queryClient.invalidateQueries({ queryKey }),
  };
};

const useMarkAllAsReadMutation = (params: NotificationFiltersSchema) => {
  const queryClient = useQueryClient();
  const queryKey = ["userNotifications", buildQueryParams(params)];

  const mutation =  useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(
        endpoints.notifications.markAllAsRead,
        {}
      );
      return response.data;
    },

    onMutate: async () => {
      // 1. Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // 3. Optimistically mark every notification as read
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          notifications: oldData.notifications.map((notification: NotificationSchema) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? new Date().toISOString(), // preserve existing readAt if already read
          })),
          summary: oldData.summary
            ? {
                ...oldData.summary,
                unreadCount: 0,
                readCount: oldData.summary.totalNotifications, // all notifications are now read
              }
            : oldData.summary,
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  return {
    mutation: mutation,
    markAllAsRead: mutation,
    isMarkAllAsReadLoading: mutation.isPending,
    isMarkAllAsReadError: mutation.isError,
    markAllAsReadError: mutation.error,
    refetchNotifications: () => queryClient.invalidateQueries({ queryKey }),
  };
};

const notificationMutationService = {
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
};

export default notificationMutationService;