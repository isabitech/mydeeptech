import React from "react";
import { Modal, Form, Select, Input } from "antd";
import type { FormInstance } from "antd";
import type { 
  ModalEntity, 
  ModalData, 
  AvailableCategory, 
  AvailableSubCategory,
  DomainWithCategorizationItem
} from "./types";

interface EditModalProps {
  isOpen: boolean;
  entity: ModalEntity;
  data: ModalData | null;
  form: FormInstance;
  availableCategories: AvailableCategory[];
  selectedCategoryForSubCategory: string | null;
  selectedCategoryForDomain: string | null;
  selectedSubCategoryForDomain: string | null;
  domainsData: DomainWithCategorizationItem[] | undefined;
  onCancel: () => void;
  onSubmit: () => void;
  onCategorySelection: (categoryId: string) => void;
  onCategorySelectionForDomain: (categoryId: string) => void;
  onSubCategorySelection: (subCategoryId: string) => void;
  onSubCategorySelectionForDomain: (subCategoryId: string) => void;
  onDomainSelection: (domainId: string) => void;
  getSubCategoriesForCategory: (categoryId: string) => AvailableSubCategory[];
  getDomainsForCategoryAndSubCategory: (categoryId: string, subCategoryId: string) => any[];
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  entity,
  data,
  form,
  availableCategories,
  selectedCategoryForSubCategory,
  selectedCategoryForDomain,
  selectedSubCategoryForDomain,
  domainsData,
  onCancel,
  onSubmit,
  onCategorySelection,
  onCategorySelectionForDomain,
  onSubCategorySelection,
  onSubCategorySelectionForDomain,
  onDomainSelection,
  getSubCategoriesForCategory,
  getDomainsForCategoryAndSubCategory
}) => {
  return (
    <Modal
      title={`Edit ${entity?.charAt(0).toUpperCase()}${entity?.slice(1)}`}
      open={isOpen}
      onOk={onSubmit}
      onCancel={onCancel}
      okText="Update"
    >
      <Form form={form} layout="vertical">
        {entity === 'category' && (
          <>
            <Form.Item
              name="category"
              label="Select Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select
                placeholder="Select a category"
                onChange={onCategorySelection}
                options={availableCategories.map(category => ({
                  label: category.name,
                  value: category.id
                }))}
              />
            </Form.Item>
          </>
        )}
        
        {entity === 'subcategory' && (
          <>
            <Form.Item
              name="category"
              label="Select Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select
                placeholder="Select a category"
                value={selectedCategoryForSubCategory}
                onChange={onCategorySelection}
                options={availableCategories.map(category => ({
                  label: category.name,
                  value: category.id
                }))}
              />
            </Form.Item>
            <Form.Item
              name="subcategory"
              label="Select Sub-Category (Optional)"
            >
              <Select
                placeholder="Select a sub-category (optional)"
                value={selectedCategoryForSubCategory && getSubCategoriesForCategory(selectedCategoryForSubCategory).length > 0 ? form.getFieldValue('subcategory') : undefined}
                disabled={!selectedCategoryForSubCategory || getSubCategoriesForCategory(selectedCategoryForSubCategory).length === 0}
                onChange={(value) => {
                  if (selectedCategoryForSubCategory && getSubCategoriesForCategory(selectedCategoryForSubCategory).length > 0) {
                    onSubCategorySelection(value);
                  }
                }}
                options={selectedCategoryForSubCategory && getSubCategoriesForCategory(selectedCategoryForSubCategory).length > 0 ? 
                  getSubCategoriesForCategory(selectedCategoryForSubCategory).map(subCategory => ({
                    label: subCategory.name,
                    value: subCategory.id
                  })) : [{ label: "No sub-categories available", value: "" }]
                }
              />
            </Form.Item>
          </>
        )}
        
        {entity === 'domain' && (
          <>
            <Form.Item
              name="category"
              label="Select Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select
                placeholder="Select a category"
                value={selectedCategoryForDomain}
                onChange={onCategorySelectionForDomain}
                options={availableCategories.map(category => ({
                  label: category.name,
                  value: category.id
                }))}
              />
            </Form.Item>
            <Form.Item
              name="subcategory"
              label="Select Sub-Category"
              rules={[{ required: true, message: 'Please select a sub-category' }]}
            >
              <Select
                placeholder="Select a sub-category"
                value={selectedSubCategoryForDomain}
                disabled={!selectedCategoryForDomain || getSubCategoriesForCategory(selectedCategoryForDomain || '').length === 0}
                onChange={onSubCategorySelectionForDomain}
                options={selectedCategoryForDomain ? 
                  getSubCategoriesForCategory(selectedCategoryForDomain).map(subCategory => ({
                    label: subCategory.name,
                    value: subCategory.id
                  })) : []
                }
              />
            </Form.Item>
            <Form.Item
              name="domain"
              label="Select Domain"
              rules={[{ required: true, message: 'Please select a domain' }]}
            >
              <Select
                placeholder="Select a domain"
                disabled={!selectedCategoryForDomain}
                onChange={onDomainSelection}
                options={(() => {
                  if (selectedCategoryForDomain && selectedSubCategoryForDomain) {
                    return getDomainsForCategoryAndSubCategory(selectedCategoryForDomain, selectedSubCategoryForDomain).map((domain: any) => ({
                      label: domain.name,
                      value: domain._id
                    }));
                  } else if (selectedCategoryForDomain) {
                    const allDomainsForCategory = domainsData
                      ?.filter((item) => item.category._id === selectedCategoryForDomain)
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
          </>
        )}
        
        <Form.Item
          name="name"
          label={entity === 'subcategory' ? 'SubCategory Name' : 'Name'}
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea placeholder="Enter description (optional)" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;