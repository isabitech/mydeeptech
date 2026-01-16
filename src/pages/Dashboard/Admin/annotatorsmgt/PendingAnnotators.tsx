import { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Space, Spin, Alert, Card, Descriptions, message } from "antd";
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import { useApproveUser } from "../../../../hooks/Auth/Admin/Annotators/useApproveUser";
import PageModal from "../../../../components/Modal/PageModal";

const { Search } = Input;

const PendingAnnotators = () => {
  const [pendingUsers, setPendingUsers] = useState<DTUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState<DTUser | null>(null);

  const {
    getPendingAnnotators,
    loading,
    error,
    resetState
  } = useGetAllDtUsers();

  const {
    approveUser,
    loading: updateLoading
  } = useApproveUser();

  useEffect(() => {
    fetchPendingAnnotators();
  }, []);

  const fetchPendingAnnotators = async () => {
    const pending = await getPendingAnnotators();
    setPendingUsers(pending);
  };

  const handleRefresh = () => {
    resetState();
    fetchPendingAnnotators();
  };

  const handleSearch = async (value: string) => {
    const pending = await getPendingAnnotators();
    if (value) {
      const filtered = pending.filter(user =>
        user.fullName.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setPendingUsers(filtered);
    } else {
      setPendingUsers(pending);
    }
  };

  const handleViewDetails = (annotator: DTUser) => {
    setSelectedAnnotator(annotator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnotator(null);
  };

  const handleApprove = async () => {
    if (!selectedAnnotator) return;

    const result = await approveUser({
      userId: selectedAnnotator._id,
      status: 'approve'
    });

    if (result.success) {
      message.success('Annotator approved successfully');
      handleCloseModal();
      fetchPendingAnnotators(); // Refresh the data
    } else {
      message.error(result.error || 'Failed to approve annotator');
    }
  };

  const handleReject = async () => {
    if (!selectedAnnotator) return;

    const result = await approveUser({
      userId: selectedAnnotator._id,
      status: 'reject'
    });

    if (result.success) {
      message.success('Annotator rejected successfully');
      handleCloseModal();
      fetchPendingAnnotators(); // Refresh the data
    } else {
      message.error(result.error || 'Failed to reject annotator');
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: DTUser, b: DTUser) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Domains',
      dataIndex: 'domains',
      key: 'domains',
      render: (domains: string[]) => (
        <div>
          {domains?.map((domain, index) => (
            <Tag key={index} color="blue">{domain}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'annotatorStatus',
      key: 'annotatorStatus',
      render: (status: string) => (
        <Tag color="orange">
          <ClockCircleOutlined /> {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Email Verified',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'red'}>
          {verified ? 'VERIFIED' : 'UNVERIFIED'}
        </Tag>
      ),
    },
    {
      title: 'Password Set',
      dataIndex: 'hasSetPassword',
      key: 'hasSetPassword',
      render: (hasPassword: boolean) => (
        <Tag color={hasPassword ? 'green' : 'orange'}>
          {hasPassword ? 'SET' : 'NOT SET'}
        </Tag>
      ),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: DTUser, b: DTUser) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Assessment Result',
      dataIndex: 'resultLink',
      key: 'resultLink',
      render: (link: string) => (
        link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            View Result
          </a>
        ) : (
          <span className="text-gray-500">No Result</span>
        )
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DTUser) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            View Details
          </Button>
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
            <Button size="small" onClick={handleRefresh}>
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
    <div className="p-4">
      <div className="mb-4">
        <Card size="small" className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-1">
                <ClockCircleOutlined className="mr-2" />
                Pending Annotators
              </h3>
              <p className="text-gray-600">
                Total: {pendingUsers.length} pending approval
              </p>
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              type="primary"
            >
              Refresh
            </Button>
          </div>
        </Card>

        <Space size="middle">
          <Search
            placeholder="Search pending annotators..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={pendingUsers || []}
          rowKey="_id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} pending annotators`,
          }}
          scroll={{ x: 1200 }}
        />
      </Spin>

      {/* Annotator Details Modal */}
      <PageModal
        openModal={isModalOpen}
        onCancel={handleCloseModal}
        closable={true}
        className="annotator-details-modal"
        modalwidth="800px"
      >
        {selectedAnnotator && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Pending Annotator Details</h2>
              <Tag color="orange">
                <ClockCircleOutlined /> PENDING APPROVAL
              </Tag>
            </div>

            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{selectedAnnotator.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedAnnotator.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedAnnotator.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{selectedAnnotator.personal_info?.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Time Zone">{selectedAnnotator.personal_info?.time_zone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Available Hours/Week">{selectedAnnotator.personal_info?.available_hours_per_week || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Submitted Date">{new Date(selectedAnnotator.createdAt).toLocaleDateString()}</Descriptions.Item>
                <Descriptions.Item label="Email Verified">
                  <Tag color={selectedAnnotator.isEmailVerified ? 'green' : 'red'}>
                    {selectedAnnotator.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Professional Background" bordered column={2}>
                <Descriptions.Item label="Education Field">{selectedAnnotator.professional_background?.education_field || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Years of Experience">{selectedAnnotator.professional_background?.years_of_experience || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Primary Language">{selectedAnnotator.language_proficiency?.primary_language || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="English Fluency">{selectedAnnotator.language_proficiency?.english_fluency_level || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Domains & Skills" bordered column={1}>
                <Descriptions.Item label="Domains">
                  <div>
                    {selectedAnnotator.domains?.map((domain, index) => (
                      <Tag key={index} color="blue">{domain}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Assessment Result">
                  {selectedAnnotator.resultLink ? (
                    <a href={selectedAnnotator.resultLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View Assessment Result
                    </a>
                  ) : (
                    <span className="text-gray-500">No Result Available</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                loading={updateLoading}
                size="large"
              >
                Approve Annotator
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                loading={updateLoading}
                size="large"
              >
                Reject Annotator
              </Button>
            </div>
          </div>
        )}
      </PageModal>
    </div>
  );
};

export default PendingAnnotators;