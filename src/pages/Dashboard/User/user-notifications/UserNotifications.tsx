import React, { useState } from "react";
import {
  Card,
  Button,
  List,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Modal,
  Descriptions,
  Empty,
  Avatar,
  Badge,
  Spin,
  Alert,
} from "antd";
import {
  ReloadOutlined,
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Notification } from "../../../../types/notification.types";
import notificationQueryService from "../../../../services/notification-service/notification-query";
import notificationMutationService from "../../../../services/notification-service/notification-mutation";
import errorMessage from "../../../../lib/error-message";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const UserNotifications: React.FC = () => {

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const { notifications, isNotificationsLoading, pagination, summary, refreshNotifications, isNotificationsError, notificationsError } = notificationQueryService.useUserNotificationQuery(filters);
  const { markAsRead, isMarkAsReadLoading  } = notificationMutationService.useMarkAsReadMutation(filters);
  const { deleteNotification, isDeleteNotificationLoading } = notificationMutationService.useDeleteNotificationMutation(filters);
  const { markAllAsRead, isMarkAllAsReadLoading } = notificationMutationService.useMarkAllAsReadMutation(filters);
  const isLoading = (isNotificationsLoading || isMarkAsReadLoading || isDeleteNotificationLoading || isMarkAllAsReadLoading);

  const handleViewNotification = (notification: Notification) => {
    setViewingNotification(notification);
    setViewModalOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (isLoading) return;
    if(!notificationId) {
      message.error("Invalid notification ID");
      return;
    }

    markAsRead.mutate(notificationId, {
        onSuccess: () => {
          message.success("Notification marked as read");
        },
        onError: (error) => {
          const errorMsg = errorMessage(error) || "Failed to mark notification as read";
          console.error("Error marking notification as read:", error);
          message.error(errorMsg);
        }
    });
  };

  const handleMarkAllAsRead = async () => {

    if (isLoading) return;
      markAllAsRead.mutate(undefined, {
        onSuccess: () => {
          message.success("All notifications marked as read");
          refreshNotifications();
        },
        onError: (error) => { 
           const errorMsg = errorMessage(error) || "Failed to mark all notifications as read";
          console.error("Error marking notifications as read:", error);
          message.error(errorMsg);
        }
      });
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (isLoading) return;
    if(!notificationId) {
      message.error("Invalid notification ID");
      return;
    }
     deleteNotification.mutate(notificationId, {
        onSuccess: () => {
          message.success("Notification deleted successfully");
          refreshNotifications();
        },
        onError: (error) => {
          const errorMsg = errorMessage(error) || "Failed to delete notification";
          console.error("Error deleting notification:", error);
          message.error(errorMsg);
        }
    });
  };

  const getTypeColor = (type: string): string => {
    if (!type) return "default";
    const colors: Record<string, string> = {
      account_update: "blue",
      project_update: "purple",
      application_update: "cyan",
      assessment_result: "green",
      system_alert: "orange",
      system_announcement: "geekblue",
      security_alert: "red",
      payment_update: "magenta",
    };
    return colors[type] || "default";
  };

  const getPriorityColor = (priority: string): string => {
    if (!priority) return "default";
    const colors: Record<string, string> = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority] || "default";
  };

  const getNotificationIcon = (type: string) => {
    if (!type) return <BellOutlined />;
    const icons: Record<string, React.ReactNode> = {
      account_update: <BellOutlined />,
      project_update: <ExclamationCircleOutlined />,
      application_update: <CheckCircleOutlined />,
      assessment_result: <CheckOutlined />,
      system_alert: <ExclamationCircleOutlined />,
      system_announcement: <BellOutlined />,
      security_alert: <ExclamationCircleOutlined />,
      payment_update: <CheckCircleOutlined />,
    };
    return icons[type] || <BellOutlined />;
  };

  return (
    <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            My Notifications
          </Title>
          <Text type="secondary">Stay updated with important information</Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshNotifications}
            loading={isNotificationsLoading}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {summary && summary.unreadCount > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              loading={isNotificationsLoading}
              disabled={isLoading}
            >
              Mark All as Read ({summary?.unreadCount || 0})
            </Button>
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={8} xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Total Notifications"
              value={summary?.totalNotifications || 0}
              prefix={<BellOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8} xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Unread"
              value={summary?.unreadCount || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={8} xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic
              title="Read"
              value={summary?.readCount || 0}
              prefix={<CheckOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Notifications List */}
      <Card>
        <Spin spinning={isNotificationsLoading} tip="Loading notifications...">
          {isNotificationsError ? (
            <Alert
              message="Error Loading Notifications"
              description={notificationsError ? errorMessage(notificationsError) : "Failed to load notifications. Please try again."}
              type="error"
              showIcon
              action={
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={refreshNotifications}
                  type="primary"
                >
                  Retry
                </Button>
              }
            />
          ) : notifications && notifications.length > 0 ? (
            <List
              itemLayout="vertical"
              size="large"
              pagination={{
                current: pagination?.currentPage || 1,
                pageSize: filters.limit || 20,
                total: pagination?.totalNotifications || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                position: "bottom",
                align: "center",
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} notifications`,
                onChange: (page, limit) => {
                  setFilters({ ...filters, page, limit });
                },
              }}
              dataSource={notifications}
              renderItem={(notification: Notification) => (
                <List.Item
                  key={notification._id}
                  className={`${
                    !notification.isRead ? "bg-blue-50" : "bg-white"
                  } hover:bg-gray-50 cursor-pointer transition-all rounded-lg p-4 mb-2`}
                  onClick={() => handleViewNotification(notification)}
                  actions={[
                    <Space key="actions">
                      {!notification.isRead && (
                        <Tooltip title="Mark as Read">
                          <Button
                            icon={<CheckOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                          />
                        </Tooltip>
                      )}
                      {/* <Tooltip title="View">
                        <Button
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewNotification(notification);
                          }}
                        />
                      </Tooltip> */}
                    </Space>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!notification.isRead}>
                        <Avatar
                          style={{
                            backgroundColor: getTypeColor(notification.type || ''),
                            color: "white",
                          }}
                          icon={getNotificationIcon(notification.type || '')}
                        />
                      </Badge>
                    }
                    title={
                      <div className="flex items-center gap-2 flex-wrap">
                        <Text strong={!notification.isRead}>
                          {notification.title || 'Untitled'}
                        </Text>
                        <Tag color={getTypeColor(notification.type || '')}>
                          {(notification.type || '').replace("_", " ").toUpperCase() || 'UNKNOWN'}
                        </Tag>
                        <Tag color={getPriorityColor(notification.priority || '')}>
                          {(notification.priority || '').toUpperCase() || 'NORMAL'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text
                          type="secondary"
                          className={!notification.isRead ? "font-medium" : ""}
                        >
                          {(notification.message || '').length > 100
                            ? `${(notification.message || '').substring(0, 100)}...`
                            : notification.message || 'No message'}
                        </Text>
                        <div className="mt-2">
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {notification.createdAt ? dayjs(notification.createdAt).fromNow() : 'Unknown date'}
                          </Text>
                          {notification.isRead && notification.readAt && (
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px", marginLeft: "10px" }}
                            >
                              • Read {dayjs(notification.readAt).fromNow()}
                            </Text>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No notifications found"
            >
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refreshNotifications}
              >
                Refresh
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>

      {/* View Notification Modal */}
      <Modal
        title="Notification Details"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setViewingNotification(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewModalOpen(false);
              setViewingNotification(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {viewingNotification && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Title">
              <Text strong>{viewingNotification.title || 'Untitled'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              <Text>{viewingNotification.message || 'No message'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getTypeColor(viewingNotification.type || '')}>
                {(viewingNotification.type || '').replace("_", " ").toUpperCase() || 'UNKNOWN'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={getPriorityColor(viewingNotification.priority || '')}>
                {(viewingNotification.priority || '').toUpperCase() || 'NORMAL'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingNotification.isRead ? "green" : "orange"}>
                {viewingNotification.isRead ? "Read" : "Unread"}
              </Tag>
            </Descriptions.Item>
            {((viewingNotification.actionUrl && typeof viewingNotification.actionUrl === 'string') || (viewingNotification.data?.actionUrl && typeof viewingNotification.data.actionUrl === 'string')) && (
              <Descriptions.Item label="Action URL">
                <a
                  href={(viewingNotification.actionUrl && typeof viewingNotification.actionUrl === 'string' ? viewingNotification.actionUrl : viewingNotification.data?.actionUrl) || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1890ff", textDecoration: "underline" }}
                >
                  {(viewingNotification.actionUrl && typeof viewingNotification.actionUrl === 'string' ? viewingNotification.actionUrl : viewingNotification.data?.actionUrl) || ''}
                </a>
              </Descriptions.Item>
            )}
            {(viewingNotification.actionText || viewingNotification.data?.actionText) && (
              <Descriptions.Item label="Action Button Text">
                <Text code>{viewingNotification.actionText || viewingNotification.data?.actionText}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created">
              <Text>
                {viewingNotification.createdAt
                  ? dayjs(viewingNotification.createdAt).format("MMM DD, YYYY HH:mm:ss")
                  : 'Unknown date'
                }
              </Text>
            </Descriptions.Item>
            {viewingNotification.readAt && (
              <Descriptions.Item label="Read At">
                <Text>
                  {dayjs(viewingNotification.readAt).format("MMM DD, YYYY HH:mm:ss")}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default UserNotifications;