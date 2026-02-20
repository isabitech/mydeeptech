import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  Tooltip,
  notification,
  Card,
  Statistic,
  Row,
  Col,
  Avatar,
  Typography,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { User, UserRole, Role, PaginatedUsersResponse } from "../../../../types/user.types";
import { roleManagementService } from "../../../../services/roleManagementService";
import Loader from "../../../../components/Loader";

const { Option } = Select;
const { Text } = Typography;

const getRoleColor = (role: UserRole): string => {
  const colors = {
    admin: 'red',
    user: 'blue',
    annotator: 'green',
    moderator: 'orange',
    qa_reviewer: 'purple',
  };
  return colors[role] || 'default';
};

const getRoleIcon = (role: UserRole) => {
  const icons = {
    admin: <CrownOutlined />,
    user: <UserOutlined />,
    annotator: <EditOutlined />,
    moderator: <SafetyOutlined />,
    qa_reviewer: <EyeOutlined />,
  };
  return icons[role] || <UserOutlined />;
};

const RoleManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [roleStats, setRoleStats] = useState<Record<UserRole, number>>({
    admin: 0,
    user: 0,
    annotator: 0,
    moderator: 0,
    qa_reviewer: 0,
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [paginationLoading, setPaginationLoading] = useState<boolean>(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);


  // Fallback roles in case backend is not available
  const DEFAULT_ROLES: Role[] = [
    {
      id: '1',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access and management capabilities',
      permissions: [],
      isEditable: false,
    },
    {
      id: '2',
      name: 'user',
      displayName: 'Regular User',
      description: 'Standard user with basic access to the platform',
      permissions: [],
      isEditable: true,
    },
    {
      id: '3',
      name: 'annotator',
      displayName: 'Annotator',
      description: 'Can perform annotation tasks and access projects',
      permissions: [],
      isEditable: true,
    },
    {
      id: '4',
      name: 'moderator',
      displayName: 'Moderator',
      description: 'Can moderate content and manage user interactions',
      permissions: [],
      isEditable: true,
    },
    {
      id: '5',
      name: 'qa_reviewer',
      displayName: 'QA Reviewer',
      description: 'Can review and approve annotation work',
      permissions: [],
      isEditable: true,
    },
  ];

  // Load roles from backend or use defaults
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await roleManagementService.getRoles();
        setAvailableRoles(roles);
      } catch (error) {
        setAvailableRoles(DEFAULT_ROLES);
      }
    };

    fetchRoles();
  }, []);

  // Separate effect for fetching role statistics (only once)
  useEffect(() => {
    const fetchRoleStatistics = async () => {
      try {
        const roleStatistics = await roleManagementService.getRoleStatistics();
        setRoleStats(roleStatistics);
      } catch (error) {
        console.warn('Failed to fetch role statistics:', error);
        // Set default empty stats
        setRoleStats({
          admin: 0,
          user: 0,
          annotator: 0,
          moderator: 0,
          qa_reviewer: 0,
        });
      }
    };

    fetchRoleStatistics();
  }, []); // Only fetch once on mount

  // Fetch users with pagination and search (simplified - no statistics fetching)
  const fetchUsers = async (page: number = currentPage, limit: number = pageSize, search: string = searchTerm) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setPaginationLoading(true);
    }
    
    try {
      const response: PaginatedUsersResponse = await roleManagementService.getAllUsers(page, limit, search);
      setUsers(response.users);
      setCurrentPage(response.pagination.currentPage);
      setTotalUsers(response.pagination.totalUsers);

    } catch (error) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "Error fetching users",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, newRole: UserRole, reason?: string) => {
    try {
      await roleManagementService.updateUserRole(userId, newRole, reason);
      
      notification.success({
        message: "Role Updated",
        description: `User role has been successfully updated to ${newRole}`,
      });

      // Refresh users list at current page
      fetchUsers(currentPage, pageSize, searchTerm);
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      notification.error({
        message: "Error updating user role",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Handle role edit
  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      role: user.role,
      reason: '',
    });
    setEditModalVisible(true);
  };

  // Handle role update
  const handleSubmitRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const values = await form.validateFields();
      await updateUserRole(selectedUser._id, values.role, values.reason);
    } catch (error) {
      console.error("Error submitting role update:", error);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers(1, pageSize, value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchUsers(1, pageSize, '');
  };

  useEffect(() => {
    fetchUsers(1, pageSize); // Load first page with default page size
  }, []);

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, __: User, index: number) => (
        <Text strong>{(currentPage - 1) * pageSize + index + 1}</Text>
      ),
    },
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.firstname} {record.lastname}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Current Role',
      key: 'role',
      render: (record: User) => (
        <Tag 
          color={getRoleColor(record.role)} 
          icon={getRoleIcon(record.role)}
        >
          {availableRoles.find(role => role.name === record.role)?.displayName || record.role}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Tooltip title="Edit Role">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditRole(record)}
            >
              Edit Role
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="font-[gilroy-regular] p-6">
      {/* Role Statistics */}
      <Card title="Role Statistics" className="mb-6">
        <Row gutter={16}>
          {availableRoles.map((role) => (
            <Col xs={12} sm={8} md={6} lg={4} xl={4} key={role.id}>
              <Statistic
                title={role.displayName}
                value={roleStats[role.name]}
                prefix={getRoleIcon(role.name)}
                valueStyle={{ color: getRoleColor(role.name) }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* Users Table */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>All Users ({totalUsers})</span>
          </Space>
        }
      >
        {/* Search Field */}
        <div className="mb-4">
          <Input.Search
            placeholder="Search by name, email, phone, or role..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            loading={searchLoading}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={paginationLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalUsers,
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page: number, size: number) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrentPage(1); // Reset to first page when page size changes
                  fetchUsers(1, size, searchTerm);
                } else {
                  fetchUsers(page, size, searchTerm);
                }
              },
              onShowSizeChange: (current: number, size: number) => {
                setPageSize(size);
                setCurrentPage(1); // Reset to first page when page size changes
                fetchUsers(1, size, searchTerm);
              }
            }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* Edit Role Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
           <span> Edit Role </span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        onOk={handleSubmitRoleUpdate}
        width={500}
      >
        {selectedUser && (
          <Form form={form} layout="vertical">
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{selectedUser.firstname} {selectedUser.lastname}</Text>
                  <br />
                  <Text type="secondary">{selectedUser.email}</Text>
                  <br />
                  <Text type="secondary">Current Role: </Text>
                  <Tag color={getRoleColor(selectedUser.role)}>
                    {availableRoles.find(role => role.name === selectedUser.role)?.displayName}
                  </Tag>
                </div>
              </Space>
            </div>

            <Form.Item
              name="role"
              label="New Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select a role">
                {availableRoles.map((role) => (
                  <Option key={role.id} value={role.name}>
                    <Space>
                      {getRoleIcon(role.name)}
                      <span>{role.displayName}</span>
                    </Space>
                    <div style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                      {role.description}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Change (Optional)"
            >
              <Input.TextArea 
                placeholder="Provide a reason for this role change..."
                rows={3}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default RoleManagement;