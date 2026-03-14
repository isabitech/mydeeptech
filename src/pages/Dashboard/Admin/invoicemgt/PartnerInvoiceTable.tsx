import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Card, Typography, Tag, message } from "antd";
import { SearchOutlined, LeftOutlined, RightOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import { Invoice } from "../../../../store/useInvoiceStore";

const { Title, Text } = Typography;

const PartnerInvoiceTable: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const limit = 10;

    const { data, isLoading, isError, refetch } = partnerInvoiceQueryService.useFetchPaginatedPartnerInvoices({
        page,
        limit,
        search,
    });

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1); // Reset to page 1 on search
    };

    const columns: ColumnsType<Invoice> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text || "N/A"}</Text>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount, record) => (
                <Text>
                    {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: record.currency || "USD",
                    }).format(amount)}
                </Text>
            ),
        },
        {
            title: "Currency",
            dataIndex: "currency",
            key: "currency",
            render: (currency) => <Tag color="blue">{currency}</Tag>,
        },
        {
            title: "Due Date",
            dataIndex: "due_date",
            key: "due_date",
            render: (date) => (date ? dayjs(date).format("MMM DD, YYYY") : "N/A"),
        },
    ];

    const invoices = data?.invoices || [];
    const pagination = data?.pagination || { page: 1, limit: 10, totalCount: 0 };

    return (
        <Card className="shadow-sm rounded-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <Title level={4} className="!m-0">Partner Invoices</Title>
                    <Text type="secondary">View and manage all partner invoices</Text>
                </div>

                <Space size="middle" className="w-full md:w-auto">
                    <Input
                        placeholder="Search by name or email..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full md:w-64"
                        allowClear
                    />
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={() => refetch()}
                        className="flex items-center"
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={invoices}
                rowKey="_id"
                loading={isLoading}
                pagination={false}
                className="premium-table"
                scroll={{ x: 800 }}
            />

            <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <Text type="secondary">
                    Showing {(page - 1) * limit + 1} - {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} results
                </Text>

                <Space>
                    <Button
                        icon={<LeftOutlined />}
                        disabled={page === 1 || isLoading}
                        onClick={() => setPage(prev => prev - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        iconPosition="end"
                        icon={<RightOutlined />}
                        disabled={page * limit >= pagination.totalCount || isLoading}
                        onClick={() => setPage(prev => prev + 1)}
                    >
                        Next
                    </Button>
                </Space>
            </div>

            {isError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    Failed to load partner invoices. Please try again later.
                </div>
            )}
        </Card>
    );
};

export default PartnerInvoiceTable;
