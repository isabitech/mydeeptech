import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Badge,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  DollarOutlined,
  FileTextOutlined,
  MailOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import {
  Invoice,
  PaymentStatus,
  Currency,
} from "../../../../types/invoice.types";
import CreateInvoiceModal from "./CreateInvoiceModal";
import UpdatePaymentModal from "./UpdatePaymentModal";
import InvoiceDetailsModal from "./InvoiceDetailsModal";

const { Option } = Select;
const { RangePicker } = DatePicker;

const InvoiceManagement: React.FC = () => {
  const {
    loading,
    error,
    invoices,
    pagination,
    summary,
    getAllInvoices,
    sendPaymentReminder,
    deleteInvoice,
    refreshInvoices,
  } = useAdminInvoices();

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updatePaymentModalOpen, setUpdatePaymentModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    paymentStatus: undefined as PaymentStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    await getAllInvoices(filters);
  };

  const handleCreateSuccess = () => {
    setCreateModalOpen(false);
    refreshInvoices(filters);
    message.success("Invoice created successfully!");
  };

  const handleUpdatePaymentSuccess = () => {
    setUpdatePaymentModalOpen(false);
    setSelectedInvoice(null);
    refreshInvoices(filters);
    message.success("Payment status updated successfully!");
  };

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      const result = await sendPaymentReminder(invoice._id);
      if (result.success) {
        message.success(`Payment reminder sent to ${invoice.dtUserId}`);
      } else {
        message.error(result.error || "Failed to send reminder");
      }
    } catch (error) {
      message.error("Failed to send payment reminder");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        message.success("Invoice deleted successfully!");
        refreshInvoices(filters);
      } else {
        message.error(result.error || "Failed to delete invoice");
      }
    } catch (error) {
      message.error("Failed to delete invoice");
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus): string => {
    const colors = {
      paid: "green",
      unpaid: "orange",
      overdue: "red",
      cancelled: "default",
      disputed: "purple",
    };
    return colors[status] || "default";
  };

  const formatCurrency = (amount: number, currency: Currency): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const due = dayjs(dueDate);
    const now = dayjs();
    return now.isAfter(due) ? now.diff(due, "day") : 0;
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice #",
      dataIndex: "formattedInvoiceNumber",
      key: "invoiceNumber",
      width: 150,
      render: (text: string, record: Invoice) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedInvoice(record);
            setDetailsModalOpen(true);
          }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "DTUser",
      dataIndex: ["dtUserId"],
      key: "dtUser",
      width: 200,
      render: (dtUser: any) => (
        <div>
          <div className="font-medium">{dtUser?.fullName || "N/A"}</div>
          <div className="text-sm text-gray-500">{dtUser?.email}</div>
        </div>
      ),
    },
    {
      title: "Project",
      dataIndex: ["projectId"],
      key: "project",
      width: 200,
      render: (project: any) => (
        <div>
          <div className="font-medium">{project?.projectName || "N/A"}</div>
          <div className="text-sm text-gray-500">{project?.projectCategory}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "invoiceAmount",
      key: "amount",
      width: 120,
      render: (amount: number, record: Invoice) => (
        <span className="font-medium">
          {formatCurrency(amount, record.currency)}
        </span>
      ),
      sorter: (a, b) => a.invoiceAmount - b.invoiceAmount,
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (status: PaymentStatus, record: Invoice) => {
        const daysOverdue = calculateDaysOverdue(record.dueDate);
        return (
          <Space direction="vertical" size="small">
            <Tag color={getPaymentStatusColor(status)}>
              {status.toUpperCase()}
            </Tag>
            {status === "unpaid" && daysOverdue > 0 && (
              <Badge count={`${daysOverdue}d overdue`} size="small" />
            )}
          </Space>
        );
      },
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Unpaid", value: "unpaid" },
        { text: "Overdue", value: "overdue" },
        { text: "Cancelled", value: "cancelled" },
        { text: "Disputed", value: "disputed" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record: Invoice) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedInvoice(record);
                setDetailsModalOpen(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Update Payment">
            <Button
              icon={<DollarOutlined />}
              size="small"
              onClick={() => {
                setSelectedInvoice(record);
                setUpdatePaymentModalOpen(true);
              }}
            />
          </Tooltip>

          {record.paymentStatus === "unpaid" && (
            <Tooltip title="Send Reminder">
              <Button
                icon={<MailOutlined />}
                size="small"
                onClick={() => handleSendReminder(record)}
              />
            </Tooltip>
          )}

          {record.paymentStatus === "unpaid" && (
            <Popconfirm
              title="Delete Invoice"
              description="Are you sure you want to delete this invoice?"
              onConfirm={() => handleDeleteInvoice(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Invoice Management</h1>
          <p className="text-gray-600">Manage and track all invoices</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Invoice
        </Button>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Invoices"
                value={summary.totalInvoices}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Amount"
                value={summary.totalAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Paid Amount"
                value={summary.paidAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Unpaid Amount"
                value={summary.unpaidAmount}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              value={filters.paymentStatus}
              onChange={(value) => setFilters({ ...filters, paymentStatus: value, page: 1 })}
              style={{ width: "100%" }}
            >
              <Option value="paid">Paid</Option>
              <Option value="unpaid">Unpaid</Option>
              <Option value="overdue">Overdue</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="disputed">Disputed</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  startDate: dates?.[0]?.toISOString(),
                  endDate: dates?.[1]?.toISOString(),
                  page: 1,
                });
              }}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refreshInvoices(filters)}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          loading={loading}
          rowKey="_id"
          rowSelection={{
            selectedRowKeys: selectedInvoices,
            onChange: (keys) => setSelectedInvoices(keys as string[]),
          }}
          pagination={
            pagination
              ? {
                  current: pagination.currentPage,
                  pageSize: pagination.invoicesPerPage,
                  total: pagination.totalInvoices,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  onChange: (page, limit) => {
                    setFilters({ ...filters, page, limit });
                  },
                }
              : false
          }
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <CreateInvoiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedInvoice && (
        <UpdatePaymentModal
          open={updatePaymentModalOpen}
          onClose={() => {
            setUpdatePaymentModalOpen(false);
            setSelectedInvoice(null);
          }}
          onSuccess={handleUpdatePaymentSuccess}
          invoice={selectedInvoice}
        />
      )}

      {selectedInvoice && (
        <InvoiceDetailsModal
          open={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
        />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;