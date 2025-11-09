import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Tag,
  Alert,
  Spin,
  Modal,
  Descriptions,
  Empty,
  Progress,
} from "antd";
import {
  ArrowRightOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserProjects } from "../../../../hooks/Auth/User/Projects/useUserProjects";
import { retrieveUserInfoFromStorage } from "../../../../helpers";
import { Application } from "../../../../types/project.types";

const ActiveProjects = () => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const {
    getApplicationsByStatus,
    loading,
    error,
    applications,
    userStats,
    resetState,
  } = useUserProjects();

  // Use applications directly since getApplicationsByStatus filters server-side
  const activeProjects = applications;

  // Legacy projects for backward compatibility
  const legacyProjects = [
    {
      title: "Annotator Assessment",
      description: "This project involves evaluating LLM responses",
      rate: " up to $25",
      projectLink: "https://talent.micro1.ai",
    },
    {
      title: "English Language Proficiency",
      description: "Take English Language Proficiency test",
      rate: "up to $10",
      projectLink: "https://jobs.e2f.io/",
    },
  ];

  useEffect(() => {
    loadUserAndFetchProjects();
  }, []);

  const loadUserAndFetchProjects = async () => {
    try {
      const userInfo = await retrieveUserInfoFromStorage();
      if (userInfo && userInfo._id) {
        await getApplicationsByStatus('approved');
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  const handleRefresh = () => {
    getApplicationsByStatus('approved');
  };

  const showApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailModalVisible(true);
  };

  const calculateProgress = (startDate: string, endDate: string): number => {
    const start = moment(startDate);
    const end = moment(endDate);
    const now = moment();
    
    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;
    
    const total = end.diff(start);
    const elapsed = now.diff(start);
    return Math.round((elapsed / total) * 100);
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          action={
            <Button size="small" onClick={() => { resetState(); handleRefresh(); }}>
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
    <div className="font-[gilroy-regular] flex flex-col gap-4">
      {/* Statistics Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{activeProjects.length}</div>
              <div className="text-gray-600 text-sm">Active Projects</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{userStats.pendingApplicationions || 0}</div>
              <div className="text-gray-600 text-sm">Pending</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{userStats.totalApplications}</div>
              <div className="text-gray-600 text-sm">Total Applied</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{userStats.completedProjects}</div>
              <div className="text-gray-600 text-sm">Completed</div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Projects</h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Spin spinning={loading}>
        {activeProjects.length === 0 && legacyProjects.length === 0 ? (
          <Empty description="No active projects" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API-based Active Projects */}
            {activeProjects.map((application) => {
              const project = typeof application.projectId === 'object' ? application.projectId : null;
              if (!project) return null;

              const progress = application.workStartedAt 
                ? calculateProgress(application.workStartedAt, project.deadline)
                : 0;

              return (
                <Card
                  key={application._id}
                  className="project-card hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showApplicationDetails(application)}
                    >
                      View Details
                    </Button>,
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      className="!bg-secondary !border-secondary"
                    >
                      Continue Work
                    </Button>,
                  ]}
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {project.projectName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.projectDescription}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Tag color="green">
                        <CheckCircleOutlined /> ACTIVE
                      </Tag>
                      <Tag color="blue">{project.projectCategory}</Tag>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-600">
                        <DollarOutlined /> {project.payRateCurrency} {project.payRate}
                        <span className="text-gray-500">/{project.payRateType.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress percent={progress} size="small" />
                    </div>

                    <div className="text-gray-500 text-sm">
                      <CalendarOutlined /> Due: {moment(project.deadline).format('MMM DD, YYYY')}
                    </div>

                    {application.approvedAt && (
                      <div className="text-gray-500 text-sm">
                        Started: {moment(application.approvedAt).format('MMM DD, YYYY')}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Legacy Projects for Assessment */}
            {legacyProjects.map((project, index) => (
              <Card
                key={`legacy-${index}`}
                className="project-card hover:shadow-lg transition-shadow"
                actions={[
                  <a
                    href={project.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      className="!bg-secondary !border-secondary"
                    >
                      Take Test
                    </Button>
                  </a>,
                ]}
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Tag color="orange">
                      <ClockCircleOutlined /> ASSESSMENT
                    </Tag>
                  </div>

                  <div className="font-bold text-green-600">
                    <DollarOutlined /> {project.rate}/hr
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>

      {/* Application Details Modal */}
      <Modal
        title="Project Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedApplication && typeof selectedApplication.projectId === 'object' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">
                {selectedApplication.projectId.projectName}
              </h3>
              <div className="flex gap-2">
                <Tag color="green">
                  <CheckCircleOutlined /> ACTIVE
                </Tag>
                <Tag color="blue">{selectedApplication.projectId.projectCategory}</Tag>
                <Tag color="purple">{selectedApplication.projectId.difficultyLevel}</Tag>
              </div>
            </div>

            <Card>
              <Descriptions title="Project Information" bordered column={2}>
                <Descriptions.Item label="Description" span={2}>
                  {selectedApplication.projectId.projectDescription}
                </Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {selectedApplication.projectId.payRateCurrency} {selectedApplication.projectId.payRate} per {selectedApplication.projectId.payRateType.replace('_', ' ')}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedApplication.projectId.estimatedDuration}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  {moment(selectedApplication.projectId.deadline).format('MMMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">ACTIVE</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card>
              <Descriptions title="Your Application" bordered column={2}>
                <Descriptions.Item label="Applied Date">
                  {moment(selectedApplication.appliedAt).format('MMMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Approved Date">
                  {selectedApplication.approvedAt 
                    ? moment(selectedApplication.approvedAt).format('MMMM DD, YYYY')
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  {selectedApplication.availability.replace('_', ' ').toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Rate">
                  {selectedApplication.proposedRate || 'As Listed'}
                </Descriptions.Item>
                <Descriptions.Item label="Cover Letter" span={2}>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedApplication.coverLetter}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedApplication.reviewNotes && (
              <Card>
                <Descriptions title="Review Notes" bordered>
                  <Descriptions.Item label="Admin Notes">
                    <div className="bg-gray-50 p-3 rounded">
                      {selectedApplication.reviewNotes}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActiveProjects;
