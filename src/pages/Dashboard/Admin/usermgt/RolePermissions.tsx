import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Typography, Space, Divider, Modal, Button, notification } from "antd";
import {
    UserOutlined,
    CrownOutlined,
    SafetyOutlined,
    EyeOutlined,
    EditOutlined,
    MoreOutlined,
} from "@ant-design/icons";
import { Role, RolePermission } from "../../../../types/user.types";
import { roleManagementService } from "../../../../services/roleManagementService";
import Loader from "../../../../components/Loader";

const { Title, Text } = Typography;

const getRoleIcon = (roleName: string) => {
    const icons: Record<string, React.ReactNode> = {
        admin: <CrownOutlined />,
        user: <UserOutlined />,
        annotator: <EditOutlined />,
        moderator: <SafetyOutlined />,
        qa_reviewer: <EyeOutlined />,
    };
    return icons[roleName] || <UserOutlined />;
};

const getPermissionColor = (category: string) => {
    const colors: Record<string, string> = {
        dashboard: 'blue',
        user_management: 'red',
        project_management: 'orange',
        analytics: 'green',
        assessment_management: 'purple',
        system: 'magenta',
        reporting: 'cyan',
        moderation: 'volcano',
        annotation: 'lime',
        quality_assurance: 'gold',
    };
    return colors[category] || 'default';
};

const RolePermissions: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = async () => {
        setLoading(true);
        try {
            const rolesData = await roleManagementService.getRoles();
            setRoles(rolesData);
            
            // Extract all unique permissions from all roles
            const allUniquePermissions: RolePermission[] = [];
            const permissionMap = new Map<string, RolePermission>();
            
            rolesData.forEach(role => {
                role.permissions.forEach(permission => {
                    if (!permissionMap.has(permission.id)) {
                        permissionMap.set(permission.id, permission);
                    }
                });
            });
            
            setAllPermissions(Array.from(permissionMap.values()));
        } catch (error) {
            console.error('Error fetching roles and permissions:', error);
            notification.error({
                message: 'Failed to load roles and permissions',
                description: 'Please try refreshing the page',
            });
        } finally {
            setLoading(false);
        }
    };

    const showPermissions = (role: Role) => {
        setSelectedRole(role);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedRole(null);
    };
    const columns = [
        {
            title: 'Permission',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: RolePermission) => (
                <div>
                    <Text strong>{name.replace(/_/g, ' ').toUpperCase()}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color={getPermissionColor(category)}>
                    {category.toUpperCase()}
                </Tag>
            ),
        },
        ...roles.map((role) => ({
            title: (
                <Space>
                    {getRoleIcon(role.name)}
                    {role.displayName}
                </Space>
            ),
            key: role.name,
            render: (_: any, record: RolePermission) => {
                const hasPermission = role.permissions.some(p => p.id === record.id);
                return hasPermission ? (
                    <Tag color="green">✓ Allowed</Tag>
                ) : (
                    <Tag color="red">✗ Denied</Tag>
                );
            },
        })),
    ];

    return (
        <div className="p-6">
            <Title level={3}>Role Permissions</Title>
            <Text type="secondary">
                This section shows the permissions assigned to each role in the system.
            </Text>

            <Divider />

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader />
                </div>
            ) : (
                <>
                    {/* Role Cards */}
                    <div className="mb-6">
                        <Title level={4}>Available Roles</Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roles
                                .sort((a, b) => a.permissions.length - b.permissions.length)
                                .map((role) => (
                                <Card
                                    key={role.id}
                                    size="small"
                                    title={
                                        <Space>
                                            {getRoleIcon(role.name)}
                                            {role.displayName}
                                        </Space>
                                    }
                                    extra={
                                        <Button
                                            type="text"
                                            icon={<MoreOutlined />}
                                            onClick={() => showPermissions(role)}
                                            size="small"
                                            title="View Permissions"
                                        />
                                    }
                                >
                                    <Text type="secondary">{role.description}</Text>
                                    <br />
                                    <Text strong>Permissions: {role.permissions.length}</Text>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Divider />

                    {/* Permissions Table */}
                    <Card title="Permissions">
                        <Table
                            columns={columns}
                            dataSource={allPermissions}
                            rowKey="id"
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                                position: ['bottomCenter'],
                            }}
                            scroll={{ x: 1200 }}
                            size="small"
                        />
                    </Card>
                </>
            )}

            {/* Role Permissions Modal */}
            <Modal
                title={
                    selectedRole && (
                        <Space>
                            {getRoleIcon(selectedRole.name)}
                            <span>{selectedRole.displayName} Permissions</span>
                            <Tag color={getPermissionColor('access')}>
                                {selectedRole.permissions.length} permissions
                            </Tag>
                        </Space>
                    )
                }
                open={modalVisible}
                onCancel={closeModal}
                footer={[
                    <Button key="close" onClick={closeModal}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedRole && (
                    <div>
                        <div className="mb-4 p-4 bg-gray-50 rounded">
                            <Text strong>Role Description:</Text>
                            <br />
                            <Text type="secondary">{selectedRole.description}</Text>
                        </div>

                        <div className="flex items-center gap-3 w-full py-5">
                            <Text strong className="shrink-0">Assigned Permissions:</Text>
                        </div>

                        
                        <div className="space-y-3">
                            {selectedRole.permissions.map((permission) => (
                                <div key={permission.id} className="p-3 border rounded">
                                    <Space>
                                        <Text strong>
                                            {(permission.name || 'unknown_permission').replace(/_/g, ' ')?.toUpperCase()}
                                        </Text>
                                        <Tag color={getPermissionColor(permission.category)}>
                                            {(permission.category || 'general').toUpperCase()}
                                        </Tag>
                                    </Space>
                                    <div className="mt-2">
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            {permission.description || 'No description available'}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedRole.permissions.length === 0 && (
                            <div className="text-center py-8">
                                <Text type="secondary">This role has no permissions assigned.</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RolePermissions;