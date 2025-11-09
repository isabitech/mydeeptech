import { useEffect, useState } from "react";
import { Table, Input, Select, Button, Tag, Space, Spin, Alert, Descriptions, Card, message } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { DTUser, useGetAllDtUsers } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import { useApproveUser } from "../../../../hooks/Auth/Admin/Annotators/useApproveUser";
import PageModal from "../../../../components/Modal/PageModal";

const { Search } = Input;
const { Option } = Select;

const AllAnnotators = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState<DTUser | null>(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = currentPage, limit = pageSize) => {
    await getAllDTUsers({
      page,
      limit,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(searchTerm && { search: searchTerm })
    });
  };

  const handleRefresh = () => {
    resetState();
    fetchUsers();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Trigger fetch with new search term
    setTimeout(() => {
      fetchUsers(1, pageSize);
    }, 0);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    // Trigger fetch with new filter
    setTimeout(() => {
      fetchUsers(1, pageSize);
    }, 0);
  };

  const handleViewDetails = (annotator: DTUser) => {
    setSelectedAnnotator(annotator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnotator(null);
  };

  const handleApprove = async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    const status = 'approve';
    const result = await approveUser({ 
      userId: selectedAnnotator._id, 
      status 
    });

    if (result.success) {
      message.success(`${type === 'annotator' ? 'Annotator' : 'MicroTasker'} approved successfully`);
      handleCloseModal();
      fetchUsers(); // Refresh the data
    } else {
      message.error(result.error || 'Failed to approve user');
    }
  };

  const handleReject = async (type: 'annotator' | 'microtasker') => {
    if (!selectedAnnotator) return;

    const status = 'reject';
    const result = await approveUser({ 
      userId: selectedAnnotator._id, 
      status 
    });

    if (result.success) {
      message.success(`${type === 'annotator' ? 'Annotator' : 'MicroTasker'} rejected successfully`);
      handleCloseModal();
      fetchUsers(); // Refresh the data
    } else {
      message.error(result.error || 'Failed to reject user');
    }
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
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'MicroTasker Status',
      dataIndex: 'microTaskerStatus',
      key: 'microTaskerStatus',
      render: (status: string) => getStatusTag(status),
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
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
        title: "Assessment Result",
        dataIndex: "resultLink",
        key: "resultLink",
        render: (link: string) => (
          link ? <a href={link} target="_blank" rel="noopener noreferrer">View Result</a> : "No Result"
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
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
              // Fetch new data when pagination changes
              getAllDTUsers({
                page,
                limit: size || 10,
                ...(statusFilter !== "all" && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
              });
            }
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
            <div className="flex justify-end gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-white text-sm font-medium">Annotator Actions:</span>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleApprove('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleReject('annotator')}
                    loading={updateLoading}
                    disabled={selectedAnnotator.annotatorStatus === 'rejected'}
                  >
                    Reject
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </PageModal>
    </div>
  );
};

export default AllAnnotators;