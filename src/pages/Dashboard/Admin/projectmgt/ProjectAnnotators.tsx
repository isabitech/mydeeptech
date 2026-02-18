import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Dropdown,
  message,
  Form,
  Input,
  Select,
  Grid,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  MoreOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import {
  AnnotatorProjectResponseData,
  RecentApplication,
  RemoveApplicantRequest,
} from "../../../../types/project.types";

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { useBreakpoint } = Grid;

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
  const [isRemovalModalVisible, setIsRemovalModalVisible] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState<RecentApplication | null>(null);
  const [removalForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [searchText, setSearchText] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getProjectAnnotators, removeApplicant, loading, error } = useAdminProjects();

  const screens = useBreakpoint();

  const getWidth = () => {
    if (screens.xxl) return '70%';
    if (screens.xl) return '75%';
    if (screens.lg) return '80%';
    if (screens.md) return '85%';
    if (screens.sm) return '90%';
    return '95%';
  };



  useEffect(() => {
    if (visible && projectId) {
      setInitialLoading(true);
      fetchProjectAnnotators();
    }
  }, [visible, projectId]);

  // Handle search with debouncing
  useEffect(() => {
    if (!visible || !projectId) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchProjectAnnotators();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, visible, projectId]);

  const fetchProjectAnnotators = useCallback(async () => {
    // Only set isSearching if it's not the initial load
    if (!initialLoading) {
      setIsSearching(true);
    }
    try {
      const result = await getProjectAnnotators(
        projectId, 
        searchText.trim() || undefined
      );
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching project annotators:', error);
    } finally {
      setIsSearching(false);
      setInitialLoading(false);
    }
  }, [projectId, searchText, getProjectAnnotators, initialLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchText("");
  };

  const handleViewApplication = (application: RecentApplication) => {
    setSelectedApplication(application);
    setIsApplicationModalVisible(true);
  };

  const handleRemoveAnnotator = (application: RecentApplication) => {
    setSelectedForRemoval(application);
    setIsRemovalModalVisible(true);
    removalForm.resetFields();
  };

  const handleConfirmRemoval = async () => {
    if (!selectedForRemoval) return;

    console.log({ selectedForRemoval });

    try {
      const values = await removalForm.validateFields();
      const removalData: RemoveApplicantRequest = {
        removalReason: values.reason,
        removalNotes: values.notes || '',
      };

      const result = await removeApplicant(selectedForRemoval.applicantId?._id, removalData);

      if (result.success) {
        message.success('Annotator removed successfully');
        setIsRemovalModalVisible(false);
        setSelectedForRemoval(null);
        removalForm.resetFields();
        // Refresh the data
        fetchProjectAnnotators();
      } else {
        message.error(result.error || 'Failed to remove annotator');
      }
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const handleCancelRemoval = () => {
    setIsRemovalModalVisible(false);
    setSelectedForRemoval(null);
    removalForm.resetFields();
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

  // Use backend-filtered data directly
  const approvedAnnotators = data?.annotators?.approved || [];
  const rejectedAnnotators = data?.annotators?.rejected || [];
  const pendingAnnotators = data?.annotators?.pending || [];

  // Columns for recentApplications (lightweight records)
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
          {/* <Tag color={getAnnotatorStatusColor(record.applicantId.annotatorStatus)}>
            {record.applicantId.annotatorStatus.toUpperCase()}
          </Tag> */}
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
      render: (record: RecentApplication) => {
        // Create dropdown menu based on the current tab
        const getDropdownMenu = () => {
          const items = [
            {
              key: 'view',
              icon: <EyeOutlined />,
              label: 'View Details',
              onClick: () => handleViewApplication(record)
            }
          ];

          // Only show remove option for approved applications
          if (record.status === 'approved') {
            items.push({
              key: 'remove',
              icon: <DeleteOutlined />,
              label: 'Remove Annotator',
              onClick: () => handleRemoveAnnotator(record)
            });
          }

          return { items };
        };

        return (
          <Dropdown menu={getDropdownMenu()} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      },
    },
  ];

  // Columns for detailed annotator applications (approved/rejected/pending lists)
  const annotatorColumns = [
    {
      title: "Applicant",
      key: "annotator",
      render: (record: any) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{record.annotator?.fullName}</div>
            <div className="text-gray-500 text-sm">{record.annotator?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (record: any) => (
        <div className="space-y-1">
          <Tag color={getStatusColor(record.applicationStatus)}>
            {String(record.applicationStatus || '').toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: "Applied",
      key: "appliedAt",
      render: (record: any) => record.appliedAt ? moment(record.appliedAt).format("MMM DD, YYYY") : "N/A",
    },
    {
      title: "Reviewed",
      key: "reviewedAt",
      render: (record: any) => record.reviewedAt ? moment(record.reviewedAt).format("MMM DD, YYYY") : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => {
        const isApproved = record.applicationStatus === 'approved';
        const onView = () => handleViewApplication(record as any);
        const onRemove = () => handleRemoveAnnotator(record);

        const items: any[] = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: onView
          }
        ];
        if (isApproved) {
          items.push({
            key: 'remove',
            icon: <DeleteOutlined />,
            label: 'Remove Annotator',
            onClick: onRemove
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={['click']} >
            <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        );
      }
    }
  ];

  if (initialLoading || (loading && !data)) {
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
        centered
        width={getWidth()}
        bodyStyle={{
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
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

            {/* Search Annotators */}
            <div className="mb-4">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Input
                  placeholder="Search annotators by name, email, or status..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={handleSearchChange}
                  allowClear
                  onClear={handleSearchClear}
                  style={{ maxWidth: 400 }}
                  className="mb-2"
                  suffix={isSearching ? <Spin size="small" /> : null}
                />
                {searchText && (
                  <div className="text-sm text-gray-500">
                    <Space>
                      {isSearching && <Spin size="small" />}
                      Showing results for {`"${searchText}"`}
                      {data && (
                        <span>
                          ({(data.annotators?.approved?.length || 0) + 
                            (data.annotators?.pending?.length || 0) + 
                            (data.annotators?.rejected?.length || 0)} total)
                        </span>
                      )}
                    </Space>
                  </div>
                )}
              </Space>
            </div>

            {/* Applications Tabs */}
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <CheckCircleOutlined />
                    Approved ({approvedAnnotators.length})
                  </span>
                }
                key="1"
              >
                {approvedAnnotators.length > 0 ? (
                  <Table
                    columns={annotatorColumns}
                    dataSource={approvedAnnotators}
                    rowKey={(record) => record._id || record.applicationId}
                    pagination={{ pageSize: 10, position: ["bottomCenter"], }}
                    loading={isSearching}
                  />
                ) : (
                  isSearching ? (
                    <div className="flex justify-center items-center h-32">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Empty description="No approved applications yet" />
                  )
                )}
              </TabPane>

              <TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined />
                    Pending ({pendingAnnotators.length})
                  </span>
                }
                key="2"
              >
                {pendingAnnotators.length > 0 ? (
                  <Table
                    columns={annotatorColumns}
                    dataSource={pendingAnnotators}
                    rowKey={(record) => record._id || record.applicationId}
                    pagination={{ pageSize: 10, position: ["bottomCenter"], }}
                    loading={isSearching}
                  />
                ) : (
                  isSearching ? (
                    <div className="flex justify-center items-center h-32">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Empty description="No pending applications" />
                  )
                )}
              </TabPane>

              <TabPane
                tab={
                  <span className="flex items-center gap-1">
                    <CloseCircleOutlined />
                    Rejected ({rejectedAnnotators.length})
                  </span>
                }
                key="3"
              >
                {rejectedAnnotators.length > 0 ? (
                  <Table
                    columns={annotatorColumns}
                    dataSource={rejectedAnnotators}
                    rowKey={(record) => record._id || record.applicationId}
                    pagination={{ pageSize: 10, position: ["bottomCenter"], }}
                    loading={isSearching}
                  />
                ) : (
                  isSearching ? (
                    <div className="flex justify-center items-center h-32">
                      <Spin size="large" />
                    </div>
                  ) : (
                    <Empty description="No rejected applications" />
                  )
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
            <span>{selectedApplication?.applicantId?.fullName}</span>
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
                className="capitalize"
              />
              <Badge
                status={selectedApplication.applicantId?.annotatorStatus === "approved" ? "success" : "processing"}
                text={`Annotator: ${selectedApplication.applicantId?.annotatorStatus}`}
                className="capitalize"
              />
            </div>

            {/* Application Information */}
            <Card title="Application Details" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {selectedApplication?.applicantId?.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Rate">
                  <Space>
                    <DollarOutlined />
                    {selectedApplication?.proposedRate || "Not specified"}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  {selectedApplication?.availability}
                </Descriptions.Item>
                <Descriptions.Item label="Estimated Completion">
                  {selectedApplication?.estimatedCompletionTime || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Applied Date">
                  <Space>
                    <CalendarOutlined />
                    {moment(selectedApplication.appliedAt).format("MMM DD, YYYY HH:mm")}
                  </Space>
                </Descriptions.Item>
                {selectedApplication?.reviewedAt && (
                  <Descriptions.Item label="Reviewed Date">
                    <Space>
                      <CalendarOutlined />
                      {moment(selectedApplication.reviewedAt).format("MMM DD, YYYY HH:mm")}
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedApplication?.workStartedAt && (
                  <Descriptions.Item label="Work Started">
                    <Space>
                      <CalendarOutlined />
                      {moment(selectedApplication.workStartedAt).format("MMM DD, YYYY HH:mm")}
                    </Space>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Tasks Completed">
                  {selectedApplication?.tasksCompleted || 0}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Cover Letter */}
            <Card title="Cover Letter" size="small">
              <Text>{selectedApplication?.coverLetter}</Text>
            </Card>

            {/* Review Information */}
            {(selectedApplication?.reviewNotes || selectedApplication?.rejectionReason) && (
              <Card title="Review Information" size="small">
                <Descriptions column={1} size="small">
                  {selectedApplication?.reviewNotes && (
                    <Descriptions.Item label="Review Notes">
                      {selectedApplication?.reviewNotes}
                    </Descriptions.Item>
                  )}
                  {selectedApplication?.rejectionReason && (
                    <Descriptions.Item label="Rejection Reason">
                      <Tag color="red">{selectedApplication?.rejectionReason}</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Annotator Removal Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2 text-red-600">
            <ExclamationCircleOutlined />
            <span>Remove Annotator</span>
          </div>
        }
        open={isRemovalModalVisible}
        onCancel={handleCancelRemoval}
        footer={[
          <Button key="cancel" onClick={handleCancelRemoval}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={loading}
            onClick={handleConfirmRemoval}
          >
            Remove Annotator
          </Button>
        ]}
        width={600}
      >
        {selectedForRemoval && (
          <div className="space-y-4">
            {/* Warning Alert */}
            <Alert
              message="Warning: This action cannot be undone"
              description="The annotator will be removed from the project and their access will be revoked immediately."
              type="warning"
              showIcon
            />

            {/* Annotator Information */}
            <Card title="Annotator to Remove" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  {selectedForRemoval?.applicantId?.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedForRemoval?.applicantId?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Work Started">
                  {selectedForRemoval.workStartedAt
                    ? moment(selectedForRemoval.workStartedAt).format("MMM DD, YYYY HH:mm")
                    : "Not started"
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Tasks Completed">
                  {selectedForRemoval.tasksCompleted || 0}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Removal Form */}
            <Form
              form={removalForm}
              layout="vertical"
              initialValues={{
                reason: undefined,
                notes: ''
              }}
            >
              <Form.Item
                name="reason"
                label="Removal Reason"
                rules={[{ required: true, message: 'Please select a removal reason' }]}
              >
                <Select placeholder="Select a reason for removal">
                  <Option value="performance_issues">Performance Issues</Option>
                  <Option value="project_cancelled">Project Cancelled</Option>
                  <Option value="violates_guidelines">Violates Guidelines</Option>
                  <Option value="unavailable">Unavailable</Option>
                  <Option value="quality_concerns">Quality Concerns</Option>
                  <Option value="admin_decision">Admin Decision</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Additional Notes (Optional)"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Provide additional context for the removal (optional)"
                  maxLength={500}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectAnnotators;