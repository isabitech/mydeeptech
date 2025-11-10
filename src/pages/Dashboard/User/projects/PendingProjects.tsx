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
} from "antd";
import {
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserProjects } from "../../../../hooks/Auth/User/Projects/useUserProjects";
import { retrieveUserInfoFromStorage } from "../../../../helpers";
import { 
  Project as ProjectWithStatus 
} from "../../../../hooks/Auth/User/Projects/project-status-type";

const PendingProjects = () => {
  const [selectedProject, setSelectedProject] = useState<ProjectWithStatus | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const {
    loading,
    error,
    projects,
    userStats,
    resetState,
    getPendingApplications,
  } = useUserProjects();

  // Filter projects that have pending applications - cast to proper type
  const pendingProjects: ProjectWithStatus[] = (projects as unknown as ProjectWithStatus[]).filter(project => 
    project.userApplication && project.userApplication.status === 'pending'
  );

  useEffect(() => {
    const fetchPendingProjects = async () => {
      try {
        await getPendingApplications({ limit: 50, page: 1 });
      } catch (error) {
        console.error("Failed to fetch active projects:", error);
      }
    };

    fetchPendingProjects();
  }, [getPendingApplications]);

  const handleRefresh = () => {
    console.log("Refreshing pending applications...");
    getPendingApplications({ limit: 50, page: 1 });
  };

  const showProjectDetails = (project: ProjectWithStatus) => {
    setSelectedProject(project);
    setIsDetailModalVisible(true);
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          action={
            <Button
              size="small"
              onClick={() => {
                resetState();
                handleRefresh();
              }}
            >
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
      {/* Statistics Card */}
      {userStats && (
        <Card size="small" className="mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingProjects.length || 0}
            </div>
            <div className="text-gray-600">Pending Applications</div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pending Applications</h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Spin spinning={loading}>
        {pendingProjects.length === 0 ? (
          <Empty description="No pending applications" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingProjects.map((project) => (
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
                    <Tag color="orange">
                      <ClockCircleOutlined /> PENDING
                    </Tag>
                    <Tag color="blue">{project.projectCategory}</Tag>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">
                      <DollarOutlined /> {project.payRateCurrency} {project.payRate}
                      {project.payRateType ? (
                        <span className="text-gray-500">
                          /{project.payRateType.replace("_", " ")}
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <div className="text-gray-500 text-sm">
                    <CalendarOutlined /> Applied:{" "}
                    {project.userApplication?.appliedAt 
                      ? moment(project.userApplication.appliedAt).format("MMM DD, YYYY")
                      : 'N/A'
                    }
                  </div>

                  <div className="text-gray-500 text-sm">
                    Deadline:{" "}
                    {project.deadline 
                      ? moment(project.deadline).format("MMM DD, YYYY")
                      : 'N/A'
                    }
                  </div>

                  <div className="text-gray-500 text-sm">
                    {project.totalApplications || 0} applicants
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Spin>

      {/* Application Details Modal */}
      <Modal
        title="Pending Application Details"
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
                <Tag color="orange">
                  <ClockCircleOutlined /> PENDING REVIEW
                </Tag>
                <Tag color="blue">
                  {selectedProject.projectCategory}
                </Tag>
                {selectedProject.difficultyLevel && (
                  <Tag color="purple">
                    {selectedProject.difficultyLevel}
                  </Tag>
                )}
              </div>
            </div>

            <Card>
              <Descriptions title="Project Information" bordered column={2}>
                <Descriptions.Item label="Description" span={2}>
                  {selectedProject.projectDescription}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {selectedProject.projectCategory}
                </Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {selectedProject.payRateCurrency} {selectedProject.payRate}
                  {selectedProject.payRateType ? ` per ${selectedProject.payRateType.replace('_', ' ')}` : ''}
                </Descriptions.Item>
                <Descriptions.Item label="Company">
                  {selectedProject.createdBy?.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Applicants">
                  {selectedProject.totalApplications || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  {selectedProject.deadline
                    ? moment(selectedProject.deadline).format("MMMM DD, YYYY")
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Posted">
                  {selectedProject.createdAt
                    ? moment(selectedProject.createdAt).format("MMMM DD, YYYY")
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedProject.estimatedDuration || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedProject.userApplication && (
              <Card>
                <Descriptions title="Your Application" bordered column={2}>
                  <Descriptions.Item label="Applied Date">
                    {selectedProject.userApplication.appliedAt
                      ? moment(selectedProject.userApplication.appliedAt).format("MMMM DD, YYYY HH:mm")
                      : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color="orange">
                      {selectedProject.userApplication.status?.toUpperCase() || 'PENDING'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Availability">
                    {selectedProject.userApplication.availability
                      ? selectedProject.userApplication.availability.replace('_', ' ').toUpperCase()
                      : 'N/A'}
                  </Descriptions.Item>
                  {selectedProject.userApplication.coverLetter && (
                    <Descriptions.Item label="Cover Letter" span={2}>
                      <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                        {selectedProject.userApplication.coverLetter}
                      </div>
                    </Descriptions.Item>
                  )}
                  {selectedProject.userApplication.reviewNotes && (
                    <Descriptions.Item label="Review Notes" span={2}>
                      <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                        {selectedProject.userApplication.reviewNotes}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {selectedProject.requiredSkills && selectedProject.requiredSkills.length > 0 && (
              <Card>
                <div>
                  <strong className="mb-2 block">Required Skills:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.requiredSkills.map((skill: string, index: number) => (
                      <Tag key={index} color="blue">
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selectedProject.languageRequirements && selectedProject.languageRequirements.length > 0 && (
              <Card>
                <div>
                  <strong className="mb-2 block">Language Requirements:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.languageRequirements.map((lang: string, index: number) => (
                      <Tag key={index} color="green">
                        {lang}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <ClockCircleOutlined />
                <strong>Application Status</strong>
              </div>
              <p className="text-blue-600 mt-1">
                Your application is under review. You will receive an email
                notification once the admin has made a decision. This process
                typically takes 1-3 business days.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingProjects;
