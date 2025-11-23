import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Tooltip,
  message,
  Spin,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Invoice } from "../../../../types/invoice.types";
import { AdminInvoice } from "../../../../types/admin-invoice-type";
import { generatePaymentReceipt } from "../../../../utils/receiptGenerator";
import PaymentReceipt from "../../../../components/PaymentReceipt/PaymentReceipt";

interface PaidProps {
  invoices: AdminInvoice[];
  loading: boolean;
  onRefresh: () => void;
}

const Paid: React.FC<PaidProps> = ({
  invoices,
  loading,
  onRefresh,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const handleDownloadReceipt = async (invoice: AdminInvoice) => {
    try {
      setIsGeneratingReceipt(true);
      message.loading({ content: 'Generating receipt...', key: 'receipt' });
      
      await generatePaymentReceipt(invoice, {
        filename: `Receipt-${invoice.invoiceNumber}-${dayjs().format('YYYY-MM-DD')}.pdf`,
        format: 'a4',
        quality: 2,
      });
      
      message.success({ content: 'Receipt downloaded successfully!', key: 'receipt' });
    } catch (error) {
      console.error('Error generating receipt:', error);
      message.error({ content: 'Failed to generate receipt. Please try again.', key: 'receipt' });
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handlePreviewReceipt = (invoice: AdminInvoice) => {
    setSelectedInvoice(invoice);
    setShowReceiptPreview(true);
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview Receipt">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewReceipt(record)}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip title="Download Receipt PDF">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              loading={isGeneratingReceipt && selectedInvoice?._id === record._id}
              onClick={() => handleDownloadReceipt(record)}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="View Invoice Details">
            <Button
              size="small"
              icon={<FileTextOutlined />}
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

      {/* Receipt Preview Modal */}
      <Modal
        title="Payment Receipt Preview"
        open={showReceiptPreview}
        onCancel={() => {
          setShowReceiptPreview(false);
          setSelectedInvoice(null);
        }}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setShowReceiptPreview(false)}>
            Close
          </Button>,
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Print
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={isGeneratingReceipt}
            onClick={() => selectedInvoice && handleDownloadReceipt(selectedInvoice)}
          >
            Download PDF
          </Button>,
        ]}
        styles={{
          body: { maxHeight: '70vh', overflow: 'auto' }
        }}
      >
        {selectedInvoice && (
          <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
            <PaymentReceipt invoice={selectedInvoice} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Paid;
