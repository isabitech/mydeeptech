

import React, { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Modal,
  Button,
} from "antd";
import {
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
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedInvoice(record);
            setShowDetails(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <p className="mb-4">
        Your Paid Invoices - {dayjs().format("MMMM DD, YYYY")}
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
            <p><strong>Project:</strong> {getProjectName(selectedInvoice.projectId)}</p>
            <p><strong>Payment Method:</strong> {selectedInvoice.paymentMethod || "N/A"}</p>
            <p><strong>Description:</strong> {selectedInvoice.description || "No description"}</p>
            {selectedInvoice.workDescription && (
              <p><strong>Work Description:</strong> {selectedInvoice.workDescription}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Paid;