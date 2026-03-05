import React, { useEffect, useState } from "react";
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
import { useUserNotifications } from "../../../../hooks/Auth/User/useUserNotifications";
import { Notification } from "../../../../types/notification.types";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const UserNotifications: React.FC = () => {
  const {
    loading,
    notifications,
    pagination,
    summary,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useUserNotifications();

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    await getUserNotifications(filters);
  };

  const handleViewNotification = (notification: Notification) => {
    setViewingNotification(notification);
    setViewModalOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markAsRead(notificationId);
    if (result.success) {
      message.success("Notification marked as read");
      refreshNotifications(filters);
    } else {
      message.error(result.error || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead();
    if (result.success) {
      message.success("All notifications marked as read");
      refreshNotifications(filters);
    } else {
      message.error(result.error || "Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      message.success("Notification deleted successfully");
      refreshNotifications(filters);
    } else {
      message.error(result.error || "Failed to delete notification");
    }
  };

  const getTypeColor = (type: string): string => {
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
    const colors: Record<string, string> = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority] || "default";
  };

  const getNotificationIcon = (type: string) => {
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
            onClick={() => refreshNotifications(filters)}
            loading={loading}
          >
            Refresh
          </Button>
          {summary && summary.unreadCount > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              loading={loading}
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
        {notifications && notifications.length > 0 ? (
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
            renderItem={(notification: any) => (
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
                          backgroundColor: getTypeColor(notification.type),
                          color: "white",
                        }}
                        icon={getNotificationIcon(notification.type)}
                      />
                    </Badge>
                  }
                  title={
                    <div className="flex items-center gap-2 flex-wrap">
                      <Text strong={!notification.isRead}>
                        {notification.title}
                      </Text>
                      <Tag color={getTypeColor(notification.type)}>
                        {notification.type.replace("_", " ").toUpperCase()}
                      </Tag>
                      <Tag color={getPriorityColor(notification.priority)}>
                        {notification.priority.toUpperCase()}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        className={!notification.isRead ? "font-medium" : ""}
                      >
                        {notification.message.length > 100
                          ? `${notification.message.substring(0, 100)}...`
                          : notification.message}
                      </Text>
                      <div className="mt-2">
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {dayjs(notification.createdAt).fromNow()}
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
              onClick={() => refreshNotifications(filters)}
            >
              Refresh
            </Button>
          </Empty>
        )}
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
              <Text strong>{viewingNotification.title}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              <Text>{viewingNotification.message}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={getTypeColor(viewingNotification.type)}>
                {viewingNotification.type.replace("_", " ").toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={getPriorityColor(viewingNotification.priority)}>
                {viewingNotification.priority.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingNotification.isRead ? "green" : "orange"}>
                {viewingNotification.isRead ? "Read" : "Unread"}
              </Tag>
            </Descriptions.Item>
            {viewingNotification.data?.actionUrl && (
              <Descriptions.Item label="Action URL">
                <a
                  href={viewingNotification.data.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1890ff", textDecoration: "underline" }}
                >
                  {viewingNotification.data.actionUrl}
                </a>
              </Descriptions.Item>
            )}
            {viewingNotification.data?.actionText && (
              <Descriptions.Item label="Action Button Text">
                <Text code>{viewingNotification.data.actionText}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created">
              <Text>
                {dayjs(viewingNotification.createdAt).format(
                  "MMM DD, YYYY HH:mm:ss"
                )}
              </Text>
            </Descriptions.Item>
            {viewingNotification.readAt && (
              <Descriptions.Item label="Read At">
                <Text>
                  {dayjs(viewingNotification.readAt).format(
                    "MMM DD, YYYY HH:mm:ss"
                  )}
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