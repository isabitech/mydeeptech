import React, { useState } from "react";
import { Table, Button, Space, Input, Switch, Tag, Modal, Typography, Dropdown, MenuProps } from "antd";
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { resourceListQueryOptions } from "../../../../api/rbac/resourceQueries";
import { useResourceDelete, useResourceTogglePublish } from "../../../../api/rbac/resourceMutations";
import { ResourceModule } from "../../../../api/rbac/rbacSchema";
import ResourceForm from "./ResourceForm";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const ResourcesList: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceModule | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceModule | null>(null);

  const { data: resourcesResponse, isLoading } = useQuery(
    resourceListQueryOptions({ q: searchText })
  );
  
  const { mutate: deleteResource, isPending: isDeletePending } = useResourceDelete();
  const { mutate: togglePublish } = useResourceTogglePublish();

  const resources = resourcesResponse?.data ?? [];

  const handleCreate = () => {
    setEditingResource(null);
    setIsModalVisible(true);
  };

  const handleEdit = (resource: ResourceModule) => {
    setEditingResource(resource);
    setIsModalVisible(true);
  };

  const handleDelete = (resource: ResourceModule) => {
    setResourceToDelete(resource);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteExecute = () => {
    if (resourceToDelete?._id) {
      deleteResource(resourceToDelete._id, {
        onSuccess: (res) => {
          if (res.success) {
            setIsDeleteModalVisible(false);
            setResourceToDelete(null);
          }
        }
      });
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: ResourceModule) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>/{record.resourceKey}</Text>
        </Space>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (link: string) => <Tag color="blue">{link}</Tag>,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (icon: string) => icon || "-",
    },
    {
      title: "Parent",
      dataIndex: "parent",
      key: "parent",
      render: (parent: any) => {
        if (!parent) return <Tag>Root</Tag>;
        return typeof parent === "object" ? parent.title : parent;
      },
    },
    {
      title: "Sort",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished: boolean, record: ResourceModule) => (
        <Space direction="vertical" align="center" size={0}>
          <Switch 
            size="small" 
            checked={isPublished} 
            onChange={() => togglePublish(record._id!)} 
          />
          {isPublished ? (
            <Tag color="success" style={{ fontSize: "10px", marginTop: "4px" }}>Live</Tag>
          ) : (
            <Tag color="default" style={{ fontSize: "10px", marginTop: "4px" }}>Draft</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM D, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: ResourceModule) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: "#1565C0" }} />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ margin: 0 }}>Resource Modules</Title>
          <Text type="secondary">Manage sidebar menus, modules, and internal resources hierarchy.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleCreate}
          className="bg-[#1565C0]"
        >
          Add Resource
        </Button>
      </div>

      <Space className="mb-6 w-full justify-between">
        <Space>
          <Input
            placeholder="Search resources..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-72"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
        
        <Text type="secondary" className="text-sm">
          Total Resources: <span className="font-semibold text-gray-700">{resources.length}</span>
        </Text>
      </Space>

      <Table
        columns={columns}
        dataSource={resources}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10, position: ["bottomCenter"] }}
        className="rbac-resource-table"
        scroll={{ x: 1000 }}
      />

      <ResourceForm
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        editingResource={editingResource}
        allResources={resources}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Resource"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            loading={isDeletePending}
            onClick={handleDeleteExecute}
          >
            Delete Resource
          </Button>
        ]}
      >
        <p>
          Are you sure you want to delete the resource <span className="font-bold">"{resourceToDelete?.title}"</span>? 
          This will remove the resource and its child associations. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ResourcesList;
