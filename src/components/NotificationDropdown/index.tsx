import React, { useMemo, useState } from "react";
import { Dropdown, Badge, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import notificationQueryService from "../../services/notification-service/notification-query";
import { DEFAULT_FILTERS, DROPDOWN_STYLES } from "./constants";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationContent } from "./NotificationContent";
import { NotificationFooter } from "./NotificationFooter";
import { useNotificationActions } from "./useNotificationActions";

dayjs.extend(relativeTime);

interface NotificationDropdownProps {
  isAdmin?: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isAdmin = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // React Query services  
  const { notifications, isNotificationsLoading, summary } = notificationQueryService.useUserNotificationQuery(DEFAULT_FILTERS);
  
  const { 
    markingAsRead,
    keepDropdownOpen,
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleViewAll,
  } = useNotificationActions({ 
    filters: DEFAULT_FILTERS, 
    onDropdownClose: () => setDropdownOpen(false),
    isAdmin 
  });

  const dropdownContent = useMemo(() => (
    <div 
      style={DROPDOWN_STYLES.container}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <NotificationHeader 
        summary={summary}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      
      <div style={DROPDOWN_STYLES.content}>
        <NotificationContent
          isLoading={isNotificationsLoading}
          notifications={notifications}
          markingAsReadId={markingAsRead}
          onNotificationClick={handleNotificationClick}
          onMarkAsRead={handleMarkAsRead}
          onDeleteNotification={handleDeleteNotification}
        />
      </div>

      <NotificationFooter
        notifications={notifications}
        isAdmin={isAdmin}
        onViewAll={handleViewAll}
      />
    </div>
  ), [
    summary,
    isNotificationsLoading,
    notifications,
    markingAsRead,
    isAdmin,
    handleMarkAllAsRead,
    handleNotificationClick,
    handleMarkAsRead,
    handleDeleteNotification,
    handleViewAll
  ]);

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownOpen}
      onOpenChange={(open) => {
        if (!open || (!markingAsRead && !keepDropdownOpen)) {
          setDropdownOpen(open);
        }
      }}
      overlayStyle={DROPDOWN_STYLES.overlay}
    >
      <Badge
        count={summary?.unreadCount || 0}
        size="small"
        style={DROPDOWN_STYLES.badge}
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            border: 'none',
            boxShadow: 'none',
            color: summary && summary.unreadCount > 0 ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
          }}
          size="large"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;