import { useEffect } from "react";
import { Table, Input, Button, Space, Spin, Alert, Card, Descriptions, Tag } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, UserDeleteOutlined, FileImageOutlined } from "@ant-design/icons";
import { annotatorsQueryService } from "../../../../services/annotators-service";
import {  QAUserSchema } from "../../../../validators/annotators/annotators-schema";
import PageModal from "../../../../components/Modal/PageModal";
import { StatusTag } from "./components";
import { useAnnotatorFilters, useAnnotatorModals, useAnnotatorActions } from "./hooks";

const { Search } = Input;

const QAAnnotators = () => {
  // Use custom hooks for separation of concerns
  const filters = useAnnotatorFilters({ countryFilter: "all" });
  const modals = useAnnotatorModals();
  
  // Use TanStack Query hook for data fetching QA annotators
  const {
    users: qaUsers,
    pagination,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
    isRefetching
  } = annotatorsQueryService.useGetQAAnnotators(filters.queryParams);

  // Convert query error to string for compatibility
  const error = queryError ? (queryError.message || 'Failed to fetch QA annotators') : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => filters.cleanup();
  }, [filters]);

  // Action handlers with auto-refresh and modal closing
  const actions = useAnnotatorActions({
    selectedAnnotator: modals.selectedAnnotator,
    onActionComplete: () => {
      refetch();
      modals.closeAllModals();
    }
  });

  // Handle refresh with filter reset
  const handleRefresh = () => {
    filters.resetFilters();
    refetch();
  };

  const handleRemoveFromQA = (user: QAUserSchema) => {
    modals.setSelectedAnnotator(user);
    actions.handleRemoveFromQA();
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: QAUserSchema, b: QAUserSchema) => a.fullName.localeCompare(b.fullName),
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
      render: (phone: string | undefined) => phone || 'N/A',
    },
    {
      title: 'Domains',
      dataIndex: 'userDomains',
      key: 'userDomains',
      render: (_: unknown, record: QAUserSchema) => {
        // Prioritize userDomains over legacy domains
        const domains = record.userDomains && record.userDomains.length > 0 
          ? record.userDomains.map((ud: { _id: string; name: string; assignmentId?: string }) => ud.name)
          : record.domains || [];
        
        return (
          <div>
            {domains?.map((domain: string, index: number) => (
                <Tag key={index} color="blue">{domain}</Tag>
            ))}
          </div>
        );
      },
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
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: QAUserSchema) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => modals.handleViewDetails(record)}
            size="small"
          >
            View
          </Button>
          <Button
            danger
            icon={<UserDeleteOutlined />}
            onClick={() => handleRemoveFromQA(record)}
            size="small"
            loading={actions.qaLoading}
          >
            Remove QA
          </Button>
        </Space>
      ),
    },
  ];

  // Error state
  if (isError && error) {
    return (
      <div className="p-4">
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
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QA Annotators ({pagination?.totalUsers || 0})
          </h3>
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
            Quality Assurance Team
          </span>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={loading || isRefetching}
            loading={loading || isRefetching}
          >
            Refresh
          </Button>
          <Search
            placeholder="Search QA annotators..."
            allowClear
            onSearch={filters.handleSearch}
            onChange={(e) => filters.handleSearchChange(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <Spin spinning={loading || isRefetching}>
        <Table<QAUserSchema>
          columns={columns}
          dataSource={qaUsers || []}
          rowKey="_id"
          pagination={{
            current: pagination?.currentPage || filters.currentPage,
            pageSize: pagination?.usersPerPage || filters.pageSize,
            total: pagination?.totalUsers || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} QA annotators`,
            onChange: filters.handlePagination
          }}
          scroll={{ x: 1000 }}
        />
      </Spin>

      {/* QA User Details Modal */}
      <PageModal
        openModal={modals.isModalOpen}
        onCancel={modals.handleCloseModal}
        closable={true}
        className="qa-user-details-modal"
        modalwidth="800px"
      >
        {modals.selectedAnnotator && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">QA Annotator Details</h2>
              <div className="flex gap-2">
                <StatusTag status={modals.selectedAnnotator.qaStatus || ''} type="qa" />
                <StatusTag status={modals.selectedAnnotator.annotatorStatus || ''} type="annotator" />
              </div>
            </div>

            {/* Personal Information */}
            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{modals.selectedAnnotator.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{modals.selectedAnnotator.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{modals.selectedAnnotator.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{modals.selectedAnnotator.personal_info?.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email Status">
                  <StatusTag 
                    status={(modals.selectedAnnotator.isEmailVerified ?? false).toString()} 
                    type="boolean" 
                    trueLabel="VERIFIED" 
                    falseLabel="UNVERIFIED" 
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Professional Information */}
            <Card className="mb-6">
              <Descriptions title="Professional Information" bordered column={2}>
                <Descriptions.Item label="Domains">
                  <div>
                    {/* Prioritize userDomains over legacy domains */}
                    {(modals.selectedAnnotator.userDomains && modals.selectedAnnotator.userDomains.length > 0 
                      ? modals.selectedAnnotator.userDomains.map((ud: { _id: string; name: string; assignmentId?: string }) => ud.name)
                      : modals.selectedAnnotator.domains || []
                    )?.map((domain: string, index: number) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs mr-1 mb-1">
                        {domain}
                      </span>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Assessment Result">
                  {modals.selectedAnnotator.resultLink ? (
                    <a href={modals.selectedAnnotator.resultLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
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
                  <StatusTag status={modals.selectedAnnotator.qaStatus || ''} type="qa" />
                </Descriptions.Item>
                <Descriptions.Item label="QA Approved Date">
                  {('qaApprovedAt' in modals.selectedAnnotator && modals.selectedAnnotator.qaApprovedAt) 
                    ? new Date(modals.selectedAnnotator.qaApprovedAt).toLocaleString() 
                    : 'N/A'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Approved By">
                  {('qaApprovedBy' in modals.selectedAnnotator && modals.selectedAnnotator.qaApprovedBy) || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="QA Reason">
                  {('qaReason' in modals.selectedAnnotator && modals.selectedAnnotator.qaReason) || 'Elevated to QA'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ID Documents */}
            {('idDocuments' in modals.selectedAnnotator && modals.selectedAnnotator.idDocuments && modals.selectedAnnotator.idDocuments.length > 0) && (
              <Card className="mb-6">
                <Descriptions title="ID Documents" bordered>
                  <Descriptions.Item label="Documents">
                    <div className="flex flex-wrap gap-2">
                      {modals.selectedAnnotator.idDocuments.map((doc: string, index: number) => (
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
                onClick={() => actions.handleRemoveFromQA()}
                loading={actions.qaLoading}
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