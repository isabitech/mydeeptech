import React, { useEffect, useState } from "react";
import {
  Dropdown,
  Badge,
  Button,
  List,
  Typography,
  Empty,
  Spin,
  Divider,
  Avatar,
  Space,
  Tag
} from "antd";
import { toast } from 'sonner';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { useUserNotifications } from "../../hooks/Auth/User/useUserNotifications";
import { Notification, NotificationType, Priority } from "../../types/notification.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationDropdown: React.FC = () => {
  const {
    loading,
    notifications,
    summary,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getSummary,
  } = useUserNotifications();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch summary on component mount
    getSummary();
  }, []);

  useEffect(() => {
    // Fetch notifications when dropdown opens
    if (dropdownOpen) {
      getUserNotifications({ limit: 10, page: 1 });
    }
  }, [dropdownOpen]);

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      account_update: <UserOutlined />,
      project_update: <ProjectOutlined />,
      application_update: <UserOutlined />,
      assessment_result: <SafetyCertificateOutlined />,
      system_alert: <WarningOutlined />,
      system_announcement: <InfoCircleOutlined />,
      security_alert: <ExclamationCircleOutlined />,
      payment_update: <DollarOutlined />,
    };
    return iconMap[type] || <InfoCircleOutlined />;
  };

  const getPriorityColor = (priority: Priority) => {
    const colorMap = {
      high: "#ff4d4f",
      medium: "#fa8c16",
      low: "#52c41a",
    };
    return colorMap[priority];
  };

  const getNotificationColor = (type: NotificationType) => {
    const colorMap = {
      account_update: "#1890ff",
      project_update: "#722ed1",
      application_update: "#13c2c2",
      assessment_result: "#52c41a",
      system_alert: "#fa8c16",
      system_announcement: "#1890ff",
      security_alert: "#ff4d4f",
      payment_update: "#eb2f96",
    };
    return colorMap[type] || "#1890ff";
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await markAsRead(notificationId);
      if (result.success) {
        // Update summary
        getSummary();
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        toast.success("Notification deleted");
        // Update summary
        getSummary();
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
        // Refresh notifications and summary
        getUserNotifications({ limit: 10, page: 1 });
        getSummary();
      }
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setDropdownOpen(false);
  };

  const dropdownContent = (
    <div style={{ width: 380, maxHeight: 500, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Text strong>Notifications</Text>
        {summary && summary.unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            style={{ padding: 0 }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '20px' }}>
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification: Notification) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: notification.isRead ? '#ffffff' : '#f6ffed',
                  borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? '#f5f5f5' : '#f0f9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? '#ffffff' : '#f6ffed';
                }}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                      title="Mark as read"
                    />
                  ),
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDeleteNotification(notification._id, e)}
                    title="Delete"
                    danger
                  />
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      style={{
                        backgroundColor: getNotificationColor(notification.type),
                        color: '#ffffff'
                      }}
                      size="small"
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text
                        strong={!notification.isRead}
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.4',
                          marginBottom: '4px'
                        }}
                      >
                        {notification.title}
                      </Text>
                      <Tag
                        color={getPriorityColor(notification.priority)}
                        style={{
                          fontSize: '11px',
                          lineHeight: '16px',
                          marginLeft: '8px',
                          flexShrink: 0
                        }}
                      >
                        {notification.priority.toUpperCase()}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.4',
                          display: 'block',
                          marginBottom: '4px'
                        }}
                      >
                        {notification.message}
                      </Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: '11px' }}
                      >
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div
            style={{
              padding: '8px 16px',
              textAlign: 'center'
            }}
          >
            {/* <Button 
              type="link" 
              size="small"
              onClick={() => {
                // Navigate to notifications page
                window.location.href = '/dashboard/notifications';
                setDropdownOpen(false);
              }}
            >
              View all notifications
            </Button> */}
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="topCenter"
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      overlayStyle={{
        boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
      }}
    >
      <Badge
        count={summary?.unreadCount || 0}
        size="small"
        style={{
          backgroundColor: '#ff4d4f',
          fontSize: '10px'
        }}
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