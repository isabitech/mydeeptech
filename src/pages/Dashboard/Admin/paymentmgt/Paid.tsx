import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Tooltip,
  message,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Invoice } from "../../../../types/invoice.types";

interface PaidProps {
  invoices: Invoice[];
  loading: boolean;
  onRefresh: () => void;
}

const Paid: React.FC<PaidProps> = ({
  invoices,
  loading,
  onRefresh,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDownloadReceipt = (invoice: Invoice) => {
    // TODO: Implement receipt download functionality
    message.info(`Downloading receipt for invoice ${invoice.invoiceNumber}`);
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

  const columns: ColumnsType<Invoice> = [
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
      title: "Paid Date",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (paidAt) => (
        <span>{dayjs(paidAt).format("MMM DD, YYYY")}</span>
      ),
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
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => (
        <Tag color="green">
          {method ? method.replace('_', ' ').toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Download Receipt">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReceipt(record)}
            >
              Receipt
            </Button>
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4">
        Paid Invoices - {dayjs().format("MMMM DD, YYYY")}
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
            <p><strong>Paid Date:</strong> {selectedInvoice.paidAt ? dayjs(selectedInvoice.paidAt).format("MMMM DD, YYYY") : "N/A"}</p>
            <p><strong>DTUser:</strong> {getDTUserName(selectedInvoice.dtUserId)}</p>
            <p><strong>Project:</strong> {getProjectName(selectedInvoice.projectId)}</p>
            <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod || "N/A"}</p>
            <p><strong>Transaction Reference:</strong> {selectedInvoice.paymentReference || "N/A"}</p>
            <p><strong>Description:</strong> {selectedInvoice.description || "No description"}</p>
            {selectedInvoice.workDescription && (
              <p><strong>Work Description:</strong> {selectedInvoice.workDescription}</p>
            )}
            {selectedInvoice.paymentNotes && (
              <p><strong>Payment Notes:</strong> {selectedInvoice.paymentNotes}</p>
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

export default Paid;
