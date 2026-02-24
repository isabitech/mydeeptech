import React from "react";
import { Space, Tag, Button, Dropdown, message } from "antd";
import { 
  DatabaseOutlined, 
  FolderOutlined, 
  BranchesOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { Typography } from "antd";
import type { TableDataType } from "./types";

const { Text } = Typography;

interface TableColumnsProps {
  onEditCategory: (categoryId: string, categoryName: string) => void;
  onEditSubCategory: (subCategoryId: string, subCategoryName: string, categoryId?: string) => void;
  onEditDomain: (domainId: string, domainName: string, categoryId: string, subCategoryId: string | null) => void;
  onDeleteCategory: (categoryId: string, categoryName: string) => void;
  onDeleteSubCategory: (subCategoryId: string, subCategoryName: string, categoryId: string) => void;
  onDeleteDomain: (domainId: string, domainName: string, categoryId: string, subCategoryId?: string) => void;
}

export const createTableColumns = ({
  onEditCategory,
  onEditSubCategory,
  onEditDomain,
  onDeleteCategory,
  onDeleteSubCategory,
  onDeleteDomain
}: TableColumnsProps) => [
  {
    title: (
      <Space>
        <FolderOutlined />
        <span>Category</span>
      </Space>
    ),
    dataIndex: 'categoryName',
    key: 'category',
    render: (text: string, record: any) => ({
      children: (
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {text}
        </div>
      ),
      props: {
        rowSpan: record.categoryRowSpan,
      },
    }),
    width: '20%',
  },
  {
    title: (
      <Space>
        <BranchesOutlined />
        <span>Sub-Category</span>
      </Space>
    ),
    dataIndex: 'subCategoryName',
    key: 'subCategory',
    render: (text: string) => (
      <Tag color={text === 'No Sub-Category' ? 'default' : 'cyan'} style={{ fontSize: '12px' }}>
        {text}
      </Tag>
    ),
    width: '40%',
  },
  {
    title: (
      <Space>
        <DatabaseOutlined />
        <span>Domains</span>
      </Space>
    ),
    dataIndex: 'domains',
    key: 'domains',
    render: (domains: { _id: string; name: string; slug: string; }[]) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px' }}>
        {domains.map((domain) => (
          <div key={domain._id} style={{ marginBottom: '4px' }}>
            <Tag 
              color="green" 
              style={{ 
                borderRadius: '4px',
                display: 'block',
                textAlign: 'center'
              }}
            >
              <div>{domain.name}</div>
            </Tag>
          </div>
        ))}
        {domains.length === 0 && (
          <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
            No domains
          </Text>
        )}
      </div>
    ),
    width: '30%',
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: TableDataType) => {
      const editItems = [
        {
          key: 'edit-category',
          label: 'Category',
          icon: <EditOutlined />,
          onClick: () => onEditCategory(record.categoryId, record.categoryName || 'Unknown')
        },
        {
          key: 'edit-subcategory',
          label: 'Sub-Category',
          icon: <EditOutlined />,
          onClick: () => onEditSubCategory(record.subCategoryId || record.categoryId, record.subCategoryName, record.categoryId)
        },
        {
          key: 'edit-domain',
          label: 'Domain',
          icon: <EditOutlined />,
          onClick: () => {
            if (record.domains.length > 0) {
              onEditDomain(record.domains[0]._id, record.domains[0].name, record.categoryId, record.subCategoryId);
            } else {
              message.warning('No domain available to edit');
            }
          }
        }
      ];

      const deleteItems = [
        {
          key: 'delete-category',
          label: 'Category',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onDeleteCategory(record.categoryId, record.categoryName || 'Unknown')
        },
        {
          key: 'delete-subcategory',
          label: 'Sub-Category',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => onDeleteSubCategory(record.subCategoryId || record.categoryId, record.subCategoryName, record.categoryId)
        },
        {
          key: 'delete-domain',
          label: 'Domain',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            if (record.domains.length > 0) {
              onDeleteDomain(record.domains[0]._id, record.domains[0].name, record.categoryId, record.subCategoryId || undefined);
            } else {
              message.warning('No domain available to delete');
            }
          }
        }
      ];

      return (
        <Space size="small">
          <Dropdown
            menu={{ items: editItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="primary" size="small" icon={<EditOutlined />}>
              Edit
            </Button>
          </Dropdown>

          <Dropdown
            menu={{ items: deleteItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Dropdown>
        </Space>
      );
    },
    width: '15%',
  }
];