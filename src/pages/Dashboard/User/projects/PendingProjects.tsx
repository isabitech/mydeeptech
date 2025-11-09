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
import { Application } from "../../../../types/project.types";

const PendingProjects = () => {
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
  const pendingApplications = applications;

  useEffect(() => {
    loadUserAndFetchProjects();
  }, []);

  const loadUserAndFetchProjects = async () => {
    try {
      const userInfo = await retrieveUserInfoFromStorage();
      if (userInfo && userInfo._id) {
        await getApplicationsByStatus('pending');
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  const handleRefresh = () => {
    getApplicationsByStatus('pending');
  };

  const showApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
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
      {/* Statistics Card */}
      {userStats && (
        <Card size="small" className="mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {pendingApplications.length || 0}
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
        {pendingApplications.length === 0 ? (
          <Empty description="No pending applications" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApplications.map((application) => {
              const project = typeof application.projectId === 'object' ? application.projectId : null;
              if (!project) return null;

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
                        <span className="text-gray-500">/{project.payRateType.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <div className="text-gray-500 text-sm">
                      <CalendarOutlined /> Applied: {moment(application.appliedAt).format('MMM DD, YYYY')}
                    </div>

                    <div className="text-gray-500 text-sm">
                      Availability: {application.availability.replace('_', ' ').toUpperCase()}
                    </div>

                    {application.proposedRate && (
                      <div className="text-gray-500 text-sm">
                        Proposed Rate: {project.payRateCurrency} {application.proposedRate}
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
        {selectedApplication && typeof selectedApplication.projectId === 'object' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">
                {selectedApplication.projectId.projectName}
              </h3>
              <div className="flex gap-2">
                <Tag color="orange">
                  <ClockCircleOutlined /> PENDING REVIEW
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
                <Descriptions.Item label="Category">
                  {selectedApplication.projectId.projectCategory}
                </Descriptions.Item>
                <Descriptions.Item label="Difficulty">
                  {selectedApplication.projectId.difficultyLevel}
                </Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {selectedApplication.projectId.payRateCurrency} {selectedApplication.projectId.payRate} per {selectedApplication.projectId.payRateType.replace('_', ' ')}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {selectedApplication.projectId.estimatedDuration}
                </Descriptions.Item>
                <Descriptions.Item label="Max Annotators">
                  {selectedApplication.projectId.maxAnnotators || 'Unlimited'}
                </Descriptions.Item>
                <Descriptions.Item label="Current Applications">
                  {selectedApplication.projectId.totalApplications}
                </Descriptions.Item>
                <Descriptions.Item label="Project Deadline">
                  {moment(selectedApplication.projectId.deadline).format('MMMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Application Deadline">
                  {moment(selectedApplication.projectId.applicationDeadline).format('MMMM DD, YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card>
              <Descriptions title="Your Application" bordered column={2}>
                <Descriptions.Item label="Applied Date">
                  {moment(selectedApplication.appliedAt).format('MMMM DD, YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="orange">PENDING REVIEW</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  {selectedApplication.availability.replace('_', ' ').toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Rate">
                  {selectedApplication.proposedRate 
                    ? `${selectedApplication.projectId.payRateCurrency} ${selectedApplication.proposedRate}`
                    : 'As Listed'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Estimated Completion">
                  {selectedApplication.estimatedCompletionTime || 'Not specified'}
                </Descriptions.Item>
                <Descriptions.Item label="Cover Letter" span={2}>
                  <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    {selectedApplication.coverLetter}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedApplication.projectId.requiredSkills?.length > 0 && (
              <Card>
                <div>
                  <strong className="mb-2 block">Required Skills:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedApplication.projectId.requiredSkills.map((skill, index) => (
                      <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {selectedApplication.projectId.languageRequirements?.length > 0 && (
              <Card>
                <div>
                  <strong className="mb-2 block">Language Requirements:</strong>
                  <div className="flex flex-wrap gap-1">
                    {selectedApplication.projectId.languageRequirements.map((lang, index) => (
                      <Tag key={index} color="green">{lang}</Tag>
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
                Your application is under review. You will receive an email notification 
                once the admin has made a decision. This process typically takes 1-3 business days.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingProjects;