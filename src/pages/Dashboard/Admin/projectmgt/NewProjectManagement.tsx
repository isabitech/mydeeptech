import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  notification,
  Select,
  InputNumber,
  Tag,
  Card,
  Space,
  Popconfirm,
  Table,
  Alert,
  Spin,
  Descriptions,
  Steps,
  Dropdown,
  Menu,
  Switch,
} from "antd";
import {
  PlusSquareOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  MoreOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Header from "../../User/Header";
import ProjectAnnotators from "./ProjectAnnotators";
import moment from "moment";
import dayjs from "dayjs";
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import {
  Project,
  CreateProjectForm,
  ProjectCategory,
  Currency,
  PayRateType,
  DifficultyLevel,
  ExperienceLevel,
  ProjectStatus,
} from "../../../../types/project.types";
import PageModal from "../../../../components/Modal/PageModal";
import { retrieveTokenFromStorage } from "../../../../helpers";
import { baseURL } from "../../../../store/api/endpoints";

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Step } = Steps;

// Project categories for the new system
const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Text Annotation",
  "Image Annotation",
  "Audio Annotation",
  "Video Annotation",
  "Data Labeling",
  "Content Moderation",
  "Transcription",
  "Translation",
  "Sentiment Analysis",
  "Entity Recognition",
  "Classification",
  "Object Detection",
  "Semantic Segmentation",
  "Survey Research",
  "Data Entry",
  "Quality Assurance",
  "Other",
];

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "NGN", "KES", "GHS"];

const PAY_RATE_TYPES: PayRateType[] = ["per_task", "per_hour", "per_project", "per_annotation"];

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["beginner", "intermediate", "advanced", "expert"];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["none", "beginner", "intermediate", "advanced"];

const PROJECT_STATUSES: ProjectStatus[] = ["active", "completed", "paused", "cancelled", "inactive"];

const ProjectManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAnnotatorsModalVisible, setIsAnnotatorsModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectForAnnotators, setSelectedProjectForAnnotators] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [deletionForm] = Form.useForm();
  const [projectId, setProjectId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>(""); // "true", "false", or "" (all)
  const [openCloseFilter, setOpenCloseFilter] = useState<string>(""); // "open", "close", or "" (all)
  const [toggleLoadingIds, setToggleLoadingIds] = useState<Set<string>>(new Set());
  const [token, setToken] = useState<string | null>(null);

  // Deletion states
  const [isDeletionModalVisible, setIsDeletionModalVisible] = useState(false);
  const [deletionStep, setDeletionStep] = useState(0);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
    requestDeletionOtp,
    verifyDeletionOtp,
    toggleProjectActiveStatus,
    toggleProjectVisibleStatus,
    loading,
    error,
    projects,
    summary,
    resetState,
  } = useAdminProjects();

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    await getAllProjects({
      page: 1,
      limit: 50,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      search: searchText || undefined,
      isActive: activeFilter || undefined,
      openCloseStatus: openCloseFilter || undefined,
    });
  };

  useEffect(() => {
    const getToken = async () => {
      const retrievedToken = await retrieveTokenFromStorage();
      setToken(retrievedToken);
    };
    getToken();
  }, []);

  // Handle search and filters
  const handleSearch = (value: string) => {
    setSearchText(value);
    getAllProjects({
      search: value || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      isActive: activeFilter || undefined,
      openCloseStatus: openCloseFilter || undefined,
    });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    getAllProjects({
      status: value || undefined,
      search: searchText || undefined,
      category: categoryFilter || undefined,
      isActive: activeFilter || undefined,
      openCloseStatus: openCloseFilter || undefined,
    });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    getAllProjects({
      category: value || undefined,
      search: searchText || undefined,
      status: statusFilter || undefined,
      isActive: activeFilter || undefined,
      openCloseStatus: openCloseFilter || undefined,
    });
  };

  const handleActiveFilter = (value: string) => {
    setActiveFilter(value);
    getAllProjects({
      isActive: value || undefined,
      search: searchText || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      openCloseStatus: openCloseFilter || undefined,
    });
  };

  // Handle open/close filter
  const handleOpenCloseFilter = (value: string) => {
    setOpenCloseFilter(value);
    getAllProjects({
      openCloseStatus: value || undefined,
      search: searchText || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      isActive: activeFilter || undefined,
    });
  };

  // Create or Update a Project
  const handleSubmitProject = async () => {
    try {
      const values = await form.validateFields();

      // Exclude status from payload when editing
      const { status, ...formValues } = values;

      const payload: CreateProjectForm = {
        ...formValues,
        deadline: dayjs(formValues.deadline).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        applicationDeadline: dayjs(formValues.applicationDeadline).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        requiredSkills: formValues.requiredSkills || [],
        languageRequirements: formValues.languageRequirements || [],
        tags: formValues.tags || [],
      };

      let result;
      if (isEditMode) {
        result = await updateProject(projectId, payload);
      } else {
        result = await createProject(payload);
      }

      if (result.success) {
        notification.success({
          message: `Project ${isEditMode ? "updated" : "created"} successfully!`,
        });
        form.resetFields();
        setIsModalVisible(false);
        setIsEditMode(false);
        fetchProjects(); // Refresh the list
      } else {
        notification.error({
          message: `Error ${isEditMode ? "Updating" : "Creating"} Project`,
          description: result.error,
        });
      }
    } catch (error: any) {
      notification.error({
        message: `Error ${isEditMode ? "Updating" : "Creating"} Project`,
        description: error.message,
      });
    }
  };

  // Smart Delete Project - checks if project has applications
  const handleDeleteProject = async (project: Project) => {
    setProjectToDelete(project);

    // If project has active applications, use OTP flow
    if (project.totalApplications > 0) {
      setDeletionStep(0);
      setIsDeletionModalVisible(true);
    } else {
      // Direct deletion for projects without applications
      Modal.confirm({
        title: 'Delete Project',
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete "${project.projectName}"? This action cannot be undone.`,
        okText: 'Delete',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk: async () => {
          const result = await deleteProject(project._id);
          if (result.success) {
            notification.success({ message: "Project deleted successfully!" });
            fetchProjects();
          } else {
            notification.error({
              message: "Error Deleting Project",
              description: result.error,
            });
          }
        },
      });
    }
  };

  // Handle OTP Request for Deletion
  const handleRequestDeletionOtp = async () => {
    try {
      const values = await deletionForm.validateFields(['reason']);
      if (!projectToDelete) return;

      const result = await requestDeletionOtp(projectToDelete._id, values.reason);
      if (result.success) {
        notification.success({
          message: "OTP Sent",
          description: "A deletion OTP has been sent to projects@mydeeptech.ng"
        });
        setOtpSent(true);
        setDeletionStep(1);
      } else {
        notification.error({
          message: "Error Requesting OTP",
          description: result.error,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to request deletion OTP",
      });
    }
  };

  // Handle OTP Verification and Final Deletion
  const handleVerifyDeletionOtp = async () => {
    try {
      const values = await deletionForm.validateFields(['otp', 'confirmationMessage']);
      if (!projectToDelete) return;

      const result = await verifyDeletionOtp(
        projectToDelete._id,
        values.otp,
        values.confirmationMessage
      );

      if (result.success) {
        notification.success({
          message: "Project Deleted Successfully",
          description: "The project has been permanently deleted."
        });
        setIsDeletionModalVisible(false);
        resetDeletionState();
        fetchProjects();
      } else {
        notification.error({
          message: "Error Verifying OTP",
          description: result.error,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to verify deletion OTP",
      });
    }
  };

  // Reset deletion modal state
  const resetDeletionState = () => {
    setProjectToDelete(null);
    setDeletionStep(0);
    setOtpSent(false);
    deletionForm.resetFields();
  };

  const handleCancelDeletion = () => {
    setIsDeletionModalVisible(false);
    resetDeletionState();
  };

  // Handle toggle project active status
  const handleToggleActiveStatus = async (project: Project) => {
    // Add to loading set
    setToggleLoadingIds(prev => new Set(prev).add(project._id));

    try {
      const result = await toggleProjectActiveStatus(project._id);

      if (result.success) {
        const newStatus = result.data.project.isActive;
        notification.success({
          message: `Project ${newStatus ? 'Activated' : 'Deactivated'}`,
          description: `"${project.projectName}" has been ${newStatus ? 'activated' : 'deactivated'} successfully.`,
        });
      } else {
        notification.error({
          message: "Error Toggling Project Status",
          description: result.error,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to toggle project status",
      });
    } finally {
      // Remove from loading set
      setToggleLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(project._id);
        return newSet;
      });
    }
  };

  // Export approved annotators to CSV
  const handleExportApprovedAnnotators = async (project: Project) => {
    try {

      if (!token) {
        notification.error({
          message: 'Authentication Error',
          description: 'Please log in again to export data.',
        });
        return;
      }

      // Show loading notification
      const loadingKey = 'exporting';
      notification.info({
        key: loadingKey,
        message: 'Exporting CSV',
        description: 'Preparing approved annotators data...',
        duration: 0,
      });

      // Use the proper base URL for the API call
      const apiBaseUrl = baseURL || 'http://localhost:5000'; // Fallback URL
      const apiUrl = `${apiBaseUrl}/admin/projects/${project._id}/export-approved-csv`;
      console.log('🚀 baseURL:', baseURL);
      console.log('🚀 Final API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Close loading notification
      notification.destroy(loadingKey);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || 'Failed to export CSV');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${project.projectName}_approved_annotators.csv`;
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }
      // Create blob and download
      const blob = await response.blob();
      console.log('📦 Blob size:', blob.size, 'Type:', blob.type);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      notification.success({
        message: 'CSV Exported Successfully',
        description: `Approved annotators data for "${project.projectName}" has been downloaded.`,
      });
    } catch (error: any) {
      console.error('❌ Error exporting CSV:', error);
      notification.error({
        message: 'Export Failed',
        description: error.message || 'Failed to export approved annotators CSV',
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setIsEditMode(false);
  };

  // Show Modal for Create or Update
  const showModal = (project?: Project) => {
    if (project) {
      setIsEditMode(true);
      setProjectId(project._id);
      form.setFieldsValue({
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        projectCategory: project.projectCategory,
        payRate: project.payRate,
        payRateCurrency: project.payRateCurrency,
        payRateType: project.payRateType,
        maxAnnotators: project.maxAnnotators,
        deadline: project.deadline ? dayjs(project.deadline) : null,
        estimatedDuration: project.estimatedDuration,
        difficultyLevel: project.difficultyLevel,
        requiredSkills: project.requiredSkills,
        minimumExperience: project.minimumExperience,
        languageRequirements: project.languageRequirements,
        tags: project.tags,
        applicationDeadline: project.applicationDeadline ? dayjs(project.applicationDeadline) : null,
        projectGuidelineLink: project.projectGuidelineLink,
        projectGuidelineVideo: project.projectGuidelineVideo,
        projectCommunityLink: project.projectCommunityLink,
        projectTrackerLink: project.projectTrackerLink,
      });
    } else {
      form.resetFields();
      setIsEditMode(false);
    }
    setIsModalVisible(true);
  };

  // Show project details
  const showProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalVisible(true);
  };

  // Show project annotators
  const showProjectAnnotators = (project: Project) => {
    console.log({ project });
    setSelectedProjectForAnnotators(project);
    setIsAnnotatorsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      sorter: (a: Project, b: Project) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: "Category",
      dataIndex: "projectCategory",
      key: "projectCategory",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Pay Rate",
      key: "payRate",
      render: (record: Project) => (
        <span>
          {record.payRateCurrency} {record.payRate}/{record.payRateType.replace("_", " ")}
        </span>
      ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      render: (level: string) => {
        const colors = {
          beginner: "green",
          intermediate: "orange",
          advanced: "red",
          expert: "purple",
        };
        return <Tag color={colors[level as keyof typeof colors]}>{level.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (status: boolean) => {
        const colors = {
          true: "green",
          false: "red",
        };
        return <Tag color={colors[status?.toString() as keyof typeof colors]}>{status ? "ACTIVE" : "INACTIVE"}</Tag>;
      },
    },
    {
      title: "Open",
      dataIndex: "openCloseStatus",
      key: "openCloseStatus",
      render: (openCloseStatus: string) => {
        const colors = {
          open: "green",
          close: "red",
        };
        return <Tag color={colors[openCloseStatus as keyof typeof colors]}>{openCloseStatus?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Applications",
      dataIndex: "totalApplications",
      key: "totalApplications",
      render: (total: number, record: Project) => (
        <div className="flex items-center gap-2">
          <span>{total} / {record.maxAnnotators || "∞"}</span>
        </div>
      ),
    },
    {
      title: "Approved Annotators",
      dataIndex: "approvedAnnotators",
      key: "approvedAnnotators",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: Project) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActiveStatus(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          loading={toggleLoadingIds.has(record._id)}
        />
      ),
    },
    {
      title: () => <span className="text-center flex items-center justify-center">Application <br />Status</span>,
      dataIndex: "openCloseStatus",
      key: "openCloseStatus",
      render: (openCloseStatus: Project["openCloseStatus"], record: Project) => (
        <Switch
          checked={openCloseStatus === "open"}
          onChange={() => toggleProjectVisibleStatus(record._id)}
          checkedChildren="Open"
          unCheckedChildren="Closed"
          loading={toggleLoadingIds.has(record._id)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Project) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => showProjectDetails(record),
          },
          {
            key: 'annotators',
            icon: <UserOutlined />,
            label: 'View Annotators',
            onClick: () => showProjectAnnotators(record),
            disabled: record.totalApplications === 0,
          },
          {
            key: 'export',
            icon: <DownloadOutlined />,
            label: 'Export Approved Annotators',
            onClick: () => handleExportApprovedAnnotators(record),
            disabled: record.approvedAnnotators === 0,
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Project',
            onClick: () => showModal(record),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            icon: record.totalApplications > 0 ? <SafetyCertificateOutlined /> : <DeleteOutlined />,
            label: (
              <span style={{ color: '#ff4d4f' }}>
                Delete Project
                {record.totalApplications > 0 && (
                  <Tag color="orange" style={{ marginLeft: 8, fontSize: '12px', padding: '2px 6px' }}>
                    OTP Required
                  </Tag>
                )}
              </span>
            ),
            onClick: () => {
              Modal.confirm({
                title: 'Delete Project',
                icon: <ExclamationCircleOutlined />,
                content: record.totalApplications > 0
                  ? `This project has ${record.totalApplications} active applications. OTP verification will be required.`
                  : `Are you sure you want to delete "${record.projectName}"? This action cannot be undone.`,
                okText: 'Delete',
                cancelText: 'Cancel',
                okButtonProps: { danger: true },
                onOk: () => handleDeleteProject(record),
              });
            },
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                border: 'none',
                boxShadow: 'none',
                background: 'transparent'
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          action={
            <Button size="small" onClick={() => { resetState(); fetchProjects(); }}>
              Retry
            </Button>
          }
          closable
          onClose={resetState}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      {/* <Header title="Projects" /> */}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalProjects}</div>
              <div className="text-gray-600">Total Projects</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.activeProjects}</div>
              <div className="text-gray-600">Active Projects</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{summary.completedProjects}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.pausedProjects}</div>
              <div className="text-gray-600">Paused</div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Space wrap>
          <Search
            placeholder="Search projects..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            {PROJECT_STATUSES.map(status => (
              <Option key={status} value={status}>{status.toUpperCase()}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 200 }}
            onChange={handleCategoryFilter}
          >
            {PROJECT_CATEGORIES.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by visibility"
            allowClear
            style={{ width: 180 }}
            onChange={handleOpenCloseFilter}
            value={openCloseFilter}
          >
            <Option value="open">OPEN</Option>
            <Option value="close">CLOSED</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchProjects}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>

        <Button
          type="primary"
          className="!bg-secondary !border-none !font-[gilroy-regular]"
          onClick={() => showModal()}
          icon={<PlusSquareOutlined />}
        >
          Create New Project
        </Button>
      </div>

      {/* Projects Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="_id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} projects`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>

      {/* Create/Edit Project Modal */}
      <Modal
        title={isEditMode ? "Update Project" : "Create New Project"}
        open={isModalVisible}
        onOk={handleSubmitProject}
        onCancel={handleCancel}
        okText={isEditMode ? "Update" : "Create"}
        cancelText="Cancel"
        width={800}
        okButtonProps={{ loading }}
      >
        <Form form={form} layout="vertical" scrollToFirstError>
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[{ required: true, message: "Please input the project name!" }]}
          >
            <Input placeholder="Enter project name" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="projectDescription"
            label="Project Description"
            rules={[{ required: true, message: "Please input the project description!" }]}
          >
            <TextArea
              placeholder="Describe the project requirements and objectives"
              maxLength={2000}
              showCount
              rows={4}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="projectCategory"
              label="Category"
              rules={[{ required: true, message: "Please select a category!" }]}
            >
              <Select placeholder="Select category">
                {PROJECT_CATEGORIES.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="Difficulty Level"
              rules={[{ required: true, message: "Please select difficulty level!" }]}
            >
              <Select placeholder="Select difficulty">
                {DIFFICULTY_LEVELS.map(level => (
                  <Option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="payRate"
              label="Pay Rate"
              rules={[{ required: true, message: "Please input pay rate!" }]}
            >
              <InputNumber
                placeholder="0.00"
                min={0}
                precision={2}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="payRateCurrency"
              label="Currency"
              rules={[{ required: true, message: "Please select currency!" }]}
            >
              <Select placeholder="Currency">
                {CURRENCIES.map(currency => (
                  <Option key={currency} value={currency}>{currency}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="payRateType"
              label="Pay Rate Type"
              rules={[{ required: true, message: "Please select pay rate type!" }]}
            >
              <Select placeholder="Rate type">
                {PAY_RATE_TYPES.map(type => (
                  <Option key={type} value={type}>{type.replace("_", " ").toUpperCase()}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="maxAnnotators"
              label="Maximum Annotators"
            >
              <InputNumber
                placeholder="Leave empty for unlimited"
                min={1}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="minimumExperience"
              label="Minimum Experience"
              rules={[{ required: true, message: "Please select minimum experience!" }]}
            >
              <Select placeholder="Select experience level">
                {EXPERIENCE_LEVELS.map(level => (
                  <Option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <Form.Item
              name="deadline"
              label="Project Deadline"
              rules={[{ required: true, message: "Please select project deadline!" }]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Select deadline"
                disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
              />
            </Form.Item> */}

            {/* <Form.Item
              name="applicationDeadline"
              label="Application Deadline"
              rules={[{ required: true, message: "Please select application deadline!" }]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Select application deadline"
                disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
              />
            </Form.Item> */}

          </div>

          <Form.Item
            name="estimatedDuration"
            label="Estimated Duration"
            rules={[{ required: true, message: "Please input estimated duration!" }]}
          >
            <Input placeholder="e.g., 4-6 weeks, 2 months" />
          </Form.Item>

          <Form.Item
            name="requiredSkills"
            label="Required Skills"
          >
            <Select
              mode="tags"
              placeholder="Add required skills"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="languageRequirements"
            label="Language Requirements"
          >
            <Select
              mode="tags"
              placeholder="Add language requirements"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Add project tags"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="projectGuidelineLink"
              label="Project Guidelines Link"
              rules={[
                { required: true, message: "Project guidelines link is required" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="https://example.com/guidelines"
                type="url"
              />
            </Form.Item>

            <Form.Item
              name="projectGuidelineVideo"
              label="Project Guidelines Video"
              rules={[
                { required: true, message: "Project guidelines video link is required" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="https://example.com/video"
                type="url"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="projectCommunityLink"
              label="Project Community Link"
              rules={[
                { required: true, message: "Project community link is required" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="https://example.com/community"
                type="url"
              />
            </Form.Item>

            <Form.Item
              name="projectTrackerLink"
              label="Project Tracker Link"
              rules={[
                { required: true, message: "Project tracker link is required" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="https://example.com/tracker"
                type="url"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Project Details Modal */}
      <PageModal
        openModal={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        closable={true}
        className="project-details-modal"
        modalwidth="900px"
      >
        {selectedProject && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.projectName}</h2>
              <div className="flex gap-2">
                <Tag color="blue">{selectedProject.projectCategory}</Tag>
                <Tag color={selectedProject.status === 'active' ? 'green' : 'orange'}>
                  {selectedProject.status.toUpperCase()}
                </Tag>
                <Tag color="purple">{selectedProject.difficultyLevel.toUpperCase()}</Tag>
              </div>
            </div>

            <Card className="mb-6">
              <Descriptions title="Project Information" bordered column={2}>
                <Descriptions.Item label="Description" span={2}>
                  {selectedProject.projectDescription}
                </Descriptions.Item>
                <Descriptions.Item label="Category">{selectedProject.projectCategory}</Descriptions.Item>
                <Descriptions.Item label="Difficulty">{selectedProject.difficultyLevel}</Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {selectedProject.payRateCurrency} {selectedProject.payRate} per {selectedProject.payRateType.replace("_", " ")}
                </Descriptions.Item>
                <Descriptions.Item label="Max Annotators">
                  {selectedProject.maxAnnotators || "Unlimited"}
                </Descriptions.Item>
                <Descriptions.Item label="Applications">{selectedProject.totalApplications}</Descriptions.Item>
                <Descriptions.Item label="Approved">{selectedProject.approvedAnnotators}</Descriptions.Item>
                <Descriptions.Item label="Estimated Duration">{selectedProject.estimatedDuration}</Descriptions.Item>
                <Descriptions.Item label="Minimum Experience">{selectedProject.minimumExperience}</Descriptions.Item>
                <Descriptions.Item label="Project Deadline">
                  {moment(selectedProject.deadline).format("MMMM DD, YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Application Deadline">
                  {moment(selectedProject.applicationDeadline).format("MMMM DD, YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">{selectedProject.createdBy.fullName}</Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {moment(selectedProject.createdAt).format("MMMM DD, YYYY HH:mm")}
                </Descriptions.Item>
                {selectedProject.projectGuidelineLink && (
                  <Descriptions.Item label="Guidelines Link">
                    <a href={selectedProject.projectGuidelineLink} target="_blank" rel="noopener noreferrer">
                      View Guidelines
                    </a>
                  </Descriptions.Item>
                )}
                {selectedProject.projectGuidelineVideo && (
                  <Descriptions.Item label="Guidelines Video">
                    <a href={selectedProject.projectGuidelineVideo} target="_blank" rel="noopener noreferrer">
                      Watch Video
                    </a>
                  </Descriptions.Item>
                )}
                {selectedProject.projectCommunityLink && (
                  <Descriptions.Item label="Community Link">
                    <a href={selectedProject.projectCommunityLink} target="_blank" rel="noopener noreferrer">
                      Join Community
                    </a>
                  </Descriptions.Item>
                )}
                {selectedProject.projectTrackerLink && (
                  <Descriptions.Item label="Tracker Link">
                    <a href={selectedProject.projectTrackerLink} target="_blank" rel="noopener noreferrer">
                      View Tracker
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {selectedProject.requiredSkills?.length > 0 && (
              <Card className="mb-6">
                <div>
                  <strong>Required Skills:</strong>
                  <div className="mt-2">
                    {selectedProject.requiredSkills.map((skill, index) => (
                      <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selectedProject.languageRequirements?.length > 0 && (
              <Card className="mb-6">
                <div>
                  <strong>Language Requirements:</strong>
                  <div className="mt-2">
                    {selectedProject.languageRequirements.map((lang, index) => (
                      <Tag key={index} color="green">{lang}</Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selectedProject.tags?.length > 0 && (
              <Card>
                <div>
                  <strong>Tags:</strong>
                  <div className="mt-2">
                    {selectedProject.tags.map((tag, index) => (
                      <Tag key={index} color="purple">{tag}</Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </PageModal>

      {/* Project Deletion Modal with OTP */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <DeleteOutlined className="text-red-500" />
            <span>Delete Project with Active Applications</span>
          </div>
        }
        open={isDeletionModalVisible}
        onCancel={handleCancelDeletion}
        width={600}
        footer={null}
      >
        <div className="space-y-6">
          <Alert
            message="Security Verification Required"
            description="This project has active applications. An OTP will be sent to projects@mydeeptech.ng for verification."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />

          {projectToDelete && (
            <Card size="small" className="bg-gray-50">
              <div className="space-y-2">
                <div><strong>Project:</strong> {projectToDelete.projectName}</div>
                <div><strong>Applications:</strong> {projectToDelete.totalApplications}</div>
                <div><strong>Status:</strong>
                  <Tag color="blue" className="ml-1">{projectToDelete.status.toUpperCase()}</Tag>
                </div>
              </div>
            </Card>
          )}

          <Steps current={deletionStep} className="mb-6">
            <Step
              title="Request OTP"
              description="Provide reason and request OTP"
              icon={<ExclamationCircleOutlined />}
            />
            <Step
              title="Verify OTP"
              description="Enter OTP and confirm deletion"
              icon={<SafetyCertificateOutlined />}
            />
          </Steps>

          <Form form={deletionForm} layout="vertical">
            {deletionStep === 0 && (
              <div className="space-y-4">
                <Form.Item
                  name="reason"
                  label="Deletion Reason"
                  rules={[
                    { required: true, message: "Please provide a reason for deletion!" },
                    { min: 10, message: "Reason must be at least 10 characters!" }
                  ]}
                >
                  <TextArea
                    placeholder="Please provide a detailed reason for deleting this project..."
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancelDeletion}>Cancel</Button>
                  <Button
                    type="primary"
                    danger
                    onClick={handleRequestDeletionOtp}
                    loading={loading}
                  >
                    Request OTP
                  </Button>
                </div>
              </div>
            )}

            {deletionStep === 1 && (
              <div className="space-y-4">
                {otpSent && (
                  <Alert
                    message="OTP Sent"
                    description="An OTP has been sent to projects@mydeeptech.ng. Please check your email."
                    type="success"
                    showIcon
                    className="mb-4"
                  />
                )}

                <Form.Item
                  name="otp"
                  label="OTP Code"
                  rules={[
                    { required: true, message: "Please enter the OTP!" },
                    { len: 6, message: "OTP must be 6 digits!" },
                    { pattern: /^\d+$/, message: "OTP must contain only numbers!" }
                  ]}
                >
                  <Input
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    size="large"
                    style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '5px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmationMessage"
                  label="Confirmation Message"
                  rules={[
                    { required: true, message: "Please enter confirmation message!" },
                    { min: 5, message: "Confirmation must be at least 5 characters!" }
                  ]}
                >
                  <Input
                    placeholder="Type 'Confirmed deletion' or your confirmation message"
                    size="large"
                  />
                </Form.Item>

                <div className="flex justify-between">
                  <Button onClick={() => setDeletionStep(0)}>Back</Button>
                  <div className="space-x-2">
                    <Button onClick={handleCancelDeletion}>Cancel</Button>
                    <Button
                      type="primary"
                      danger
                      onClick={handleVerifyDeletionOtp}
                      loading={loading}
                    >
                      Confirm Deletion
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </div>
      </Modal>

      {/* Project Annotators Modal */}
      {selectedProjectForAnnotators && (
        <ProjectAnnotators
          projectId={selectedProjectForAnnotators._id}
          projectName={selectedProjectForAnnotators.projectName}
          visible={isAnnotatorsModalVisible}
          onClose={() => {
            setIsAnnotatorsModalVisible(false);
            setSelectedProjectForAnnotators(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectManagement;