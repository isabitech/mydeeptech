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
} from "antd";
import {
  PlusSquareOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Header from "../../User/Header";
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

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

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

const PROJECT_STATUSES: ProjectStatus[] = ["active", "completed", "paused", "cancelled"];

const ProjectManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const {
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
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
    });
  };

  // Handle search and filters
  const handleSearch = (value: string) => {
    setSearchText(value);
    getAllProjects({
      search: value || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
    });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    getAllProjects({
      status: value || undefined,
      search: searchText || undefined,
      category: categoryFilter || undefined,
    });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    getAllProjects({
      category: value || undefined,
      search: searchText || undefined,
      status: statusFilter || undefined,
    });
  };

  // Create or Update a Project
  const handleSubmitProject = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateProjectForm = {
        ...values,
        deadline: dayjs(values.deadline).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        applicationDeadline: dayjs(values.applicationDeadline).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        requiredSkills: values.requiredSkills || [],
        languageRequirements: values.languageRequirements || [],
        tags: values.tags || [],
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

  // Delete Project
  const handleDeleteProject = async (id: string) => {
    const result = await deleteProject(id);
    if (result.success) {
      notification.success({ message: "Project deleted successfully!" });
      fetchProjects(); // Refresh the list
    } else {
      notification.error({
        message: "Error Deleting Project",
        description: result.error,
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
        status: project.status,
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
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          active: "green",
          completed: "blue",
          paused: "orange",
          cancelled: "red",
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Applications",
      dataIndex: "totalApplications",
      key: "totalApplications",
      render: (total: number, record: Project) => (
        <span>{total} / {record.maxAnnotators || "∞"}</span>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Project) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => showProjectDetails(record)}
            size="small"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this project?"
            onConfirm={() => handleDeleteProject(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
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
      <Header title="Projects" />
      
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
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} projects`,
          }}
          scroll={{ x: 1200 }}
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
            <Form.Item
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
            </Form.Item>

            <Form.Item
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
            </Form.Item>
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

          {isEditMode && (
            <Form.Item
              name="status"
              label="Project Status"
            >
              <Select placeholder="Select status">
                {PROJECT_STATUSES.map(status => (
                  <Option key={status} value={status}>{status.toUpperCase()}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
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
    </div>
  );
};

export default ProjectManagement;