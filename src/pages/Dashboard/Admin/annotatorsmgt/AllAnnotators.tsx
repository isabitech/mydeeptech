import { useEffect, useState, useCallback, useRef } from "react";
import { Table, Input, Select, Button, Tag, Space, Spin, Alert, Descriptions, Card, notification, Modal, Image } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, CheckOutlined, CloseOutlined, FileImageOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { DTUser, useGetAllDtUsers } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import { useApproveUser } from "../../../../hooks/Auth/Admin/Annotators/useApproveUser";
import { useQAManagement } from "../../../../hooks/Auth/Admin/Annotators/useQAManagement";
import PageModal from "../../../../components/Modal/PageModal";

const { Search } = Input;
const { Option } = Select;

const AllAnnotators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState<DTUser | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    getAllDTUsers,
    loading,
    error,
    users,
    pagination,
    resetState
  } = useGetAllDtUsers();

  const {
    approveUser,
    loading: updateLoading,
    error: updateError
  } = useApproveUser();

  const {
    approveQA,
    rejectQA,
    loading: qaLoading,
    error: qaError
  } = useQAManagement();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = currentPage, limit = pageSize, search = searchTerm, status = statusFilter) => {
    await getAllDTUsers({
      page,
      limit,
      ...(status !== "all" && { status }),
      ...(search && { search })
    });
  };

  const handleRefresh = () => {
    resetState();
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    fetchUsers(1, pageSize, "", "all");
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Pass the search value directly to avoid stale state
    fetchUsers(1, pageSize, value, statusFilter);
  };

  // Debounced search for real-time typing
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search is cleared, fetch immediately
    if (!value) {
      setCurrentPage(1);
      fetchUsers(1, pageSize, "", statusFilter);
      return;
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, pageSize, value, statusFilter);
    }, 500); // 500ms delay
  }, [pageSize, statusFilter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    // Pass the filter value directly to avoid stale state
    fetchUsers(1, pageSize, searchTerm, value);
  };

  const handleViewDetails = (annotator: DTUser) => {
    setSelectedAnnotator(annotator);
    setIsModalOpen(true);
  };

  const handleViewResult = (annotator: DTUser) => {
    setSelectedAnnotator(annotator);
    setIsResultModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnotator(null);
  };

  const handleCloseResultModal = () => {
    setIsResultModalOpen(false);
    setSelectedAnnotator(null);
  };

  const handleApprove = async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    try {
      const status = 'approve';
      const result = await approveUser({
        userId: selectedAnnotator._id,
        status
      });

      if (result.success) {
        // Use API response message if available, otherwise use custom message
        const successMessage = result.message || `${type === 'annotator' ? 'Annotator' : 'MicroTasker'} approved successfully`;
        notification.open({
          type: 'success',
          message: 'User Approved',
          description: successMessage,
          placement: 'topRight',
        });
        handleCloseModal();
        handleCloseResultModal();
        fetchUsers(); // Refresh the data
      } else {
        // Use API error message if available, otherwise use custom message
        const errorMessage = result.error || result.message || 'Failed to approve user';
        notification.open({
          type: 'error',
          message: 'Approval Failed',
          description: errorMessage,
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while approving user';
      notification.open({
        type: 'error',
        message: 'Unexpected Error',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  const handleReject = async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    try {
      const status = 'reject';
      const result = await approveUser({
        userId: selectedAnnotator._id,
        status
      });

      if (result.success) {
        // Use API response message if available, otherwise use custom message
        const successMessage = result.message || `${type === 'annotator' ? 'Annotator' : 'MicroTasker'} rejected successfully`;
        notification.open({
          type: 'success',
          message: 'User Rejected',
          description: successMessage,
          placement: 'topRight',
        });
        handleCloseModal();
        handleCloseResultModal();
        fetchUsers(); // Refresh the data
      } else {
        // Use API error message if available, otherwise use custom message
        const errorMessage = result.error || result.message || 'Failed to reject user';
        notification.open({
          type: 'error',
          message: 'Rejection Failed',
          description: errorMessage,
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while rejecting user';
      notification.open({
        type: 'error',
        message: 'Unexpected Error',
        description: errorMessage,
        placement: 'topRight',
      });
    }
  };

  // QA Management Functions
  const handleElevateToQA = async () => {
    if (!selectedAnnotator) return;

    try {
      const result = await approveQA(selectedAnnotator._id);

      if (result.success) {
        // Use API response message if available, otherwise use custom message
        const successMessage = result.message || `${selectedAnnotator.fullName} has been elevated to QA successfully`;
        notification.open({
          type: 'success',
          message: 'QA Elevation Successful',
          description: successMessage,
          placement: 'topRight',
        });
        handleCloseModal();
        handleCloseResultModal();
        fetchUsers(); // Refresh the data
      } else {
        // Use API error message if available, otherwise use custom message
        const errorMessage = result.error || result.message || 'Failed to elevate user to QA';
        notification.open({
          type: 'error',
          message: 'QA Elevation Failed',
          description: errorMessage,
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
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
            // Use API response message if available, otherwise use custom message
            const successMessage = result.message || `${selectedAnnotator.fullName} has been removed from QA successfully`;
            notification.open({
              type: 'success',
              message: 'QA Removal Successful',
              description: successMessage,
              placement: 'topRight',
            });
            handleCloseModal();
            handleCloseResultModal();
            fetchUsers(); // Refresh the data
          } else {
            // Use API error message if available, otherwise use custom message
            const errorMessage = result.error || result.message || 'Failed to remove user from QA';
            notification.open({
              type: 'error',
              message: 'QA Removal Failed',
              description: errorMessage,
              placement: 'topRight',
            });
          }
        } catch (error: any) {
          // Handle unexpected errors
          const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while removing user from QA';
          notification.open({
            type: 'error',
            message: 'Unexpected Error',
            description: errorMessage,
            placement: 'topRight',
          });
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusColors = {
      approved: 'green',
      pending: 'orange',
      rejected: 'red',
      inactive: 'gray'
    };
    return (
      <Tag color={statusColors[status as keyof typeof statusColors] || 'default'}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 100,
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
      width: 300,
      render: (domains: string[]) => (
        <div className="flex items-center gap-px gap-y-1 w-[300px] flex-wrap">
          {domains?.map((domain, index) => (
            <Tag key={index} color="blue">{domain}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Annotator Status',
      dataIndex: 'annotatorStatus',
      key: 'annotatorStatus',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'MicroTasker Status',
      dataIndex: 'microTaskerStatus',
      key: 'microTaskerStatus',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'QA Status',
      dataIndex: 'qaStatus',
      key: 'qaStatus',
      render: (status: string) => {
        const qaColors = {
          approved: 'green',
          pending: 'orange',
          rejected: 'red'
        };
        return (
          <Tag color={qaColors[status as keyof typeof qaColors] || 'default'}>
            {status ? status.toUpperCase() : 'PENDING'}
          </Tag>
        );
      },
    },
    {
      title: 'Email Verified',
      width: 100,
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
      width: 100,
      render: (hasPassword: boolean) => (
        <Tag color={hasPassword ? 'green' : 'orange'}>
          {hasPassword ? 'SET' : 'NOT SET'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Assessment Result",
      dataIndex: "resultLink",
      key: "resultLink",
      width: 100,
      render: (link: string, record: DTUser) => (
        link ?
          <Button
            type="link"
            icon={<FileImageOutlined />}
            onClick={() => handleViewResult(record)}
          >
            View Result
          </Button>
          : "No Result"
      )
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: DTUser) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    }
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
        <Space size="middle" wrap>
          <Search
            placeholder="Search by name or email"
            allowClear
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              handleSearchChange(value);
            }}
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />

          <Select
            value={statusFilter}
            onChange={handleStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="approved">Approved</Option>
            <Option value="pending">Pending</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="submitted">Submitted</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users || []}
          rowKey="_id"
          pagination={{
            current: pagination?.currentPage || currentPage,
            pageSize: pagination?.usersPerPage || pageSize,
            total: pagination?.totalUsers || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
              // Fetch new data when pagination changes using updated fetchUsers function
              fetchUsers(page, size || 10, searchTerm, statusFilter);
            }
          }}
          scroll={{ x: "max-content" }}
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
              <h2 className="text-2xl font-bold text-white mb-2">Annotator Details</h2>
              <div className="flex gap-2">
                <Tag color={selectedAnnotator.annotatorStatus === 'approved' ? 'green' :
                  selectedAnnotator.annotatorStatus === 'pending' ? 'orange' : 'red'}>
                  Annotator: {selectedAnnotator.annotatorStatus?.toUpperCase()}
                </Tag>
                <Tag color={selectedAnnotator.microTaskerStatus === 'approved' ? 'green' :
                  selectedAnnotator.microTaskerStatus === 'pending' ? 'orange' : 'red'}>
                  MicroTasker: {selectedAnnotator.microTaskerStatus?.toUpperCase()}
                </Tag>
                <Tag color={selectedAnnotator.qaStatus === 'approved' ? 'green' :
                  selectedAnnotator.qaStatus === 'pending' ? 'orange' : 'red'}>
                  QA: {selectedAnnotator.qaStatus?.toUpperCase() || 'PENDING'}
                </Tag>
              </div>
            </div>

            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{selectedAnnotator.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedAnnotator.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedAnnotator.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{selectedAnnotator.personal_info?.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Time Zone">{selectedAnnotator.personal_info?.time_zone || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Available Hours/Week">{selectedAnnotator.personal_info?.available_hours_per_week || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email Verified" span={2}>
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
            <div className="flex justify-end gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-white text-sm font-medium">Annotator Actions:</span>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'approved'}
                    className="font-[gilroy-regular]"
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleReject('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'rejected'}
                    className="font-[gilroy-regular]"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-white text-sm font-medium">QA Management:</span>
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
          </div>
        )}
      </PageModal>

      {/* Image Result Modal */}
      <Modal
        title="Assessment Result"
        open={isResultModalOpen}
        onCancel={handleCloseResultModal}
        footer={null}
        width={800}
        centered
      >
        {selectedAnnotator && (
          <div>
            <Image
              src={selectedAnnotator.resultLink}
              alt="Assessment Result"
              style={{ width: '100%' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Space direction="vertical" size="middle">
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'approved'}
                    className="font-[gilroy-regular]"
                  >
                    Approve Annotator
                  </Button>
                  <Button
                    type="default"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleReject('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'rejected'}
                    className="font-[gilroy-regular]"
                  >
                    Reject Annotator
                  </Button>
                </Space>

                <Space>
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
                </Space>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllAnnotators;