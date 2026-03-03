import React, { useState, useMemo, useCallback } from "react";
import { Form, message } from "antd";
import domainQueryService from "../../services/domain-service/domain-query";

// Import extracted components
import DomainTableCore from "./_domain_modal_components/DomainTableCore";
import EditModal from "./_domain_modal_components/EditModal";
import DeleteModal from "./_domain_modal_components/DeleteModal";
import { createTableColumns } from "./_domain_modal_components/TableColumns";

// Import types and utilities
import type { ModalType, ModalEntity, ModalData } from "./_domain_modal_components/types";
import {
  debounce,
  processTableData,
  getAvailableCategories,
  getSubCategoriesForCategory,
  getDomainsForCategoryAndSubCategory
} from "./_domain_modal_components/utils";

const DomainTable: React.FC = () => {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('edit');
  const [modalEntity, setModalEntity] = useState<ModalEntity>('category');
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [selectedCategoryForSubCategory, setSelectedCategoryForSubCategory] = useState<string | null>(null);
  const [selectedCategoryForDomain, setSelectedCategoryForDomain] = useState<string | null>(null);
  const [selectedSubCategoryForDomain, setSelectedSubCategoryForDomain] = useState<string | null>(null);
  const [isNameFieldDisabled, setIsNameFieldDisabled] = useState(false);
  const [form] = Form.useForm();

  const pageSize = 20;

  // API call
  const { data: domainsWithCategorizationData, isLoading, error } = domainQueryService.useDomainsWithCategorization({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Processed data
  const tableData = useMemo(() =>
    processTableData(domainsWithCategorizationData?.data?.domains),
    [domainsWithCategorizationData]
  );

  const availableCategories = useMemo(() =>
    getAvailableCategories(domainsWithCategorizationData?.data?.domains),
    [domainsWithCategorizationData]
  );

  // Helper functions
  const getSubCategoriesForCategoryHelper = (categoryId: string) =>
    getSubCategoriesForCategory(categoryId, domainsWithCategorizationData?.data?.domains);

  const getDomainsForCategoryAndSubCategoryHelper = (categoryId: string, subCategoryId: string) =>
    getDomainsForCategoryAndSubCategory(categoryId, subCategoryId, domainsWithCategorizationData?.data?.domains);

  // Modal handlers
  const openModal = (type: ModalType, entity: ModalEntity, data: ModalData) => {
    setModalType(type);
    setModalEntity(entity);
    setModalData(data);
    setIsModalOpen(true);

    if (type === 'edit') {
      // Pre-populate form for editing
      let nameValue = data.name;

      if (entity === 'category') {
        setSelectedCategoryForSubCategory(data.id);
        form.setFieldsValue({
          category: data.id,
          subcategory: data.subCategoryId || undefined,
          name: nameValue,
          description: data.description || ''
        });
      } else if (entity === 'subcategory') {
        if (data.categoryId) {
          setSelectedCategoryForSubCategory(data.categoryId);
        }

        if (nameValue === 'No Sub-Category' || nameValue?.toLowerCase().includes('no sub-category')) {
          nameValue = '';
          setIsNameFieldDisabled(true);
        } else {
          setIsNameFieldDisabled(false);
        }

        const availableSubCategories = data.categoryId ? getSubCategoriesForCategoryHelper(data.categoryId) : [];

        let subCategoryValue = undefined;
        if (availableSubCategories.length > 0) {
          if (nameValue !== 'No Sub-Category' && !nameValue?.toLowerCase().includes('no sub-category')) {
            subCategoryValue = data.id;
          }
        }

        form.setFieldsValue({
          category: data.categoryId || undefined,
          subcategory: subCategoryValue,
          name: nameValue,
          description: data.description || ''
        });
      } else {
        // Domain modal
        if (data.categoryId) {
          setSelectedCategoryForDomain(data.categoryId);

          // Only set the sub-category if the domain actually has one
          setSelectedSubCategoryForDomain(data.subCategoryId || null);
        }

        let availableDomains = [];
        // Only use the actual subCategoryId if it exists, don't fall back to first available
        const actualSubCategoryId = data.subCategoryId;

        if (data.categoryId && actualSubCategoryId) {
          availableDomains = getDomainsForCategoryAndSubCategoryHelper(data.categoryId, actualSubCategoryId);
        } else if (data.categoryId) {
          availableDomains = domainsWithCategorizationData?.data?.domains
            ?.filter((item: any) => item.category._id === data.categoryId)
            ?.flatMap((item: any) => item.domains) || [];
        }

        const defaultDomain = availableDomains.find((domain: any) => domain._id === data.id) ||
          (availableDomains.length > 0 ? availableDomains[0] : null);

        form.setFieldsValue({
          category: data.categoryId || undefined,
          subcategory: actualSubCategoryId || undefined, // Only set if actually exists
          domain: defaultDomain?._id || data.id || undefined,
          name: defaultDomain?.name || nameValue,
          description: defaultDomain?.description || data.description || ''
        });
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setSelectedCategoryForSubCategory(null);
    setSelectedCategoryForDomain(null);
    setSelectedSubCategoryForDomain(null);
    setIsNameFieldDisabled(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    if (modalType === 'edit') {
      form.validateFields().then(values => {
        console.log('Edit values:', values, 'for', modalEntity, modalData);
        message.success(`${modalEntity} updated successfully!`);
        closeModal();
        // TODO: Implement actual API call
      }).catch(err => {
        console.log('Validation failed:', err);
      });
    } else {
      if (modalEntity === 'category') {
        console.log('Delete category:', modalData);
        message.success(`Category deleted successfully!`);
        closeModal();
      } else {
        form.validateFields().then(values => {
          if (modalEntity === 'subcategory') {
            console.log('Delete subcategory:', values.subcategoryToDelete);
            message.success(`Sub-category deleted successfully!`);
          } else if (modalEntity === 'domain') {
            console.log('Delete domain:', values.domainToDelete);
            message.success(`Domain deleted successfully!`);
          }
          closeModal();
        }).catch(err => {
          console.log('Delete validation failed:', err);
        });
      }
    }
  };

  // Action handlers
  const handleEditCategory = (categoryId: string, categoryName: string) => {
    const categoryData = domainsWithCategorizationData?.data?.domains?.find(
      (item: any) => item.category._id === categoryId
    );

    const modalDataObj: ModalData = {
      id: categoryId,
      name: categoryName,
      subCategoryId: categoryData?.subCategory?._id || undefined,
      description: categoryData?.category?.description || ''
    };

    openModal('edit', 'category', modalDataObj);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    openModal('delete', 'category', { id: categoryId, name: categoryName });
  };

  const handleEditSubCategory = (subCategoryId: string, subCategoryName: string, categoryId?: string) => {
    let categoryData;

    if (subCategoryId && subCategoryId !== categoryId) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) => item.subCategory._id === subCategoryId
      );
    }

    if (!categoryData && categoryId) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) => item.category._id === categoryId
      );
    }

    if (!categoryData) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) =>
          item.subCategory._id === subCategoryId || item.category._id === (categoryId || subCategoryId)
      );
    }

    const modalDataObj: ModalData = {
      id: subCategoryId,
      name: subCategoryName,
      categoryId: categoryData?.category?._id || categoryId || subCategoryId,
      categoryName: categoryData?.category?.name || '',
      description: categoryData?.subCategory?.description || ''
    };

    openModal('edit', 'subcategory', modalDataObj);
  };

  const handleDeleteSubCategory = (subCategoryId: string, subCategoryName: string, categoryId: string) => {
    openModal('delete', 'subcategory', {
      id: subCategoryId,
      name: subCategoryName,
      categoryId: categoryId
    });
  };

  const handleEditDomain = (domainId: string, domainName: string, categoryId: string, subCategoryId: string | null) => {
    const modalDataObj: ModalData = {
      id: domainId,
      name: domainName,
      categoryId: categoryId,
      subCategoryId: subCategoryId,
      description: ''
    };
    openModal('edit', 'domain', modalDataObj);
  };

  const handleDeleteDomain = (domainId: string, domainName: string, categoryId: string, subCategoryId?: string) => {
    openModal('delete', 'domain', {
      id: domainId,
      name: domainName,
      categoryId: categoryId,
      subCategoryId: subCategoryId
    });
  };

  // Form handlers for edit modal
  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategoryForSubCategory(categoryId);

    const availableSubCategories = getSubCategoriesForCategoryHelper(categoryId);

    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];

      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        name: '',
        description: ''
      });

      setTimeout(() => {
        handleSubCategorySelectionForSubCategory(firstSubCategory.id);
      }, 100);
    } else {
      form.setFieldsValue({
        category: categoryId,
        subcategory: undefined,
        name: '',
        description: ''
      });
    }

    setIsNameFieldDisabled(false);
  };

  const handleCategorySelectionForDomain = (categoryId: string) => {
    setSelectedCategoryForDomain(categoryId);

    const availableSubCategories = getSubCategoriesForCategoryHelper(categoryId);

    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];
      setSelectedSubCategoryForDomain(firstSubCategory.id);

      const availableDomains = getDomainsForCategoryAndSubCategoryHelper(categoryId, firstSubCategory.id);
      const firstDomain = availableDomains.length > 0 ? availableDomains[0] : null;

      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        domain: firstDomain?._id || undefined,
        name: firstDomain?.name || '',
        description: firstDomain?.description || ''
      });
    } else {
      setSelectedSubCategoryForDomain(null);
      const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
        ?.filter((item: any) => item.category._id === categoryId)
        ?.flatMap((item: any) => item.domains) || [];

      const firstDomain = allDomainsForCategory.length > 0 ? allDomainsForCategory[0] : null;

      form.setFieldsValue({
        category: categoryId,
        subcategory: undefined,
        domain: firstDomain?._id || undefined,
        name: firstDomain?.name || '',
        description: firstDomain?.description || ''
      });
    }
  };

  const handleSubCategorySelectionForDomain = (subCategoryId: string | null) => {
    setSelectedSubCategoryForDomain(subCategoryId);

    if (!selectedCategoryForDomain) return;

    let availableDomains = [];

    if (subCategoryId) {
      // Show domains for specific sub-category
      availableDomains = getDomainsForCategoryAndSubCategoryHelper(selectedCategoryForDomain, subCategoryId);
    } else {
      // Show all domains for the category when sub-category is cleared
      availableDomains = domainsWithCategorizationData?.data?.domains
        ?.filter((item: any) => item.category._id === selectedCategoryForDomain)
        ?.flatMap((item: any) => item.domains) || [];
    }

    const firstDomain = availableDomains.length > 0 ? availableDomains[0] : null;

    form.setFieldsValue({
      subcategory: subCategoryId,
      domain: firstDomain?._id || undefined,
      name: firstDomain?.name || '',
      description: firstDomain?.description || ''
    });
  };

  const handleDomainSelection = (domainId: string) => {
    let selectedDomain = null;

    if (selectedCategoryForDomain && selectedSubCategoryForDomain) {
      const domains = getDomainsForCategoryAndSubCategoryHelper(selectedCategoryForDomain, selectedSubCategoryForDomain);
      selectedDomain = domains.find((domain: any) => domain._id === domainId);
    } else if (selectedCategoryForDomain) {
      const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
        ?.filter((item: any) => item.category._id === selectedCategoryForDomain)
        ?.flatMap((item: any) => item.domains) || [];

      selectedDomain = allDomainsForCategory.find((domain: any) => domain._id === domainId);
    }

    if (selectedDomain) {
      form.setFieldsValue({
        domain: domainId,
        name: selectedDomain.name,
        description: selectedDomain.description || ''
      });
    }
  };

  const handleSubCategorySelectionForSubCategory = (subCategoryId: string) => {
    if (!selectedCategoryForSubCategory) return;

    if (domainsWithCategorizationData?.data?.domains) {
      const categoryData = domainsWithCategorizationData.data.domains.find(
        (item: any) =>
          item.category._id === selectedCategoryForSubCategory && item.subCategory._id === subCategoryId
      );

      if (categoryData && categoryData.subCategory) {
        const subCategoryName = categoryData.subCategory.name;
        const isNoSubCategory = subCategoryName === 'No Sub-Category' || subCategoryName.toLowerCase().includes('no sub-category');
        setIsNameFieldDisabled(isNoSubCategory);

        const nameValue = isNoSubCategory ? '' : subCategoryName;

        form.setFieldsValue({
          subcategory: subCategoryId,
          name: nameValue,
          description: categoryData.subCategory.description || ''
        });

        if (isNoSubCategory) {
          setTimeout(() => {
            form.setFieldValue('name', '');
          }, 100);
        }
      }
    }
  };

  // Create table columns
  const columns = createTableColumns({
    onEditCategory: handleEditCategory,
    onEditSubCategory: handleEditSubCategory,
    onEditDomain: handleEditDomain,
    onDeleteCategory: handleDeleteCategory,
    onDeleteSubCategory: handleDeleteSubCategory,
    onDeleteDomain: handleDeleteDomain
  });

  return (
    <>
      <DomainTableCore
        tableData={tableData}
        columns={columns}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        currentPage={currentPage}
        paginationData={domainsWithCategorizationData?.data?.pagination}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
      />

      {modalType === 'edit' ? (
        <EditModal
          isOpen={isModalOpen}
          entity={modalEntity}
          data={modalData}
          form={form}
          availableCategories={availableCategories}
          selectedCategoryForSubCategory={selectedCategoryForSubCategory}
          selectedCategoryForDomain={selectedCategoryForDomain}
          selectedSubCategoryForDomain={selectedSubCategoryForDomain}
          domainsData={domainsWithCategorizationData?.data?.domains}
          onCancel={closeModal}
          onSubmit={handleSubmit}
          onCategorySelection={handleCategorySelection}
          onCategorySelectionForDomain={handleCategorySelectionForDomain}
          onSubCategorySelection={handleSubCategorySelectionForSubCategory}
          onSubCategorySelectionForDomain={handleSubCategorySelectionForDomain}
          onDomainSelection={handleDomainSelection}
          getSubCategoriesForCategory={getSubCategoriesForCategoryHelper}
          getDomainsForCategoryAndSubCategory={getDomainsForCategoryAndSubCategoryHelper}
        />
      ) : (
        <DeleteModal
          isOpen={isModalOpen}
          entity={modalEntity}
          data={modalData}
          form={form}
          domainsData={domainsWithCategorizationData?.data?.domains}
          onCancel={closeModal}
          onSubmit={handleSubmit}
          getSubCategoriesForCategory={getSubCategoriesForCategoryHelper}
          getDomainsForCategoryAndSubCategory={getDomainsForCategoryAndSubCategoryHelper}
        />
      )}
    </>
  );
};

export default DomainTable;