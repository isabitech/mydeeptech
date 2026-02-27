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
  notification,
  Divider,
  Checkbox,
} from "antd";
import {
  DollarCircleOutlined,
  EyeOutlined,
  EditOutlined,
  MailOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  FileExcelOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Invoice, UpdatePaymentStatusForm } from "../../../../types/invoice.types";
import { AdminInvoice } from "../../../../types/admin-invoice-type";
import { generatePaymentReceipt } from "../../../../utils/receiptGenerator";
import { constructBulkTransferPayload } from "./_utils/_payment-payload.utils";
import paymentMutationService from "../../../../services/invoice-payment-service/invoice-payment-mutation";
import ErrorMessage from "../../../../lib/error-message";
import { BulkTransferPayloadSchema } from "../../../../validators/payment/payment-schema";

interface UnpaidProps {
  invoices: AdminInvoice[];
  loading: boolean;
  onRefresh: () => void;
  onUpdatePayment: (invoiceId: string, paymentData: UpdatePaymentStatusForm) => Promise<any>;
  onSendReminder: (invoiceId: string) => Promise<any>;
  onDelete: (invoiceId: string) => Promise<any>;
  onShowPaymentModal: (invoice: any) => void;
  onBulkAuthorizePayment?: () => Promise<any>;
  onGeneratePaystackCSV?: (invoiceIds?: string[] | null) => Promise<any>;
  onGenerateMpesaCSV?: (invoiceIds?: string[] | null) => Promise<any>;
}

const Unpaid: React.FC<UnpaidProps> = ({
  invoices,
  loading,
  onRefresh,
  onUpdatePayment,
  onSendReminder,
  onDelete,
  onShowPaymentModal,
  onBulkAuthorizePayment,
  onGeneratePaystackCSV,
  onGenerateMpesaCSV,
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [isBulkAuthorizing, setIsBulkAuthorizing] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [isGeneratingMpesaCSV, setIsGeneratingMpesaCSV] = useState(false);
  const [isLoggingSelected, setIsLoggingSelected] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [showNGNOnly, setShowNGNOnly] = useState(false);
  const [showKESOnly, setShowKESOnly] = useState(false);

  const paymentWithInvoiceMutation = paymentMutationService.useBulkInvoicePayment();

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

  const handleGenerateReceipt = async (invoice: AdminInvoice) => {
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

  const handleBulkAuthorizePayment = async () => {
    if (!onBulkAuthorizePayment) {
      message.error('Bulk authorize payment function not available');
      return;
    }

    Modal.confirm({
      title: 'Bulk Authorize Payment',
      content: (
        <div>
          <p>Are you sure you want to authorize payment for <strong>all unpaid invoices</strong>?</p>
          <p className="text-sm text-gray-600 mt-2">
            This will:
            <br />• Mark all unpaid invoices as paid
            <br />• Send payment confirmation emails to users
            <br />• Generate payment records
          </p>
        </div>
      ),
      okText: 'Yes, Authorize All',
      okType: 'primary',
      cancelText: 'Cancel',
      width: 500,
      onOk: async () => {
        try {
          setIsBulkAuthorizing(true);
          const result = await onBulkAuthorizePayment();
          
          if (result.success) {
            const { processedInvoices, totalAmount, emailsSent, errors } = result.data;
            
            notification.success({
              message: 'Bulk Payment Authorization Completed',
              description: (
                <div>
                  <p>✅ Processed {processedInvoices} invoices</p>
                  <p>💰 Total amount: ${totalAmount.toFixed(2)}</p>
                  <p>📧 Emails sent: {emailsSent}</p>
                  {errors && errors.length > 0 && (
                    <p className="text-orange-600">⚠️ {errors.length} email errors</p>
                  )}
                </div>
              ),
              duration: 10,
              placement: 'topRight',
            });
            
            onRefresh(); // Refresh the invoices list
          } else {
            notification.error({
              message: 'Bulk Authorization Failed',
              description: result.message || result.error || 'Failed to authorize payments',
              placement: 'topRight',
            });
          }
        } catch (error: any) {
          console.error('Bulk authorize error:', error);
          notification.error({
            message: 'Bulk Authorization Error',
            description: error.message || 'An unexpected error occurred',
            placement: 'topRight',
          });
        } finally {
          setIsBulkAuthorizing(false);
        }
      },
    });
  };

  // Filter invoices based on currency filters
  const filteredInvoices = showNGNOnly || showKESOnly
    ? invoices.filter(invoice => {
        const dtUser = invoice.dtUserId;
        if (typeof dtUser === 'string') return false;
        const currency = dtUser?.payment_info?.payment_currency;
        if (showNGNOnly && showKESOnly) {
          return currency === 'NGN' || currency === 'KES';
        } else if (showNGNOnly) {
          return currency === 'NGN';
        } else if (showKESOnly) {
          return currency === 'KES';
        }
        return false;
      })
    : invoices;

  // Get selected invoice objects (not just IDs)
  const selectedInvoices = filteredInvoices.filter(invoice => 
    selectedInvoiceIds.includes(invoice._id)
  );

  // Check if user has NGN payment info
  const hasNGNPaymentInfo = (invoice: AdminInvoice): boolean => {
    const dtUser = invoice.dtUserId;
    if (typeof dtUser === 'string') return false;
    return !!(dtUser?.payment_info?.payment_currency === 'NGN' && 
           dtUser?.payment_info?.account_name && 
           dtUser?.payment_info?.account_number &&
           dtUser?.payment_info?.bank_name);
  };

  // Check if user has KES payment info
  const hasKESPaymentInfo = (invoice: AdminInvoice): boolean => {
    const dtUser = invoice.dtUserId;
    if (typeof dtUser === 'string') return false;
    return !!(dtUser?.payment_info?.payment_currency === 'KES' && 
           dtUser?.payment_info?.account_name && 
           dtUser?.payment_info?.account_number &&
           dtUser?.payment_info?.bank_name);
  };

  const rowSelection = {
    selectedRowKeys: selectedInvoiceIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedInvoiceIds(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: AdminInvoice) => ({
      disabled: record.paymentStatus === 'paid',
      name: record.invoiceNumber,
    }),
  };

  const handleGeneratePaystackCSV = async () => {
    if (!onGeneratePaystackCSV) {
      message.error('Generate Paystack CSV function not available');
      return;
    }

    const invoicesToProcess = selectedInvoiceIds.length > 0 ? selectedInvoiceIds : null;
    
    if (selectedInvoiceIds.length === 0 && !showNGNOnly && !showKESOnly) {
      Modal.confirm({
        title: 'No Selection Made',
        content: (
          <div>
            <p>You haven't selected any specific invoices or filtered by currency.</p>
            <p>Do you want to process <strong>all unpaid invoices</strong> for CSV generation?</p>
            <p className="text-sm text-gray-600 mt-2">
              Note: Only invoices from supported currency freelancers (NGN, KES) will be included in the final CSV.
            </p>
          </div>
        ),
        okText: 'Yes, Process All',
        cancelText: 'Cancel',
        onOk: () => generateCSV(null),
      });
      return;
    }

    generateCSV(invoicesToProcess);
  };

  const handleGenerateMpesaCSV = async () => {
    if (!onGenerateMpesaCSV) {
      message.error('Generate MPESA CSV function not available');
      return;
    }

    const invoicesToProcess = selectedInvoiceIds.length > 0 ? selectedInvoiceIds : null;
    
    if (selectedInvoiceIds.length === 0 && !showKESOnly) {
      Modal.confirm({
        title: 'No Selection Made',
        content: (
          <div>
            <p>You haven't selected any specific invoices or filtered by KES currency.</p>
            <p>Do you want to process <strong>all unpaid invoices</strong> for MPESA CSV generation?</p>
            <p className="text-sm text-gray-600 mt-2">
              Note: Only invoices from Kenyan freelancers with MPESA account numbers will be included in the final CSV.
            </p>
          </div>
        ),
        okText: 'Yes, Process All',
        cancelText: 'Cancel',
        onOk: () => generateMpesaCSV(null),
      });
      return;
    }

    generateMpesaCSV(invoicesToProcess);
  };

  const generateCSV = async (invoiceIds: string[] | null) => {
    if (!onGeneratePaystackCSV) {
      message.error('Generate Paystack CSV function not available');
      return;
    }

    try {
      setIsGeneratingCSV(true);
      message.loading({ content: 'Generating Paystack CSV...', key: 'csv' });
      
      const result = await onGeneratePaystackCSV(invoiceIds);
      
      if (result.success) {
        const { csvContent, summary } = result.data;
        const { totalInvoices, nigerianFreelancers, totalAmountUSD, totalAmountNGN, errors } = summary;
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `Paystack-Bulk-Transfer-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        notification.success({
          message: 'Paystack CSV Generated Successfully',
          description: (
            <div>
              <p>📊 Total invoices: {totalInvoices}</p>
              <p>🇳🇬 Nigerian freelancers: {nigerianFreelancers}</p>
              <p>💵 Total USD: ${totalAmountUSD.toFixed(2)}</p>
              <p>₦ Total NGN: ₦{totalAmountNGN.toLocaleString()}</p>
              {errors && errors.length > 0 && (
                <p className="text-orange-600">⚠️ {errors.length} processing errors</p>
              )}
            </div>
          ),
          duration: 10,
          placement: 'topRight',
        });
        
        message.success({ content: 'CSV file downloaded successfully!', key: 'csv' });
      } else {
        // Handle exchange rate service failure or other errors
        const errorMsg = result.message || result.error || 'Failed to generate CSV';
        
        notification.error({
          message: 'CSV Generation Failed',
          description: (
            <div>
              <p>{errorMsg}</p>
              {result.details && (
                <div className="mt-2 text-sm">
                  <p>Details: {result.details.message}</p>
                  {result.details.exchangeRateError && (
                    <p className="text-red-600">Exchange Rate Error: {result.details.exchangeRateError}</p>
                  )}
                </div>
              )}
            </div>
          ),
          duration: 8,
          placement: 'topRight',
        });
        
        message.error({ content: errorMsg, key: 'csv' });
      }
    } catch (error: any) {
      console.error('Generate CSV error:', error);
      const errorMessage = error.message || 'An unexpected error occurred while generating CSV';
      
      notification.error({
        message: 'CSV Generation Error',
        description: errorMessage,
        placement: 'topRight',
      });
      
      message.error({ content: errorMessage, key: 'csv' });
    } finally {
      setIsGeneratingCSV(false);
    }
  };

  const handleLogSelectedInvoices = () => {
    // console.log('Selected Invoice IDs:', selectedInvoiceIds);
    // console.log('Selected Invoice Objects:', selectedInvoices);
    // console.log('Number of selected items:', selectedInvoices.length);


    if (selectedInvoices.length === 0) {
      message.info('No invoices selected');
      return;
    }

    const payload = constructBulkTransferPayload(selectedInvoices, {
      currency: showNGNOnly ? "NGN" : showKESOnly ? "KES" : undefined,
      source: "balance",
    });

    const validatedPayload = BulkTransferPayloadSchema.safeParse(payload);

    if (!validatedPayload.success) {
      const errorMessage = validatedPayload.error.issues[0]?.message || 'Invalid payload structure';
      console.error('Payload validation failed:', validatedPayload.error);
      
      // Show the invoices that failed validation
      const failedInvoices = selectedInvoices.map(invoice => 
        `${invoice.invoiceNumber} (${getDTUserName(invoice.dtUserId)})`
      ).join(', ');
      
      notification.error({
        key: 'bulk-payment-validation-error', // Prevents multiple duplicate notifications
        message: 'Payload Validation Failed',
        description: (
          <div>
            <p>{errorMessage}</p>
            <div className="mt-2">
              <p className="font-medium">Failed Invoices ({selectedInvoices.length}):</p>
              <p className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                {failedInvoices}
              </p>
            </div>
          </div>
        ),
        duration: 8,
        placement: 'topRight',
      });
      return;
    }

    paymentWithInvoiceMutation.bulkPaymentMutate(validatedPayload.data, {
      onSuccess: () => {
        message.success('Bulk payment mutation successful. Invoices will be processed shortly.');
      },
      onError: (error) =>  message.error(ErrorMessage(error)),
    })

  };

  const generateMpesaCSV = async (invoiceIds: string[] | null) => {
    if (!onGenerateMpesaCSV) {
      message.error('Generate MPESA CSV function not available');
      return;
    }

    try {
      setIsGeneratingMpesaCSV(true);
      message.loading({ content: 'Generating MPESA CSV...', key: 'mpesa-csv' });
      
      const result = await onGenerateMpesaCSV(invoiceIds);
      
      if (result.success) {
        const { csvContent, summary } = result.data;
        const { totalInvoices, processedInvoices, totalAmountUSD, errors } = summary;
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `MPESA-Bulk-Transfer-${dayjs().format('YYYY-MM-DD-HHmm')}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        notification.success({
          message: 'MPESA CSV Generated Successfully',
          description: (
            <div>
              <p>📊 Total invoices: {totalInvoices}</p>
              <p>🇰🇪 Processed invoices: {processedInvoices}</p>
              <p>💵 Total USD: ${totalAmountUSD.toFixed(2)}</p>
              {errors && errors.length > 0 && (
                <p className="text-orange-600">⚠️ {errors.length} processing errors</p>
              )}
            </div>
          ),
          duration: 10,
          placement: 'topRight',
        });
        
        message.success({ content: 'MPESA CSV file downloaded successfully!', key: 'mpesa-csv' });
      } else {
        const errorMsg = result.message || result.error || 'Failed to generate MPESA CSV';
        
        notification.error({
          message: 'MPESA CSV Generation Failed',
          description: (
            <div>
              <p>{errorMsg}</p>
              {result.details && (
                <div className="mt-2 text-sm">
                  <p>Details: {result.details.message}</p>
                </div>
              )}
            </div>
          ),
          duration: 8,
          placement: 'topRight',
        });
        
        message.error({ content: errorMsg, key: 'mpesa-csv' });
      }
    } catch (error: any) {
      console.error('Generate MPESA CSV error:', error);
      const errorMessage = error.message || 'An unexpected error occurred while generating MPESA CSV';
      
      notification.error({
        message: 'MPESA CSV Generation Error',
        description: errorMessage,
        placement: 'topRight',
      });
      
      message.error({ content: errorMessage, key: 'mpesa-csv' });
    } finally {
      setIsGeneratingMpesaCSV(false);
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
      render: (dtUserId, record) => (
        <Space direction="vertical" size={0}>
          <div className="flex items-center gap-2">
            <span className="font-medium">{getDTUserName(dtUserId)}</span>
            {hasNGNPaymentInfo(record) && (
              <Tag color="green">NGN</Tag>
            )}
            {hasKESPaymentInfo(record) && (
              <Tag color="blue">KES</Tag>
            )}
          </div>
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
      width: 250,
      render: (_, record) => (
        <Space size="small">
          {record.paymentStatus !== 'paid' && (
            <>
              <Tooltip title="Authorize Payment">
                <Button
                  type="primary"
                  size="small"
                  icon={<DollarCircleOutlined />}
                  onClick={() => onShowPaymentModal(record)}
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
            </>
          )}
          
          {record.paymentStatus === 'paid' && (
            <Tooltip title="Download Receipt">
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                loading={isGeneratingReceipt}
                onClick={() => handleGenerateReceipt(record)}
              >
                Receipt
              </Button>
            </Tooltip>
          )}
          
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
          
          {record.paymentStatus !== 'paid' && (
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
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-5">
        <p>
          Unpaid Invoices - {dayjs().format("MMMM DD, YYYY")}
        </p>
        
        {/* Bulk Operations */}
        <div  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {onBulkAuthorizePayment && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleBulkAuthorizePayment}
              loading={isBulkAuthorizing}
              disabled={!invoices.length || loading}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              Bulk Authorize Payment
            </Button>
          )}
          
          {onGeneratePaystackCSV && (
            <Button
              type="default"
              icon={<FileExcelOutlined />}
              onClick={handleGeneratePaystackCSV}
              loading={isGeneratingCSV}
              disabled={!invoices.length || loading || selectedInvoiceIds.length === 0}
              className="border-orange-500 text-orange-600 hover:border-orange-600 hover:text-orange-700"
            >
              Generate Paystack CSV
            </Button>
          )}

          {onGenerateMpesaCSV && (
            <Button
              type="default"
              icon={<FileExcelOutlined />}
              onClick={handleGenerateMpesaCSV}
              loading={isGeneratingMpesaCSV}
              disabled={!invoices.length || loading || selectedInvoiceIds.length === 0}
              className="border-blue-500 text-blue-600 hover:border-blue-600 hover:text-blue-700"
            >
              Generate MPESA CSV
            </Button>
          )}
          
          <Button
            type="default"
            icon={<CreditCardOutlined />}
            onClick={handleLogSelectedInvoices}
            loading={paymentWithInvoiceMutation.bulkPaymentMutationIsPending}
            disabled={!invoices.length || paymentWithInvoiceMutation.bulkPaymentMutationIsPending}
            className="border-gray-500 text-gray-600 hover:border-gray-600 hover:text-gray-700"
          > Pay Invoice{`${selectedInvoiceIds.length > 1 ? 's' : ''}`} ({selectedInvoiceIds.length})
          </Button>
        </div>
      </div>
      
      {/* Bulk Operations Info */}
      {(onBulkAuthorizePayment || onGeneratePaystackCSV || onGenerateMpesaCSV) && invoices.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
          <div className="flex items-start space-x-2">
            <div className="text-blue-600 text-sm">
              <p className="font-medium mb-1">💡 Bulk Operations Available:</p>
              {onBulkAuthorizePayment && (
                <p>• <strong>Bulk Authorize:</strong> Mark all {filteredInvoices.length} unpaid invoices as paid and send confirmation emails</p>
              )}
              {onGeneratePaystackCSV && (
                <p>• <strong>Paystack CSV:</strong> Generate CSV file for bulk transfers to Nigerian freelancers (USD → NGN conversion)</p>
              )}
              {onGenerateMpesaCSV && (
                <p>• <strong>MPESA CSV:</strong> Generate CSV file for bulk transfers to Kenyan freelancers (USD amounts)</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Selection and Filter Controls */}
      {(onGeneratePaystackCSV || onGenerateMpesaCSV) && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={showNGNOnly}
                  onChange={(e) => {
                    setShowNGNOnly(e.target.checked);
                    setSelectedInvoiceIds([]); // Clear selection when filter changes
                  }}
                >
                  Nigerian users (NGN)
                </Checkbox>
                <Checkbox
                  checked={showKESOnly}
                  onChange={(e) => {
                    setShowKESOnly(e.target.checked);
                    setSelectedInvoiceIds([]); // Clear selection when filter changes
                  }}
                >
                  Kenyan users (KES)
                </Checkbox>
              </div>
              
              {selectedInvoiceIds.length > 0 && (
                <div className="text-sm text-blue-600">
                  {selectedInvoiceIds.length} invoice(s) selected
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {selectedInvoiceIds.length > 0 && (
                <Button 
                  size="small" 
                  onClick={() => setSelectedInvoiceIds([])}
                >
                  Clear Selection
                </Button>
              )}
              
              {filteredInvoices.length > 0 && (
                <Button 
                  size="small" 
                  onClick={() => {
                    const selectableIds = filteredInvoices
                      .filter(inv => inv.paymentStatus !== 'paid')
                      .map(inv => inv._id);
                    setSelectedInvoiceIds(selectableIds);
                  }}
                >
                  Select All {showNGNOnly && showKESOnly ? 'NGN/KES ' : showNGNOnly ? 'NGN ' : showKESOnly ? 'KES ' : ''}Unpaid
                </Button>
              )}
            </div>
          </div>
          
          {(showNGNOnly || showKESOnly) && (
            <div className="mt-2 text-xs text-gray-600">
              Showing {filteredInvoices.length} invoices from users with {showNGNOnly && showKESOnly ? 'NGN or KES' : showNGNOnly ? 'NGN' : 'KES'} payment currency
            </div>
          )}
        </div>
      )}
      
      <Table
        columns={columns}
        dataSource={filteredInvoices}
        loading={loading}
        rowKey="_id"
        rowSelection={onGeneratePaystackCSV ? rowSelection : undefined}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => {
            let filterText = '';
            if (showNGNOnly && showKESOnly) {
              filterText = ' (NGN/KES filtered)';
            } else if (showNGNOnly) {
              filterText = ' (NGN filtered)';
            } else if (showKESOnly) {
              filterText = ' (KES filtered)';
            }
            return `${range[0]}-${range[1]} of ${total} invoices${filterText}`;
          },
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
