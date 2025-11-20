import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Tooltip,
  message,
  Popconfirm,
} from "antd";
import {
  DollarCircleOutlined,
  EyeOutlined,
  EditOutlined,
  MailOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Invoice, UpdatePaymentStatusForm } from "../../../../types/invoice.types";
import { AdminInvoice } from "../../../../types/admin-invoice-type";

interface UnpaidProps {
  invoices: AdminInvoice[];
  loading: boolean;
  onRefresh: () => void;
  onUpdatePayment: (invoiceId: string, paymentData: UpdatePaymentStatusForm) => Promise<any>;
  onSendReminder: (invoiceId: string) => Promise<any>;
  onDelete: (invoiceId: string) => Promise<any>;
}

const Unpaid: React.FC<UnpaidProps> = ({
  invoices,
  loading,
  onRefresh,
  onUpdatePayment,
  onSendReminder,
  onDelete,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const paymentData: UpdatePaymentStatusForm = {
        paymentStatus: "paid",
        paymentMethod: "bank_transfer", // Default method
        paymentReference: `PAY-${Date.now()}`,
        paymentNotes: "Marked as paid by admin",
      };

      const result = await onUpdatePayment(invoice._id, paymentData);
      if (result.success) {
        message.success("Invoice marked as paid");
        onRefresh();
      } else {
        message.error(result.error || "Failed to update payment status");
      }
    } catch (error) {
      message.error("Failed to update payment status");
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const result = await onSendReminder(invoiceId);
      if (result.success) {
        message.success("Payment reminder sent");
      } else {
        message.error(result.error || "Failed to send reminder");
      }
    } catch (error) {
      message.error("Failed to send reminder");
    }
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      const result = await onDelete(invoiceId);
      if (result.success) {
        message.success("Invoice deleted");
        onRefresh();
      } else {
        message.error(result.error || "Failed to delete invoice");
      }
    } catch (error) {
      message.error("Failed to delete invoice");
    }
  };

  const getDTUserName = (dtUserId: any): string => {
    if (typeof dtUserId === "string") return dtUserId;
    return dtUserId?.fullName || "Unknown User";
  };

  const getDTUserEmail = (dtUserId: any): string => {
    if (typeof dtUserId === "string") return "N/A";
    return dtUserId?.email || "N/A";
  };

  const getProjectName = (projectId: any): string => {
    if (typeof projectId === "string") return projectId;
    return projectId?.projectName || "Unknown Project";
  };

  const getDaysOverdue = (dueDate: string): number => {
    const now = dayjs();
    const due = dayjs(dueDate);
    return now.isAfter(due) ? now.diff(due, "day") : 0;
  };

  const columns: ColumnsType<AdminInvoice> = [
    {
      title: "S/N",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{text}</span>
          <span className="text-xs text-gray-500">
            {dayjs(record.invoiceDate).format("MMM DD, YYYY")}
          </span>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "invoiceAmount",
      key: "invoiceAmount",
      render: (amount, record) => (
        <span className="font-medium">
          {record.currency} {amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate) => {
        const daysOverdue = getDaysOverdue(dueDate);
        return (
          <Space direction="vertical" size={0}>
            <span>{dayjs(dueDate).format("MMM DD, YYYY")}</span>
            {daysOverdue > 0 && (
              <Tag color="red">
                {daysOverdue} days overdue
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "DTUser",
      dataIndex: "dtUserId",
      key: "dtUserId",
      render: (dtUserId) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">{getDTUserName(dtUserId)}</span>
          <span className="text-xs text-gray-500">{getDTUserEmail(dtUserId)}</span>
        </Space>
      ),
    },
    {
      title: "Project",
      dataIndex: "projectId", 
      key: "projectId",
      render: (projectId) => (
        <span className="text-sm">{getProjectName(projectId)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color="orange">{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Mark as Paid">
            <Button
              type="primary"
              size="small"
              icon={<DollarCircleOutlined />}
              onClick={() => handleMarkAsPaid(record)}
            >
              Pay
            </Button>
          </Tooltip>
          <Tooltip title="Send Reminder">
            <Button
              size="small"
              icon={<MailOutlined />}
              onClick={() => handleSendReminder(record._id)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedInvoice(record);
                setShowDetails(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this invoice?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4">
        Unpaid Invoices - {dayjs().format("MMMM DD, YYYY")}
      </p>
      
      <Table
        columns={columns}
        dataSource={invoices}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} invoices`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Invoice Details Modal */}
      <Modal
        title="Invoice Details"
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={null}
        width={600}
      >
        {selectedInvoice && (
          <div>
            <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</p>
            <p><strong>Amount:</strong> {selectedInvoice.currency} {selectedInvoice.invoiceAmount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> {dayjs(selectedInvoice.dueDate).format("MMMM DD, YYYY")}</p>
            <p><strong>DTUser:</strong> {getDTUserName(selectedInvoice.dtUserId)}</p>
            <p><strong>Project:</strong> {getProjectName(selectedInvoice.projectId)}</p>
            <p><strong>Description:</strong> {selectedInvoice.description || "No description"}</p>
            {selectedInvoice.workDescription && (
              <p><strong>Work Description:</strong> {selectedInvoice.workDescription}</p>
            )}
            {selectedInvoice.adminNotes && (
              <p><strong>Admin Notes:</strong> {selectedInvoice.adminNotes}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Unpaid;
