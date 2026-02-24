
import React, { useState, useMemo, useCallback } from "react";
import { Table, Card, Typography, Tag, Spin, Alert, Space, Input, Row, Col } from "antd";
import { DatabaseOutlined, FolderOutlined, BranchesOutlined, SearchOutlined } from "@ant-design/icons";
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
}

const DomainTable: React.FC = () => {
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
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

  // Single API call with pagination
  const { data: domainsWithCategorizationData, isLoading, error } = domainQueryService.useDomainsWithCategorization({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm
  });

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
      width: '40%',
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
      </Card>
    </div>
  );
};

export default DomainTable;