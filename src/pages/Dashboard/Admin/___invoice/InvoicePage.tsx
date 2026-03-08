import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button, Table, Dropdown, MenuProps } from "antd";
import { MoreOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useInvoiceStates, useInvoiceActions, Invoice } from "../../../../store/useInvoiceStore";
import { formatMoney } from "../../../../utils/moneyFormat";
import { App } from "antd";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import partnerInvoiceMutationService from "../../../../services/partner-invoice-service/invoice-mutation";

const InvoicePage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data: invoices = [], isLoading: loading, error } = partnerInvoiceQueryService.useFetchPartnerInvoices();
  const { mutate: deleteInvoiceAction } = partnerInvoiceMutationService.useDeletePartnerInvoice();
  const { setError } = useInvoiceActions();

  useEffect(() => {
    if (error) {
      message.error((error as any).message || "An error occurred");
      setError(null);
    }
  }, [error, message, setError]);

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
      render: (amount: number, record: Invoice) => formatMoney(amount, record.currency || "USD"),
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
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}`),
          },
          {
            key: "email",
            label: "Send as Email",
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}/send`),
          },
          {
            key: "edit",
            label: "Edit",
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}/edit`),
          },
          {
            key: "delete",
            label: <span className="text-red-500">Delete</span>,
            danger: true,
            onClick: () => {
              if (invoice._id) deleteInvoiceAction(invoice._id);
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

  // Note: These are mock conversion rates as the backend doesn't provide them. 
  // Adjust these according to real exchange rates.
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

  let grandTotalNGN = 0;
  Object.entries(totalsByCurrency).forEach(([cur, data]) => {
    const rate = conversionRatesToNGN[cur] || 1500;
    grandTotalNGN += data.total * rate;
  });

  const grandAvgNGN = invoices.length ? grandTotalNGN / invoices.length : 0;

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
            className="bg-black border-black font-bold px-6 py-5"
            onClick={() => navigate("/admin/invoice-page/new")}
          >
            New Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">
              Total Invoices
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {invoices.length}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm font-medium">Total Value</span>
              {invoices.length > 0 && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Grand Total: {formatMoney(grandTotalNGN, "NGN")}</span>}
            </div>
            <div className="space-y-2">
              {Object.entries(totalsByCurrency).map(([currency, data]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{currency} Total:</span>
                  <span className="font-bold text-green-600">{formatMoney(data.total, currency)}</span>
                </div>
              ))}
              {Object.keys(totalsByCurrency).length === 0 && (
                <div className="text-2xl font-bold text-green-600">{formatMoney(0, "NGN")}</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm font-medium">Average Invoice</span>
              {invoices.length > 0 && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Overall Avg: {formatMoney(grandAvgNGN, "NGN")}</span>}
            </div>
            <div className="space-y-2">
              {Object.entries(totalsByCurrency).map(([currency, data]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">{currency} Avg:</span>
                  <span className="font-bold text-blue-600">{formatMoney(data.count ? data.total / data.count : 0, currency)}</span>
                </div>
              ))}
              {Object.keys(totalsByCurrency).length === 0 && (
                <div className="text-2xl font-bold text-blue-600">{formatMoney(0, "NGN")}</div>
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
            loading={loading}
            pagination={{ pageSize: 10, position: ["bottomCenter"] }}
          />
        </div>
      </div>
    </div>
  );
};
export default InvoicePage;