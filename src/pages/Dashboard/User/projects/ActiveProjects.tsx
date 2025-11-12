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
import { Project } from "../../../../hooks/Auth/User/Projects/project-status-type";

const ActiveProjects = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const {
    loading,
    error,
    projects,
    userStats,
    resetState,
    getActiveProjects,
  } = useUserProjects();

  // Filter projects that have active applications
  const activeProjects: Project[] = (projects as unknown as Project[]).filter(project => 
    project.userApplication && project.userApplication.status === 'approved'
  );

  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        await getActiveProjects({ limit: 50, page: 1 });
      } catch (error) {
        console.error('Failed to fetch active projects:', error);
      }
    };

    fetchActiveProjects();
  }, [getActiveProjects]);

  const handleRefresh = () => {
    console.log("Refreshing active projects...");
    getActiveProjects({ limit: 50, page: 1 });
  };

  const showProjectDetails = (project: Project) => {
    setSelectedProject(project);
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
        {activeProjects.length === 0 ? (
          <Empty description="No active projects" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* API-based Active Projects */}
            {activeProjects.map((project) => {
              const progress = project.userApplication?.appliedAt 
                ? calculateProgress(project.userApplication.appliedAt, project.deadline)
                : 0;

              return (
                <Card
                  key={project._id}
                  className="project-card hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showProjectDetails(project)}
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
                      <CalendarOutlined /> Due: {project.deadline ? moment(project.deadline).format('MMM DD, YYYY') : 'N/A'}
                    </div>

                    {project.userApplication?.appliedAt && (
                      <div className="text-gray-500 text-sm">
                        Started: {moment(project.userApplication.appliedAt).format('MMM DD, YYYY')}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
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
        {selectedProject && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">
                {selectedProject.projectName}
              </h3>
              <div className="flex gap-2">
                <Tag color="green">
                  <CheckCircleOutlined /> ACTIVE
                </Tag>
                <Tag color="blue">{selectedProject.projectCategory}</Tag>
                <Tag color="purple">{selectedProject.difficultyLevel}</Tag>
              </div>
            </div>

            <Card>
              <Descriptions title="Project Information" bordered column={2}>
                <Descriptions.Item label="Description" span={2}>
                  {selectedProject.projectDescription}
                </Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {selectedProject.payRateCurrency} {selectedProject.payRate} per {selectedProject.payRateType.replace('_', ' ')}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedProject.estimatedDuration || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  {selectedProject.deadline ? moment(selectedProject.deadline).format('MMMM DD, YYYY') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="green">ACTIVE</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedProject.userApplication && (
              <Card>
                <Descriptions title="Your Application" bordered column={2}>
                  <Descriptions.Item label="Applied Date">
                    {selectedProject.userApplication.appliedAt ? moment(selectedProject.userApplication.appliedAt).format('MMMM DD, YYYY') : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color="green">{selectedProject.userApplication.status?.toUpperCase() || 'APPROVED'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Availability">
                    {selectedProject.userApplication.availability ? selectedProject.userApplication.availability.replace('_', ' ').toUpperCase() : 'N/A'}
                  </Descriptions.Item>
                  {selectedProject.userApplication.coverLetter && (
                    <Descriptions.Item label="Cover Letter" span={2}>
                      <div className="bg-gray-50 p-3 rounded">
                        {selectedProject.userApplication.coverLetter}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {selectedProject.userApplication?.reviewNotes && (
              <Card>
                <Descriptions title="Review Notes" bordered>
                  <Descriptions.Item label="Admin Notes">
                    <div className="bg-gray-50 p-3 rounded">
                      {selectedProject.userApplication.reviewNotes}
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
