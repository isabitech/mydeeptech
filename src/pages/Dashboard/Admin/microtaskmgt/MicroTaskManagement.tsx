import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  notification,
  Select,
  InputNumber,
  Tag,
  Card,
  Space,
  Table,
  Descriptions,
  Typography,
  Row,
  Col,
  DatePicker,
  Divider,
  Progress,
  Statistic,
  Dropdown,
} from "antd";
import {
  PlusSquareOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CopyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import moment from "moment";
import axiosInstance from "../../../../service/axiosApi";
import { endpoints } from "../../../../store/api/endpoints";

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Micro Task Categories
const MICRO_TASK_CATEGORIES = [
  { value: "mask_collection", label: "Mask Collection (20 images)", description: "Collect 20 face mask images with different angles" },
  { value: "age_progression", label: "Age Progression (15 images)", description: "Collect 15 images across different time periods" }
];

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "GHS"];

const TASK_STATUSES = [
  { value: "draft", label: "Draft", color: "default" },
  { value: "active", label: "Active", color: "success" },
  { value: "paused", label: "Paused", color: "warning" },
  { value: "completed", label: "Completed", color: "blue" },
  { value: "cancelled", label: "Cancelled", color: "error" }
];

interface MicroTask {
  _id: string;
  title: string;
  description: string;
  category: "mask_collection" | "age_progression";
  required_count: number;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  payRate: number;
  payRateCurrency: string;
  maxParticipants: number | null;
  deadline: string | null;
  createdBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
  submissionStats: {
    total: number;
    in_progress: number;
    completed: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

interface MicroTaskFormData {
  title: string;
  description: string;
  category: "mask_collection" | "age_progression";
  payRate: number;
  payRateCurrency: string;
  maxParticipants?: number;
  deadline?: string;
  instructions?: string;
  quality_guidelines?: string;
}

interface MicroTaskStatistics {
  tasks: {
    total: number;
    active: number;
    draft: number;
    paused: number;
    completed: number;
    cancelled: number;
  };
  submissions: {
    total: number;
    in_progress: number;
    completed: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
}

const MicroTaskManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MicroTask | null>(null);
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [statistics, setStatistics] = useState<MicroTaskStatistics | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, filterStatus, filterCategory, searchText]);

  const fetchTasks = async () => {
    setTableLoading(true);
    try {
      const params = {
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterCategory !== "all" && { category: filterCategory }),
        ...(searchText && { search: searchText })
      };

      const response = await axiosInstance.get(endpoints.microTasks.getAllTasks, { params });

      if (response.data.success) {
        setTasks(response.data.data.tasks);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total_items
        }));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch micro tasks"
      });
    } finally {
      setTableLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axiosInstance.get(endpoints.microTasks.getStatistics);

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleCreateTask = async (values: MicroTaskFormData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(endpoints.microTasks.createTask, values);

      if (response.data.success) {
        notification.success({
          message: "Success",
          description: "Micro task created successfully"
        });
        setIsModalVisible(false);
        form.resetFields();
        fetchTasks();
        fetchStatistics();
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to create micro task"
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      notification.error({
        message: "Error",
        description: "Failed to create micro task"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await axiosInstance.patch(`${endpoints.microTasks.updateTaskStatus}/${taskId}/status`, { status });

      if (response.data.success) {
        notification.success({
          message: "Success",
          description: `Task ${status} successfully`
        });
        fetchTasks();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      notification.error({
        message: "Error",
        description: "Failed to update task status"
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Modal.confirm({
      title: "Delete Micro Task",
      content: "Are you sure you want to delete this micro task? This action cannot be undone and will delete all associated submissions and images.",
      icon: <ExclamationCircleOutlined />,
      okType: "danger",
      onOk: async () => {
        try {
          const response = await axiosInstance.delete(`${endpoints.microTasks.deleteTask}/${taskId}`);

          if (response.data.success) {
            notification.success({
              message: "Success",
              description: "Micro task deleted successfully"
            });
            fetchTasks();
            fetchStatistics();
          }
        } catch (error) {
          console.error("Error deleting task:", error);
          notification.error({
            message: "Error",
            description: "Failed to delete micro task"
          });
        }
      }
    });
  };

  const handleDuplicateTask = async (task: MicroTask) => {
    try {
      const response = await axiosInstance.post(`${endpoints.microTasks.duplicateTask}/${task._id}/duplicate`, {
        title: `${task.title} (Copy)`
      });

      if (response.data.success) {
        notification.success({
          message: "Success",
          description: "Task duplicated successfully"
        });
        fetchTasks();
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
      notification.error({
        message: "Error",
        description: "Failed to duplicate task"
      });
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
    return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryConfig = MICRO_TASK_CATEGORIES.find(c => c.value === category);
    return categoryConfig?.label || category;
  };

  const columns: ColumnsType<MicroTask> = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: MicroTask) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ color: "#666", fontSize: "12px" }}>
            {getCategoryLabel(record.category)}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Pay Rate",
      dataIndex: "payRate",
      key: "payRate",
      render: (rate: number, record: MicroTask) => (
        `${record.payRateCurrency} ${rate}`
      ),
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record: MicroTask) => {
        const stats = record.submissionStats;
        const total = stats.total;
        const maxParticipants = record.maxParticipants;
        
        return (
          <div>
            <div>{total} submissions</div>
            {maxParticipants && (
              <Progress 
                percent={Math.round((total / maxParticipants) * 100)} 
                size="small" 
                status={total >= maxParticipants ? "success" : "active"}
                format={() => `${total}/${maxParticipants}`}
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Review Status",
      key: "reviewStatus",
      render: (_, record: MicroTask) => {
        const stats = record.submissionStats;
        return (
          <div>
            <div>{stats.approved} approved</div>
            <div>{stats.under_review} pending</div>
            {stats.rejected > 0 && <div>{stats.rejected} rejected</div>}
          </div>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: MicroTask) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
          },
          {
            key: 'duplicate',
            icon: <CopyOutlined />,
            label: 'Duplicate',
          },
          {
            type: 'divider' as const
          }
        ];

        // Add status-specific actions
        if (record.status === "draft") {
          menuItems.push({
            key: 'activate',
            icon: <PlayCircleOutlined />,
            label: 'Activate',
          });
        }

        if (record.status === "active") {
          menuItems.push({
            key: 'pause',
            icon: <PauseCircleOutlined />,
            label: 'Pause',
          });
        }

        if (record.status === "paused") {
          menuItems.push({
            key: 'resume',
            icon: <PlayCircleOutlined />,
            label: 'Resume',
          });
        }

        if (["active", "paused"].includes(record.status)) {
          menuItems.push({
            key: 'complete',
            icon: <StopOutlined />,
            label: 'Complete',
          });
        }

        // Add delete action
        menuItems.push(
          {
            type: 'divider' as const
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
          }
        );

        const handleMenuClick = ({ key }: { key: string }) => {
          switch (key) {
            case 'view':
              setSelectedTask(record);
              setIsDetailModalVisible(true);
              break;
            case 'duplicate':
              handleDuplicateTask(record);
              break;
            case 'activate':
              handleUpdateTaskStatus(record._id, "active");
              break;
            case 'pause':
              handleUpdateTaskStatus(record._id, "paused");
              break;
            case 'resume':
              handleUpdateTaskStatus(record._id, "active");
              break;
            case 'complete':
              handleUpdateTaskStatus(record._id, "completed");
              break;
            case 'delete':
              handleDeleteTask(record._id);
              break;
            default:
              break;
          }
        };

        return (
          <Dropdown
            menu={{ 
              items: menuItems,
              onClick: handleMenuClick
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.preventDefault()}
            >
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2}>Micro Task Management</Title>
        <Text type="secondary">
          Create and manage structured micro tasks for data collection
        </Text>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={statistics.tasks.total}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Active Tasks"
                value={statistics.tasks.active}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Submissions"
                value={statistics.submissions.total}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Review"
                value={statistics.submissions.under_review}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Controls */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Search
              placeholder="Search tasks..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter by status"
            >
              <Option value="all">All Status</Option>
              {TASK_STATUSES.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              style={{ width: "100%" }}
              value={filterCategory}
              onChange={setFilterCategory}
              placeholder="Filter by category"
            >
              <Option value="all">All Categories</Option>
              {MICRO_TASK_CATEGORIES.map(category => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTasks}
            >
              Refresh
            </Button>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<PlusSquareOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Create Task
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tasks Table */}
      <Card>
        <Table
          dataSource={tasks}
          columns={columns}
          loading={tableLoading}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} tasks`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10
              }));
            }
          }}
        />
      </Card>

      {/* Create Task Modal */}
      <Modal
        title="Create New Micro Task"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[
              { required: true, message: "Please enter task title" },
              { min: 3, max: 200, message: "Title must be 3-200 characters" }
            ]}
          >
            <Input placeholder="Enter descriptive task title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter description" },
              { min: 10, max: 2000, message: "Description must be 10-2000 characters" }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Detailed description of the task requirements"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Task Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select task category">
              {MICRO_TASK_CATEGORIES.map(category => (
                <Option key={category.value} value={category.value}>
                  <div>
                    <div>{category.label}</div>
                    <div style={{ color: "#666", fontSize: "12px" }}>
                      {category.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payRate"
                label="Pay Rate"
                rules={[
                  { required: true, message: "Please enter pay rate" },
                  { type: "number", min: 0, message: "Pay rate must be positive" }
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter pay rate"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payRateCurrency"
                label="Currency"
                rules={[{ required: true, message: "Please select currency" }]}
              >
                <Select placeholder="Select currency">
                  {CURRENCIES.map(currency => (
                    <Option key={currency} value={currency}>{currency}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label="Max Participants (Optional)"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Leave empty for unlimited"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deadline"
                label="Deadline (Optional)"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  showTime
                  placeholder="Select deadline"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="instructions"
            label="Task Instructions (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Detailed instructions for participants"
            />
          </Form.Item>

          <Form.Item
            name="quality_guidelines"
            label="Quality Guidelines (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Quality standards and acceptance criteria"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                Create Task
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          title={`Task Details: ${selectedTask.title}`}
          open={isDetailModalVisible}
          onCancel={() => {
            setIsDetailModalVisible(false);
            setSelectedTask(null);
          }}
          footer={null}
          width={800}
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Title" span={2}>
              {selectedTask.title}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {getCategoryLabel(selectedTask.category)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedTask.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Pay Rate">
              {selectedTask.payRateCurrency} {selectedTask.payRate}
            </Descriptions.Item>
            <Descriptions.Item label="Required Images">
              {selectedTask.required_count}
            </Descriptions.Item>
            <Descriptions.Item label="Max Participants">
              {selectedTask.maxParticipants || "Unlimited"}
            </Descriptions.Item>
            <Descriptions.Item label="Deadline">
              {selectedTask.deadline ? 
                moment(selectedTask.deadline).format("MMM DD, YYYY HH:mm") : 
                "No deadline"
              }
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedTask.description}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {selectedTask.createdBy.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              {moment(selectedTask.createdAt).format("MMM DD, YYYY HH:mm")}
            </Descriptions.Item>
          </Descriptions>

          <Divider>Submission Statistics</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="Total Submissions"
                value={selectedTask.submissionStats.total}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Completed"
                value={selectedTask.submissionStats.completed}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Under Review"
                value={selectedTask.submissionStats.under_review}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Statistic
                title="Approved"
                value={selectedTask.submissionStats.approved}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="In Progress"
                value={selectedTask.submissionStats.in_progress}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Rejected"
                value={selectedTask.submissionStats.rejected}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        </Modal>
      )}
    </div>
  );
};

export default MicroTaskManagement;