import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Pagination,
  Row,
  Col,
  Statistic,
  Avatar,
  Select,
  Popconfirm,
} from "antd";
import { toast } from 'sonner';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useUserNotifications } from "../../../hooks/Auth/User/useUserNotifications";
import {
  Notification,
  NotificationType,
  Priority,
} from "../../../types/notification.types";
import Header from "./Header";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;

const UserNotifications: React.FC = () => {
  const {
    loading,
    notifications,
    summary,
    pagination,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getSummary,
  } = useUserNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<{
    unreadOnly: boolean;
    type?: NotificationType;
    priority?: Priority;
  }>({
    unreadOnly: false,
  });

  useEffect(() => {
    loadNotifications();
    loadSummary();
  }, [currentPage, filter]);

  const loadNotifications = () => {
    getUserNotifications({
      page: currentPage,
      limit: 10,
      unreadOnly: filter.unreadOnly,
      type: filter.type,
      priority: filter.priority,
    });
  };

  const loadSummary = () => {
    getSummary();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markAsRead(notificationId);
      if (result.success) {
        toast.success("Notification marked as read");
        loadSummary();
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
        loadNotifications();
        loadSummary();
      }
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        toast.success("Notification deleted");
        loadNotifications();
        loadSummary();
      }
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

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

  const getPriorityColor = (priority: Priority) => {
    const colorMap = {
      high: "#ff4d4f",
      medium: "#fa8c16",
      low: "#52c41a",
    };
    return colorMap[priority];
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="p-6 font-[gilroy-regular]">
      <Header title="Notifications" />

      <div className="mb-6">
        <Title level={2} style={{ marginBottom: 8 }}>
          Your Notifications
        </Title>
        <Text type="secondary">Stay updated with the latest information</Text>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Notifications"
                value={summary.totalNotifications}
                prefix={<BellOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Unread"
                value={summary.unreadCount}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="High Priority"
                value={summary.priorityBreakdown?.high || 0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Recent (Last 7 days)"
                value={summary.recentCount}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              placeholder="Show"
              value={filter.unreadOnly ? "unread" : "all"}
              onChange={(value) =>
                setFilter({ ...filter, unreadOnly: value === "unread" })
              }
              style={{ width: "100%" }}
            >
              <Option value="all">All</Option>
              <Option value="unread">Unread Only</Option>
            </Select>
          </Col>
          <Col span={5}>
            <Select
              placeholder="Filter by type"
              allowClear
              value={filter.type}
              onChange={(value) => setFilter({ ...filter, type: value })}
              style={{ width: "100%" }}
            >
              <Option value="account_update">Account Update</Option>
              <Option value="project_update">Project Update</Option>
              <Option value="assessment_result">Assessment Result</Option>
              <Option value="system_announcement">System Announcement</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Priority"
              allowClear
              value={filter.priority}
              onChange={(value) => setFilter({ ...filter, priority: value })}
              style={{ width: "100%" }}
            >
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  loadNotifications();
                  loadSummary();
                }}
                loading={loading}
              >
                Refresh
              </Button>
              {summary && summary.unreadCount > 0 && (
                <Button type="primary" onClick={handleMarkAllAsRead}>
                  Mark All Read
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Notifications List */}
      <Card>
        {notifications.length === 0 ? (
          <Empty
            description="No notifications found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            loading={loading}
            dataSource={notifications}
            renderItem={(notification: Notification) => (
              <List.Item
                style={{
                  backgroundColor: notification.isRead ? "#ffffff" : "#f6ffed",
                  border: notification.isRead ? "1px solid #f0f0f0" : "1px solid #d9f7be",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
                onClick={() => handleNotificationClick(notification)}
                actions={[
                  !notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      title="Mark as read"
                    />
                  ),
                  <Popconfirm
                    title="Delete notification"
                    description="Are you sure you want to delete this notification?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      title="Delete"
                      danger
                    />
                  </Popconfirm>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getNotificationIcon(notification.type)}
                      style={{
                        backgroundColor: getNotificationColor(notification.type),
                        color: "#ffffff",
                      }}
                    />
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        strong={!notification.isRead}
                        style={{ fontSize: "16px" }}
                      >
                        {notification.title}
                      </Text>
                      <Space>
                        <Tag color={getPriorityColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {dayjs(notification.createdAt).fromNow()}
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "14px",
                          lineHeight: "1.5",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        {notification.message}
                      </Text>
                      {notification.actionUrl && (
                        <Button
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = notification.actionUrl!;
                          }}
                          style={{ padding: 0 }}
                        >
                          {notification.actionText || "View Details"}
                        </Button>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {/* Pagination */}
        {pagination && pagination.totalCount > 10 && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Pagination
              current={currentPage}
              pageSize={10}
              total={pagination.totalCount}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} notifications`
              }
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserNotifications;