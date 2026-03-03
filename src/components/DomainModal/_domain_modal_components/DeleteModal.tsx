import React from "react";
import { Modal, Form, Select } from "antd";
import type { FormInstance } from "antd";
import type { 
  ModalEntity, 
  ModalData, 
  AvailableSubCategory,
  DomainWithCategorizationItem
} from "./types";

interface DeleteModalProps {
  isOpen: boolean;
  entity: ModalEntity;
  data: ModalData | null;
  form: FormInstance;
  domainsData: DomainWithCategorizationItem[] | undefined;
  onCancel: () => void;
  onSubmit: () => void;
  getSubCategoriesForCategory: (categoryId: string) => AvailableSubCategory[];
  getDomainsForCategoryAndSubCategory: (categoryId: string, subCategoryId: string) => any[];
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  entity,
  data,
  form,
  domainsData,
  onCancel,
  onSubmit,
  getSubCategoriesForCategory,
  getDomainsForCategoryAndSubCategory
}) => {
  return (
    <Modal
      title={`Delete ${entity?.charAt(0).toUpperCase()}${entity?.slice(1)}`}
      open={isOpen}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical">
        {entity === 'category' && (
          <div>
            <p>Are you sure you want to delete this category?</p>
            <p><strong>Name:</strong> {data?.name}</p>
            <p style={{ color: '#ff4d4f' }}>This action cannot be undone and will delete all associated sub-categories and domains.</p>
          </div>
        )}
        
        {entity === 'subcategory' && (
          <>
            <p>Select the sub-category you want to delete:</p>
            <Form.Item
              name="subcategoryToDelete"
              label="Sub-Category to Delete"
              rules={[{ required: true, message: 'Please select a sub-category to delete' }]}
            >
              <Select
                placeholder="Select a sub-category to delete"
                options={data?.categoryId ? 
                  getSubCategoriesForCategory(data.categoryId).map(subCategory => ({
                    label: subCategory.name,
                    value: subCategory.id
                  })) : []
                }
              />
            </Form.Item>
            <p style={{ color: '#ff4d4f' }}>This action cannot be undone and will delete all domains associated with this sub-category.</p>
          </>
        )}
        
        {entity === 'domain' && (
          <>
            <p>Select the domain you want to delete:</p>
            <Form.Item
              name="domainToDelete"
              label="Domain to Delete"
              rules={[{ required: true, message: 'Please select a domain to delete' }]}
            >
              <Select
                placeholder="Select a domain to delete"
                options={(() => {
                  if (data?.categoryId && data?.subCategoryId) {
                    return getDomainsForCategoryAndSubCategory(data.categoryId, data.subCategoryId).map((domain: any) => ({
                      label: domain.name,
                      value: domain._id
                    }));
                  } else if (data?.categoryId) {
                    const allDomainsForCategory = domainsData
                      ?.filter((item) => item.category._id === data.categoryId)
                      ?.flatMap((item) => item.domains) || [];
                    
                    return allDomainsForCategory.map((domain: any) => ({
                      label: domain.name,
                      value: domain._id
                    }));
                  }
                  return [];
                })()}
              />
            </Form.Item>
            <p style={{ color: '#ff4d4f' }}>This action cannot be undone.</p>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default DeleteModal;