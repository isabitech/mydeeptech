import React from "react";
import { Table, Card, Typography, Spin, Alert, Input, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableDataType } from "./types";

const { Title, Text } = Typography;

interface DomainTableCoreProps {
  tableData: TableDataType[];
  columns: any[];
  isLoading: boolean;
  error: any;
  searchTerm: string;
  debouncedSearchTerm: string;
  currentPage: number;
  paginationData: any;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageChange: (page: number) => void;
}

const DomainTableCore: React.FC<DomainTableCoreProps> = ({
  tableData,
  columns,
  isLoading,
  error,
  searchTerm,
  debouncedSearchTerm,
  currentPage,
  paginationData,
  onSearchChange,
  onPageChange
}) => {
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
              onChange={onSearchChange}
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
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="key"
            pagination={{
              current: paginationData?.currentPage || currentPage,
              pageSize: paginationData?.limit || 20,
              total: paginationData?.totalCount || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              position: ['bottomCenter'],
              showTotal: (total, range) => {
                const currentPageNum = paginationData?.currentPage || 1;
                return `Showing (${currentPageNum} of ${paginationData?.totalPages || 1})`;
              },
              onChange: (page, size) => {
                onPageChange(page);
              }
            }}
            scroll={{ x: 800 }}
            size="small"
            bordered
            style={{ backgroundColor: '#fafafa' }}
          />
        )}
      </Card>
    </div>
  );
};

export default DomainTableCore;