import React from "react";
import { Button, List, Typography, Empty, Spin, Avatar, Space, Tag } from "antd";
import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Notification } from "../../types/notification.types";
import { DROPDOWN_STYLES } from "./constants";
import { getNotificationIcon, getPriorityColor, getNotificationColor } from "./utils";

const { Text } = Typography;

interface NotificationContentProps {
  isLoading: boolean;
  notifications: Notification[] | undefined;
  markingAsReadId: string | null;
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string, event: React.MouseEvent) => void;
  onDeleteNotification: (notificationId: string, event: React.MouseEvent) => void;
}

export const NotificationContent: React.FC<NotificationContentProps> = ({
  isLoading,
  notifications,
  markingAsReadId,
  onNotificationClick,
  onMarkAsRead,
  onDeleteNotification,
}) => {
  if (isLoading) {
    return (
      <div style={DROPDOWN_STYLES.loadingContainer}>
        <Spin />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div style={DROPDOWN_STYLES.emptyContainer}>
        <Empty
          description="No notifications"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <List
      dataSource={notifications}
      renderItem={(notification: Notification) => {
        const isMarkingAsRead = markingAsReadId === notification._id;
        return (
          <List.Item
            style={{
              padding: '12px 16px',
              cursor: isMarkingAsRead ? 'not-allowed' : 'pointer',
              backgroundColor: notification.isRead ? '#ffffff' : '#f6ffed',
              borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
              transition: 'background-color 0.2s',
              opacity: isMarkingAsRead ? 0.7 : 1
            }}
            onClick={() => !isMarkingAsRead && onNotificationClick(notification)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = notification.isRead ? '#f5f5f5' : '#f0f9ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = notification.isRead ? '#ffffff' : '#f6ffed';
            }}
            // actions={[]}
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
                <div className="flex items-center justify-between w-full">
                   {isMarkingAsRead && <Spin size="small" />}
                    <Text
                      strong={!notification.isRead}
                      style={{
                        fontSize: '14px',
                        lineHeight: '1.4',
                        marginBottom: '4px',
                        flex: 1
                      }}
                    >
                      {notification.title}
                    </Text>

                    <Tag
                        color={getPriorityColor(notification.priority)}
                        style={{
                        fontSize: '11px',
                        lineHeight: '16px',
                        flexShrink: 0
                        }}
                    >
                        {notification.priority.toUpperCase()}
                    </Tag>
                </div>
              }
              description={
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex-1">
                    <Text
                      type="secondary"
                      style={{
                        fontSize: '12px',
                        lineHeight: '1.4',
                        display: 'block',
                        marginBottom: '4px'
                      }}
                      className="line-clamp-2 w-[98%]"
                    >
                     {notification.message.length > 80 ? `${notification.message.substring(0, 80)}...` : notification.message}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: '11px' }}
                    >
                      {dayjs(notification.createdAt).fromNow()}
                    </Text>
                  </div>

                  <div className="flex gap-2 self-start">
                    {!notification.isRead && (
                      <Button
                        key="mark-read"
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => onMarkAsRead(notification._id, e)}
                        title="Mark as read"
                      />
                    )}
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => onDeleteNotification(notification._id, e)}
                      title="Delete"
                      danger
                    />
                  </div>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};