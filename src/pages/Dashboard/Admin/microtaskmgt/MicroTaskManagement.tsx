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
  Statistic,
  Dropdown,
  Tabs,
  Avatar,
} from "antd";
import {
  PlusSquareOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  BarChartOutlined,
  EditOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import axiosInstance from "../../../../service/axiosApi";
import { endpoints } from "../../../../store/api/endpoints";
import { microTaskAdminQueryService, microTaskMutationService, microTaskQueryService } from "../../../../services/micro-task-service";
import { getErrorMessage } from "../../../../service/apiUtils";
import { BaseTaskSchema, TaskSchema } from "../../../../validators/task/task-schema";
import { UserSchema } from "../../../../validators/users/users-schema";
import { TaskAssignmentSchema } from "../../../../validators/task/assigned-task-schema";
import { TaskStatus } from "../../../../services/micro-task-service/micro-task-query";
import { TaskApplicationSchema } from "../../../../validators/task/task-filters";

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
  { value: "pending", label: "Pending", color: "default" },
  { value: "active", label: "Active", color: "success" },
  { value: "ongoing", label: "Ongoing", color: "success" },
  { value: "paused", label: "Paused", color: "warning" },
  { value: "completed", label: "Completed", color: "blue" },
  { value: "cancelled", label: "Cancelled", color: "error" }
];


interface MicroTaskStatistics {
  tasks: {
    total: number;
    active: number;
    draft: number;
    pending: number;
    ongoing: number;
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
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Partial<BaseTaskSchema> | null>(null);
  const [taskToAssign, setTaskToAssign] = useState<Partial<BaseTaskSchema> | null>(null);
  const [statistics, setStatistics] = useState<MicroTaskStatistics | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<BaseTaskSchema> | null>(null);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAssignUserIds, setSelectedAssignUserIds] = useState<string[]>([]);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });


  const {
    tasks: tasksData,
    tasksRefetch,
    isTasksLoading,
    isTasksFetching
  } = microTaskAdminQueryService.useGetAllMicroTasksAdmin(
    pagination.current, 
    pagination.pageSize, 
    {
      status: filterStatus !== "all" ? filterStatus : undefined,
      category: filterCategory !== "all" ? filterCategory : undefined,
      search: searchText || undefined
    }
  );

  const { createTaskMutation, isCreateTaskLoading } = microTaskMutationService.useCreateMicroTask();
  const { updateTaskMutation, isUpdateTaskLoading } = microTaskMutationService.useUpdateMicroTask();
  const { assignTaskToUsersMutation, isAssignTaskToUsersLoading } = microTaskMutationService.useAssignTaskToUsers();
  const { approveOrRejectApplicationMutation } = microTaskMutationService.useApproveOrRejectApplication();

  const { 
    assignedTasks, 
    isAssignedTasksLoading,
    assignedTasksRefetch,
     pagination: taskUsersPagination
  }  = microTaskAdminQueryService.useGetAssignedTaskToUsers(taskToAssign?._id || "", pagination.current, pagination.pageSize);
  const { 
    paginatedUsers,
    pagination: usersPagination,
    isPaginatedUsersLoading,
    isPaginatedUsersFetching,
  }  = microTaskAdminQueryService.useGetPaginatedUsers(pagination.current, pagination.pageSize, searchQuery);

  const { allFilters, allFiltersRefetch, isAllFiltersLoading, isAllFiltersFetching } = microTaskQueryService.useGetTasksByFilter({ 
    page: 1, limit: 10, status: taskStatus, search: search || undefined
  });

  useEffect(() => {
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, filterStatus, filterCategory, searchText]);

  // Sync pagination total with service data
  useEffect(() => {
    if (usersPagination?.total !== undefined) {
      setPagination(prev => ({
        ...prev,
        total: usersPagination.total
      }));
    }
  }, [usersPagination]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Reset search when modal closes
  const handleModalClose = () => {
    setIsAssignModalVisible(false);
    setTaskToAssign(null);
    assignForm.resetFields();
    setSearch(""); // Reset search
    setSearchQuery(""); // Reset search query
    setSelectedUserIds([]); // Reset selected users
    setSelectedAssignUserIds([]); // Reset assign selected users
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

  const handleUpdateTask = async (taskId: string, taskData: Partial<BaseTaskSchema>) => {
    console.log("Updating task with data:", taskData);
    updateTaskMutation.mutate({ taskId, taskData }, {
      onSuccess: () => {
        notification.success({
          message: "Success",
          description: "Micro task updated successfully",
          key: "updateTaskSuccess"
        });
        setIsModalVisible(false);
        setIsEditMode(false);
        setEditingTask(null);
        form.resetFields();
        tasksRefetch();
        fetchStatistics();
      },
      onError: (error) => {
        const errMsg = getErrorMessage(error);
        notification.error({
          message: "Error",
          description: errMsg || "Failed to update micro task",
          key: "updateTaskError"
        });
      }
    });
  }

  const handleCreateTask = async (values: TaskSchema) => {
       // Handle create
      createTaskMutation.mutate(values, {
        onSuccess: () => {
          notification.success({
            message: "Success",
            description: "Micro task created successfully",
            key: "createTaskSuccess"
          });
          setIsModalVisible(false);
          form.resetFields();
          tasksRefetch();
          fetchStatistics();
        },
        onError: (error) => {
          const errMsg = getErrorMessage(error);
          notification.error({
            message: "Error",
            description: errMsg || "Failed to create micro task",
            key: "createTaskError"
          });
        }
      });
  };

  const handleApproveOrRejectApplication = async (applicationId: string, action: "approve" | "reject") => {
    try {
         await approveOrRejectApplicationMutation.mutateAsync({ applicationId, action });
          notification.success({
            message: "Success",
            description: action === "approve" ? "Application approved successfully" : "Application rejected successfully",
            key: "updateApplicationStatusSuccess"
        });
        allFiltersRefetch();
    } catch (error) {
        const errMsg = getErrorMessage(error);
        notification.error({
          message: "Error",
          description: errMsg || "Failed to update application status",
          key: "updateApplicationStatusError"
        });
    }
  }


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
            tasksRefetch();
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

  const handleEditTask = (task: Partial<BaseTaskSchema>) => {
    setEditingTask(task);
    setIsEditMode(true);
    
    // Pre-populate form with task data
    form.setFieldsValue({
      taskTitle: task.taskTitle || task.taskTitle,
      description: task.description ?? undefined,
      category: task.category,
      payRate: task.payRate,
      currency: task.currency,
      maxParticipants: task.maxParticipants,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      instructions: task.instructions,
      quality_guidelines: task.quality_guidelines
    });
    setIsModalVisible(true);
  };

  const handleAssignTask = (task: Partial<BaseTaskSchema>) => {
    setTaskToAssign(task);
    setIsAssignModalVisible(true);
  };


  const handleAssignUsers = async (values?: { userIds: string[] }) => {
    if (!taskToAssign) return;
    
    // Use selected users from checkboxes if no form values provided
    const userIds = values?.userIds || selectedAssignUserIds;
    
    if (userIds.length === 0) {
      notification.warning({
        message: "No Users Selected",
        description: "Please select at least one user to assign"
      });
      return;
    }
    
    assignTaskToUsersMutation.mutate(
      {
        taskId: taskToAssign._id!,
        userIds: userIds
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Success",
            description: "Task assigned to users successfully"
          });
          setSelectedAssignUserIds([]);
          assignForm.resetFields();
          assignedTasksRefetch();
        },
        onError: (error) => {
          const errMsg = getErrorMessage(error);
          notification.error({
            message: "Error",
            description: errMsg || "Failed to assign task to users"
          });
        }
      }
    );
  };

  const handleBulkRemoveUsers = async () => {
    if (!taskToAssign || selectedUserIds.length === 0) return;
  };


  const columns: ColumnsType<TaskSchema> = [
    {
      title: "Task Title",
      dataIndex: "taskTitle",
      key: "taskTitle",
      render: (_: unknown, record: TaskSchema) => (
        <div className="flex flex-col">
          <div className="font-bold">{record.taskTitle}</div>
          <span className="text-gray-400 text-xs"> {record?.category}</span>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (_: unknown, record: TaskSchema) => (
       <span className="font-bold">{ record.createdBy ? record.createdBy?.fullName : "N/A"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_: string, record: TaskSchema ) => record.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Pay Rate",
      dataIndex: "payRate",
      key: "payRate",
      render: (rate: number, record: TaskSchema) => (
        `${record.currency} ${rate}`
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: TaskSchema) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Task',
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Task',
          },
          {
            key: 'assign',
            icon: <UserAddOutlined />,
            label: 'Assign Task',
          },
          {
            type: 'divider' as const
          },
           {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete Task',
          }
        ];

      const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
          case "view":
            setSelectedTask(record);
            setIsDetailModalVisible(true);
            break;

          case "edit":
            handleEditTask(record);
            break;

          case "assign":
            handleAssignTask(record);
            break;

          case "delete":
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

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          defaultActiveKey="tasks"
          items={[
            {
              key: 'tasks',
              label: 'Tasks',
              children: (
                <div>
                  {/* Tasks Controls */}
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
                          loading={isTasksFetching || isTasksLoading}
                          onClick={tasksRefetch}
                        >
                          Refresh
                        </Button>
                      </Col>
                      <Col span={4}>
                        <Button
                          type="primary"
                          icon={<PlusSquareOutlined />}
                          onClick={() => {
                            setIsEditMode(false);
                            setEditingTask(null);
                            form.resetFields();
                            setIsModalVisible(true);
                          }}
                        >
                          Create Task
                        </Button>
                      </Col>
                    </Row>
                  </Card>

                  {/* Tasks Table */}
                  <Table
                    dataSource={tasksData}
                    columns={columns}
                    loading={isTasksLoading || isTasksFetching}
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
                </div>
              ),
            },
            {
              key: 'applications',
              label: 'Applications',
              children: (
                <div>
                  {/* Applications Content */}
                  <Row gutter={16} align="middle" style={{ marginBottom: 20 }}>
                    <Col span={8}>
                      <Search
                        placeholder="Search applications..."
                        allowClear
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Filter by status"
                        defaultValue="all"
                        onChange={(value) => setTaskStatus(value.trim() as TaskStatus)}
                      >
                        <Option value="all">All Status</Option>
                        <Option value="pending">Pending</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="ongoing">Ongoing</Option>
                        <Option value="approved">Approved</Option>
                        <Option value="processing">Processing</Option>
                        <Option value="active">Active</Option>
                        <Option value="paused">Paused</Option>
                        <Option value="cancelled">Cancelled</Option>
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Button
                        icon={<ReloadOutlined />}
                        loading={isAllFiltersLoading || isAllFiltersFetching}
                        onClick={allFiltersRefetch}
                      >
                        Refresh
                      </Button>
                    </Col>
                    <Col span={4}>
                      {/* Additional actions can be added here */}
                    </Col>
                  </Row>

                  {/* Applications Table */}
                  <Table
                    dataSource={Array.isArray(allFilters) ? allFilters : []}
                    loading={isAllFiltersLoading || isAllFiltersFetching}
                    rowKey="_id"
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      position: ["bottomCenter"],
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} applications`,
                    }}
                    columns={[
                      {
                        title: "Applicant",
                        dataIndex: "applicant",
                        key: "applicant",
                        render: (applicant) => {
                          return (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar size="small" style={{ marginRight: 8 }}>
                              {applicant?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{applicant?.fullName || 'Unknown'}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {applicant?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        )
                        },
                      },
                      {
                        title: "Task",
                        dataIndex: "task",
                        key: "task",
                        render: (task: TaskSchema) => (
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{task?.taskTitle || 'Unknown Task'}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {task?.category || 'No category'}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: "Status",
                        dataIndex: "status",
                        key: "status",
                        render: (status: string) => {
                          const statusColors: Record<string, string> = {
                            in_progress: 'processing',
                            completed: 'success',
                            under_review: 'warning',
                            approved: 'success',
                            rejected: 'error',
                          };
                          return <Tag color={statusColors[status] || 'default'}>{status?.replace('_', ' ').toUpperCase()}</Tag>;
                        },
                      },
                      {
                        title: "Submitted",
                        dataIndex: "submittedAt",
                        key: "submittedAt",
                        render: (date: string) => date ? dayjs(date).format("MMM DD, YYYY") : 'Not submitted',
                      },
                      {
                        title: "Actions",
                        key: "actions",
                        render: (_: unknown, record: TaskApplicationSchema) => {
                          const menuItems = [
                            {
                              key: 'view',
                              icon: <EyeOutlined />,
                              label: 'View Submission',
                            },
                            {
                              key: 'approve',
                              icon: <EditOutlined />,
                              label: 'Approve',
                            },
                            {
                              key: 'reject',
                              icon: <DeleteOutlined />,
                              label: 'Reject',
                            }
                          ];

                          const handleMenuClick = ({ key }: { key: string }) => {
                            switch (key) {
                              case "view":
                                console.log("View submission for:", record._id);
                                break;
                              case "approve":
                                Modal.confirm({
                                  title: "Approve Application",
                                  content: `Are you sure you want to approve this application from ${record.applicant?.fullName || 'this user'}?`,
                                  icon: <ExclamationCircleOutlined />,
                                  okText: "Approve",
                                  okType: "primary",
                                  cancelText: "Cancel",
                                  onOk: () => {
                                    return handleApproveOrRejectApplication(record._id, "approve");
                                  }
                                });
                                break;
                              case "reject":
                                Modal.confirm({
                                  title: "Reject Application",
                                  content: `Are you sure you want to reject this application from ${record.applicant?.fullName || 'this user'}? This action cannot be undone.`,
                                  icon: <ExclamationCircleOutlined />,
                                  okText: "Reject",
                                  okType: "danger",
                                  cancelText: "Cancel",
                                  onOk: () => {
                                    return handleApproveOrRejectApplication(record._id, "reject");
                                  }
                                });
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
                              />
                            </Dropdown>
                          );
                        },
                      },
                    ]}
                    locale={{
                      emptyText: (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                          <Text type="secondary">No applications found</Text>
                        </div>
                      ),
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Create/Edit Task Modal */}
      <Modal
        title={isEditMode ? "Edit Micro Task" : "Create New Micro Task"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={() => {
            if(isEditMode && editingTask) {
              handleUpdateTask(editingTask._id as string, form.getFieldsValue() as Partial<BaseTaskSchema>);
            } else {
              handleCreateTask(form.getFieldsValue() as TaskSchema);
            }
          }}
        >
          <Form.Item
            name="taskTitle"
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
                name="currency"
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
                name="dueDate"
                label="DueDate (Optional)"
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
            <Space style={{ display: "flex", justifyContent: "end" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setIsEditMode(false);
                  setEditingTask(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>

               <Button
                type="primary"
                htmlType="submit"
                loading={isUpdateTaskLoading || isCreateTaskLoading}
              >
                {isEditMode ? "Update Task" : "Create Task"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          title={`Task Details: ${selectedTask.taskTitle}`}
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
              <strong>{selectedTask.taskTitle}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {selectedTask.category}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedTask.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Pay Rate">
              <strong>{selectedTask.currency} {selectedTask.payRate}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Required Images">
              {selectedTask.totalImagesRequired ? `${selectedTask.totalImagesRequired} images` : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Max Participants">
              {selectedTask?.maxParticipants || "Unlimited"}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {selectedTask.dueDate ? 
                dayjs(selectedTask.dueDate).format("MMM DD, YYYY HH:mm") : 
                "No due date"
              }
            </Descriptions.Item>
            
            <Descriptions.Item label="Created By">
              { selectedTask.createdBy ? selectedTask.createdBy.fullName : "N/A" }
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              {dayjs(selectedTask.createdAt).format("MMM DD, YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedTask?.description ?? "No description provided"}
            </Descriptions.Item>
          </Descriptions>

        </Modal>
      )}

      {/* Assign Task Modal */}
      <Modal
        title={`Assign Task: ${taskToAssign?.taskTitle}`}
        open={isAssignModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
  <Tabs
    defaultActiveKey="assigned"
    items={[
      {
        key: 'assigned',
        label: 'Tasks with Users',
        children: (
          <div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong>Assigned Users ({assignedTasks.length})</Text>
              {selectedUserIds.length > 0 && (
                <Button danger size="small" onClick={handleBulkRemoveUsers}>
                  Remove Selected ({selectedUserIds.length})
                </Button>
              )}
            </div>

            {isAssignedTasksLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading users...
              </div>
            ) : assignedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No users assigned to this task yet
              </div>
            ) : (
              <Table
                dataSource={assignedTasks}
                rowKey="_id"
                size="small"
                pagination={{
                  current: taskUsersPagination?.page || 1,
                  pageSize: taskUsersPagination?.limit || 10,
                  total: taskUsersPagination?.total || 0,
                  size: 'small',
                  showSizeChanger: false,
                  showQuickJumper: false,
                  position: ['bottomCenter'],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} assigned users`,
                  onChange: (page, pageSize) => {
                    setPagination((prev) => ({
                      ...prev,
                      current: page,
                      pageSize: pageSize || 10,
                    }));
                  },
                }}
                scroll={{ x: 'max-content' }}
                loading={isAssignedTasksLoading}
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys: selectedUserIds,
                  onChange: (selectedRowKeys: React.Key[]) => {
                    setSelectedUserIds(selectedRowKeys as string[]);
                  },
                  getCheckboxProps: (record: TaskAssignmentSchema) => ({
                    disabled: false,
                    name: record.assignedTo?.fullName || 'Unknown',
                  }),
                  columnWidth: 50,
                }}
                columns={[
                  {
                    title: 'User',
                    key: 'user',
                    render: (_, record: TaskAssignmentSchema) => (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size="small" style={{ marginRight: 8 }}>
                          {record.assignedTo?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{record.assignedTo?.fullName || 'Unknown'}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.assignedTo?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'Assigned Date',
                    dataIndex: 'assignedAt',
                    key: 'assignedAt',
                    render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_: unknown, record: TaskAssignmentSchema) => (
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() => {
                          Modal.confirm({
                            title: 'Remove User',
                            content: `Are you sure you want to remove ${record.assignedTo?.fullName || 'this user'} from this task?`,
                            onOk: () => {},
                          });
                        }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </div>
        ),
      },
      {
        key: 'assign',
        label: 'Assign Task to Users',
        children: (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>All Available Users</Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  (Browse all users who can be assigned to tasks)
                </Text>
              </div>
              {selectedAssignUserIds.length > 0 && (
                <Button 
                  type="primary"
                  size="small"
                  onClick={() => handleAssignUsers()}
                  loading={isAssignTaskToUsersLoading}
                >
                  Assign Selected ({selectedAssignUserIds.length})
                </Button>
              )}
            </div>

              <div style={{ marginBottom: 16 }}>
                <Search
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={handleSearchChange}
                  onSearch={setSearchQuery}
                  allowClear
                  loading={isPaginatedUsersLoading || isPaginatedUsersFetching}
                  style={{ width: '100%' }}
                />
              </div>

              <Table
                dataSource={paginatedUsers}
                loading={isPaginatedUsersLoading}
                rowKey="_id"
                size="small"
                scroll={{ y: 300, x: 'max-content' }}
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys: selectedAssignUserIds,
                  onChange: (selectedRowKeys: React.Key[]) => {
                    setSelectedAssignUserIds(selectedRowKeys as string[]);
                  },
                  getCheckboxProps: (record: TaskAssignmentSchema["assignedTo"]) => ({
                    disabled: assignedTasks.some(assigned => assigned.assignedTo?._id === record._id),
                    name: record.fullName,
                  }),
                  columnWidth: 50,
                }}
                pagination={{
                  current: usersPagination?.page || 1,
                  pageSize: usersPagination?.limit || 10,
                  total: usersPagination?.total || 0,
                  size: 'small',
                  showSizeChanger: false,
                  showQuickJumper: false,
                  position: ['bottomCenter'],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`,
                  onChange: (page, pageSize) => {
                    setPagination((prev) => ({
                      ...prev,
                      current: page,
                      pageSize: pageSize || 10,
                    }));
                  },
                }}
                columns={[
                  {
                    title: 'Full Name',
                    dataIndex: 'fullName',
                    key: 'fullName',
                    render: (name: string) => (
                      <div className="capitalize flex items-center">
                        <Avatar size="small" className="mr-2 size-6 shrink-0">
                          {name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <span>{name}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                  },
                  {
                    title: 'Country',
                    dataIndex: 'personal_info',
                    key: 'country',
                    render: (personalInfo: UserSchema['personal_info']) =>
                      personalInfo?.country || 'N/A',
                  },
                ]}
              />
          </div>
        ),
      },
    ]}
  />
      </Modal>
    </div>
  );
};

export default MicroTaskManagement;