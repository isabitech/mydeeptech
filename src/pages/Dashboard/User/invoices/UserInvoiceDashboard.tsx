import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Progress,
  Tooltip,
  Select,
  DatePicker,
  Empty,
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Invoice, PaymentStatus } from "../../../../types/invoice.types";
import InvoiceDetailsModal from "../../Admin/invoicemgt/InvoiceDetailsModal";
import { useUserInvoices } from "../../../../hooks/Auth/User/Invoices/useUserInvoices";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UserInvoiceDashboard: React.FC = () => {
  const {
    loading,
    getUserInvoices,
    getInvoiceDashboard,
    invoices,
    pagination,
    dashboardData,
  } = useUserInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    paymentStatus: undefined as PaymentStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadData = async () => {
    await getInvoiceDashboard();
    await loadInvoices();
  };

  const loadInvoices = async () => {
    await getUserInvoices(filters);
  };

  const getStatusColor = (status: PaymentStatus) => {
    const statusMap = {
      paid: "green",
      unpaid: "orange",
      overdue: "red",
      cancelled: "default",
      disputed: "red",
    } as const;
    return statusMap[status] || "default";
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "unpaid":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "overdue":
        return <CalendarOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const calculateDaysOverdue = (dueDate: string, paymentStatus: PaymentStatus) => {
    if (paymentStatus === "paid" || paymentStatus === "cancelled") return 0;
    const now = dayjs();
    const due = dayjs(dueDate);
    return now.isAfter(due) ? now.diff(due, "day") : 0;
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // TODO: Implement download functionality
    console.log("Download invoice:", invoice.invoiceNumber);
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice #",
      dataIndex: "formattedInvoiceNumber",
      key: "invoiceNumber",
      width: 150,
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Project",
      key: "project",
      width: 200,
      render: (record: Invoice) => {
        const projectName = typeof record.projectId === "string" 
          ? `Project ID: ${record.projectId}`
          : record.projectId.projectName;
        return (
          <Tooltip title={projectName}>
            <Text ellipsis style={{ maxWidth: 180 }}>
              {projectName}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (record: Invoice) => (
        <Text strong>
          {record.currency} {record.invoiceAmount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 130,
      render: (status: PaymentStatus, record: Invoice) => {
        const daysOverdue = calculateDaysOverdue(record.dueDate, status);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
              {status.toUpperCase()}
            </Tag>
            {daysOverdue > 0 && (
              <Text type="danger" style={{ fontSize: 11 }}>
                {daysOverdue} days overdue
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date: string, record: Invoice) => {
        const isOverdue = dayjs().isAfter(dayjs(date)) && 
          record.paymentStatus !== "paid" && 
          record.paymentStatus !== "cancelled";
        return (
          <Text type={isOverdue ? "danger" : undefined}>
            {dayjs(date).format("MMM DD, YYYY")}
          </Text>
        );
      },
    },
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (record: Invoice) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadInvoice(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
    }));
  };

  const handleStatusChange = (value: PaymentStatus | undefined) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      paymentStatus: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div>
      <Title level={2}>My Invoices</Title>

      {/* Dashboard Stats */}
      {dashboardData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={dashboardData.summary.totalAmount || 0}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="USD"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={dashboardData.summary.unpaidAmount || 0}
                precision={2}
                prefix={<ClockCircleOutlined />}
                suffix="USD"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Paid Amount"
                value={dashboardData.summary.paidAmount || 0}
                precision={2}
                prefix={<CheckCircleOutlined />}
                suffix="USD"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Invoices"
                value={dashboardData.summary.totalInvoices || 0}
                prefix={<FileTextOutlined />}
              />
              {dashboardData.summary.totalAmount && dashboardData.summary.paidAmount && (
                <Progress 
                  percent={Math.round((dashboardData.summary.paidAmount / dashboardData.summary.totalAmount) * 100)}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Filters:</Text>
          </Col>
          <Col>
            <Select
              placeholder="Payment Status"
              style={{ width: 150 }}
              value={filters.paymentStatus}
              onChange={handleStatusChange}
              allowClear
            >
              <Option value="unpaid">Unpaid</Option>
              <Option value="paid">Paid</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="disputed">Disputed</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={filters.startDate && filters.endDate ? 
                [dayjs(filters.startDate), dayjs(filters.endDate)] : undefined}
              onChange={handleDateRangeChange}
              format="MMM DD, YYYY"
            />
          </Col>
          <Col>
            <Button onClick={resetFilters}>Reset</Button>
          </Col>
        </Row>
      </Card>

      {/* Invoices Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination?.currentPage || 1,
            pageSize: pagination?.invoicesPerPage || 10,
            total: pagination?.totalInvoices || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} invoices`,
            onChange: (page, size) => {
              setFilters(prev => ({ ...prev, page, limit: size }));
            },
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No invoices found"
              />
            ),
          }}
        />
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default UserInvoiceDashboard;