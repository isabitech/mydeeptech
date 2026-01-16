import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BellOutlined,
  UserOutlined,
  GlobalOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAdminNotifications } from "../../../../hooks/Auth/Admin/useAdminNotifications";
import {
  Notification,
  NotificationType,
  Priority,
  NotificationFilters,
} from "../../../../types/notification.types";
import CreateNotificationModal from "./CreateNotificationModal";
import BroadcastNotificationModal from "./BroadcastNotificationModal";
import Header from "../../User/Header";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const NotificationManagement: React.FC = () => {
  const {
    loading,
    error,
    notifications,
    pagination,
    analytics,
    getAllNotifications,
    deleteNotification,
    refreshNotifications,
  } = useAdminNotifications();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    await getAllNotifications(filters);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    refreshNotifications(filters);
    message.success("Notification created successfully!");
  };

  const handleBroadcastSuccess = () => {
    setBroadcastModalOpen(false);
    refreshNotifications(filters);
    message.success("Broadcast notification sent successfully!");
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        message.success("Notification deleted successfully!");
        refreshNotifications(filters);
      } else {
        message.error(result.error || "Failed to delete notification");
      }
    } catch (error) {
      message.error("Failed to delete notification");
    }
  };

  const getTypeColor = (type: NotificationType): string => {
    const colors = {
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

  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      high: "red",
      medium: "orange",
      low: "green",
    };
    return colors[priority];
  };

  const columns: ColumnsType<any> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (title: string, record: any) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.message.length > 100
              ? `${record.message.substring(0, 100)}...`
              : record.message}
          </Text>
        </div>
      ),
    },
    {
      title: "Recipient",
      key: "recipient",
      width: 200,
      render: (_, record: any) => (
        <div>
          <Space>
            {record.recipientType === "all" ? (
              <GlobalOutlined style={{ color: "#1890ff" }} />
            ) : (
              <UserOutlined />
            )}
            <div>
              {record.recipientType === "all" ? (
                <Text>All Users</Text>
              ) : (
                <div>
                  <Text>{record.recipientId?.fullName || "N/A"}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {record.recipientId?.email}
                  </Text>
                </div>
              )}
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type: NotificationType) => (
        <Tag color={getTypeColor(type)}>
          {type.replace("_", " ").toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Account Update", value: "account_update" },
        { text: "Project Update", value: "project_update" },
        { text: "Application Update", value: "application_update" },
        { text: "Assessment Result", value: "assessment_result" },
        { text: "System Alert", value: "system_alert" },
        { text: "System Announcement", value: "system_announcement" },
        { text: "Security Alert", value: "security_alert" },
        { text: "Payment Update", value: "payment_update" },
      ],
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: Priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "High", value: "high" },
        { text: "Medium", value: "medium" },
        { text: "Low", value: "low" },
      ],
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record: any) => (
        <div>
          <Tag color={record.isRead ? "green" : "orange"}>
            {record.isRead ? "Read" : "Unread"}
          </Tag>
          {record.emailSent && (
            <Tag color="blue" style={{ marginTop: 4 }}>
              Email Sent
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <div>
          <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                // Open details modal (to be implemented)
                console.log("View details:", record);
              }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Notification"
            description="Are you sure you want to delete this notification?"
            onConfirm={() => handleDeleteNotification(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      {/* <Header title="Notifications" /> */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Notification Management
          </Title>
          <Text type="secondary">Create and manage platform notifications</Text>
        </div>
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Notification
          </Button>
          <Button
            type="primary"
            icon={<SoundOutlined />}
            onClick={() => setBroadcastModalOpen(true)}
            style={{ backgroundColor: "#722ed1", borderColor: "#722ed1" }}
          >
            Broadcast to All
          </Button>
        </Space>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sent"
                value={analytics.totalSent}
                prefix={<BellOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Read Rate"
                value={analytics.readRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Read"
                value={analytics.totalRead}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Unread"
                value={analytics.totalUnread}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="Filter by type"
              allowClear
              value={filters.type}
              onChange={(value) =>
                setFilters({ ...filters, type: value, page: 1 })
              }
              style={{ width: "100%" }}
            >
              <Option value="account_update">Account Update</Option>
              <Option value="project_update">Project Update</Option>
              <Option value="system_alert">System Alert</Option>
              <Option value="system_announcement">System Announcement</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by priority"
              allowClear
              value={filters.priority}
              onChange={(value) =>
                setFilters({ ...filters, priority: value, page: 1 })
              }
              style={{ width: "100%" }}
            >
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  startDate: dates?.[0]?.format("YYYY-MM-DD"),
                  endDate: dates?.[1]?.format("YYYY-MM-DD"),
                  page: 1,
                });
              }}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refreshNotifications(filters)}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={notifications}
          loading={loading}
          rowKey="_id"
          pagination={
            pagination
              ? {
                current: pagination.currentPage,
                pageSize: filters.limit || 20,
                total: pagination.totalCount,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ["bottomCenter"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                onChange: (page, limit) => {
                  setFilters({ ...filters, page, limit });
                },
              }
              : false
          }
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <CreateNotificationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <BroadcastNotificationModal
        open={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onSuccess={handleBroadcastSuccess}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <Text type="danger">{error}</Text>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;