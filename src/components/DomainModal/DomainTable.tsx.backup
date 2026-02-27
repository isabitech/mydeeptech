
import React, { useState, useMemo, useCallback } from "react";
import { Table, Card, Typography, Tag, Spin, Alert, Space, Input, Row, Col, Button, Dropdown, message, Modal, Form, Select } from "antd";
import { DatabaseOutlined, FolderOutlined, BranchesOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import domainQueryService from "../../services/domain-service/domain-query";

const { Title, Text } = Typography;

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

interface DomainWithCategorizationItem {
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subCategory: {
    _id: string | null;
    name: string;
    slug: string | null;
  };
  domains: {
    _id: string;
    name: string;
    slug: string;
  }[];
  totalDomains: number;
}

interface TableDataType {
  key: string;
  categoryName: string;
  categoryRowSpan: number;
  subCategoryName: string;
  subCategorySlug: string | null;
  domains: {
    _id: string;
    name: string;
    slug: string;
  }[];
  categoryId: string;
  subCategoryId: string | null;
}

const DomainTable: React.FC = () => {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Modal state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'delete'>('edit');
  const [modalEntity, setModalEntity] = useState<'category' | 'subcategory' | 'domain'>('category');
  const [modalData, setModalData] = useState<any>(null);
  const [selectedCategoryForSubCategory, setSelectedCategoryForSubCategory] = useState<string | null>(null);
  const [selectedCategoryForDomain, setSelectedCategoryForDomain] = useState<string | null>(null);
  const [selectedSubCategoryForDomain, setSelectedSubCategoryForDomain] = useState<string | null>(null);
  const [isNameFieldDisabled, setIsNameFieldDisabled] = useState(false);
  const [form] = Form.useForm();
  
  const pageSize = 20; // Reasonable page size for grouped data

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      // Reset to page 1 when searching
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

  // Modal handlers
  const openModal = (type: 'edit' | 'delete', entity: 'category' | 'subcategory' | 'domain', data: any) => {
    setModalType(type);
    setModalEntity(entity);
    setModalData(data);
    setIsModalOpen(true);
    
    if (type === 'edit') {
      // Pre-populate form for editing
      let nameValue = data.name;
      
      if (entity === 'category') {
        // For category modal, pre-select the category and find sub-categories
        setSelectedCategoryForSubCategory(data.id);
        form.setFieldsValue({
          category: data.id,
          subcategory: data.subCategoryId || undefined,
          name: nameValue,
          description: data.description || ''
        });
      } else if (entity === 'subcategory') {
        // For sub-category modal, pre-select the category and sub-category
        if (data.categoryId) {
          setSelectedCategoryForSubCategory(data.categoryId);
        }
        
        // If name is "No Sub-Category", set it to empty string
        if (nameValue === 'No Sub-Category' || nameValue?.toLowerCase().includes('no sub-category')) {
          nameValue = '';
          setIsNameFieldDisabled(true);
        } else {
          setIsNameFieldDisabled(false);
        }
        
        // Check if sub-categories are available for this category
        const availableSubCategories = data.categoryId ? getSubCategoriesForCategory(data.categoryId) : [];
        
        // Only set subcategory value if sub-categories are available and it's not 'No Sub-Category'
        let subCategoryValue = undefined;
        if (availableSubCategories.length > 0) {
          // If the entry is not 'No Sub-Category', use the sub-category ID
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
        // For domain modal
        if (data.categoryId) {
          setSelectedCategoryForDomain(data.categoryId);
          
          // Get sub-categories for the selected category
          const availableSubCategories = getSubCategoriesForCategory(data.categoryId);
          
          // If sub-categories are available, set the first one as default, otherwise use the provided subCategoryId
          if (availableSubCategories.length > 0) {
            const defaultSubCategory = data.subCategoryId || availableSubCategories[0].id;
            setSelectedSubCategoryForDomain(defaultSubCategory);
          } else if (data.subCategoryId) {
            setSelectedSubCategoryForDomain(data.subCategoryId);
          }
        }
        
        // Get available domains for this category and subcategory
        let availableDomains = [];
        const effectiveSubCategoryId = data.subCategoryId || 
          (data.categoryId ? getSubCategoriesForCategory(data.categoryId)[0]?.id : null);
          
        if (data.categoryId && effectiveSubCategoryId) {
          availableDomains = getDomainsForCategoryAndSubCategory(data.categoryId, effectiveSubCategoryId);
        } else if (data.categoryId) {
          // If no sub-category, get all domains for this category
          availableDomains = domainsWithCategorizationData?.data?.domains
            ?.filter((item: DomainWithCategorizationItem) => item.category._id === data.categoryId)
            ?.flatMap((item: DomainWithCategorizationItem) => item.domains) || [];
        }
        
        // Set the current domain as default, or first domain if available
        const defaultDomain = availableDomains.find((domain: any) => domain._id === data.id) || 
                             (availableDomains.length > 0 ? availableDomains[0] : null);
        
        form.setFieldsValue({
          category: data.categoryId || undefined,
          subcategory: effectiveSubCategoryId || undefined,
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
      // Delete operation
      if (modalEntity === 'category') {
        // Category delete doesn't need form validation
        console.log('Delete category:', modalData);
        message.success(`Category deleted successfully!`);
        closeModal();
        // TODO: Implement actual API call
      } else {
        // Sub-category and domain deletes need form validation for selection
        form.validateFields().then(values => {
          if (modalEntity === 'subcategory') {
            console.log('Delete subcategory:', values.subcategoryToDelete);
            message.success(`Sub-category deleted successfully!`);
          } else if (modalEntity === 'domain') {
            console.log('Delete domain:', values.domainToDelete);
            message.success(`Domain deleted successfully!`);
          }
          closeModal();
          // TODO: Implement actual API call
        }).catch(err => {
          console.log('Delete validation failed:', err);
        });
      }
    }
  };

  // Action handlers
  const handleEditCategory = (categoryId: string, categoryName: string) => {
    // Find sub-category data for this category
    const categoryData = domainsWithCategorizationData?.data?.domains?.find(
      (item: DomainWithCategorizationItem) => item.category._id === categoryId
    );
    
    const modalData = {
      id: categoryId,
      name: categoryName,
      subCategoryId: categoryData?.subCategory?._id || null,
      description: categoryData?.category?.description || ''
    };
    
    openModal('edit', 'category', modalData);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    openModal('delete', 'category', { id: categoryId, name: categoryName });
  };

  const handleEditSubCategory = (subCategoryId: string, subCategoryName: string, categoryId?: string) => {
    // Find category data for this sub-category
    let categoryData;
    
    if (subCategoryId && subCategoryId !== categoryId) {
      // If we have a real sub-category ID, find by sub-category
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: DomainWithCategorizationItem) => item.subCategory._id === subCategoryId
      );
    }
    
    // If we didn't find by sub-category or don't have a real sub-category, find by category
    if (!categoryData && categoryId) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: DomainWithCategorizationItem) => item.category._id === categoryId
      );
    }
    
    // Fallback: find any data with the category ID if we still don't have it
    if (!categoryData) {
      categoryData = domainsWithCategorizationData?.data?.domains?.find(
        (item: DomainWithCategorizationItem) => 
          item.subCategory._id === subCategoryId || item.category._id === (categoryId || subCategoryId)
      );
    }
    
    const modalData = {
      id: subCategoryId,
      name: subCategoryName,
      categoryId: categoryData?.category?._id || categoryId || subCategoryId,
      categoryName: categoryData?.category?.name || '',
      description: categoryData?.subCategory?.description || ''
    };
    
    openModal('edit', 'subcategory', modalData);
  };

  const handleDeleteSubCategory = (subCategoryId: string, subCategoryName: string, categoryId: string) => {
    openModal('delete', 'subcategory', { 
      id: subCategoryId, 
      name: subCategoryName, 
      categoryId: categoryId 
    });
  };

  const handleEditDomain = (domainId: string, domainName: string, categoryId: string, subCategoryId: string | null) => {
    const modalData = {
      id: domainId,
      name: domainName,
      categoryId: categoryId,
      subCategoryId: subCategoryId,
      description: ''
    };
    openModal('edit', 'domain', modalData);
  };

  const handleDeleteDomain = (domainId: string, domainName: string, categoryId: string, subCategoryId?: string) => {
    openModal('delete', 'domain', { 
      id: domainId, 
      name: domainName, 
      categoryId: categoryId,
      subCategoryId: subCategoryId 
    });
  };

  // Single API call with pagination
  const { data: domainsWithCategorizationData, isLoading, error } = domainQueryService.useDomainsWithCategorization({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm
  });

  // Get available categories from the data
  const availableCategories = useMemo(() => {
    if (!domainsWithCategorizationData?.data?.domains) return [];
    
    const categoryMap = new Map();
    domainsWithCategorizationData.data.domains.forEach((item: DomainWithCategorizationItem) => {
      if (!categoryMap.has(item.category._id)) {
        categoryMap.set(item.category._id, {
          id: item.category._id,
          name: item.category.name,
          slug: item.category.slug
        });
      }
    });
    
    return Array.from(categoryMap.values());
  }, [domainsWithCategorizationData]);

  // Get available sub-categories for a specific category
  const getSubCategoriesForCategory = (categoryId: string) => {
    if (!domainsWithCategorizationData?.data?.domains) return [];
    
    const subCategoryMap = new Map();
    domainsWithCategorizationData.data.domains.forEach((item: DomainWithCategorizationItem) => {
      if (item.category._id === categoryId && item.subCategory._id) {
        if (!subCategoryMap.has(item.subCategory._id)) {
          subCategoryMap.set(item.subCategory._id, {
            id: item.subCategory._id,
            name: item.subCategory.name,
            slug: item.subCategory.slug
          });
        }
      }
    });
    
    return Array.from(subCategoryMap.values());
  };

  // Get available domains for a specific category and sub-category
  const getDomainsForCategoryAndSubCategory = (categoryId: string, subCategoryId: string) => {
    if (!domainsWithCategorizationData?.data?.domains) return [];
    
    const domainsData = domainsWithCategorizationData.data.domains.find(
      (item: DomainWithCategorizationItem) => 
        item.category._id === categoryId && item.subCategory._id === subCategoryId
    );
    
    return domainsData?.domains || [];
  };

  // Handle category selection for domain modal
  const handleCategorySelectionForDomain = (categoryId: string) => {
    setSelectedCategoryForDomain(categoryId);
    
    // Get sub-categories for the selected category
    const availableSubCategories = getSubCategoriesForCategory(categoryId);
    
    // If sub-categories are available, auto-select the first one
    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];
      setSelectedSubCategoryForDomain(firstSubCategory.id);
      
      // Get domains for this category + sub-category
      const availableDomains = getDomainsForCategoryAndSubCategory(categoryId, firstSubCategory.id);
      const firstDomain = availableDomains.length > 0 ? availableDomains[0] : null;
      
      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        domain: firstDomain?._id || undefined,
        name: firstDomain?.name || '',
        description: firstDomain?.description || ''
      });
    } else {
      // No sub-categories, get all domains for this category
      setSelectedSubCategoryForDomain(null);
      const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
        ?.filter((item: DomainWithCategorizationItem) => item.category._id === categoryId)
        ?.flatMap((item: DomainWithCategorizationItem) => item.domains) || [];
      
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

  // Handle sub-category selection for domain modal
  const handleSubCategorySelectionForDomain = (subCategoryId: string) => {
    setSelectedSubCategoryForDomain(subCategoryId);
    
    if (!selectedCategoryForDomain) return;
    
    // Get domains for this category + sub-category combination
    const availableDomains = getDomainsForCategoryAndSubCategory(selectedCategoryForDomain, subCategoryId);
    const firstDomain = availableDomains.length > 0 ? availableDomains[0] : null;
    
    form.setFieldsValue({
      subcategory: subCategoryId,
      domain: firstDomain?._id || undefined,
      name: firstDomain?.name || '',
      description: firstDomain?.description || ''
    });
  };

  // Handle domain selection for domain modal
  const handleDomainSelection = (domainId: string) => {
    let selectedDomain = null;
    
    if (selectedCategoryForDomain && selectedSubCategoryForDomain) {
      // Normal case: both category and sub-category selected
      const domains = getDomainsForCategoryAndSubCategory(selectedCategoryForDomain, selectedSubCategoryForDomain);
      selectedDomain = domains.find((domain: any) => domain._id === domainId);
    } else if (selectedCategoryForDomain) {
      // Case where only category is selected
      const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
        ?.filter((item: DomainWithCategorizationItem) => item.category._id === selectedCategoryForDomain)
        ?.flatMap((item: DomainWithCategorizationItem) => item.domains) || [];
      
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

  // Handle category selection for subcategory modal
  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategoryForSubCategory(categoryId);
    
    // Get sub-categories for the selected category
    const availableSubCategories = getSubCategoriesForCategory(categoryId);
    
    // If sub-categories are available, auto-select the first one
    if (availableSubCategories.length > 0) {
      const firstSubCategory = availableSubCategories[0];
      
      form.setFieldsValue({
        category: categoryId,
        subcategory: firstSubCategory.id,
        name: '',
        description: ''
      });
      
      // Trigger the sub-category selection to populate name and description
      setTimeout(() => {
        handleSubCategorySelectionForSubCategory(firstSubCategory.id);
      }, 100);
    } else {
      // No sub-categories available, clear the form
      form.setFieldsValue({
        category: categoryId,
        subcategory: undefined,
        name: '',
        description: ''
      });
    }
    
    setIsNameFieldDisabled(false);
  };

  // Handle sub-category selection for subcategory modal
  const handleSubCategorySelectionForSubCategory = (subCategoryId: string) => {
    if (!selectedCategoryForSubCategory) return;
    
    // Find the sub-category data
    if (domainsWithCategorizationData?.data?.domains) {
      const categoryData = domainsWithCategorizationData.data.domains.find(
        (item: DomainWithCategorizationItem) => 
          item.category._id === selectedCategoryForSubCategory && item.subCategory._id === subCategoryId
      );
      
      if (categoryData && categoryData.subCategory) {
        const subCategoryName = categoryData.subCategory.name;
        const isNoSubCategory = subCategoryName === 'No Sub-Category' || subCategoryName.toLowerCase().includes('no sub-category');
        setIsNameFieldDisabled(isNoSubCategory);
        
        console.log('Sub-category selected:', subCategoryName);
        console.log('Is No Sub-Category:', isNoSubCategory);
        
        // Auto-populate name and description based on selected sub-category
        // If it's "No Sub-Category", clear the name field completely
        const nameValue = isNoSubCategory ? '' : subCategoryName;
        
        console.log('Setting name field to:', nameValue || '(EMPTY)');
        
        form.setFieldsValue({
          subcategory: subCategoryId,
          name: nameValue,
          description: categoryData.subCategory.description || ''
        });
        
        // Force update the name field if it's supposed to be empty
        if (isNoSubCategory) {
          setTimeout(() => {
            form.setFieldValue('name', '');
          }, 100);
        }
      }
    }
  };

  // Process data to create flattened table rows
  const processTableData = (): TableDataType[] => {
    if (!domainsWithCategorizationData?.data?.domains) {
      return [];
    }

    const domainsData: DomainWithCategorizationItem[] = domainsWithCategorizationData.data.domains;
    
    // Group by category to calculate rowSpans
    const categoryGroups: { [categoryId: string]: DomainWithCategorizationItem[] } = {};
    
    domainsData.forEach(item => {
      const categoryId = item.category._id;
      if (!categoryGroups[categoryId]) {
        categoryGroups[categoryId] = [];
      }
      categoryGroups[categoryId].push(item);
    });

    // Flatten data for table display with proper rowSpan calculation
    const flattenedData: TableDataType[] = [];
    
    Object.values(categoryGroups).forEach(categoryItems => {
      categoryItems.forEach((item, index) => {
        flattenedData.push({
          key: `${item.category._id}-${item.subCategory._id || 'no-sub'}-${index}`,
          categoryName: index === 0 ? item.category.name : '',
          categoryRowSpan: index === 0 ? categoryItems.length : 0,
          subCategoryName: item.subCategory.name,
          subCategorySlug: item.subCategory.slug,
          domains: item.domains,
          categoryId: item.category._id,
          subCategoryId: item.subCategory._id,
        });
      });
    });

    return flattenedData;
  };

  // Memoize processed data
  const tableData = useMemo(() => processTableData(), [domainsWithCategorizationData]);

  const columns = [
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
          <div  style={{ fontSize: '12px', fontWeight: 'bold' }}>
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
        // Fixed Edit dropdown items - always show all 3 options
        const editItems = [
          {
            key: 'edit-category',
            label: 'Category',
            icon: <EditOutlined />,
            onClick: () => handleEditCategory(record.categoryId, record.categoryName || 'Unknown')
          },
          {
            key: 'edit-subcategory',
            label: 'Sub-Category',
            icon: <EditOutlined />,
            onClick: () => handleEditSubCategory(record.subCategoryId || record.categoryId, record.subCategoryName, record.categoryId)
          },
          {
            key: 'edit-domain',
            label: 'Domain',
            icon: <EditOutlined />,
            onClick: () => {
              if (record.domains.length > 0) {
                handleEditDomain(record.domains[0]._id, record.domains[0].name, record.categoryId, record.subCategoryId);
              } else {
                message.warning('No domain available to edit');
              }
            }
          }
        ];

        // Fixed Delete dropdown items - always show all 3 options
        const deleteItems = [
          {
            key: 'delete-category',
            label: 'Category',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteCategory(record.categoryId, record.categoryName || 'Unknown')
          },
          {
            key: 'delete-subcategory',
            label: 'Sub-Category',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDeleteSubCategory(record.subCategoryId || record.categoryId, record.subCategoryName, record.categoryId)
          },
          {
            key: 'delete-domain',
            label: 'Domain',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              if (record.domains.length > 0) {
                handleDeleteDomain(record.domains[0]._id, record.domains[0].name, record.categoryId, record.subCategoryId || undefined);
              } else {
                message.warning('No domain available to delete');
              }
            }
          }
        ];

        return (
          <Space size="small">
            {/* Edit Button with Dropdown */}
            <Dropdown
              menu={{ items: editItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="primary" size="small" icon={<EditOutlined />}>
                Edit
              </Button>
            </Dropdown>

            {/* Delete Button with Dropdown */}
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
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading domain data...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error Loading Data"
          description="There was an error loading the domain data. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
            Domain, Category & Sub-Category Overview
          </Title>
          <Text type="secondary">
            Complete listing of all domains with their associated categories and sub-categories
          </Text>
        </div>

        {/* Search Input */}
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search domains, categories, or subcategories..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={handleSearchChange}
              allowClear
            />
          </Col>
        </Row>

        {tableData.length === 0 ? (
          <Alert
            message="No Data Available"
            description={
              debouncedSearchTerm 
                ? `No results found for "${debouncedSearchTerm}". Try adjusting your search terms.`
                : "No domains, categories, or sub-categories have been created yet."
            }
            type="info"
            showIcon
            style={{ marginTop: '20px' }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="key"
              pagination={{
                current: domainsWithCategorizationData?.data?.pagination?.currentPage || currentPage,
                pageSize: domainsWithCategorizationData?.data?.pagination?.limit || pageSize,
                total: domainsWithCategorizationData?.data?.pagination?.totalCount || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ['bottomCenter'],
                showTotal: (total, range) => {
                  const currentPage = domainsWithCategorizationData?.data?.pagination?.currentPage || 1;
                  return `Showing (${currentPage} of ${domainsWithCategorizationData?.data?.pagination?.totalPages || 1})`;
                },
                onChange: (page, size) => {
                  setCurrentPage(page);
                }
              }}
              scroll={{ x: 800 }}
              size="small"
              bordered
              style={{ backgroundColor: '#fafafa' }}
            />
          </>
        )}
        
        {/* Modal for Edit/Delete */}
        <Modal
          title={`${modalType === 'edit' ? 'Edit' : 'Delete'} ${modalEntity?.charAt(0).toUpperCase()}${modalEntity?.slice(1)}`}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={closeModal}
          okText={modalType === 'edit' ? 'Update' : 'Delete'}
          okButtonProps={{ danger: modalType === 'delete' }}
        >
          {modalType === 'edit' ? (
            <Form form={form} layout="vertical">
              {modalEntity === 'category' && (
                <>
                  <Form.Item
                    name="category"
                    label="Select Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      placeholder="Select a category"
                      onChange={handleCategorySelection}
                      options={availableCategories.map(category => ({
                        label: category.name,
                        value: category.id
                      }))}
                    />
                  </Form.Item>
                </>
              )}
              {modalEntity === 'subcategory' && (
                <>
                  <Form.Item
                    name="category"
                    label="Select Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      placeholder="Select a category"
                      value={selectedCategoryForSubCategory}
                      onChange={handleCategorySelection}
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
                          handleSubCategorySelectionForSubCategory(value);
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
              {modalEntity === 'domain' && (
                <>
                  <Form.Item
                    name="category"
                    label="Select Category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select
                      placeholder="Select a category"
                      value={selectedCategoryForDomain}
                      onChange={handleCategorySelectionForDomain}
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
                      onChange={handleSubCategorySelectionForDomain}
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
                      onChange={handleDomainSelection}
                      options={(() => {
                        if (selectedCategoryForDomain && selectedSubCategoryForDomain) {
                          // Normal case: both category and sub-category selected
                          return getDomainsForCategoryAndSubCategory(selectedCategoryForDomain, selectedSubCategoryForDomain).map((domain: any) => ({
                            label: domain.name,
                            value: domain._id
                          }));
                        } else if (selectedCategoryForDomain) {
                          // Case where sub-category is empty - show all domains for the category
                          const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
                            ?.filter((item: DomainWithCategorizationItem) => item.category._id === selectedCategoryForDomain)
                            ?.flatMap((item: DomainWithCategorizationItem) => item.domains) || [];
                          
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
                label={modalEntity === 'subcategory' ? 'SubCategory Name' : 'Name'}
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
          ) : (
            <Form form={form} layout="vertical">
              {modalEntity === 'category' && (
                <div>
                  <p>Are you sure you want to delete this category?</p>
                  <p><strong>Name:</strong> {modalData?.name}</p>
                  <p style={{ color: '#ff4d4f' }}>This action cannot be undone and will delete all associated sub-categories and domains.</p>
                </div>
              )}
              {modalEntity === 'subcategory' && (
                <>
                  <Form.Item
                    name="subcategoryToDelete"
                    label="Sub-Category to delete"
                    rules={[{ required: true, message: 'Please select a sub-category to delete' }]}
                  >
                    <Select
                      placeholder="Select a sub-category to delete"
                      options={modalData?.categoryId ? 
                        getSubCategoriesForCategory(modalData.categoryId).map(subCategory => ({
                          label: subCategory.name,
                          value: subCategory.id
                        })) : []
                      }
                    />
                  </Form.Item>
                  <p style={{ color: '#ff4d4f' }}>This action cannot be undone and will delete all domains associated with this sub-category.</p>
                </>
              )}
              {modalEntity === 'domain' && (
                <>
                  <Form.Item
                    name="domainToDelete"
                    label="Domain to delete"
                    rules={[{ required: true, message: 'Please select a domain to delete' }]}
                  >
                    <Select
                      placeholder="Select a domain to delete"
                      options={(() => {
                        if (modalData?.categoryId && modalData?.subCategoryId) {
                          // Normal case: both category and sub-category exist
                          return getDomainsForCategoryAndSubCategory(modalData.categoryId, modalData.subCategoryId).map((domain: any) => ({
                            label: domain.name,
                            value: domain._id
                          }));
                        } else if (modalData?.categoryId) {
                          // Case where sub-category is empty - show all domains for the category
                          const allDomainsForCategory = domainsWithCategorizationData?.data?.domains
                            ?.filter((item: DomainWithCategorizationItem) => item.category._id === modalData.categoryId)
                            ?.flatMap((item: DomainWithCategorizationItem) => item.domains) || [];
                          
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
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default DomainTable;