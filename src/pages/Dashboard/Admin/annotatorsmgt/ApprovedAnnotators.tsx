import { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Space, Spin, Alert, Card, Descriptions, message, Modal, notification } from "antd";
import { SearchOutlined, ReloadOutlined, CheckOutlined, EyeOutlined, CloseOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import { useUpdateUserStatus } from "../../../../hooks/Auth/Admin/Annotators/useUpdateUserStatus";
import { useQAManagement } from "../../../../hooks/Auth/Admin/Annotators/useQAManagement";
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

  const {
    approveQA,
    rejectQA,
    loading: qaLoading,
    error: qaError
  } = useQAManagement();

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

  // QA Management Functions
  const handleElevateToQA = async () => {
    if (!selectedAnnotator) return;

    try {
      const result = await approveQA(selectedAnnotator._id);

      if (result.success) {
        const successMessage = result.message || `${selectedAnnotator.fullName} has been elevated to QA successfully`;
        notification.open({
          type: 'success',
          message: 'QA Elevation Successful',
          description: successMessage,
          placement: 'topRight',
        });
        handleCloseModal();
        fetchApprovedAnnotators(); // Refresh the data
      } else {
        const errorMessage = result.error || result.message || 'Failed to elevate user to QA';
        notification.open({
          type: 'error',
          message: 'QA Elevation Failed',
          description: errorMessage,
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while elevating user to QA';
      notification.open({
        type: 'error',
        message: 'Unexpected Error',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  const handleRemoveFromQA = async () => {
    if (!selectedAnnotator) return;

    Modal.confirm({
      title: 'Remove from QA',
      content: `Are you sure you want to remove ${selectedAnnotator.fullName} from QA status?`,
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const result = await rejectQA(selectedAnnotator._id, 'Removed from QA by admin');

          if (result.success) {
            const successMessage = result.message || `${selectedAnnotator.fullName} has been removed from QA successfully`;
            notification.open({
              type: 'success',
              message: 'QA Removal Successful',
              description: successMessage,
              placement: 'topRight',
            });
            handleCloseModal();
            fetchApprovedAnnotators(); // Refresh the data
          } else {
            const errorMessage = result.error || result.message || 'Failed to remove user from QA';
            notification.open({
              type: 'error',
              message: 'QA Removal Failed',
              description: errorMessage,
              placement: 'topRight',
            });
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while removing user from QA';
          notification.open({
            type: 'error',
            message: 'Unexpected Error',
            description: errorMessage,
            placement: 'topRight',
          });
        }
      },
    });
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
      title: 'QA Status',
      dataIndex: 'qaStatus',
      key: 'qaStatus',
      render: (qaStatus: string) => {
        const color = qaStatus === 'approved' ? 'blue' : qaStatus === 'pending' ? 'orange' : 'default';
        const text = qaStatus ? qaStatus.toUpperCase() : 'NOT QA';
        return <Tag color={color}>{text}</Tag>;
      },
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
            position: ['bottomCenter'],
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {/* QA Management Section */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-orange-800 text-sm font-medium">QA Management:</span>
                  <div className="flex gap-2">
                    {selectedAnnotator.qaStatus !== 'approved' ? (
                      <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleElevateToQA}
                        loading={qaLoading}
                        className="font-[gilroy-regular] bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c]"
                      >
                        Elevate to QA
                      </Button>
                    ) : (
                      <Button
                        danger
                        icon={<UserDeleteOutlined />}
                        onClick={handleRemoveFromQA}
                        loading={qaLoading}
                        className="font-[gilroy-regular]"
                      >
                        Remove from QA
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Management */}
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
          </div>
        )}
      </PageModal>
    </div>
  );
};

export default ApprovedAnnotators;