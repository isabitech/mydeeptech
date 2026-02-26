import React, { useState, useMemo, useCallback } from "react";
import { Form, message } from "antd";
import domainQueryService from "../../services/domain-service/domain-query";
import { useQueryClient } from "@tanstack/react-query";
import REACT_QUERY_KEYS from "../../services/_keys/react-query-keys";

// Import extracted components
import DomainTableCore from "./_domain_modal_components/DomainTableCore";
import EditModal from "./_domain_modal_components/EditModal";
import DeleteModal from "./_domain_modal_components/DeleteModal";
import { createTableColumns } from "./_domain_modal_components/TableColumns";
import domainMutation from "../../services/domain-service/domain-mutation";

// Import types and utilities
import type {
  ModalType,
  ModalEntity,
  ModalData,
} from "./_domain_modal_components/types";
import {
  debounce,
  processTableData,
  getAvailableCategories,
  getSubCategoriesForCategory,
  getDomainsForCategoryAndSubCategory,
} from "./_domain_modal_components/utils";

const DomainTable: React.FC = () => {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("edit");
  const [modalEntity, setModalEntity] = useState<ModalEntity>("category");
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [selectedCategoryForSubCategory, setSelectedCategoryForSubCategory] =
    useState<string | null>(null);
  const [selectedCategoryForDomain, setSelectedCategoryForDomain] = useState<
    string | null
  >(null);
  const [selectedSubCategoryForDomain, setSelectedSubCategoryForDomain] =
    useState<string | null>(null);
  const [isNameFieldDisabled, setIsNameFieldDisabled] = useState(false);
  const updateDomainMutation = domainMutation.useUpdateDomainDomain();
  const deleteSubCategoryMutation = domainMutation.useDeleteDomainSubCategory();
  const deleteDomainMutation = domainMutation.useDeleteDomain();
  const [form] = Form.useForm();
  const updateCategoryMutation = domainMutation.useUpdateDomainCategory();
  const updateSubCategoryMutation = domainMutation.useUpdateDomainSubCategory();
  const queryClient = useQueryClient();
  const pageSize = 20;

  // API call
  const {
    data: domainsWithCategorizationData,
    isLoading,
    error,
  } = domainQueryService.useDomainsWithCategorization({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1);
    }, 500),
    [],
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Processed data
  const tableData = useMemo(
    () => processTableData(domainsWithCategorizationData?.data?.domains),
    [domainsWithCategorizationData],
  );

  const availableCategories = useMemo(
    () => getAvailableCategories(domainsWithCategorizationData?.data?.domains),
    [domainsWithCategorizationData],
  );

  // Helper functions
  const getSubCategoriesForCategoryHelper = (categoryId: string) =>
    getSubCategoriesForCategory(
      categoryId,
      domainsWithCategorizationData?.data?.domains,
    );

  const getDomainsForCategoryAndSubCategoryHelper = (
    categoryId: string,
    subCategoryId: string,
  ) =>
    getDomainsForCategoryAndSubCategory(
      categoryId,
      subCategoryId,
      domainsWithCategorizationData?.data?.domains,
    );

  // Modal handlers
  const openModal = (type: ModalType, entity: ModalEntity, data: ModalData) => {
    setModalType(type);
    setModalEntity(entity);
    setModalData(data);
    setIsModalOpen(true);

    if (type === "edit") {
      // Pre-populate form for editing
      let nameValue = data.name;

      if (entity === "category") {
        setSelectedCategoryForSubCategory(data.id);
        form.setFieldsValue({
          category: data.id,
          subcategory: data.subCategoryId || undefined,
          name: nameValue,
          description: data.description || "",
        });
      } else if (entity === "subcategory") {
        if (data.categoryId) {
          setSelectedCategoryForSubCategory(data.categoryId);
        }

        if (
          nameValue === "No Sub-Category" ||
          nameValue?.toLowerCase().includes("no sub-category")
        ) {
          nameValue = "";
          setIsNameFieldDisabled(true);
        } else {
          setIsNameFieldDisabled(false);
        }

        const availableSubCategories = data.categoryId
          ? getSubCategoriesForCategoryHelper(data.categoryId)
          : [];

        let subCategoryValue = undefined;
        if (availableSubCategories.length > 0) {
          if (
            nameValue !== "No Sub-Category" &&
            !nameValue?.toLowerCase().includes("no sub-category")
          ) {
            subCategoryValue = data.id;
          }
        }

        form.setFieldsValue({
          category: data.categoryId || undefined,
          subcategory: subCategoryValue,
          name: nameValue,
          description: data.description || "",
        });
      } else {
        // Domain modal
        if (data.categoryId) {
          setSelectedCategoryForDomain(data.categoryId);

          const availableSubCategories = getSubCategoriesForCategoryHelper(
            data.categoryId,
          );

          if (availableSubCategories.length > 0) {
            const defaultSubCategory =
              data.subCategoryId || availableSubCategories[0].id;
            setSelectedSubCategoryForDomain(defaultSubCategory);
          } else if (data.subCategoryId) {
            setSelectedSubCategoryForDomain(data.subCategoryId);
          }
        }

        let availableDomains = [];
        const effectiveSubCategoryId =
          data.subCategoryId ||
          (data.categoryId
            ? getSubCategoriesForCategoryHelper(data.categoryId)[0]?.id
            : null);

        if (data.categoryId && effectiveSubCategoryId) {
          availableDomains = getDomainsForCategoryAndSubCategoryHelper(
            data.categoryId,
            effectiveSubCategoryId,
          );
        } else if (data.categoryId) {
          availableDomains =
            domainsWithCategorizationData?.data?.domains
              ?.filter((item: any) => item.category._id === data.categoryId)
              ?.flatMap((item: any) => item.domains) || [];
        }

        const defaultDomain =
          availableDomains.find((domain: any) => domain._id === data.id) ||
          (availableDomains.length > 0 ? availableDomains[0] : null);

        form.setFieldsValue({
          category: data.categoryId || undefined,
          subcategory: effectiveSubCategoryId || undefined,
          domain: defaultDomain?._id || data.id || undefined,
          name: defaultDomain?.name || nameValue,
          description: defaultDomain?.description || data.description || "",
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
    if (modalType === "edit") {
      // Validate form fields first
      form
        .validateFields()
        .then((values) => {
          // EDIT CATEGORY
          if (modalEntity === "category" && modalData) {
            updateCategoryMutation.mutate(
              {
                id: values.category,
                name: values.name,
                description: values.description,
              },
              {
                onSuccess: () => {
                  message.success("Category updated successfully!");
                  closeModal();
                  ({
                    queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
                  });
                },
                onError: (error: any) => {
                  message.error(
                    error?.response?.data?.message || "Update failed",
                  );
                },
              },
            );
          }

          // EDIT SUBCATEGORY
          else if (modalEntity === "subcategory" && modalData) {
            updateSubCategoryMutation.mutate(
              {
                id: modalData.id,
                domain_category: form.getFieldValue("category"),
                 name: form.getFieldValue("name"),
                description: form.getFieldValue("description"),
              },
              {
                onSuccess: () => {
                  message.success("SubCategory updated successfully!");
                  closeModal();

                  queryClient.invalidateQueries({
                    queryKey: [
                      REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization,
                    ],
                  });
                },
                onError: (error: any) => {
                  message.error(
                    error?.response?.data?.message || "Update failed",
                  );
                },
              },
            );
          }

          // EDIT DOMAIN (if you add a domain update mutation)
          else if (modalEntity === "domain" && modalData) {
            updateDomainMutation.mutate(
              {
                id: values.domain,
                category: values.category,
                subCategory: values.subcategory,
                name: values.name,
                description: values.description || "",
              },
              {
                onSuccess: () => {
                  message.success("Domain updated successfully!");
                  closeModal();
                  ({
                    queryKey: [
                      REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization,
                    ],
                  });
                },
                onError: (error: any) => {
                  message.error(
                    error?.response?.data?.message || "Update failed",
                  );
                },
              },
            );
          }
        })
        .catch((err) => {
          console.log("Validation failed:", err);
          message.error("Please check the form for errors.");
        });
    }

    // DELETE MODAL HANDLING
    else if (modalType === "delete") {
      if (!modalData) return;

      if (modalEntity === "category") {
        domainMutation.useDeleteDomainCategory().mutate(
          { id: modalData.id },
          {
            onSuccess: () => {
              message.success("Category deleted successfully!");
              closeModal();
              queryClient.invalidateQueries({
                queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
              });
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || "Delete failed");
            },
          },
        );
      } else if (modalEntity === "subcategory") {
        deleteSubCategoryMutation.mutate(
          { id: modalData.id },
          {
            onSuccess: () => {
              message.success("Sub-category deleted successfully!");
              closeModal();
              queryClient.invalidateQueries({
                queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
              });
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || "Delete failed");
            },
          },
        );
      } else if (modalEntity === "domain") {
        deleteDomainMutation.mutate(
          { id: modalData.id },
          {
            onSuccess: () => {
              message.success("Domain deleted successfully!");
              closeModal();
              queryClient.invalidateQueries({
                queryKey: [REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization],
              });
            },
            onError: (error: any) => {
              message.error(error?.response?.data?.message || "Delete failed");
            },
          },
        );
      }
    }
  };

  // Action handlers
  const handleEditCategory = (categoryId: string, categoryName: string) => {
    const categoryData = domainsWithCategorizationData?.data?.domains?.find(
      (item: any) => item.category._id === categoryId,
    );

    const modalDataObj: ModalData = {
      id: categoryId,
      name: categoryName,
      subCategoryId: categoryData?.subCategory?._id || undefined,
      description: categoryData?.category?.description || "",
    };

    openModal("edit", "category", modalDataObj);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    openModal("delete", "category", { id: categoryId, name: categoryName });
  };

  const handleEditSubCategory = (
    subCategoryId: string,
    subCategoryName: string,
    categoryId?: string,
  ) => {
    let categoryData;

    if (subCategoryId && subCategoryId !== categoryId) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) => item.subCategory._id === subCategoryId,
      );
    }

    if (!categoryData && categoryId) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) => item.category._id === categoryId,
      );
    }

    if (!categoryData) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: any) =>
          item.subCategory._id === subCategoryId ||
          item.category._id === (categoryId || subCategoryId),
      );
    }

    const modalDataObj: ModalData = {
      id: subCategoryId,
      name: subCategoryName,
      categoryId: categoryData?.category?._id || categoryId || subCategoryId,
      categoryName: categoryData?.category?.name || "",
      description: categoryData?.subCategory?.description || "",
    };

    openModal("edit", "subcategory", modalDataObj);
  };

  const handleDeleteSubCategory = (
    subCategoryId: string,
    subCategoryName: string,
    categoryId: string,
  ) => {
    openModal("delete", "subcategory", {
      id: subCategoryId,
      name: subCategoryName,
      categoryId: categoryId,
    });
  };

  const handleEditDomain = (
    domainId: string,
    domainName: string,
    categoryId: string,
    subCategoryId: string | null,
  ) => {
    const modalDataObj: ModalData = {
      id: domainId,
      name: domainName,
      categoryId: categoryId,
      subCategoryId: subCategoryId,
      description: "",
    };
    openModal("edit", "domain", modalDataObj);
  };

  const handleDeleteDomain = (
    domainId: string,
    domainName: string,
    categoryId: string,
    subCategoryId?: string,
  ) => {
    openModal("delete", "domain", {
      id: domainId,
      name: domainName,
      categoryId: categoryId,
      subCategoryId: subCategoryId,
    });
  };

  // Form handlers for edit modal
  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategoryForSubCategory(categoryId);

    const availableSubCategories =
      getSubCategoriesForCategoryHelper(categoryId);

    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];

      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        name: "",
        description: "",
      });

      setTimeout(() => {
        handleSubCategorySelectionForSubCategory(firstSubCategory.id);
      }, 100);
    } else {
      form.setFieldsValue({
        category: categoryId,
        subcategory: undefined,
        name: "",
        description: "",
      });
    }

    setIsNameFieldDisabled(false);
  };

  const handleCategorySelectionForDomain = (categoryId: string) => {
    setSelectedCategoryForDomain(categoryId);

    const availableSubCategories =
      getSubCategoriesForCategoryHelper(categoryId);

    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];
      setSelectedSubCategoryForDomain(firstSubCategory.id);

      const availableDomains = getDomainsForCategoryAndSubCategoryHelper(
        categoryId,
        firstSubCategory.id,
      );
      const firstDomain =
        availableDomains.length > 0 ? availableDomains[0] : null;

      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        domain: firstDomain?._id || undefined,
        name: firstDomain?.name || "",
        description: firstDomain?.description || "",
      });
    } else {
      setSelectedSubCategoryForDomain(null);
      const allDomainsForCategory =
        domainsWithCategorizationData?.data?.domains
          ?.filter((item: any) => item.category._id === categoryId)
          ?.flatMap((item: any) => item.domains) || [];

      const firstDomain =
        allDomainsForCategory.length > 0 ? allDomainsForCategory[0] : null;

      form.setFieldsValue({
        category: categoryId,
        subcategory: undefined,
        domain: firstDomain?._id || undefined,
        name: firstDomain?.name || "",
        description: firstDomain?.description || "",
      });
    }
  };

  const handleSubCategorySelectionForDomain = (subCategoryId: string) => {
    setSelectedSubCategoryForDomain(subCategoryId);

    if (!selectedCategoryForDomain) return;

    const availableDomains = getDomainsForCategoryAndSubCategoryHelper(
      selectedCategoryForDomain,
      subCategoryId,
    );
    const firstDomain =
      availableDomains.length > 0 ? availableDomains[0] : null;

    form.setFieldsValue({
      subcategory: subCategoryId,
      domain: firstDomain?._id || undefined,
      name: firstDomain?.name || "",
      description: firstDomain?.description || "",
    });
  };

  const handleDomainSelection = (domainId: string) => {
    let selectedDomain = null;

    if (selectedCategoryForDomain && selectedSubCategoryForDomain) {
      const domains = getDomainsForCategoryAndSubCategoryHelper(
        selectedCategoryForDomain,
        selectedSubCategoryForDomain,
      );
      selectedDomain = domains.find((domain: any) => domain._id === domainId);
    } else if (selectedCategoryForDomain) {
      const allDomainsForCategory =
        domainsWithCategorizationData?.data?.domains
          ?.filter(
            (item: any) => item.category._id === selectedCategoryForDomain,
          )
          ?.flatMap((item: any) => item.domains) || [];

      selectedDomain = allDomainsForCategory.find(
        (domain: any) => domain._id === domainId,
      );
    }

    if (selectedDomain) {
      form.setFieldsValue({
        domain: domainId,
        name: selectedDomain.name,
        description: selectedDomain.description || "",
      });
    }
  };

  const handleSubCategorySelectionForSubCategory = (subCategoryId: string) => {
    if (!selectedCategoryForSubCategory) return;

    if (domainsWithCategorizationData?.data?.domains) {
      const categoryData = domainsWithCategorizationData.data.domains.find(
        (item: any) =>
          item.category._id === selectedCategoryForSubCategory &&
          item.subCategory._id === subCategoryId,
      );

      if (categoryData && categoryData.subCategory) {
        const subCategoryName = categoryData.subCategory.name;
        const isNoSubCategory =
          subCategoryName === "No Sub-Category" ||
          subCategoryName.toLowerCase().includes("no sub-category");
        setIsNameFieldDisabled(isNoSubCategory);

        const nameValue = isNoSubCategory ? "" : subCategoryName;

        form.setFieldsValue({
          subcategory: subCategoryId,
          name: nameValue,
          description: categoryData.subCategory.description || "",
        });

        if (isNoSubCategory) {
          setTimeout(() => {
            form.setFieldValue("name", "");
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
    onDeleteDomain: handleDeleteDomain,
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

      {modalType === "edit" ? (
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
          getDomainsForCategoryAndSubCategory={
            getDomainsForCategoryAndSubCategoryHelper
          }
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
          getDomainsForCategoryAndSubCategory={
            getDomainsForCategoryAndSubCategoryHelper
          }
        />
      )}
    </>
  );
};

export default DomainTable;
