import React, { useState } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { permissionListQueryOptions } from "../../../../api/rbac/rbacQueries";
import { 
  usePermissionCreate, 
  usePermissionUpdate, 
  usePermissionDelete 
} from "../../../../api/rbac/rbacMutations";
import { Permission } from "../../../../api/rbac/rbacSchema";
import Loader from "../../../../components/Loader";
import { useQuery } from "@tanstack/react-query";

const { Option } = Select;

/**
 * Component for managing RBAC permissions (Glossary).
 * Allows viewing, creating, editing, and deleting permissions with strict validation.
 */
const PermissionsManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm<Partial<Permission>>();

  // Queries & Mutations using strict schemas and types
  const { data: permissionsResponse, isLoading: isPermissionsLoading } = useQuery(
    permissionListQueryOptions({ limit: 100 })
  );
  const { mutate: createPermission, isPending: isCreatePending } = usePermissionCreate();
  const { mutate: updatePermission, isPending: isUpdatePending } = usePermissionUpdate();
  const { mutate: deletePermission, isPending: isDeletePending } = usePermissionDelete();

  const permissions = permissionsResponse?.data ?? [];

  /**
   * Opens the edit modal with the selected permission data.
   * @param record - The permission object to edit.
   */
  const handlePermissionEdit = (record: Permission) => {
    setEditingPermission(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  /**
   * Opens the modal for adding a new permission.
   */
  const handlePermissionAdd = () => {
    setEditingPermission(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  /**
   * Opens the delete confirmation modal.
   */
  const showDeleteConfirm = (permission: Permission) => {
    setDeletingPermission(permission);
    setIsDeleteModalOpen(true);
  };

  /**
   * Executes the deletion of the selected permission.
   */
  const handleDeleteExecute = () => {
    if (deletingPermission?._id) {
      deletePermission(deletingPermission._id, {
        onSuccess: (res) => {
          if (res.success) {
            setIsDeleteModalOpen(false);
            setDeletingPermission(null);
          }
        }
      });
    }
  };

  /**
   * Handles form submission for both creation and updates.
   * @param values - Validated form values.
   */
  const handleFormFinish = (values: Partial<Permission>) => {
    if (editingPermission && editingPermission._id) {
      updatePermission(
        { permissionId: editingPermission._id, rawPayload: values }, 
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createPermission(values, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const resourceOptions = [
    "overview", "annotators", "assessments", "projects", "applications", 
    "payment", "invoice", "notifications", "support_chat", "user_roles", 
    "employees", "settings", "roles", "permissions"
  ] as const;

  const actionOptions = ["view", "view_own", "create", "edit", "delete", "approve", "manage"] as const;

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { 
      title: "Resource", 
      dataIndex: "resource", 
      key: "resource", 
      render: (resource: string) => <Tag color="blue">{resource}</Tag> 
    },
    { 
      title: "Action", 
      dataIndex: "action", 
      key: "action", 
      render: (action: string) => <Tag color="green">{action}</Tag> 
    },
    { 
      title: "Description", 
      dataIndex: "description", 
      key: "description", 
      className: "max-w-xs" 
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Permission) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handlePermissionEdit(record)} 
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            disabled={!record._id}
            onClick={() => showDeleteConfirm(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handlePermissionAdd} 
          ghost
        >
          Add Permission
        </Button>
      </div>

      {isPermissionsLoading ? (
        <div className="py-10 text-center w-full flex items-center justify-center"><Loader /></div>
      ) : (
        <Table<Permission> 
          dataSource={permissions} 
          columns={columns} 
          rowKey="_id" 
          pagination={{ pageSize: 5, position: ["bottomCenter"] }}
        />
      )}

      <Modal
        title={editingPermission ? "Edit Permission" : "Add Permission"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form<Partial<Permission>> form={form} layout="vertical" onFinish={handleFormFinish}>
          <Form.Item name="name" label="Permission Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. projects:view" />
          </Form.Item>
          <Form.Item name="resource" label="Resource" rules={[{ required: true }]}>
            <Select showSearch>
              {resourceOptions.map(res => <Option key={res} value={res}>{res}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="action" label="Action" rules={[{ required: true }]}>
            <Select showSearch>
              {actionOptions.map(act => <Option key={act} value={act}>{act}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={isCreatePending || isUpdatePending}
            >
              {editingPermission ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            loading={isDeletePending}
            onClick={handleDeleteExecute}
          >
            Delete Permission
          </Button>
        ]}
      >
        <p>
          Are you sure you want to delete the permission <span className="font-bold">"{deletingPermission?.name}"</span>? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PermissionsManagement;
