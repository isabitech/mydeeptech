import { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Space, Spin, Alert, Card, Descriptions, message } from "antd";
import { SearchOutlined, ReloadOutlined, CheckOutlined, EyeOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import { useUpdateUserStatus } from "../../../../hooks/Auth/Admin/Annotators/useUpdateUserStatus";
import PageModal from "../../../../components/Modal/PageModal";

const { Search } = Input;

const ApprovedAnnotators = () => {
  const [approvedUsers, setApprovedUsers] = useState<DTUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState<DTUser | null>(null);

  const {
    getApprovedAnnotators,
    loading,
    error,
    resetState
  } = useGetAllDtUsers();

  const {
    updateUserStatus,
    loading: updateLoading
  } = useUpdateUserStatus();

  useEffect(() => {
    fetchApprovedAnnotators();
  }, []);

  const fetchApprovedAnnotators = async () => {
    const approved = await getApprovedAnnotators();
    setApprovedUsers(approved);
  };

  const handleRefresh = () => {
    resetState();
    fetchApprovedAnnotators();
  };

  const handleSearch = async (value: string) => {
    const approved = await getApprovedAnnotators();
    if (value) {
      const filtered = approved.filter(user =>
        user.fullName.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setApprovedUsers(filtered);
    } else {
      setApprovedUsers(approved);
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

  const handleReject = async () => {
    if (!selectedAnnotator) return;

    const result = await updateUserStatus({
      userId: selectedAnnotator._id,
      annotatorStatus: 'reject'
    });

    if (result.success) {
      message.success('Annotator rejected successfully');
      handleCloseModal();
      fetchApprovedAnnotators(); // Refresh the data
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
        <Tag color="green">
          <CheckOutlined /> {status.toUpperCase()}
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
      title: 'Approved Date',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: DTUser, b: DTUser) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
              <h3 className="text-lg font-semibold text-green-700 mb-1">
                <CheckOutlined className="mr-2" />
                Approved Annotators
              </h3>
              <p className="text-gray-600">
                Total: {approvedUsers.length} approved annotators
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
            placeholder="Search approved annotators..."
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
          dataSource={approvedUsers || []}
          rowKey="_id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} approved annotators`,
          }}
          scroll={{ x: 1000 }}
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
              <h2 className="text-2xl font-bold text-white mb-2">Approved Annotator Details</h2>
              <Tag color="green">
                <CheckOutlined /> APPROVED
              </Tag>
            </div>

            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{selectedAnnotator.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedAnnotator.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedAnnotator.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{selectedAnnotator.personal_info?.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Approved Date">{new Date(selectedAnnotator.updatedAt).toLocaleDateString()}</Descriptions.Item>
                <Descriptions.Item label="Email Verified">
                  <Tag color={selectedAnnotator.isEmailVerified ? 'green' : 'red'}>
                    {selectedAnnotator.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Professional Information" bordered column={2}>
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

            {/* Action Button */}
            <div className="flex justify-end">
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                loading={updateLoading}
              >
                Revoke Approval
              </Button>
            </div>
          </div>
        )}
      </PageModal>
    </div>
  );
};

export default ApprovedAnnotators;