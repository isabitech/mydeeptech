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
  CloseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useUserProjects } from "../../../../hooks/Auth/User/Projects/useUserProjects";
import { retrieveUserInfoFromStorage } from "../../../../helpers";
import { Application } from "../../../../types/project.types";

const RejectedProjects = () => {
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

  // Use applications directly since getRejectedApplications filters server-side
  const rejectedApplications = applications;

  useEffect(() => {
    loadUserAndFetchProjects();
  }, []);

  const loadUserAndFetchProjects = async () => {
    try {
      const userInfo = await retrieveUserInfoFromStorage();
      if (userInfo && userInfo._id) {
        await getApplicationsByStatus('rejected');
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  const handleRefresh = () => {
    getApplicationsByStatus('rejected');
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
            <div className="text-2xl font-bold text-red-600">
              {rejectedApplications.length || 0}
            </div>
            <div className="text-gray-600">Rejected Applications</div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rejected Applications</h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Spin spinning={loading}>
        {rejectedApplications.length === 0 ? (
          <Empty description="No rejected applications" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rejectedApplications.map((application) => {
              const project = typeof application.projectId === 'object' ? application.projectId : null;
              if (!project) return null;

              return (
                <Card
                  key={application._id}
                  className="project-card hover:shadow-lg transition-shadow border-red-200"
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
                      <Tag color="red">
                        <CloseCircleOutlined /> REJECTED
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

                    {application.rejectedAt && (
                      <div className="text-red-500 text-sm">
                        Rejected: {moment(application.rejectedAt).format('MMM DD, YYYY')}
                      </div>
                    )}

                    <div className="text-gray-500 text-sm">
                      Availability: {application.availability.replace('_', ' ').toUpperCase()}
                    </div>

                    {application.proposedRate && (
                      <div className="text-gray-500 text-sm">
                        Proposed Rate: {project.payRateCurrency} {application.proposedRate}
                      </div>
                    )}

                    {application.rejectionReason && (
                      <div className="text-red-500 text-sm">
                        Reason: {application.rejectionReason.replace('_', ' ').toUpperCase()}
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
        title="Rejected Application Details"
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
                <Tag color="red">
                  <CloseCircleOutlined /> REJECTED
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
                <Descriptions.Item label="Rejected Date">
                  {selectedApplication.rejectedAt 
                    ? moment(selectedApplication.rejectedAt).format('MMMM DD, YYYY HH:mm')
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color="red">REJECTED</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Rejection Reason">
                  {selectedApplication.rejectionReason?.replace('_', ' ').toUpperCase() || 'Not specified'}
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

            {selectedApplication.reviewNotes && (
              <Card>
                <Descriptions title="Rejection Feedback" bordered>
                  <Descriptions.Item label="Review Notes" span={2}>
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      {selectedApplication.reviewNotes}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

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

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <CloseCircleOutlined />
                <strong>Application Rejected</strong>
              </div>
              <p className="text-red-600 mt-1">
                Unfortunately, your application was not accepted for this project. 
                Please review the feedback above and consider applying to other projects 
                that better match your skills and experience.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RejectedProjects;