import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Notification } from "../../types/notification.types";
import { NotificationFiltersSchema } from "../../validators/notification/notification-schema";
import notificationMutationService from "../../services/notification-service/notification-mutation";

interface UseNotificationActionsProps {
  filters: NotificationFiltersSchema;
  onDropdownClose: () => void;
  isAdmin: boolean;
}

export const useNotificationActions = ({ 
  filters, 
  onDropdownClose, 
  isAdmin 
}: UseNotificationActionsProps) => {
  const navigate = useNavigate();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [keepDropdownOpen, setKeepDropdownOpen] = useState(false);

  const { markAllAsRead } = notificationMutationService.useMarkAllAsReadMutation(filters);
  const { deleteNotification } = notificationMutationService.useDeleteNotificationMutation(filters);
  const { markAsRead } = notificationMutationService.useMarkAsReadMutation(filters);

  const handleMarkAsRead = useCallback(async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markAsRead.mutateAsync(notificationId);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  }, [markAsRead]);

  const handleDeleteNotification = useCallback(async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification.mutateAsync(notificationId);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(async (event: React.MouseEvent) => {
    event.stopPropagation();
    setKeepDropdownOpen(true);
    try {
      await markAllAsRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    } finally {
      setKeepDropdownOpen(false);
    }
  }, [markAllAsRead]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      setMarkingAsRead(notification._id);
      try {
        await markAsRead.mutateAsync(notification._id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark notification as read');
      } finally {
        setMarkingAsRead(null);
      }
    }

    if (notification.actionUrl) {
        const href = isAdmin ? "/admin/notifications" : "/dashboard/notifications";
        navigate(href);
    }
    onDropdownClose();
  }, [markAsRead, navigate, isAdmin, onDropdownClose]);

  const handleViewAll = useCallback(() => {
    const href = isAdmin ? "/admin/notifications" : "/dashboard/notifications";
    navigate(href);
    onDropdownClose();
  }, [navigate, isAdmin, onDropdownClose]);

  return {
    markingAsRead,
    keepDropdownOpen,
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleViewAll,
  };
};