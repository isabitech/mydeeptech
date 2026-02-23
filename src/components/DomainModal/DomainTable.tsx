
import React from "react";
import { Table, Card, Typography, Tag, Spin, Alert, Space } from "antd";
import { DatabaseOutlined, FolderOutlined, BranchesOutlined } from "@ant-design/icons";
import domainQueryService from "../../services/domain-service/domain-query";
import { DivideCircle } from "lucide-react";

const { Title, Text } = Typography;

interface TableDataType {
  key: string;
  category: {
    name: string;
    id: string;
    slug?: string;
  };
  subCategories: {
    name: string;
    id: string;
    slug?: string;
    domains: {
      name: string;
      id: string;
      slug?: string;
      createdAt?: string;
    }[];
  }[];
}

const DomainTable: React.FC = () => {
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = domainQueryService.useDomainCategories();
  const { data: subCategoriesData, isLoading: subCategoriesLoading, error: subCategoriesError } = domainQueryService.useDomainSubCategories();
  const { data: domainsData, isLoading: domainsLoading, error: domainsError } = domainQueryService.useDomains();

  const isLoading = categoriesLoading || subCategoriesLoading || domainsLoading;
  const hasError = categoriesError || subCategoriesError || domainsError;

  // Process data to create grouped table rows
  const processTableData = (): TableDataType[] => {
    if (!domainsData?.data?.domain || !categoriesData?.data?.categories || !subCategoriesData?.data?.domainSubCategories) {
      return [];
    }

    const domains = domainsData.data.domain;
    const categories = categoriesData.data.categories;
    const subCategories = subCategoriesData.data.domainSubCategories;

    // Group domains by category
    const groupedData: TableDataType[] = [];

    categories.forEach((category) => {
      // Find all subcategories for this category
      const categorySubCategories = subCategories.filter(sc => sc.domain_category._id === category._id);

      const subCategoriesWithDomains = categorySubCategories.map(subCat => ({
        name: subCat.name,
        id: subCat._id,
        slug: subCat.slug,
        domains: domains.filter(domain => 
          domain.domain_sub_category?._id === subCat._id
        ).map(domain => ({
          name: domain.name,
          id: domain._id,
          slug: domain.slug,
          createdAt: domain.createdAt,
        }))
      }));

      // Also include domains that belong directly to category without subcategory
      const directCategoryDomains = domains.filter(domain => 
        domain.domain_category._id === category._id && !domain.domain_sub_category
      );

      if (directCategoryDomains.length > 0) {
        subCategoriesWithDomains.unshift({
          name: 'No Sub-Category',
          id: 'direct',
          slug: '',
          domains: directCategoryDomains.map(domain => ({
            name: domain.name,
            id: domain._id,
            slug: domain.slug,
            createdAt: domain.createdAt,
          }))
        });
      }

      // Only add category if it has subcategories or direct domains
      if (subCategoriesWithDomains.length > 0) {
        groupedData.push({
          key: category._id,
          category: {
            name: category.name,
            id: category._id,
            slug: category.slug,
          },
          subCategories: subCategoriesWithDomains,
        });
      }
    });

    return groupedData;
  };

  const tableData = processTableData();

  // Flatten data for table display with grouped domains
  const flattenedData = tableData.flatMap(categoryData => 
    categoryData.subCategories.map((subCat, subIndex) => ({
      key: `${categoryData.key}-${subIndex}`,
      categoryName: subIndex === 0 ? categoryData.category.name : '',
      categoryRowSpan: subIndex === 0 ? categoryData.subCategories.length : 0,
      subCategoryName: subCat.name,
      subCategorySlug: subCat.slug,
      domains: subCat.domains,
    }))
  );

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
      render: (domains: any[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px' }}>
          {domains.map((domain) => (
            <div key={domain.id} style={{ marginBottom: '4px' }}>
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

  if (hasError) {
    return (
      <Card>
        <Alert
          message="Error Loading Data"
          description="There was an error loading the domain, category, or subcategory data. Please try again later."
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

        {flattenedData.length === 0 ? (
          <Alert
            message="No Data Available"
            description="No domains, categories, or sub-categories have been created yet."
            type="info"
            showIcon
            style={{ marginTop: '20px' }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={flattenedData}
              pagination={flattenedData.length > 10 ? {
                pageSize: 10, 
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} sub-categories`
              } : false}
              scroll={{ x: 800 }}
              size="small"
              bordered
              style={{
                backgroundColor: '#fafafa'
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default DomainTable;