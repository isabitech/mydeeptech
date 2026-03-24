import React, { useState } from "react";
import { Table, Input, Select, Avatar, Space, Button } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import {
  userListQueryOptions,
  roleListQueryOptions
} from "../../../../api/rbac/rbacQueries";
import { useUserRoleUpdate } from "../../../../api/rbac/rbacMutations";
import { RbacUser, Role } from "../../../../api/rbac/rbacSchema";
import Loader from "../../../../components/Loader";
import { useQuery } from "@tanstack/react-query";

const { Option } = Select;


const UserRoleAssignment: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, string>>({});

  // Queries & Mutations using strict schemas
  const { data: usersResponse, isLoading: isUsersLoading } = useQuery(
    userListQueryOptions({ search: searchQuery })
  );
  const { data: rolesResponse } = useQuery(roleListQueryOptions());
  const { mutate: updateUserRole, isPending: isUpdatePending } = useUserRoleUpdate();

  const users = usersResponse?.data ?? [];
  const roles = rolesResponse?.data ?? [];

  /**
   * Tracks role changes locally before they are saved.
   * @param userId - The ID of the user.
   * @param roleName - The new role name.
   */
  const handleRoleChange = (userId: string, roleName: string) => {
    setPendingRoleChanges(prev => ({ ...prev, [userId]: roleName }));
  };

  /**
   * Persists the role change for a specific user to the backend.
   * @param userId - The ID of the user to update.
   */
  const handleAssignmentSave = (userId: string) => {
    const newRole = pendingRoleChanges[userId];
    if (!newRole) return;

    updateUserRole({ userId, roleId: newRole }, {
      onSuccess: () => {
        setPendingRoleChanges(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: unknown, record: RbacUser) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            className="!bg-[#E3F2FD] !text-[#1565C0]"
          />
          <div>
            <div className="font-semibold text-gray-800">{record.fullName}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </Space>
      )
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-gray-500"
    },
    {
      title: "Assigned Roles",
      key: "assignedRoles",
      width: 300,
      render: (_: unknown, record: RbacUser) => {

        const currentRoleValue = record.role_permission;

        return (
          <Select
            value={pendingRoleChanges[record._id] || currentRoleValue}
            style={{ width: '100%' }}
            onChange={(value) => handleRoleChange(record._id, value)}
            className="rbac-select"
          >
            {roles.map((role: Role) => (
              <Option key={role._id} value={role._id}>{role.name}</Option>
            ))}
            {/* Fallback legacy roles */}
            {["admin", "user", "annotator", "moderator", "qa_reviewer"].map(role => (
              <Option key={role} value={role}>{role}</Option>
            ))}
          </Select>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: RbacUser) => (
        <Button
          type="link"
          onClick={() => handleAssignmentSave(record._id)}
          disabled={!pendingRoleChanges[record._id] || isUpdatePending}
          className="!font-semibold"
        >
          Save Changes
        </Button>
      )
    }
  ];

  return (
    <Space direction="vertical" className="w-full" size="middle">
      <div className="flex justify-end mb-2">
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined className="text-gray-400" />}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs rounded-lg"
        />
      </div>

      {isUsersLoading ? (
        <div className="py-10 text-center w-full flex items-center justify-center"><Loader /></div>
      ) : (
        <Table<RbacUser>
          dataSource={users}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 5, position: ["bottomCenter"] }}
        />
      )}
    </Space>
  );
};

export default UserRoleAssignment;
