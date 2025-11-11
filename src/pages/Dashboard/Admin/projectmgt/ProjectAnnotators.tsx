import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Avatar,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Button,
  Modal,
  Descriptions,
  Alert,
  Badge,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import {
  AnnotatorProjectResponseData,
  RecentApplication,
  ApplicantId,
} from "../../../../types/project.types";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ProjectAnnotatorsProps {
  projectId: string;
  projectName: string;
  visible: boolean;
  onClose: () => void;
}

const ProjectAnnotators: React.FC<ProjectAnnotatorsProps> = ({
  projectId,
  projectName,
  visible,
  onClose,
}) => {
  const [data, setData] = useState<AnnotatorProjectResponseData | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<RecentApplication | null>(null);
  const [isApplicationModalVisible, setIsApplicationModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const { getProjectAnnotators, loading, error } = useAdminProjects();

  useEffect(() => {
    if (visible && projectId) {
      fetchProjectAnnotators();
    }
  }, [visible, projectId]);

  const fetchProjectAnnotators = async () => {
    const result = await getProjectAnnotators(projectId);
    if (result.success) {
      setData(result.data);
    }
  };

  const handleViewApplication = (application: RecentApplication) => {
    setSelectedApplication(application);
    setIsApplicationModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      approved: "green",
      rejected: "red",
      pending: "orange",
      reviewing: "blue",
    };
    return colors[status] || "default";
  };

  const getAnnotatorStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      approved: "green",
      verified: "blue",
      pending: "orange",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  // Filter applications by status
  const approvedApplications = data?.recentApplications.filter(app => app.status === "approved") || [];
  const rejectedApplications = data?.recentApplications.filter(app => app.status === "rejected") || [];
  const pendingApplications = data?.recentApplications.filter(app => app.status === "pending") || [];

  const applicationColumns = [
    {
      title: "Applicant",
      key: "applicant",
      render: (record: RecentApplication) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{record.applicantId.fullName}</div>
            <div className="text-gray-500 text-sm">{record.applicantId.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: RecentApplication) => (
        <div className="space-y-1">
          <Tag color={getStatusColor(record.status)}>
            {record.status.toUpperCase()}
          </Tag>
          <Tag color={getAnnotatorStatusColor(record.applicantId.annotatorStatus)}>
            {record.applicantId.annotatorStatus.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: "Proposed Rate",
      key: "proposedRate",
      render: (record: RecentApplication) => (
        <span>
          <DollarOutlined /> {record.proposedRate || "Not specified"}
        </span>
      ),
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
    },
    {
      title: "Applied",
      key: "appliedAt",
      render: (record: RecentApplication) => moment(record.appliedAt).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: RecentApplication) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewApplication(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const rejectedColumns = [
    ...applicationColumns.slice(0, -2), // Remove Applied date and Actions
    {
      title: "Reviewed",
      key: "reviewedAt",
      render: (record: RecentApplication) => 
        record.reviewedAt ? moment(record.reviewedAt).format("MMM DD, YYYY") : "N/A",
    },
    {
      title: "Reason",
      key: "rejectionReason",
      render: (record: RecentApplication) => (
        <Tooltip title={record.reviewNotes || "No notes provided"}>
          <Tag color="red">
            {record.rejectionReason?.replace("_", " ") || "Not specified"}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: RecentApplication) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewApplication(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Modal
        title="Project Annotators"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
        centered
      >
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        title="Project Annotators"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
        centered
      >
        <Alert
          message="Error Loading Annotators"
          description={error}
          type="error"
          showIcon
        />
      </Modal>
    );
  }

  return (
    <>
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <UserOutlined />
            <span>Applications for: {projectName}</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1200}
        centered
      >
        {data ? (
          <div className="space-y-6">
            {/* Statistics Overview */}
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Total Applications"
                    value={data.recentApplications.length}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Approved"
                    value={data.applicationStats.approved}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Rejected"
                    value={data.applicationStats.rejected}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Applications Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Approved ({approvedApplications.length})
                  </span>
                }
                key="1"
              >
                {approvedApplications.length > 0 ? (
                  <Table
                    columns={applicationColumns}
                    dataSource={approvedApplications}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No approved applications yet" />
                )}
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined />
                    Pending ({pendingApplications.length})
                  </span>
                }
                key="2"
              >
                {pendingApplications.length > 0 ? (
                  <Table
                    columns={applicationColumns}
                    dataSource={pendingApplications}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No pending applications" />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <CloseCircleOutlined />
                    Rejected ({rejectedApplications.length})
                  </span>
                }
                key="3"
              >
                {rejectedApplications.length > 0 ? (
                  <Table
                    columns={rejectedColumns}
                    dataSource={rejectedApplications}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No rejected applications" />
                )}
              </TabPane>
            </Tabs>
          </div>
        ) : (
          <Empty description="No data available" />
        )}
      </Modal>

      {/* Application Details Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <Avatar icon={<UserOutlined />} />
            <span>{selectedApplication?.applicantId.fullName}</span>
          </div>
        }
        open={isApplicationModalVisible}
        onCancel={() => setIsApplicationModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex space-x-2">
              <Badge
                status={selectedApplication.status === "approved" ? "success" : 
                       selectedApplication.status === "rejected" ? "error" : "processing"}
                text={`Application: ${selectedApplication.status}`}
              />
              <Badge
                status={selectedApplication.applicantId.annotatorStatus === "approved" ? "success" : "processing"}
                text={`Annotator: ${selectedApplication.applicantId.annotatorStatus}`}
              />
            </div>

            {/* Application Information */}
            <Card title="Application Details" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {selectedApplication.applicantId.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Rate">
                  <Space>
                    <DollarOutlined />
                    {selectedApplication.proposedRate || "Not specified"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  {selectedApplication.availability}
                </Descriptions.Item>
                <Descriptions.Item label="Estimated Completion">
                  {selectedApplication.estimatedCompletionTime || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Applied Date">
                  <Space>
                    <CalendarOutlined />
                    {moment(selectedApplication.appliedAt).format("MMM DD, YYYY HH:mm")}
                  </Space>
                </Descriptions.Item>
                {selectedApplication.reviewedAt && (
                  <Descriptions.Item label="Reviewed Date">
                    <Space>
                      <CalendarOutlined />
                      {moment(selectedApplication.reviewedAt).format("MMM DD, YYYY HH:mm")}
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedApplication.workStartedAt && (
                  <Descriptions.Item label="Work Started">
                    <Space>
                      <CalendarOutlined />
                      {moment(selectedApplication.workStartedAt).format("MMM DD, YYYY HH:mm")}
                    </Space>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Tasks Completed">
                  {selectedApplication.tasksCompleted || 0}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Cover Letter */}
            <Card title="Cover Letter" size="small">
              <Text>{selectedApplication.coverLetter}</Text>
            </Card>

            {/* Review Information */}
            {(selectedApplication.reviewNotes || selectedApplication.rejectionReason) && (
              <Card title="Review Information" size="small">
                <Descriptions column={1} size="small">
                  {selectedApplication.reviewNotes && (
                    <Descriptions.Item label="Review Notes">
                      {selectedApplication.reviewNotes}
                    </Descriptions.Item>
                  )}
                  {selectedApplication.rejectionReason && (
                    <Descriptions.Item label="Rejection Reason">
                      <Tag color="red">{selectedApplication.rejectionReason}</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectAnnotators;