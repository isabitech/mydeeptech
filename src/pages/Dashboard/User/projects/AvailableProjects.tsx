import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Tag,
  Select,
  Alert,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Empty,
} from "antd";
import {
  ArrowsAltOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserProjects } from "../../../../hooks/Auth/User/Projects/useUserProjects";
import {
  Project,
  ProjectCategory,
  DifficultyLevel,
  ApplyToProjectForm,
  Availability,
} from "../../../../types/project.types";

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

// Project categories for filtering
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

const DIFFICULTY_LEVELS: DifficultyLevel[] = ["beginner", "intermediate", "advanced", "expert"];

const AVAILABILITY_OPTIONS: Availability[] = ["full_time", "part_time", "flexible"];


const statusMap = {
  open: "Open",
  close: "Closed",
};

const AvailableProjects = () => {
  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [minPayRate, setMinPayRate] = useState<number | undefined>();
  const [maxPayRate, setMaxPayRate] = useState<number | undefined>();
  const [applicationForm] = Form.useForm();

  const {
    browseProjects,
    applyToProject,
    loading,
    error,
    projects,
    userStats,
    resetState,
  } = useUserProjects();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    await browseProjects({
      page: 1,
      limit: 50,
      category: categoryFilter || undefined,
      difficultyLevel: difficultyFilter || undefined,
      minPayRate: minPayRate || undefined,
      maxPayRate: maxPayRate || undefined,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Note: The API doesn't have search functionality in the docs, 
    // so we'll filter locally for now
    // In a real implementation, you'd pass this to the API
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    browseProjects({
      category: value || undefined,
      difficultyLevel: difficultyFilter || undefined,
      minPayRate: minPayRate || undefined,
      maxPayRate: maxPayRate || undefined,
    });
  };

  const handleDifficultyFilter = (value: string) => {
    setDifficultyFilter(value);
    browseProjects({
      category: categoryFilter || undefined,
      difficultyLevel: value || undefined,
      minPayRate: minPayRate || undefined,
      maxPayRate: maxPayRate || undefined,
    });
  };

  const handlePayRateFilter = () => {
    browseProjects({
      category: categoryFilter || undefined,
      difficultyLevel: difficultyFilter || undefined,
      minPayRate: minPayRate || undefined,
      maxPayRate: maxPayRate || undefined,
    });
  };

  const showProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalVisible(true);
  };

  const showApplicationModal = (project: Project) => {
    setSelectedProject(project);
    setIsApplicationModalVisible(true);
    applicationForm.resetFields();
  };

  const handleApply = async () => {
    if (!selectedProject) return;

    try {
      const values = await applicationForm.validateFields();
      const applicationData: ApplyToProjectForm = {
        coverLetter: values.coverLetter,
        availability: values.availability,
        proposedRate: values.proposedRate,
        estimatedCompletionTime: values.estimatedCompletionTime,
      };

      const result = await applyToProject(selectedProject._id, applicationData);

      if (result.success) {
        message.success("Application submitted successfully!");
        setIsApplicationModalVisible(false);
        applicationForm.resetFields();
        fetchProjects(); // Refresh to update hasApplied status
      } else {
        message.error(result.error || "Failed to submit application");
      }
    } catch (error) {
      message.error("Please complete the required fields");
    }
  };

  // Filter projects locally based on search text
  const filteredProjects = projects.filter(project =>
    searchText ?
      project.projectName.toLowerCase().includes(searchText.toLowerCase()) ||
      project.projectDescription.toLowerCase().includes(searchText.toLowerCase())
      : true
  );


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
    <div className="font-[gilroy-regular] flex flex-col gap-4 pb-10">
      {/* User Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{userStats.totalApplications}</div>
              <div className="text-gray-600 text-sm">Total Applications</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{userStats.activeProjects}</div>
              <div className="text-gray-600 text-sm">Active Projects</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userStats.completedProjects}</div>
              <div className="text-gray-600 text-sm">Completed Projects</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Search
          placeholder="Search projects..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 250 }}
        />

        <Select
          placeholder="Category"
          allowClear
          style={{ width: 180 }}
          onChange={handleCategoryFilter}
        >
          {PROJECT_CATEGORIES.map(category => (
            <Option key={category} value={category}>{category}</Option>
          ))}
        </Select>

        <Select
          placeholder="Difficulty"
          allowClear
          style={{ width: 120 }}
          onChange={handleDifficultyFilter}
        >
          {DIFFICULTY_LEVELS.map(level => (
            <Option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</Option>
          ))}
        </Select>

        <InputNumber
          placeholder="Min Rate"
          min={0}
          precision={2}
          style={{ width: 100 }}
          value={minPayRate}
          onChange={(value) => setMinPayRate(value || undefined)}
          onPressEnter={handlePayRateFilter}
        />

        <InputNumber
          placeholder="Max Rate"
          min={0}
          precision={2}
          style={{ width: 100 }}
          value={maxPayRate}
          onChange={(value) => setMaxPayRate(value || undefined)}
          onPressEnter={handlePayRateFilter}
        />

        <Button onClick={handlePayRateFilter}>Apply Filters</Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchProjects}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Projects Grid */}
      <Spin spinning={loading}>
        {filteredProjects.length === 0 ? (
          <Empty description="No projects available" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {

              console.log('Rendering project:', project);
              return (
                <Card
                  key={project._id}
                  className="project-card hover:shadow-lg transition-shadow flex flex-col gap-5 justify-between"
                  classNames={{
                    actions: "flex items-center justify-between"
                  }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showProjectDetails(project)}
                    >
                      View Details
                    </Button>,

                    project.openCloseStatus === 'close' ? (
                      <Button type="text" disabled>
                        Closed
                      </Button>
                    ) : project.hasApplied ? (
                      <Button type="text" disabled>
                        Already Applied
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        icon={<ArrowsAltOutlined />}
                        onClick={() => showApplicationModal(project)}
                        className="!bg-secondary !border-secondary"
                      >
                        Apply
                      </Button>
                    )
                  ]}
                >
                  <div className="mb-5">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {project.projectName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {project.projectDescription}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Tag color="blue">{project.projectCategory}</Tag>
                      <Tag color={
                        project.difficultyLevel === 'beginner' ? 'green' :
                          project.difficultyLevel === 'intermediate' ? 'orange' :
                            project.difficultyLevel === 'advanced' ? 'red' : 'purple'
                      }>
                        {project.difficultyLevel.toUpperCase()}
                      </Tag>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">
                        <DollarOutlined /> {project.payRateCurrency} {project.payRate}
                        <span className="text-gray-500">/{project.payRateType.replace('_', ' ')}</span>
                      </span>
                      <span className="text-gray-500 text-sm">
                        <UserOutlined /> {project.totalApplications}/{project.maxAnnotators || '∞'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        <ClockCircleOutlined /> Due: {moment(project.deadline).format('MMM DD, YYYY')}
                      </span>
                      <Tag color={project.status === 'active' ? 'green' : 'orange'}>
                        {project.status.toUpperCase()}
                      </Tag>
                    </div>


                    {
                      project.openCloseStatus && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">
                            <CheckCircleOutlined /> Application Status: {statusMap[project.openCloseStatus]}
                          </span>
                        </div>
                      )
                    }

                    {project.requiredSkills?.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 mb-1 inline-block">Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.slice(0, 3).map((skill, index) => (
                            <Tag key={index} className="text-xs">{skill}</Tag>
                          ))}
                          {project.requiredSkills.length > 3 && (
                            <Tag className="text-xs">+{project.requiredSkills.length - 3} more</Tag>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Spin>

      {/* Project Details Modal */}
      <Modal
        title="Project Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
          selectedProject && !selectedProject.hasApplied && (
            <Button
              key="apply"
              type="primary"
              onClick={() => {
                setIsDetailModalVisible(false);
                showApplicationModal(selectedProject);
              }}
              className="!bg-secondary !border-secondary"
            >
              Apply to Project
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedProject && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedProject.projectName}</h3>
              <div className="flex gap-2 mb-3">
                <Tag color="blue">{selectedProject.projectCategory}</Tag>
                <Tag color="green">{selectedProject.difficultyLevel}</Tag>
                <Tag color="orange">{selectedProject.status}</Tag>
              </div>
              <p className="text-gray-600">{selectedProject.projectDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Project Details</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Pay Rate:</strong> {selectedProject.payRateCurrency} {selectedProject.payRate} per {selectedProject.payRateType.replace('_', ' ')}</li>
                  <li><strong>Duration:</strong> {selectedProject.estimatedDuration}</li>
                  <li><strong>Max Annotators:</strong> {selectedProject.maxAnnotators || 'Unlimited'}</li>
                  <li><strong>Applications:</strong> {selectedProject.totalApplications}</li>
                  <li><strong>Min Experience:</strong> {selectedProject.minimumExperience}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Deadlines</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Project Deadline:</strong> {moment(selectedProject.deadline).format('MMMM DD, YYYY')}</li>
                  <li><strong>Application Deadline:</strong> {moment(selectedProject.applicationDeadline).format('MMMM DD, YYYY')}</li>
                </ul>
              </div>
            </div>

            {selectedProject.requiredSkills?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.requiredSkills.map((skill, index) => (
                    <Tag key={index} color="blue">{skill}</Tag>
                  ))}
                </div>
              </div>
            )}

            {selectedProject.languageRequirements?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Language Requirements</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.languageRequirements.map((lang, index) => (
                    <Tag key={index} color="green">{lang}</Tag>
                  ))}
                </div>
              </div>
            )}

            {selectedProject.tags?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.tags.map((tag, index) => (
                    <Tag key={index} color="purple">{tag}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Application Modal */}
      <Modal
        title="Apply to Project"
        open={isApplicationModalVisible}
        onOk={handleApply}
        onCancel={() => setIsApplicationModalVisible(false)}
        okText="Submit Application"
        cancelText="Cancel"
        okButtonProps={{ loading }}
        width={600}
      >
        {selectedProject && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-semibold">{selectedProject.projectName}</h4>
              <p className="text-sm text-gray-600">
                {selectedProject.payRateCurrency} {selectedProject.payRate} per {selectedProject.payRateType.replace('_', ' ')}
              </p>
            </div>

            <Form form={applicationForm} layout="vertical">
              <Form.Item
                name="coverLetter"
                label="Cover Letter"
                rules={[
                  { required: true, message: "Please write a cover letter" },
                  { max: 1000, message: "Cover letter cannot exceed 1000 characters" }
                ]}
              >
                <TextArea
                  placeholder="Explain why you're interested in this project and what makes you a good fit..."
                  rows={6}
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="availability"
                  label="Availability"
                  rules={[{ required: true, message: "Please select your availability" }]}
                >
                  <Select placeholder="Select availability">
                    {AVAILABILITY_OPTIONS.map(option => (
                      <Option key={option} value={option}>
                        {option.replace('_', ' ').toUpperCase()}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="proposedRate"
                  label="Proposed Rate (Optional)"
                  help="Leave empty to accept listed rate"
                >
                  <InputNumber
                    placeholder={`Default: ${selectedProject.payRateCurrency} ${selectedProject.payRate}`}
                    min={0}
                    precision={2}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="estimatedCompletionTime"
                label="Estimated Completion Time (Optional)"
              >
                <Input placeholder="e.g., 2 weeks, 1 month" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AvailableProjects;
