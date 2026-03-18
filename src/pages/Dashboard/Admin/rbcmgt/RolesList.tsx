import React, { useState } from "react";
import { Table, Tag, Space, Button, Modal, Form, Input, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { roleListQueryOptions } from "../../../../api/rbac/rbacQueries";
import { useRoleCreate, useRoleUpdate, useRoleDelete } from "../../../../api/rbac/rbacMutations";
import { Role } from "../../../../api/rbac/rbacSchema";
import Loader from "../../../../components/Loader";
import { useQuery } from "@tanstack/react-query";

/**
 * Component for listing and managing RBAC roles.
 * Displays role names, descriptions, and permission counts with strict typing.
 */
const RolesList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const { data: rolesResponse, isLoading: isRolesLoading } = useQuery(
    roleListQueryOptions()
  );
  
  const { mutate: createRole, isPending: isCreatePending } = useRoleCreate();
  const { mutate: updateRole, isPending: isUpdatePending } = useRoleUpdate();
  const { mutate: deleteRole, isPending: isDeletePending } = useRoleDelete();

  const roles = rolesResponse?.data ?? [];

  /**
   * Opens the modal for adding a new role.
   */
  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  /**
   * Opens the modal for editing an existing role.
   * @param role - The role to edit.
   */
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    });
    setIsModalOpen(true);
  };

  /**
   * Handles the submission of the role form (Create or Update).
   */
  const handleFormFinish = (values: { name: string; description: string }) => {
    if (editingRole) {
      updateRole(
        { roleId: editingRole._id, rawPayload: values },
        {
          onSuccess: (res) => {
            if (res.success) {
              setIsModalOpen(false);
            }
          },
        }
      );
    } else {
      createRole(values, {
        onSuccess: (res) => {
          if (res.success) {
            setIsModalOpen(false);
          }
        },
      });
    }
  };

  /**
   * Opens the deletion confirmation modal.
   * @param role - The role to be deleted.
   */
  const showDeleteConfirm = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteModalOpen(true);
  };

  /**
   * Executes the deletion of the selected role.
   */
  const handleDeleteExecute = () => {
    if (deletingRole) {
      deleteRole(deletingRole._id, {
        onSuccess: (res) => {
          if (res.success) {
            setIsDeleteModalOpen(false);
            setDeletingRole(null);
          }
        }
      });
    }
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (roleName: string) => <span className="font-semibold text-gray-800">{roleName}</span>
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      className: "text-gray-500 max-w-xs",
    },
    {
      title: "Permissions Count",
      key: "permissionsCount",
      render: (_: unknown, record: Role) => (
        <Tag color="blue" className="rounded-full px-3">
          {record.permissions?.length || 0} Permissions
        </Tag>
      )
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string | undefined) => date ? dayjs(date).format("MMM DD, YYYY") : "N/A"
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: Role) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            className="!text-[#1565C0]"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  if (isRolesLoading) {
    return <div className="py-10 text-center"><Loader /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
          ghost
        >
          Add Role
        </Button>
      </div>

      <Table<Role> 
        dataSource={roles} 
        columns={columns} 
        rowKey="_id" 
        pagination={false}
        className="custom-table"
      />

      {/* Add/Edit Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Add Role"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormFinish}
          initialValues={{ name: "", description: "" }}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter the role name" }]}
          >
            <Input placeholder="e.g. Content Manager" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} placeholder="Briefly describe what this role does..." />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isCreatePending || isUpdatePending}
                className="!bg-[#1565C0]"
              >
                {editingRole ? "Update Role" : "Create Role"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined className="text-red-500" />
            <span>Confirm Deletion</span>
          </Space>
        }
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            No, Keep it
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            loading={isDeletePending}
            onClick={handleDeleteExecute}
          >
            Yes, Delete Role
          </Button>
        ]}
      >
        <p>
          Are you sure you want to delete the role <span className="font-bold">"{deletingRole?.name}"</span>? 
          This action cannot be undone and may affect users assigned to this role.
        </p>
      </Modal>
    </div>
  );
};

export default RolesList;
