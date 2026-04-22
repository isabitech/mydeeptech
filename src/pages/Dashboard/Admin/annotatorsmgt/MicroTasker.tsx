
import { useEffect } from "react";
import { Table, Input, Button, Space, Spin, Alert, Card, Tag } from "antd";
import { SearchOutlined, ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { annotatorsQueryService } from "../../../../services/annotators-service";
import { AnnotatorUserSchema } from "../../../../validators/annotators/annotators-schema";
import { StatusTag } from "./components";
import { useAnnotatorFilters } from "./hooks";

const { Search } = Input;

const MicroTasker = () => {
  // Use custom hooks for separation of concerns
  const filters = useAnnotatorFilters({ countryFilter: "all" });
  
  // Use TanStack Query hook for data fetching approved micro-taskers
  const {
    users: microTaskers,
    pagination,
    isLoading: loading,
    isError,
    error: queryError,
    refetch
  } = annotatorsQueryService.useGetAllDTUsers({
    ...filters.queryParams,
    status: 'approved'
  });

  // Convert query error to string for compatibility
  const error = queryError ? (queryError.message || 'Failed to fetch micro-taskers') : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => filters.cleanup();
  }, [filters]);

  // Handle refresh with filter reset
  const handleRefresh = () => {
    filters.resetFilters();
    refetch();
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: AnnotatorUserSchema, b: AnnotatorUserSchema) => a.fullName.localeCompare(b.fullName),
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
      dataIndex: 'userDomains',
      key: 'userDomains',
      render: (_: unknown, record: AnnotatorUserSchema) => {
        // Prioritize userDomains over legacy domains
        const domains = record.userDomains && record.userDomains.length > 0 
          ? record.userDomains.map((ud: { name: string }) => ud.name)
          : record.domains || [];
        
        return (
          <div className="flex items-center gap-y-1 flex-wrap">
            {domains?.map((domain: string, index: number) => (
              <Tag key={index} color="purple">{domain}</Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'MicroTasker Status',
      dataIndex: 'microTaskerStatus',
      key: 'microTaskerStatus',
      render: (status: string) => (
        <Tag color="purple">
          <TeamOutlined /> {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Email Verified',
      dataIndex: 'isEmailVerified',
      key: 'isEmailVerified',
      render: (verified: boolean) => (
        <StatusTag 
          status={verified.toString()} 
          type="boolean" 
          trueLabel="VERIFIED" 
          falseLabel="UNVERIFIED" 
        />
      ),
    },
    {
      title: 'Password Set',
      dataIndex: 'hasSetPassword',
      key: 'hasSetPassword',
      render: (hasPassword: boolean) => (
        <StatusTag 
          status={hasPassword.toString()} 
          type="boolean" 
          trueLabel="SET" 
          falseLabel="NOT SET" 
        />
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: AnnotatorUserSchema, b: AnnotatorUserSchema) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  // Error state
  if (isError && error) {
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
          onClose={() => refetch()}
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
              <h3 className="text-lg font-semibold text-purple-700 mb-1">
                <TeamOutlined className="mr-2" />
                MicroTaskers
              </h3>
              <p className="text-gray-600">
                Total: {microTaskers?.length || 0} active micro-taskers
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
            placeholder="Search micro-taskers..."
            allowClear
            onSearch={filters.handleSearch}
            onChange={(e) => filters.handleSearchChange(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={microTaskers || []}
          rowKey="_id"
          pagination={{
            current: pagination?.currentPage || filters.currentPage,
            pageSize: pagination?.usersPerPage || filters.pageSize,
            total: pagination?.totalUsers || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} micro-taskers`,
            onChange: filters.handlePagination
          }}
          scroll={{ x: 1000 }}
        />
      </Spin>
    </div>
  );
};

export default MicroTasker;