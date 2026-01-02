import { useEffect, useState, useCallback, useRef } from "react";
import { Table, Input, Button, Tag, Space, Spin, Alert, Card, Descriptions, Modal, notification } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, UserDeleteOutlined, FileImageOutlined } from "@ant-design/icons";
import { useQAUsers, QAUser } from "../../../../hooks/Auth/Admin/Annotators/useQAUsers";
import { useQAManagement } from "../../../../hooks/Auth/Admin/Annotators/useQAManagement";
import PageModal from "../../../../components/Modal/PageModal";

const { Search } = Input;

const QAAnnotators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQAUser, setSelectedQAUser] = useState<QAUser | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading,
    error,
    qaUsers,
    pagination,
    summary,
    getApprovedQAUsers,
    resetState,
  } = useQAUsers();

  const {
    rejectQA,
    loading: qaLoading,
  } = useQAManagement();

  useEffect(() => {
    fetchQAUsers();
  }, [currentPage, pageSize]);

  const fetchQAUsers = async (search = searchTerm, page = currentPage, limit = pageSize) => {
    await getApprovedQAUsers({
      search: search || undefined,
      page,
      limit,
    });
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchQAUsers(value, 1, pageSize);
    }, 500);
  }, [pageSize]);

  const handleRefresh = () => {
    setCurrentPage(1);
    setSearchTerm("");
    resetState();
    fetchQAUsers("", 1, pageSize);
  };

  const handleViewDetails = (qaUser: QAUser) => {
    setSelectedQAUser(qaUser);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQAUser(null);
  };

  const handleRemoveFromQA = async (userId: string, fullName: string) => {
    Modal.confirm({
      title: 'Remove from QA',
      content: `Are you sure you want to remove ${fullName} from QA status?`,
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const result = await rejectQA(userId, 'Removed from QA by admin');

          if (result.success) {
            const successMessage = result.message || `${fullName} has been removed from QA successfully`;
            notification.open({
              type: 'success',
              message: 'QA Removal Successful',
              description: successMessage,
              placement: 'topRight',
            });
            handleCloseModal();
            fetchQAUsers(); // Refresh the data
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
      sorter: (a: QAUser, b: QAUser) => a.fullName.localeCompare(b.fullName),
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
      title: 'Annotator Status',
      dataIndex: 'annotatorStatus',
      key: 'annotatorStatus',
      render: (status: string) => (
        <Tag color="green">{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'QA Status',
      dataIndex: 'qaStatus',
      key: 'qaStatus',
      render: (qaStatus: string) => (
        <Tag color="blue">
          <span>✓ QA {qaStatus.toUpperCase()}</span>
        </Tag>
      ),
    },
    {
      title: 'QA Approved Date',
      dataIndex: 'qaApprovedAt',
      key: 'qaApprovedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a: QAUser, b: QAUser) => {
        const dateA = a.qaApprovedAt ? new Date(a.qaApprovedAt).getTime() : 0;
        const dateB = b.qaApprovedAt ? new Date(b.qaApprovedAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: QAUser) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            View
          </Button>
          <Button
            danger
            icon={<UserDeleteOutlined />}
            onClick={() => handleRemoveFromQA(record._id, record.fullName)}
            size="small"
            loading={qaLoading}
          >
            Remove QA
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  if (error) {
    return (
      <Alert
        message="Error Loading QA Annotators"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="qa-annotators">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QA Annotators ({pagination?.totalUsers || 0})
          </h3>
          <Tag color="blue" className="text-sm">
            Quality Assurance Team
          </Tag>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Search
            placeholder="Search QA annotators..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={qaUsers}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination?.totalUsers || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} QA annotators`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Spin>

      {/* QA User Details Modal */}
      <PageModal
        openModal={isModalOpen}
        onCancel={handleCloseModal}
        closable={true}
        className="qa-user-details-modal"
        modalwidth="800px"
      >
        {selectedQAUser && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">QA Annotator Details</h2>
              <div className="flex gap-2">
                <Tag color="blue">QA {selectedQAUser.qaStatus.toUpperCase()}</Tag>
                <Tag color="green">{selectedQAUser.annotatorStatus.toUpperCase()}</Tag>
              </div>
            </div>

            {/* Personal Information */}
            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{selectedQAUser.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedQAUser.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{selectedQAUser.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{selectedQAUser.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email Status">
                  <Tag color={selectedQAUser.isEmailVerified ? 'green' : 'red'}>
                    {selectedQAUser.isEmailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Professional Information */}
            <Card className="mb-6">
              <Descriptions title="Professional Information" bordered column={2}>
                <Descriptions.Item label="Domains">
                  <div>
                    {selectedQAUser.domains?.map((domain, index) => (
                      <Tag key={index} color="blue">{domain}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Assessment Result">
                  {selectedQAUser.resultLink ? (
                    <a href={selectedQAUser.resultLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View Assessment Result
                    </a>
                  ) : (
                    <span className="text-gray-500">No Result Available</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* QA Information */}
            <Card className="mb-6">
              <Descriptions title="QA Information" bordered column={2}>
                <Descriptions.Item label="QA Status">
                  <Tag color="blue">QA {selectedQAUser.qaStatus.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="QA Approved Date">
                  {selectedQAUser.qaApprovedAt ? new Date(selectedQAUser.qaApprovedAt).toLocaleString() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Approved By">
                  {selectedQAUser.qaApprovedBy || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="QA Reason">
                  {selectedQAUser.qaReason || 'Elevated to QA'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ID Documents */}
            {selectedQAUser.idDocuments && selectedQAUser.idDocuments.length > 0 && (
              <Card className="mb-6">
                <Descriptions title="ID Documents" bordered>
                  <Descriptions.Item label="Documents">
                    <div className="flex flex-wrap gap-2">
                      {selectedQAUser.idDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                          <FileImageOutlined />
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                            Document {index + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                danger
                icon={<UserDeleteOutlined />}
                onClick={() => handleRemoveFromQA(selectedQAUser._id, selectedQAUser.fullName)}
                loading={qaLoading}
                className="font-[gilroy-regular]"
              >
                Remove from QA
              </Button>
            </div>
          </div>
        )}
      </PageModal>
    </div>
  );
};

export default QAAnnotators;