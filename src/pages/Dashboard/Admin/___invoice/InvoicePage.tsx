import { useState, useEffect } from "react";
import { Button, Table, Dropdown, MenuProps } from "antd";
import { MoreOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Invoice } from "../../../../store/useInvoiceStore";
import { formatMoney } from "../../../../utils/moneyFormat";
import { App } from "antd";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import partnerInvoiceMutationService from "../../../../services/partner-invoice-service/invoice-mutation";
import NewInvoice from "./NewInvoice";
import EditInvoice from "./EditInvoice";
import InvoiceDetails from "./InvoiceDetails";
import SendInvoice from "./SendInvoice";

const InvoicePage = () => {
  const { message, modal } = App.useApp();
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, isFetching, error } = partnerInvoiceQueryService.useFetchPaginatedPartnerInvoices({ page, limit });
  const invoices = data?.invoices || [];
  const pagination = data?.pagination || { page: 1, limit: 10, totalCount: 0 };
  
  const { mutate: deleteInvoice } = partnerInvoiceMutationService.useDeletePartnerInvoice();

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [sendInvoiceId, setSendInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      message.error((error as any).message || (error as Error).message || "An error occurred");
    }
  }, [error, message]);

  const columns: ColumnsType<Invoice> = [
    {
      title: "Partner Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Invoice) => {
        const currency = record.currency || "USD";
        if (currency === "NGN") {
          return `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return formatMoney(amount, currency);
      },
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const getMenuItems = (invoice: Invoice): MenuProps["items"] => [
          {
            key: "view",
            label: "View invoice",
            onClick: () => setViewInvoiceId(invoice._id || null),
          },
          {
            key: "email",
            label: "Send as Email",
            onClick: () => setSendInvoiceId(invoice._id || null),
          },
          {
            key: "edit",
            label: "Edit",
            onClick: () => setEditInvoiceId(invoice._id || null),
          },
          {
            key: "separator",
            type: "divider"
          },
          {
            key: "delete",
            className: "group",
            label: <span className="text-red-500 group-hover:!text-white">Delete</span>,
            danger: true,
            onClick: () => {
              modal.confirm({
                title: 'Delete Invoice',
                content: `Are you sure you want to delete the invoice for "${invoice.name}"?`,
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => {
                  if (invoice._id) {
                    deleteInvoice(invoice._id, {
                      onSuccess: () => {
                        message.success("Invoice deleted successfully");
                      },
                      onError: (err: any) => {
                        message.error(err.message || "Failed to delete invoice");
                      }
                    });
                  }
                }
              });
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const conversionRatesToNGN: Record<string, number> = {
    NGN: 1,
    USD: 1500,
    EUR: 1600,
    GBP: 1900,
  };

  const totalsByCurrency = invoices.reduce((acc, inv) => {
    const currency = inv.currency || "USD";
    if (!acc[currency]) {
      acc[currency] = { total: 0, count: 0 };
    }
    acc[currency].total += inv.amount;
    acc[currency].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      <div className="bg-white rounded-lg shadow-sm w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your invoices and track payments
            </p>
          </div>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => setIsNewModalOpen(true)}
          >
            New Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Total Invoices */}
          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{pagination.totalCount || invoices.length}</div>
          </div>

          {/* Card 2: Total Amount per Currency */}
          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm font-medium mb-4">Total Amount by Currency (Page)</div>
            <div className="space-y-2">
              {Object.entries(totalsByCurrency).map(([currency, data]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">{currency}</span>
                  <span className="font-bold text-green-600">{formatMoney(data.total, currency)}</span>
                </div>
              ))}
              {Object.keys(totalsByCurrency).length === 0 && (
                <div className="text-sm text-gray-400">No invoices yet</div>
              )}
            </div>
          </div>

          {/* Card 3: Invoice Count per Currency */}
          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm font-medium mb-4">Invoice Count by Currency (Page)</div>
            <div className="space-y-2">
              {Object.entries(totalsByCurrency).map(([currency, data]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">{currency}</span>
                  <span className="font-bold text-gray-900">{data.count} invoice{data.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
              {Object.keys(totalsByCurrency).length === 0 && (
                <div className="text-sm text-gray-400">No invoices yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table <Invoice>
            columns={columns}
            dataSource={invoices}
            rowKey="_id"
            loading={isLoading || isFetching}
            pagination={{ 
                current: page,
                pageSize: limit,
                total: pagination.totalCount,
                position: ["bottomCenter"],
                onChange: (newPage) => setPage(newPage)
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <NewInvoice
        open={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <EditInvoice
        open={!!editInvoiceId}
        invoiceId={editInvoiceId}
        onClose={() => setEditInvoiceId(null)}
      />

      <InvoiceDetails
        open={!!viewInvoiceId}
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
        onEdit={(id) => {
          setViewInvoiceId(null);
          setEditInvoiceId(id);
        }}
        onSend={(id) => {
          setViewInvoiceId(null);
          setSendInvoiceId(id);
        }}
      />

      <SendInvoice
        open={!!sendInvoiceId}
        invoiceId={sendInvoiceId}
        onClose={() => setSendInvoiceId(null)}
      />
    </div>
  );
};
export default InvoicePage;