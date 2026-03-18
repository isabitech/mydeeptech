import React, { useState, useEffect } from "react";
import { Table, Checkbox, Select, Button, Space, Typography, message } from "antd";
import { PlusOutlined, InfoCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  roleListQueryOptions,
  permissionListQueryOptions,
  roleByIdQueryOptions,
  rbacQueryKey
} from "../../../../api/rbac/rbacQueries";
import {
  useRolePermissionAdd,
  useRolePermissionRemove,
  usePermissionCreate
} from "../../../../api/rbac/rbacMutations";
import { Role, Permission } from "../../../../api/rbac/rbacSchema";
import Loader from "../../../../components/Loader";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { Option } = Select;
const { Text } = Typography;
const RolePermissionMatrix: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [dirtyPermissionIds, setDirtyPermissionIds] = useState<string[]>([]);
  const [initialPermissionIds, setInitialPermissionIds] = useState<string[]>([]);
  const [creatingPermissionKey, setCreatingPermissionKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rolesResponse, isLoading: isRolesLoading } = useQuery(roleListQueryOptions());
  const { data: permissionsResponse, isLoading: isPermissionsLoading } = useQuery(
    permissionListQueryOptions({ limit: 200 })
  );
  const { data: activeRole, isFetching: isRoleFetching } = useQuery(
    roleByIdQueryOptions(selectedRoleId)
  );

  const { mutateAsync: addPermissions, isPending: isAddPending } = useRolePermissionAdd();
  const { mutateAsync: removePermissions, isPending: isRemovePending } = useRolePermissionRemove();
  const { mutateAsync: createPermissionSync } = usePermissionCreate();

  const roles = rolesResponse?.data ?? [];
  const allPermissions = permissionsResponse?.data ?? [];

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0]._id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    const currentPermissions = activeRole?.permissions;
    if (currentPermissions && allPermissions.length > 0) {
      const permissionIds = currentPermissions
        .map((p) => {
          // If it's already an ID (string)
          if (typeof p === "string") return p;

          // If it's an object (as shown in your JSON snippet)
          if (typeof p === "object" && p !== null) {
            // Use _id if available
            if ("_id" in p && p._id) return p._id as string;

            // Otherwise, find the matching permission in the glossary (which HAS the ID)
            const match = allPermissions.find(
              (ap) => ap.resource === p.resource && ap.action === p.action
            );
            return match?._id;
          }
          return undefined;
        })
        .filter((id): id is string => !!id);

      setDirtyPermissionIds(permissionIds);
      setInitialPermissionIds(permissionIds);
    } else if (!selectedRoleId || (activeRole && !activeRole.permissions)) {
      setDirtyPermissionIds([]);
      setInitialPermissionIds([]);
    }
  }, [selectedRoleId, activeRole, allPermissions]);

  const hardcodedResources = [
    "overview", "annotators", "assessments", "projects", "applications",
    "payment", "invoice", "notifications", "support_chat", "user_roles",
    "employees", "settings", "roles", "permissions"
  ] as const;

  const dataResources = Array.from(new Set(allPermissions.map((p) => p.resource)));
  const resources = Array.from(new Set([...hardcodedResources, ...dataResources]));

  const actionOptions = ["view", "view_own", "create", "edit", "delete", "approve", "manage"] as const;

  /**
   * Toggles a permission ID in the dirty permissions state.
   */
  const handlePermissionToggle = async (resource: string, action: string, isChecked: boolean) => {
    if (!selectedRoleId) {
      message.info("Please select a role first");
      return;
    }

    let permission = allPermissions.find((p) => p.resource === resource && p.action === action);

    if (!permission) {
      const loadingKey = `${resource}-${action}`;
      try {
        setCreatingPermissionKey(loadingKey);
        const res = await createPermissionSync({
          name: `${resource}:${action}`,
          resource,
          action,
          description: `Auto-generated permission for ${action} on ${resource}`
        });

        if (res.success && res.data) {
          // Typed as unknown in schema, we need to treat it as Permission
          permission = res.data as Permission;

          // Using TanStack Query Client to manually update the cache for better UX
          // This makes the new permission visible to the UI immediately
          queryClient.setQueryData(permissionListQueryOptions({ limit: 200 }).queryKey, (old: any) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: [...old.data, permission]
            };
          });

          // Still invalidate to ensure we are in sync with the server's official state
          queryClient.invalidateQueries({ queryKey: rbacQueryKey.permissions });
        } else {
          throw new Error("Failed to create permission object");
        }
      } catch (error) {
        message.error("Could not initialize permission object in glossary");
        return;
      } finally {
        setCreatingPermissionKey(null);
      }
    }

    if (!permission?._id) return;

    if (isChecked) {
      setDirtyPermissionIds(prev => [...new Set([...prev, permission!._id!])]);
    } else {
      setDirtyPermissionIds(prev => prev.filter(id => id !== permission!._id));
    }
  };

  /**
   * Persists the matrix changes to the backend.
   */
  const handleMatrixUpdate = async () => {
    if (!selectedRoleId) {
      message.warning("Please select a role first");
      return;
    }

    const addedIds = dirtyPermissionIds.filter(id => !initialPermissionIds.includes(id));
    const removedIds = initialPermissionIds.filter(id => !dirtyPermissionIds.includes(id));

    if (addedIds.length === 0 && removedIds.length === 0) {
      message.info("No changes to save");
      return;
    }

    let hasError = false;

    try {
      if (addedIds.length > 0) {
        await addPermissions({ roleId: selectedRoleId, permissions: addedIds });
      }
      if (removedIds.length > 0) {
        await removePermissions({ roleId: selectedRoleId, permissions: removedIds });
      }
      message.success("Role permissions updated successfully!");
    } catch (error) {
      hasError = true;
      message.error("Failed to update role permissions.");
    }

    if (!hasError) {
      setInitialPermissionIds([...dirtyPermissionIds]);
    }
  };

  /**
   * Reverts changes to the last saved state for the active role.
   */
  const handleMatrixDiscard = () => {
    setDirtyPermissionIds([...initialPermissionIds]);
  };

  const columns = [
    {
      title: "Resource / Module",
      dataIndex: "resource",
      key: "resource",
      width: 250,
      render: (resource: string) => {
        const isSuperAdmin = activeRole?.name === 'super_admin';
        return (isSuperAdmin ? (
          <Text strong className="capitalize text-[#1565C0]">{resource.replace(/_/g, ' ')} (All Allowed)</Text>
        ) : (
          <Text strong className="capitalize">{resource.replace(/_/g, ' ')}</Text>
        ));
      }
    },
    ...actionOptions.map(action => ({
      title: action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' '),
      key: action,
      align: "center" as const,
      render: (_: unknown, record: { resource: string }) => {
        const permission = allPermissions.find((p) => p.resource === record.resource && p.action === action);
        const isLoading = creatingPermissionKey === `${record.resource}-${action}`;

        if (isLoading) {
          return <LoadingOutlined className="text-[#1565C0]" />;
        }

        const isChecked = permission?._id ? dirtyPermissionIds.includes(permission._id) : false;
        const isSuperAdmin = activeRole?.name === 'super_admin';

        return (
          <Checkbox
            className="rbac-matrix-checkbox"
            checked={isChecked || isSuperAdmin}
            onChange={(e) => handlePermissionToggle(record.resource, action, e.target.checked)}
            disabled={isSuperAdmin || isAddPending || isRemovePending || !selectedRoleId}
            title={!permission ? "This permission will be created in glossary when toggled" : ""}
          />
        );
      }
    }))
  ];

  const dataSource = resources.map(res => ({ resource: res }));
  const isInitialLoading = isRolesLoading || isPermissionsLoading || (isRoleFetching && !activeRole);
  const isPending = isAddPending || isRemovePending;

  return (
    <Space direction="vertical" className="w-full" size="large">
      <style>{`
        .rbac-matrix-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #475569;
          font-size: 12px;
        }
        .rbac-matrix-checkbox .ant-checkbox-inner {
          border-color: #cbd5e1;
          width: 18px;
          height: 18px;
        }
        .rbac-matrix-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #1565C0;
          border-color: #1565C0;
        }
      `}</style>

      <div className="flex justify-between items-center">
        <Space size="middle">
          <Text type="secondary">Editing Role:</Text>
          <Select
            placeholder="Select a role to edit permissions"
            style={{ width: 280 }}
            value={selectedRoleId}
            onChange={(roleId) => setSelectedRoleId(roleId)}
            className="rbac-select-large"
            loading={isRolesLoading}
          >
            {roles.map((role) => (
              <Option key={role._id} value={role._id}>{role.name}</Option>
            ))}
          </Select>
        </Space>

      </div>

      <div className="relative border border-gray-100 rounded-lg overflow-hidden">
        {isInitialLoading && (
          <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
            <Loader />
          </div>
        )}

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="resource"
          pagination={false}
          className="rbac-matrix-table"
          scroll={{ x: 'max-content' }}
        />
      </div>

      <div className="flex justify-between items-center bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">
        <Space>
          <InfoCircleOutlined className="text-[#1565C0]" />
          <Text type="secondary" className="text-sm">
            <span className="font-semibold text-gray-600">Pro Tip:</span> Changes here update live permissions. "Manage" supersedes other actions.
          </Text>
        </Space>
        <Space size="middle">
          <Button onClick={handleMatrixDiscard} className="rounded-lg" disabled={isPending}>Discard</Button>
          <Button
            type="primary"
            onClick={handleMatrixUpdate}
            loading={isPending}
            disabled={!selectedRoleId}
            className="!bg-[#1565C0] rounded-lg px-6"
          >
            Save Matrix Changes
          </Button>
        </Space>
      </div>
    </Space>
  );
};

export default RolePermissionMatrix;
