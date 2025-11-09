
import { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Space, Spin, Alert, Card } from "antd";
import { SearchOutlined, ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";

const { Search } = Input;

const MicroTasker = () => {
  const [microTaskers, setMicroTaskers] = useState<DTUser[]>([]);

  const {
    getMicroTaskers,
    loading,
    error,
    resetState
  } = useGetAllDtUsers();

  useEffect(() => {
    fetchMicroTaskers();
  }, []);

  const fetchMicroTaskers = async () => {
    const taskers = await getMicroTaskers();
    setMicroTaskers(taskers);
  };

  const handleRefresh = () => {
    resetState();
    fetchMicroTaskers();
  };

  const handleSearch = async (value: string) => {
    const taskers = await getMicroTaskers();
    if (value) {
      const filtered = taskers.filter(user =>
        user.fullName.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setMicroTaskers(filtered);
    } else {
      setMicroTaskers(taskers);
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
            <Tag key={index} color="purple">{domain}</Tag>
          ))}
        </div>
      ),
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
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: DTUser, b: DTUser) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
              <h3 className="text-lg font-semibold text-purple-700 mb-1">
                <TeamOutlined className="mr-2" />
                MicroTaskers
              </h3>
              <p className="text-gray-600">
                Total: {microTaskers.length} active micro-taskers
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
            onSearch={handleSearch}
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
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} micro-taskers`,
          }}
          scroll={{ x: 1000 }}
        />
      </Spin>
    </div>
  );
};

export default MicroTasker;